# Configuração do Firebase para Sapientia

## Passo 1: Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Digite o nome: `sapientia-699c2`
4. Siga os passos para criar o projeto

## Passo 2: Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Get started"
3. Vá para a aba "Sign-in method"
4. Habilite "Email/Password"
5. Clique em "Save"

## Passo 3: Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Create database"
3. Escolha "Start in test mode" (para desenvolvimento)
4. Escolha a localização mais próxima (us-east1)
5. Clique em "Done"

## Passo 4: Configurar Regras do Firestore

1. Na aba "Rules" do Firestore Database
2. Substitua as regras existentes por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários autenticados leiam e escrevam seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir que usuários autenticados leiam e escrevam suas próprias citações
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow list: if request.auth != null;
    }
  }
}
```

3. Clique em "Publish"

## Passo 5: Obter Credenciais

1. No menu lateral, clique em "Project settings" (ícone de engrenagem)
2. Role para baixo até "Your apps"
3. Clique em "Add app" e escolha "Web"
4. Digite o nome: `sapientia-web`
5. Clique em "Register app"
6. Copie as credenciais que aparecem

## Credenciais do Projeto

As credenciais já estão configuradas no arquivo `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAphx3rmh-O5SD9t8DnL8M0-i3GHeKj6lE",
  authDomain: "sapientia-699c2.firebaseapp.com",
  projectId: "sapientia-699c2",
  storageBucket: "sapientia-699c2.firebasestorage.app",
  messagingSenderId: "331824802793",
  appId: "1:331824802793:web:7cb0e76f5d1e39f69a7978",
  measurementId: "G-2BC5DD3X0N"
}
```

## Funcionalidades Implementadas

✅ **Authentication**: Login/registro com email e senha
✅ **Firestore Database**: Armazenamento de dados do usuário e citações
✅ **Regras de Segurança**: Acesso restrito aos próprios dados
✅ **Migração Automática**: Citações do localStorage migram para Firebase
✅ **Sincronização em Tempo Real**: Mudanças refletem instantaneamente
✅ **Backup na Nuvem**: Dados persistentes e seguros

## Próximos Passos

1. Teste o login/registro
2. Verifique se as citações migram automaticamente
3. Teste a sincronização em tempo real
4. Configure o deploy no Firebase Hosting 