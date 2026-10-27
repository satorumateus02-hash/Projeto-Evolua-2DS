import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Aparecer from '../components/Aparecer';
import { useTheme } from '../ThemeContext';

export default function Configuracoes() {
  const { cores } = useTheme();

  return (
    <ScrollView contentContainerStyle={[estilos.container, { backgroundColor: cores.fundo }]}>
      <Aparecer>
        <Text style={[estilos.titulo, { color: cores.texto }]}>Configurações</Text>
      </Aparecer>

      <Aparecer atraso={80}>
        <View style={[estilos.secao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <View style={estilos.linhaTitulo}>
            <Feather name="bell" size={18} color={cores.primaria} />
            <Text style={[estilos.secaoTitulo, { color: cores.texto }]}>Notificações</Text>
          </View>
          <View style={estilos.opcaoLinha}>
            <Text style={[estilos.opcaoTexto, { color: cores.texto }]}>Lembretes de consumo</Text>
            <Switch
              value={false}
              disabled
              trackColor={{ false: cores.borda, true: cores.primaria }}
            />
          </View>
          <Text style={[estilos.descricao, { color: cores.textoSuave, marginTop: 4 }]}>
            Em breve
          </Text>
        </View>
      </Aparecer>

      <Aparecer atraso={160}>
        <View style={[estilos.secao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <View style={estilos.linhaTitulo}>
            <Feather name="trash-2" size={18} color={cores.primaria} />
            <Text style={[estilos.secaoTitulo, { color: cores.texto }]}>Dados</Text>
          </View>
          <Text style={[estilos.descricao, { color: cores.texto }]}>
            Gerencie o histórico e dados locais do aplicativo.
          </Text>
          <Text style={[estilos.descricao, { color: cores.textoSuave, marginTop: 6 }]}>
            Use a opção na tela Início para limpar o histórico.
          </Text>
        </View>
      </Aparecer>

      <Aparecer atraso={240}>
        <View style={[estilos.secao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <View style={estilos.linhaTitulo}>
            <Feather name="info" size={18} color={cores.primaria} />
            <Text style={[estilos.secaoTitulo, { color: cores.texto }]}>Sobre o app</Text>
          </View>
          <Text style={[estilos.descricao, { color: cores.texto }]}>
            Evolua — Calculadora de Consumo
          </Text>
          <Text style={[estilos.versao, { color: cores.textoSuave }]}>Versão 2.0.0</Text>
        </View>
      </Aparecer>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  secao: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  descricao: {
    fontSize: 14,
    lineHeight: 20,
  },
  opcaoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  opcaoTexto: {
    fontSize: 16,
  },
  versao: {
    marginTop: 6,
    fontSize: 13,
  },
});
