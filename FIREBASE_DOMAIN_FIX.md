# 🔧 Correção do Firebase: Domínio não autorizado

## ❌ **Problema Identificado**
```
Firebase: Error (auth/unauthorized-domain)
Add your domain (chimerical-croissant-bfe87b.netlify.app) to the OAuth redirect domains list
```

## ✅ **Solução**

### **1. Acessar Firebase Console**
1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto `sapientia-699c2`

### **2. Configurar Domínios Autorizados**
1. No menu lateral, clique em **Authentication**
2. Clique na aba **Settings**
3. Role até a seção **Authorized domains**
4. Clique em **Add domain**
5. Adicione: `chimerical-croissant-bfe87b.netlify.app`
6. Clique em **Add**

### **3. Verificar Configuração**
- ✅ `localhost` (para desenvolvimento)
- ✅ `chimerical-croissant-bfe87b.netlify.app` (para produção)

## 🚀 **Após a correção**
- Login com Google funcionará
- OAuth popup será autorizado
- Erro `auth/unauthorized-domain` será resolvido

---

**Status**: ⚠️ **NECESSÁRIO CONFIGURAR NO FIREBASE CONSOLE** 