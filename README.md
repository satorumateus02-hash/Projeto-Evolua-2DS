# Evolua 2.0 — Calculadora de Consumo (100% local)

Aplicativo React Native (Expo) que calcula o consumo médio de um veículo (km/L).
**Funciona apenas localmente**: não usa Firebase nem servidor. Contas, sessão e histórico ficam salvos no próprio aparelho/navegador.

## Como rodar
Pré-requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npx expo install --fix      # (opcional) alinha as versões das bibliotecas ao Expo SDK 54
npx expo start              # abra no Expo Go (QR code) ou pressione "w" para a web
```

Também: `npm run android`, `npm run ios`, `npm run web`.

## Conta de teste
- E-mail: `demo@evolua.com`
- Senha: `Evolua123`

Você também pode criar uma conta na tela de cadastro.

## Testes automatizados (lógica)
```bash
npm test      # requer Node 22.12 ou superior
```

A documentação completa (edital) está em **EDITAL.md**.
