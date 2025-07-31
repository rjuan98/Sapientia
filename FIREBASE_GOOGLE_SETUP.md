# Configuração do Login com Google no Firebase

Para habilitar o login com Google no seu projeto Firebase, siga estes passos:

## 1. Habilitar o Provedor do Google

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Sign-in method**
5. Clique em **Google** na lista de provedores
6. Clique em **Enable** (Habilitar)
7. Configure as opções:
   - **Project support email**: Seu email de suporte
   - **Authorized domains**: Deixe vazio por enquanto (será configurado automaticamente)
8. Clique em **Save** (Salvar)

## 2. Configurar Domínios Autorizados (Opcional)

Se você planeja fazer deploy da aplicação, adicione seus domínios:

1. Na mesma página do Google provider
2. Em **Authorized domains**, adicione:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção (quando fizer deploy)

## 3. Testar o Login

Agora você pode testar o login com Google:

1. Execute `npm run dev` no seu projeto
2. Acesse `http://localhost:3000`
3. Clique em "Continuar com Google"
4. Selecione sua conta Google
5. Você será redirecionado para a aplicação

## 4. Funcionalidades Implementadas

- ✅ Login com Google
- ✅ Criação automática de conta para novos usuários
- ✅ Recuperação de dados existentes para usuários já cadastrados
- ✅ Avatar do Google (foto do perfil)
- ✅ Nome do Google (displayName)
- ✅ Email do Google

## 5. Tratamento de Erros

O sistema trata os seguintes erros:
- Popup fechado pelo usuário
- Problemas de rede
- Configuração incorreta do Firebase

## 6. Próximos Passos

Após configurar o Google, você pode:
- Testar o login com diferentes contas Google
- Verificar se os dados estão sendo salvos no Firestore
- Personalizar o fluxo de onboarding para novos usuários

---

**Nota**: O login com Google funciona tanto para novos usuários (cria conta automaticamente) quanto para usuários existentes (faz login na conta existente). 