import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Header from './components/Header';
import FloatingAddButton from './components/FloatingAddButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import AddQuote from './pages/AddQuote';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { firebaseAuthService } from './services/firebaseAuth';
import { User } from './types';
import { ThemeProvider } from './contexts/ThemeContext';

// Error Boundary para capturar React Error #130
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erro na Aplicação</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500">Detalhes do erro</summary>
                <pre className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Função para validar e limpar dados do usuário
const validateAndCleanUserData = (data: any): User => {
  try {
    // Garantir que todos os campos são serializáveis
    const cleanUser: User = {
      id: String(data?.id || ''),
      email: String(data?.email || ''),
      name: String(data?.name || ''),
      bio: String(data?.bio || ''),
      avatar: String(data?.avatar || ''),
      level: Number(data?.level || 1),
      experience: Number(data?.experience || 0),
      totalQuotes: Number(data?.totalQuotes || 0),
      totalFavorites: Number(data?.totalFavorites || 0),
      totalCustom: Number(data?.totalCustom || 0),
      streak: Number(data?.streak || 0),
      createdAt: String(data?.createdAt || new Date().toISOString()),
      lastLogin: String(data?.lastLogin || new Date().toISOString()),
      preferences: {
        theme: (data?.preferences?.theme || 'light') as 'light' | 'dark' | 'auto',
        notifications: Boolean(data?.preferences?.notifications !== false),
        autoBackup: Boolean(data?.preferences?.autoBackup !== false),
        language: (data?.preferences?.language || 'pt-BR') as 'pt-BR' | 'en',
        privacy: (data?.preferences?.privacy || 'private') as 'public' | 'private'
      },
      achievements: Array.isArray(data?.achievements) ? data.achievements.map((achievement: any, index: number) => ({
        id: String(achievement?.id || `achievement-${index}`),
        title: String(achievement?.title || 'Achievement'),
        description: String(achievement?.description || 'Descrição padrão'),
        icon: String(achievement?.icon || '🏆'),
        unlocked: Boolean(achievement?.unlocked),
        unlockedAt: achievement?.unlockedAt ? String(achievement.unlockedAt) : undefined,
        progress: Number(achievement?.progress) || 0,
        maxProgress: Number(achievement?.maxProgress) || 1,
        category: (achievement?.category || 'collection') as 'collection' | 'activity' | 'social' | 'special'
      })) : [],
      goals: Array.isArray(data?.goals) ? data.goals.map((goal: any, index: number) => ({
        id: String(goal?.id || `goal-${index}`),
        title: String(goal?.title || 'Goal'),
        description: String(goal?.description || 'Descrição padrão'),
        target: Number(goal?.target) || 1,
        progress: Number(goal?.progress) || 0,
        type: (goal?.type || 'quotes') as 'quotes' | 'favorites' | 'custom' | 'streak',
        deadline: goal?.deadline ? String(goal.deadline) : undefined,
        completed: Boolean(goal?.completed)
      })) : []
    };

    // Testar serialização
    JSON.stringify(cleanUser);
    return cleanUser;
  } catch (error) {
    console.error('Erro ao validar dados do usuário:', error);
    // Retornar dados mínimos seguros
    return {
      id: String(data?.id || ''),
      email: String(data?.email || ''),
      name: String(data?.name || 'Usuário'),
      bio: '',
      avatar: '',
      level: 1,
      experience: 0,
      totalQuotes: 0,
      totalFavorites: 0,
      totalCustom: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: true,
        autoBackup: true,
        language: 'pt-BR',
        privacy: 'private'
      },
      achievements: [],
      goals: []
    };
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar mudanças de autenticação do Firebase
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        try {
          const userData = await firebaseAuthService.getUserData(firebaseUser.uid);
          console.log('User data loaded:', userData);
          
          if (userData) {
            // Validar e limpar dados antes de usar
            const cleanUserData = validateAndCleanUserData(userData);
            setCurrentUser(cleanUserData);
          } else {
            // Se não conseguir carregar dados, criar usuário básico
            const fallbackUser = validateAndCleanUserData({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              avatar: firebaseUser.photoURL
            });
            setCurrentUser(fallbackUser);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Se não conseguir carregar dados, criar usuário básico
          const fallbackUser = validateAndCleanUserData({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL
          });
          setCurrentUser(fallbackUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseAuthService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        {loading ? (
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Carregando...</p>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
            {currentUser && <Header onLogout={handleLogout} currentUser={currentUser} />}
            <main className="container-responsive">
              <Routes>
                <Route 
                  path="/" 
                  element={currentUser ? <Home /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/favorites" 
                  element={currentUser ? <Favorites /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/add" 
                  element={currentUser ? <AddQuote /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/profile" 
                  element={currentUser ? <Profile /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/login" 
                  element={currentUser ? <Navigate to="/" /> : <Login />} 
                />
              </Routes>
            </main>
            {currentUser && <FloatingAddButton />}
            {currentUser && <ScrollToTopButton />}
          </div>
        )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 