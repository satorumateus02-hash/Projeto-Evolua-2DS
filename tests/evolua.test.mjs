import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { lerNumero, calcularConsumo, classificarConsumo, formatarNumero } from '../src/utils/consumo.js';
import { emailValido, validarCadastro, validarLogin } from '../src/utils/validacao.js';
import { sha256, hashSenha } from '../src/utils/hash.js';
import { criarContas, DEMO, CHAVE_USUARIOS, LIMITE_HISTORICO } from '../src/services/contas.js';

// Armazenamento em memória com a mesma interface do AsyncStorage.
function memoria(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return {
    getItem: async (k) => (m.has(k) ? m.get(k) : null),
    setItem: async (k, v) => { m.set(k, v); },
    removeItem: async (k) => { m.delete(k); },
    _m: m,
  };
}

test('lerNumero aceita vírgula, ponto e espaços; rejeita lixo', () => {
  assert.equal(lerNumero('12,5'), 12.5);
  assert.equal(lerNumero(' 40 '), 40);
  assert.equal(lerNumero('0.5'), 0.5);
  for (const ruim of ['', 'abc', '1e5', '-3', '1,2,3', '12abc', null, undefined]) {
    assert.ok(Number.isNaN(lerNumero(ruim)), `deveria rejeitar ${ruim}`);
  }
});

test('calcularConsumo: 300 km com 25 L = 12 km/L', () => {
  const r = calcularConsumo('300', '25');
  assert.equal(r.ok, true);
  assert.equal(r.kmPorLitro, 12);
  assert.equal(r.classificacao, 'Moderado');
  assert.equal(formatarNumero(r.kmPorLitro), '12,00');
});

test('calcularConsumo valida entradas', () => {
  assert.equal(calcularConsumo('', '10').ok, false);
  assert.equal(calcularConsumo('100', '0').ok, false);
  assert.equal(calcularConsumo('-5', '10').ok, false);
  assert.equal(calcularConsumo('abc', '10').ok, false);
  assert.equal(calcularConsumo('100', '8,5').ok, true);
});

test('classificação por faixas', () => {
  assert.equal(classificarConsumo(15), 'Econômico');
  assert.equal(classificarConsumo(9), 'Moderado');
  assert.equal(classificarConsumo(8.9), 'Alto consumo');
});

test('validação de e-mail e cadastro', () => {
  assert.ok(emailValido('a@b.com'));
  assert.ok(!emailValido('a@b'));
  assert.ok(!emailValido('a b@c.com'));
  const ok = { nome: 'Ana', email: 'ana@x.com', senha: '123456', confirmarSenha: '123456' };
  assert.equal(validarCadastro(ok), null);
  assert.match(validarCadastro({ ...ok, senha: '123', confirmarSenha: '123' }), /6 caracteres/);
  assert.match(validarCadastro({ ...ok, confirmarSenha: 'x' }), /não coincidem/);
  assert.match(validarCadastro({ ...ok, nome: '  ' }), /todos os campos/);
  assert.match(validarLogin({ email: '', senha: 'x' }), /Preencha/);
});

test('sha256 confere com o crypto do Node (vários tamanhos e acentos)', () => {
  for (const texto of ['', 'abc', 'Evolua123', 'ação ✓ 😀', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'x'.repeat(1000)]) {
    assert.equal(sha256(texto), createHash('sha256').update(texto, 'utf8').digest('hex'), `falhou para "${texto.slice(0, 10)}"`);
  }
  assert.notEqual(hashSenha('abc', 's1'), hashSenha('abc', 's2'));
  assert.equal(hashSenha('abc', 's1'), hashSenha('abc', 's1'));
});

test('conta demo não é criada automaticamente no app', async () => {
  const arm = memoria();
  const c = criarContas(arm);
  const r = await c.entrar({ email: DEMO.email, senha: DEMO.senha });
  assert.equal(r.ok, false);
  assert.ok(!arm._m.get(CHAVE_USUARIOS) || !arm._m.get(CHAVE_USUARIOS).includes(DEMO.senha));
});

test('cadastro, login, e-mail duplicado e senha errada', async () => {
  const c = criarContas(memoria());
  const dados = { nome: 'Ana', email: ' Ana@Teste.com ', senha: 'segredo1', confirmarSenha: 'segredo1' };
  const cad = await c.cadastrar(dados);
  assert.equal(cad.ok, true);
  assert.equal(cad.usuario.email, 'ana@teste.com');
  assert.equal((await c.cadastrar(dados)).ok, false);
  assert.equal((await c.entrar({ email: 'ANA@teste.com', senha: 'segredo1' })).ok, true);
  assert.equal((await c.entrar({ email: 'ana@teste.com', senha: 'errada' })).ok, false);
  assert.equal((await c.entrar({ email: 'naoexiste@x.com', senha: 'segredo1' })).ok, false);
});

test('sessão: salvar, recuperar, encerrar e conta removida', async () => {
  const arm = memoria();
  const c = criarContas(arm);
  const { usuario } = await c.cadastrar({ nome: 'Bia', email: 'bia@x.com', senha: '123456', confirmarSenha: '123456' });
  await c.salvarSessao(usuario);
  assert.deepEqual(await c.recuperarSessao(), usuario);
  await c.encerrarSessao();
  assert.equal(await c.recuperarSessao(), null);
  await arm.setItem('@evolua/sessao', JSON.stringify({ email: 'fantasma@x.com' }));
  assert.equal(await c.recuperarSessao(), null);
});

test('migra contas da versão 1 (senha em texto puro) para hash', async () => {
  const antigo = [{ nome: 'Velho', email: 'velho@x.com', senha: 'senha123' }];
  const arm = memoria({ [CHAVE_USUARIOS]: JSON.stringify(antigo) });
  const c = criarContas(arm);
  assert.equal((await c.entrar({ email: 'velho@x.com', senha: 'senha123' })).ok, true);
  assert.ok(!arm._m.get(CHAVE_USUARIOS).includes('senha123'));
});

test('dados corrompidos não derrubam o app', async () => {
  const arm = memoria({ [CHAVE_USUARIOS]: '{lixo', '@evolua/sessao': 'xxx' });
  const c = criarContas(arm);
  assert.equal(await c.recuperarSessao(), null);
  assert.equal((await c.entrar({ email: DEMO.email, senha: DEMO.senha })).ok, false);
});

test('histórico é por usuário, limitado e pode ser limpo', async () => {
  const c = criarContas(memoria());
  for (let i = 0; i < LIMITE_HISTORICO + 5; i++) {
    await c.adicionarHistorico('a@x.com', { distancia: 100, litros: 10, kmPorLitro: 10, classificacao: 'Moderado' });
  }
  const lista = await c.lerHistorico('A@x.com');
  assert.equal(lista.length, LIMITE_HISTORICO);
  assert.equal(new Set(lista.map((h) => h.id)).size, LIMITE_HISTORICO, 'ids devem ser únicos');
  assert.equal((await c.lerHistorico('b@x.com')).length, 0);
  await c.limparHistorico('a@x.com');
  assert.equal((await c.lerHistorico('a@x.com')).length, 0);
});
