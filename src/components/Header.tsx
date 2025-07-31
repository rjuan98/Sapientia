import { Link, useLocation } from 'react-router-dom'
import { Brain, BookOpen, Heart, LogOut, Crown, Trophy, Users, Menu } from 'lucide-react'
import { firebaseAuthService } from '../services/firebaseAuth'
import { User as UserType } from '../types'
import ThemeToggle from './ThemeToggle'
import { useState } from 'react'

interface HeaderProps {
  onLogout: () => void;
  currentUser?: UserType | null;
}

const Header = ({ onLogout, currentUser }: HeaderProps) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Verificar se currentUser é válido e tem as propriedades necessárias
  if (!currentUser || typeof currentUser !== 'object' || !currentUser.id) {
    console.log('Header: currentUser inválido:', currentUser)
    return null
  }

  // Garantir que todas as propriedades são strings/números válidos e serializáveis
  const safeUser = {
    id: String(currentUser.id || ''),
    name: String(currentUser.name || ''),
    email: String(currentUser.email || ''),
    bio: String(currentUser.bio || ''),
    avatar: String(currentUser.avatar || ''),
    level: Number(currentUser.level || 1),
    experience: Number(currentUser.experience || 0),
    totalQuotes: Number(currentUser.totalQuotes || 0),
    totalFavorites: Number(currentUser.totalFavorites || 0),
    totalCustom: Number(currentUser.totalCustom || 0),
    streak: Number(currentUser.streak || 0),
    createdAt: String(currentUser.createdAt || ''),
    lastLogin: String(currentUser.lastLogin || ''),
    preferences: {
      theme: String(currentUser.preferences?.theme || 'light'),
      notifications: Boolean(currentUser.preferences?.notifications !== false),
      autoBackup: Boolean(currentUser.preferences?.autoBackup !== false),
      language: String(currentUser.preferences?.language || 'pt-BR'),
      privacy: String(currentUser.preferences?.privacy || 'private')
    },
    achievements: [],
    goals: []
  }

  const handleLogout = async () => {
    try {
      await firebaseAuthService.logout()
      onLogout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
         <header className="fixed top-0 left-0 right-0 bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-200 z-50">
       <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 overflow-hidden">
         <div className="flex items-center justify-between h-14 sm:h-16 w-full min-w-0">
          {/* Logo Animado */}
                     <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <BookOpen className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full group-hover:animate-pulse"></div>
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-300 rounded-full group-hover:animate-ping"></div>
            </div>
                         <div className="overflow-hidden min-w-0">
               <h1 className="text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                 <span className="inline-block group-hover:animate-bounce">S</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}>a</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.2s' }}>p</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.3s' }}>i</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.4s' }}>e</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.5s' }}>n</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.6s' }}>t</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.7s' }}>i</span>
                 <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.8s' }}>a</span>
               </h1>
               <p className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-300 hidden lg:block">
                 Biblioteca de Citações
               </p>
             </div>
          </Link>

          {/* Desktop Navigation */}
                     <nav className="hidden md:flex items-center space-x-1 lg:space-x-1 flex-shrink-0">
            <Link
              to="/favorites"
                             className={`flex items-center space-x-1 px-1.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 mobile-button mobile-touch ${
                location.pathname === '/favorites'
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              <Heart size={16} className={location.pathname === '/favorites' ? 'fill-current' : ''} />
              <span>Favoritas</span>
            </Link>
            
                         {/* Botão de Conquistas */}
             <button
               onClick={() => {
                 const achievementsSection = document.getElementById('achievements-section')
                 if (achievementsSection) {
                   achievementsSection.scrollIntoView({ behavior: 'smooth' })
                 }
               }}
               className="flex items-center space-x-1 px-1.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-105 mobile-button mobile-touch"
               title="Ver Conquistas"
             >
              <Trophy size={16} />
              <span>Conquistas</span>
            </button>
            
                         {/* Botão de Comunidade */}
             <button
               onClick={() => {
                 if (location.pathname !== '/') {
                   window.location.href = '/#friends-section'
                 } else {
                   const friendsSection = document.getElementById('friends-section')
                   if (friendsSection) {
                     friendsSection.scrollIntoView({ behavior: 'smooth' })
                   }
                 }
               }}
               className="flex items-center space-x-1 px-1.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-105 mobile-button mobile-touch"
               title="Ver Comunidade"
             >
              <Users size={16} />
              <span>Comunidade</span>
            </button>

            {/* Perfil do Usuário */}
            {safeUser && (
                             <div className="flex items-center space-x-1 lg:space-x-1 flex-shrink-0">
                {/* Nível e XP */}
                <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Nível {safeUser.level || 1}
                  </span>
                  <div className="w-16 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                    <div 
                      className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${((safeUser.experience || 0) % 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Avatar e Nome */}
                <Link
                  to="/profile"
                                     className={`flex items-center space-x-1 px-1.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
                    location.pathname === '/profile'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {safeUser.avatar ? (
                        <img src={safeUser.avatar} alt={safeUser.name || 'Usuário'} className="w-8 h-8 rounded-full" />
                      ) : (
                        (safeUser.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{safeUser.name || 'Usuário'}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{safeUser.totalQuotes || 0} citações</div>
                  </div>
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Botão de Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
                     <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-all duration-200 mobile-touch"
              aria-label="Menu"
              title="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
            <div className="space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 mobile-touch ${
                    location.pathname === '/favorites'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Heart size={18} className={location.pathname === '/favorites' ? 'fill-current' : ''} />
                  <span className="font-medium">Favoritas</span>
                </Link>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    const achievementsSection = document.getElementById('achievements-section')
                    if (achievementsSection) {
                      achievementsSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 w-full text-left mobile-touch"
                >
                  <Trophy size={18} />
                  <span className="font-medium">Conquistas</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    if (location.pathname !== '/') {
                      window.location.href = '/#friends-section'
                    } else {
                      const friendsSection = document.getElementById('friends-section')
                      if (friendsSection) {
                        friendsSection.scrollIntoView({ behavior: 'smooth' })
                      }
                    }
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 w-full text-left mobile-touch"
                >
                  <Users size={18} />
                  <span className="font-medium">Comunidade</span>
                </button>
              </div>

              {/* Mobile User Info */}
              {safeUser && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === '/profile'
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {safeUser.avatar ? (
                          <img src={safeUser.avatar} alt={safeUser.name || 'Usuário'} className="w-10 h-10 rounded-full" />
                        ) : (
                          (safeUser.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">{safeUser.name || 'Usuário'}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{safeUser.totalQuotes || 0} citações</div>
                    </div>
                  </Link>

                  {/* Mobile Level Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-2 rounded-lg">
                      <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Nível {safeUser.level || 1}
                      </span>
                      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full ml-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
                          style={{ width: `${((safeUser.experience || 0) % 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Logout */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 w-full"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 