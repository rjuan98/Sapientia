# Configuração de Domínios Autorizados no Firebase

## Problema Identificado
O erro `auth/unauthorized-domain` indica que o domínio `chimerical-croissant-bfe87b.netlify.app` não está autorizado para autenticação OAuth no Firebase.

## Solução

### 1. Acessar o Console do Firebase
1. Vá para [https://console.firebase.google.com](https://console.firebase.google.com)
2. Selecione o projeto `sapientia-699c2`

### 2. Configurar Domínios Autorizados
1. No menu lateral, clique em **Authentication**
2. Clique na aba **Settings** (Configurações)
3. Role até a seção **Authorized domains** (Domínios autorizados)
4. Clique em **Add domain** (Adicionar domínio)
5. Adicione os seguintes domínios:
   - `chimerical-croissant-bfe87b.netlify.app`
   - `localhost` (para desenvolvimento local)
   - Qualquer outro domínio que você planeja usar

### 3. Configurar Provedores OAuth
1. Na mesma página de Authentication > Settings
2. Clique na aba **Sign-in method**
3. Clique em **Google**
4. Certifique-se de que está **Enabled**
5. Configure o **Project support email** se necessário
6. Salve as configurações

### 4. Verificar Configurações do Google Cloud
1. No console do Firebase, clique em **Project settings** (ícone de engrenagem)
2. Clique em **Service accounts**
3. Verifique se o **Project ID** está correto: `sapientia-699c2`

### 5. Configurar URLs de Redirecionamento (Opcional)
Se você estiver usando `signInWithRedirect`, também configure:
1. No Google Cloud Console: [https://console.cloud.google.com](https://console.cloud.google.com)
2. Selecione o projeto `sapientia-699c2`
3. Vá para **APIs & Services** > **Credentials**
4. Clique no OAuth 2.0 Client ID
5. Adicione as URLs de redirecionamento autorizadas

## Domínios que Devem Ser Autorizados

### Produção
- `chimerical-croissant-bfe87b.netlify.app`
- Qualquer domínio personalizado que você configurar

### Desenvolvimento
- `localhost`
- `127.0.0.1`
- `localhost:5173` (Vite dev server)

## Verificação
Após configurar os domínios:
1. Faça deploy novamente da aplicação
2. Teste o login com Google
3. Verifique se não há mais erros de `unauthorized-domain`

## Notas Importantes
- As mudanças podem levar alguns minutos para propagar
- Certifique-se de que o domínio está exatamente correto (sem http/https)
- Para domínios personalizados, adicione tanto o domínio raiz quanto subdomínios se necessário 