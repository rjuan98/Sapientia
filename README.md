# 🧠 Sapientia - Biblioteca de Citações

Uma aplicação moderna para gerenciar e compartilhar citações filosóficas, literárias e científicas.

## ✨ Funcionalidades

### 📚 **Gestão de Citações**
- ✅ Adicionar citações personalizadas
- ✅ Sistema de favoritos
- ✅ Busca e filtros avançados
- ✅ Categorização por temas
- ✅ Backup e sincronização na nuvem

### 👥 **Sistema Social**
- ✅ Comunidade de usuários
- ✅ Sistema de amigos
- ✅ Compartilhamento de citações
- ✅ Perfis personalizados

### 🎨 **Interface Moderna**
- ✅ Dark/Light mode
- ✅ Design responsivo
- ✅ Animações suaves
- ✅ Interface intuitiva

### 🔐 **Autenticação Segura**
- ✅ Login com Firebase Auth
- ✅ Perfis personalizados
- ✅ Sistema de conquistas
- ✅ Progresso do usuário

## 🚀 Tecnologias

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Tablet otimizado
- ✅ Desktop completo
- ✅ Navegação adaptativa

## 🎯 Funcionalidades Principais

### **Home Page**
- Busca avançada de citações
- Filtros por categoria
- Estatísticas pessoais
- Sistema de conquistas

### **Favoritas**
- Lista de citações favoritas
- Organização personalizada
- Busca e filtros

### **Comunidade**
- Sistema de amigos
- Compartilhamento
- Perfis de usuários
- Atividade social

### **Perfil**
- Informações pessoais
- Estatísticas de uso
- Conquistas desbloqueadas
- Configurações

## 🔧 Instalação

```bash
# Clone o repositório
git clone git@github.com:rjuan98/Sapientia.git

# Entre na pasta
cd Sapientia

# Instale as dependências
npm install

# Configure o Firebase
# Adicione suas credenciais em src/config/firebase.ts

# Execute o projeto
npm run dev
```

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.tsx      # Header principal
│   ├── ThemeToggle.tsx # Toggle de tema
│   ├── FriendsSection.tsx # Sistema social
│   ├── FloatingAddButton.tsx # Botão flutuante
│   └── ScrollToTopButton.tsx # Botão scroll to top
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Login.tsx       # Autenticação
│   ├── Profile.tsx     # Perfil do usuário
│   ├── Favorites.tsx   # Favoritas
│   └── AddQuote.tsx    # Adicionar citação
├── services/           # Serviços e APIs
│   ├── firebaseAuth.ts # Autenticação Firebase
│   ├── friendsService.ts # Sistema de amigos
│   └── storageService.ts # Armazenamento local
├── contexts/           # Contextos React
│   └── ThemeContext.tsx # Contexto de tema
├── types/              # Tipos TypeScript
│   └── index.ts        # Definições de tipos
└── config/             # Configurações
    └── firebase.ts     # Configuração Firebase
```

## 🎨 Temas

### **Light Mode**
- Fundo claro e limpo
- Texto escuro para contraste
- Cores suaves e profissionais

### **Dark Mode**
- Fundo escuro elegante
- Texto claro para legibilidade
- Cores vibrantes para destaque

## 🔐 Segurança

- ✅ Autenticação Firebase
- ✅ Regras de segurança Firestore
- ✅ Validação de dados
- ✅ Proteção de rotas

## 📊 Funcionalidades Avançadas

### **Sistema de Conquistas**
- Níveis de usuário
- Experiência acumulada
- Conquistas desbloqueáveis
- Progresso visual

### **Backup e Sincronização**
- Backup automático
- Sincronização na nuvem
- Recuperação de dados
- Migração segura

### **Busca Inteligente**
- Busca por texto
- Filtros por categoria
- Busca por autor
- Resultados em tempo real

## 🚀 Deploy

O projeto está configurado para deploy em:
- ✅ Vercel
- ✅ Netlify
- ✅ Firebase Hosting
- ✅ GitHub Pages

## 📈 Roadmap

- [ ] Sistema de tags avançado
- [ ] Exportação de citações
- [ ] API pública
- [ ] Aplicativo mobile
- [ ] Integração com APIs externas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Rafael Juan** - [GitHub](https://github.com/rjuan98)

---

**Sapientia** - Transformando conhecimento em inspiração 🧠✨ 