import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Aparecer from '../components/Aparecer';
import BotaoAnimado from '../components/BotaoAnimado';
import { useTheme } from '../ThemeContext';

export default function Perfil({ usuario, sair }) {
  const { cores } = useTheme();

  return (
    <ScrollView contentContainerStyle={[estilos.container, { backgroundColor: cores.fundo }]}>
      <Aparecer>
        <View style={[estilos.avatar, { backgroundColor: cores.primariaClara }]}>
          <Feather name="user" size={48} color={cores.primaria} />
        </View>
      </Aparecer>

      <Aparecer atraso={80}>
        <Text style={[estilos.nome, { color: cores.texto }]}>{usuario?.nome || 'Usuário'}</Text>
      </Aparecer>

      <Aparecer atraso={160}>
        <Text style={[estilos.email, { color: cores.textoSuave }]}>{usuario?.email || ''}</Text>
      </Aparecer>

      <Aparecer atraso={240}>
        <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <Text style={[estilos.rotulo, { color: cores.textoSuave }]}>Nome</Text>
          <Text style={[estilos.valor, { color: cores.texto }]}>{usuario?.nome || '-'}</Text>
          <View style={[estilos.divisor, { backgroundColor: cores.borda }]} />
          <Text style={[estilos.rotulo, { color: cores.textoSuave }]}>E-mail</Text>
          <Text style={[estilos.valor, { color: cores.texto }]}>{usuario?.email || '-'}</Text>
        </View>
      </Aparecer>

      <Aparecer atraso={320}>
        <BotaoAnimado
          titulo="Sair da conta"
          onPress={sair}
          variante="perigo"
          icone="log-out"
          style={{ marginTop: 24, alignSelf: 'stretch' }}
        />
      </Aparecer>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  cartao: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  valor: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 12,
  },
  divisor: {
    height: 1,
    marginVertical: 8,
  },
});
