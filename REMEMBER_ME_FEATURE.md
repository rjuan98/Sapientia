# Funcionalidade "Manter Logado"

## Como Funciona

A funcionalidade "Manter logado" permite que o usuário permaneça conectado mesmo após fechar o navegador.

## Tipos de Persistência

### 1. **Sessão (Padrão)**
- **Comportamento**: Usuário fica logado apenas durante a sessão atual
- **Quando**: Checkbox "Manter logado" **NÃO** marcado
- **Duração**: Até fechar o navegador/aba
- **Segurança**: Mais segura, logout automático ao fechar

### 2. **Local (Manter Logado)**
- **Comportamento**: Usuário fica logado mesmo após fechar o navegador
- **Quando**: Checkbox "Manter logado" **marcado**
- **Duração**: Até fazer logout manualmente ou limpar dados do navegador
- **Segurança**: Conveniente, mas menos segura em computadores compartilhados

## Implementação Técnica

### Firebase Auth Persistence
```typescript
// Sessão (temporário)
await setPersistence(auth, browserSessionPersistence)

// Local (permanente)
await setPersistence(auth, browserLocalPersistence)
```

### Interface do Usuário
- ✅ Checkbox "Manter logado" apenas na tela de login
- ✅ Não aparece na tela de registro
- ✅ Resetado ao alternar entre login/registro
- ✅ Funciona tanto para login tradicional quanto Google

## Benefícios

### Para o Usuário
- **Conveniência**: Não precisa fazer login toda vez
- **Escolha**: Pode escolher entre segurança e conveniência
- **Flexibilidade**: Funciona em qualquer dispositivo

### Para o Desenvolvedor
- **Firebase Native**: Usa recursos nativos do Firebase Auth
- **Seguro**: Gerenciado pelo Firebase
- **Simples**: Não precisa gerenciar tokens manualmente

## Considerações de Segurança

### Recomendações
1. **Computadores Públicos**: Não marcar "manter logado"
2. **Computadores Pessoais**: Pode marcar com segurança
3. **Dispositivos Móveis**: Conveniente para uso diário

### Logout Manual
- Sempre disponível no header da aplicação
- Remove a sessão imediatamente
- Funciona independente da configuração de persistência

## Testando a Funcionalidade

### Teste 1: Sessão Normal
1. Faça login **SEM** marcar "manter logado"
2. Feche o navegador completamente
3. Abra novamente e acesse o site
4. **Resultado**: Deve pedir login novamente

### Teste 2: Manter Logado
1. Faça login **MARCANDO** "manter logado"
2. Feche o navegador completamente
3. Abra novamente e acesse o site
4. **Resultado**: Deve estar logado automaticamente

### Teste 3: Google Login
1. Use "Continuar com Google" **SEM** marcar "manter logado"
2. Feche o navegador
3. Abra novamente
4. **Resultado**: Deve pedir login novamente

### Teste 4: Google + Manter Logado
1. Use "Continuar com Google" **MARCANDO** "manter logado"
2. Feche o navegador
3. Abra novamente
4. **Resultado**: Deve estar logado automaticamente

## Próximas Melhorias

- [ ] Lembrar a preferência do usuário
- [ ] Configuração global nas preferências
- [ ] Auto-logout após inatividade
- [ ] Notificação de sessão ativa 