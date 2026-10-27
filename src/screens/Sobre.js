import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import Aparecer from '../components/Aparecer';
import { useTheme } from '../ThemeContext';

const LINHAS = [
  'Desenvolvido por: Rafael Piffer e Vinicius Alexandre',
  'Turma: 2 DS',
  'Disciplina: PAM',
  'Professor: Márcio Ferraz',
  'Aplicativo desenvolvido em React Native (Expo) para calcular o consumo médio de um veículo a partir da distância percorrida e da quantidade de combustível utilizada.',
  'Funciona somente de forma local: contas e histórico ficam salvos neste aparelho.',
];

export default function Sobre() {
  const { cores } = useTheme();

  return (
    <ScrollView contentContainerStyle={[estilos.container, { backgroundColor: cores.fundo }]}>
      <Aparecer><Text style={[estilos.titulo, { color: cores.primaria }]}>Calculadora de Consumo</Text></Aparecer>
      {LINHAS.map((t, i) => (
        <Aparecer key={i} atraso={(i + 1) * 90}>
          <Text style={[estilos.texto, { color: cores.texto }]}>{t}</Text>
        </Aparecer>
      ))}
      <Aparecer atraso={(LINHAS.length + 1) * 90}>
        <Text style={[estilos.versao, { color: cores.textoSuave }]}>Versão 2.0.0</Text>
      </Aparecer>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  texto: { fontSize: 17, textAlign: 'center', lineHeight: 26, marginBottom: 15 },
  versao: { marginTop: 10 },
});
