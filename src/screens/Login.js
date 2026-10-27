import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { contas } from '../services/armazenamento';
import { avisar } from '../utils/alerta';
import Aparecer from '../components/Aparecer';
import BotaoAnimado from '../components/BotaoAnimado';
import Seletor from '../components/Seletor';
import { nativo } from '../theme';
import { useTheme } from '../ThemeContext';

const MODOS = [{ valor: 'login', rotulo: 'Entrar' }, { valor: 'cadastro', rotulo: 'Cadastrar' }];

function Campo({ rotulo, nome, foco, setFoco, cores, ...resto }) {
  return (
    <>
      <Text style={[styles.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: cores.borda, backgroundColor: cores.cartao, color: cores.texto },
          foco === nome && { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
        ]}
        placeholderTextColor={cores.textoSuave}
        onFocus={() => setFoco(nome)}
        onBlur={() => setFoco('')}
        {...resto}
      />
    </>
  );
}

export default function Login({ onLogin }) {
  const { cores } = useTheme();
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [foco, setFoco] = useState('');
  const tremor = useRef(new Animated.Value(0)).current;
  const cadastro = modo === 'cadastro';

  function tremer() {
    Animated.sequence(
      [10, -10, 6, -6, 0].map((t) => Animated.timing(tremor, { toValue: t, duration: 60, useNativeDriver: nativo }))
    ).start();
  }

  async function enviar() {
    if (carregando) return;
    setCarregando(true);
    setErro('');
    try {
      const resultado = cadastro
        ? await contas.cadastrar({ nome, email, senha, confirmarSenha })
        : await contas.entrar({ email, senha });

      if (!resultado.ok) {
        setErro(resultado.erro);
        tremer();
        return;
      }
      if (cadastro) avisar('Conta criada', 'Cadastro concluído! Você já entrou no Evolua.');
      await onLogin(resultado.usuario);
    } catch (e) {
      console.error('Erro ao acessar os dados do app:', e);
      setErro(e?.message || 'Não foi possível acessar os dados salvos neste aparelho.');
      tremer();
    } finally {
      setCarregando(false);
    }
  }

  function trocar(novoModo) {
    setModo(novoModo);
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setErro('');
    setFoco('');
  }

  return (
    <KeyboardAvoidingView style={[styles.fundo, { backgroundColor: cores.fundo }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Aparecer style={styles.area}>
          <Animated.View style={[styles.cartao, { backgroundColor: cores.cartao, transform: [{ translateX: tremor }] }]}>
            <Text style={[styles.titulo, { color: cores.primaria }]}>Evolua</Text>
            <Text style={[styles.descricao, { color: cores.textoSuave }]}>
              {cadastro ? 'Crie sua conta para continuar.' : 'Entre na sua conta para continuar.'}
            </Text>

            <Seletor opcoes={MODOS} valor={modo} onChange={trocar} style={{ marginBottom: 22 }} />

            {cadastro && (
              <Campo cores={cores} rotulo="Nome" nome="nome" foco={foco} setFoco={setFoco} placeholder="Seu nome"
                value={nome} onChangeText={setNome} editable={!carregando} />
            )}

            <Campo cores={cores} rotulo="E-mail" nome="email" foco={foco} setFoco={setFoco} placeholder="seuemail@exemplo.com"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              value={email} onChangeText={setEmail} editable={!carregando} />

            <Campo cores={cores} rotulo="Senha" nome="senha" foco={foco} setFoco={setFoco} placeholder="Digite sua senha"
              secureTextEntry={!verSenha} autoCapitalize="none" value={senha} onChangeText={setSenha}
              editable={!carregando} onSubmitEditing={cadastro ? undefined : enviar} />

            {cadastro && (
              <Campo cores={cores} rotulo="Confirmar senha" nome="confirmar" foco={foco} setFoco={setFoco}
                placeholder="Digite a senha novamente" secureTextEntry={!verSenha} autoCapitalize="none"
                value={confirmarSenha} onChangeText={setConfirmarSenha} editable={!carregando} onSubmitEditing={enviar} />
            )}

            {!!erro && (
              <Aparecer key={erro} style={styles.erroCaixa}>
                <Text style={[styles.erro, { color: cores.erro }]}>{erro}</Text>
              </Aparecer>
            )}

            <BotaoAnimado titulo={cadastro ? 'Criar conta' : 'Entrar'} icone={cadastro ? 'user-plus' : 'log-in'}
              onPress={enviar} carregando={carregando} />

            <BotaoAnimado variante="texto" pequeno titulo={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              icone={verSenha ? 'eye-off' : 'eye'} onPress={() => setVerSenha(!verSenha)} style={styles.linkArea} />
          </Animated.View>
        </Aparecer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  area: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  cartao: { borderRadius: 20, padding: 24, boxShadow: '0 6px 24px rgba(37,99,235,0.12)' },
  titulo: { fontSize: 38, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  descricao: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  rotulo: { fontSize: 14, fontWeight: '600', marginBottom: 7 },
  input: {
    height: 50, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14,
    marginBottom: 18,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  erroCaixa: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 14 },
  erro: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  linkArea: { alignSelf: 'center', marginVertical: 10 },
});
