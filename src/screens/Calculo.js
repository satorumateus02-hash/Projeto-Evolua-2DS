import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { calcularConsumo, formatarNumero } from '../utils/consumo';
import { contas } from '../services/armazenamento';
import Aparecer from '../components/Aparecer';
import BotaoAnimado from '../components/BotaoAnimado';
import Seletor from '../components/Seletor';
import { useTheme } from '../ThemeContext';

const ATALHOS = ['100', '300', '500'];
const UNIDADES = [{ valor: 'kml', rotulo: 'km/L' }, { valor: 'l100', rotulo: 'L/100 km' }];

function Medidor({ kmPorLitro, cor }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    p.setValue(0);
    Animated.timing(p, { toValue: Math.min(kmPorLitro / 20, 1), duration: 700, useNativeDriver: false }).start();
  }, [kmPorLitro, p]);
  return (
    <View style={estilos.trilho}>
      <Animated.View style={[estilos.barra, { backgroundColor: cor, width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
    </View>
  );
}

export default function Calculo({ usuario }) {
  const { cores } = useTheme();
  const COR = { 'Econômico': cores.sucesso, Moderado: cores.aviso, 'Alto consumo': cores.erro };
  const [distancia, setDistancia] = useState('');
  const [litros, setLitros] = useState('');
  const [resultado, setResultado] = useState(null);
  const [salvo, setSalvo] = useState(false);
  const [unidade, setUnidade] = useState('kml');
  const [tentativa, setTentativa] = useState(0);
  const [foco, setFoco] = useState('');

  async function calcular() {
    const r = calcularConsumo(distancia, litros);
    setResultado(r);
    setTentativa((n) => n + 1);
    setSalvo(false);
    if (!r.ok) return;
    try {
      await contas.adicionarHistorico(usuario.email, {
        distancia: r.distancia,
        litros: r.litros,
        kmPorLitro: r.kmPorLitro,
        classificacao: r.classificacao,
      });
      setSalvo(true);
    } catch (erro) {}
  }

  function limpar() {
    setDistancia('');
    setLitros('');
    setResultado(null);
    setSalvo(false);
  }

  const valor = resultado && resultado.ok
    ? unidade === 'kml'
      ? `${formatarNumero(resultado.kmPorLitro)} km/L`
      : `${formatarNumero(100 / resultado.kmPorLitro)} L/100 km`
    : '';

  return (
    <KeyboardAvoidingView style={[estilos.fundo, { backgroundColor: cores.fundo }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
        <Aparecer>
          <Text style={[estilos.titulo, { color: cores.primaria }]}>Formulário de cálculo de consumo</Text>

          <Text style={[estilos.label, { color: cores.texto }]}>Distância percorrida (km)</Text>
          <TextInput
            style={[estilos.input, { borderColor: cores.borda, color: cores.texto, backgroundColor: cores.cartao }, foco === 'd' && { borderColor: cores.primaria, backgroundColor: cores.primariaClara }]}
            placeholder="Ex: 100" placeholderTextColor={cores.textoSuave} keyboardType="decimal-pad"
            value={distancia} onChangeText={setDistancia} onFocus={() => setFoco('d')} onBlur={() => setFoco('')}
          />
          <View style={estilos.atalhos}>
            {ATALHOS.map((a) => (
              <BotaoAnimado key={a} pequeno titulo={`${a} km`} variante={distancia === a ? 'primario' : 'secundario'}
                onPress={() => setDistancia(a)} style={estilos.atalho} />
            ))}
          </View>

          <Text style={[estilos.label, { color: cores.texto }]}>Combustível usado (litros)</Text>
          <TextInput
            style={[estilos.input, { borderColor: cores.borda, color: cores.texto, backgroundColor: cores.cartao }, foco === 'l' && { borderColor: cores.primaria, backgroundColor: cores.primariaClara }]}
            placeholder="Ex: 8,5" placeholderTextColor={cores.textoSuave} keyboardType="decimal-pad"
            value={litros} onChangeText={setLitros} onSubmitEditing={calcular}
            onFocus={() => setFoco('l')} onBlur={() => setFoco('')}
          />

          <BotaoAnimado titulo="Calcular" icone="zap" onPress={calcular} />
          <BotaoAnimado titulo="Limpar" icone="rotate-ccw" variante="secundario" onPress={limpar} style={{ marginTop: 10 }} />
        </Aparecer>

        {resultado && (
          <Aparecer key={tentativa} style={[estilos.resultado, { backgroundColor: cores.cartao }]}>
            {resultado.ok ? (
              <>
                <Seletor opcoes={UNIDADES} valor={unidade} onChange={setUnidade} style={{ alignSelf: 'stretch', marginBottom: 16 }} />
                <Text style={[estilos.textoResultado, { color: cores.texto }]}>Consumo médio: {valor}</Text>
                <View style={[estilos.selo, { backgroundColor: COR[resultado.classificacao] }]}>
                  <Text style={estilos.seloTexto}>{resultado.classificacao}</Text>
                </View>
                <Medidor kmPorLitro={resultado.kmPorLitro} cor={COR[resultado.classificacao]} />
                {salvo && <Text style={[estilos.salvo, { color: cores.sucesso }]}>✓ Salvo no histórico</Text>}
              </>
            ) : (
              <Text style={[estilos.erro, { color: cores.erro }]}>{resultado.erro}</Text>
            )}
          </Aparecer>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1 },
  container: { padding: 25, maxWidth: 560, width: '100%', alignSelf: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    height: 48, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  atalhos: { flexDirection: 'row', marginBottom: 14 },
  atalho: { marginRight: 8 },
  resultado: { marginTop: 25, padding: 20, borderRadius: 14, alignItems: 'center' },
  textoResultado: { textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  selo: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  seloTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  trilho: { alignSelf: 'stretch', height: 10, borderRadius: 5, backgroundColor: '#E2E8F0', marginTop: 16, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 5 },
  salvo: { marginTop: 12, fontSize: 13, fontWeight: '600' },
  erro: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
