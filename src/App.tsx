import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
          
          // Validar se userData é válido
          if (userData && userData.id) {
            setCurrentUser(userData);
          } else {
            throw new Error('Dados do usuário inválidos');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Se não conseguir carregar dados, criar usuário básico
          const fallbackUser: User = {
            id: String(firebaseUser.uid),
            email: String(firebaseUser.email || ''),
            name: String(firebaseUser.displayName || 'Usuário'),
            bio: String(''),
            avatar: String(firebaseUser.photoURL || ''),
            level: Number(1),
            experience: Number(0),
            totalQuotes: Number(0),
            totalFavorites: Number(0),
            totalCustom: Number(0),
            streak: Number(0),
            createdAt: String(new Date().toISOString()),
            lastLogin: String(new Date().toISOString()),
            preferences: {
              theme: 'light' as const,
              notifications: Boolean(true),
              autoBackup: Boolean(true),
              language: 'pt-BR' as const,
              privacy: 'private' as const
            },
            achievements: [] as any[],
            goals: [] as any[]
          };
          console.log('Usando usuário fallback:', fallbackUser);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App; 