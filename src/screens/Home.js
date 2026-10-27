import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { contas } from '../services/armazenamento';
import { formatarNumero } from '../utils/consumo';
import Aparecer from '../components/Aparecer';
import BotaoAnimado from '../components/BotaoAnimado';
import Seletor from '../components/Seletor';
import { useTheme } from '../ThemeContext';

const FILTROS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'Econômico', rotulo: 'Econômico' },
  { valor: 'Moderado', rotulo: 'Moderado' },
  { valor: 'Alto consumo', rotulo: 'Alto' },
];

function formatarData(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

export default function Home({ usuario }) {
  const { cores } = useTheme();
  const COR = { 'Econômico': cores.sucesso, Moderado: cores.aviso, 'Alto consumo': cores.erro };
  const [historico, setHistorico] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [confirmando, setConfirmando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      contas.lerHistorico(usuario.email).then((l) => { if (ativo) setHistorico(l); }).catch(() => {});
      return () => { ativo = false; };
    }, [usuario.email])
  );

  useEffect(() => {
    if (!confirmando) return undefined;
    const t = setTimeout(() => setConfirmando(false), 3000);
    return () => clearTimeout(t);
  }, [confirmando]);

  async function limpar() {
    if (!confirmando) { setConfirmando(true); return; }
    setConfirmando(false);
    try { await contas.limparHistorico(usuario.email); } catch (e) { /* ignora */ }
    setHistorico([]);
    setFiltro('todos');
  }

  const media = historico.length
    ? historico.reduce((soma, h) => soma + h.kmPorLitro, 0) / historico.length
    : null;
  const lista = filtro === 'todos' ? historico : historico.filter((h) => h.classificacao === filtro);

  return (
    <View style={[estilos.container, { backgroundColor: cores.fundo }]}>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.lista}
        ListHeaderComponent={
          <View>
            <Aparecer>
              <Text style={[estilos.ola, { color: cores.primaria }]}>Olá, {usuario.nome}!</Text>
              <Text style={[estilos.texto, { color: cores.textoSuave }]}>Calcule o consumo médio do seu veículo na aba Cálculo.</Text>
            </Aparecer>
            <Aparecer atraso={100} style={estilos.resumos}>
              <View style={[estilos.resumo, { flex: 2, marginRight: 10, backgroundColor: cores.primariaClara }]}>
                <Text style={[estilos.resumoRotulo, { color: cores.textoSuave }]}>Média dos seus cálculos</Text>
                <Text style={[estilos.resumoValor, { color: cores.primaria }]}>{media === null ? '—' : `${formatarNumero(media)} km/L`}</Text>
              </View>
              <View style={[estilos.resumo, { flex: 1, backgroundColor: cores.primariaClara }]}>
                <Text style={[estilos.resumoRotulo, { color: cores.textoSuave }]}>Cálculos</Text>
                <Text style={[estilos.resumoValor, { color: cores.primaria }]}>{historico.length}</Text>
              </View>
            </Aparecer>
            <View style={estilos.cabecalhoLista}>
              <Text style={[estilos.subtitulo, { color: cores.texto }]}>Histórico</Text>
              {historico.length > 0 && (
                <BotaoAnimado pequeno icone="trash-2" variante={confirmando ? 'perigo' : 'texto'}
                  titulo={confirmando ? 'Confirmar?' : 'Limpar'} onPress={limpar} />
              )}
            </View>
            {historico.length > 0 && <Seletor opcoes={FILTROS} valor={filtro} onChange={setFiltro} style={{ marginBottom: 8 }} />}
          </View>
        }
        ListEmptyComponent={
          <Text style={[estilos.vazio, { color: cores.textoSuave }]}>
            {historico.length === 0 ? 'Nenhum cálculo ainda. Faça o primeiro na aba Cálculo.' : 'Nenhum cálculo nessa categoria.'}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Aparecer atraso={Math.min(index, 8) * 60} style={[estilos.item, { borderBottomColor: cores.borda }]}>
            <View style={[estilos.ponto, { backgroundColor: COR[item.classificacao] || cores.borda }]} />
            <View style={{ flex: 1 }}>
              <Text style={[estilos.itemValor, { color: cores.texto }]}>{formatarNumero(item.kmPorLitro)} km/L · {item.classificacao}</Text>
              <Text style={[estilos.itemDetalhe, { color: cores.textoSuave }]}>
                {formatarNumero(item.distancia, 1)} km com {formatarNumero(item.litros, 1)} L
              </Text>
            </View>
            <Text style={[estilos.itemData, { color: cores.textoSuave }]}>{formatarData(item.data)}</Text>
          </Aparecer>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1 },
  lista: { padding: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  ola: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  texto: { fontSize: 16, marginBottom: 18, lineHeight: 22 },
  resumos: { flexDirection: 'row', marginBottom: 22 },
  resumo: { borderRadius: 12, padding: 16 },
  resumoRotulo: { fontSize: 13 },
  resumoValor: { fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  cabecalhoLista: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subtitulo: { fontSize: 18, fontWeight: 'bold' },
  vazio: { textAlign: 'center', marginTop: 20 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  ponto: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  itemValor: { fontSize: 16, fontWeight: '600' },
  itemDetalhe: { fontSize: 13, marginTop: 2 },
  itemData: { fontSize: 12, marginLeft: 8 },
});
