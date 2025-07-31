import { useState, useEffect } from 'react'
import { 
  Heart, Plus, Calendar, ArrowLeft, Download, Upload, Trash2, 
  Settings, Trophy, Target, TrendingUp, BookOpen, Star, Award,
  Palette, Bell, Shield, Database, FileText, Zap,
  Edit3, Save, X, Crown, Activity
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { storageService } from '../services/storage'
import { firebaseAuthService } from '../services/firebaseAuth'
import { Quote, User as UserType } from '../types'
import ProfilePhotoUpload from '../components/ProfilePhotoUpload'

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'settings' | 'achievements' | 'edit'>('dashboard')
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    custom: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalDays: 0,
    averagePerDay: 0
  })
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([])
  const [topAuthors, setTopAuthors] = useState<{author: string, count: number}[]>([])
  const [topCategories, setTopCategories] = useState<{category: string, count: number}[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatar: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const firebaseUser = firebaseAuthService.getCurrentUser()
    if (!firebaseUser) return

    try {
      const userData = await firebaseAuthService.getUserData(firebaseUser.uid)
      if (userData) {
        setCurrentUser(userData)
        setEditForm({
          name: userData.name,
          bio: userData.bio || '',
          avatar: userData.avatar || ''
        })

        loadStats()
        loadAchievements()
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const loadStats = () => {
    const allQuotes = storageService.getQuotes()
    const favorites = allQuotes.filter(q => q.isFavorite)
    const custom = allQuotes.filter(q => q.isCustom)
    const thisWeek = allQuotes.filter(q => 
      new Date().getTime() - new Date(q.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    )
    const thisMonth = allQuotes.filter(q => {
      const quoteDate = new Date(q.createdAt)
      const now = new Date()
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear()
    })

    // Calcular dias de uso
    const dates = allQuotes.map(q => new Date(q.createdAt).toDateString())
    const uniqueDates = new Set(dates)
    const totalDays = uniqueDates.size

    // Calcular média por dia
    const averagePerDay = totalDays > 0 ? (allQuotes.length / totalDays).toFixed(1) : 0

    // Top autores
    const authorCounts: {[key: string]: number} = {}
    allQuotes.forEach(q => {
      authorCounts[q.author] = (authorCounts[q.author] || 0) + 1
    })
    const topAuthorsList = Object.entries(authorCounts)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top categorias
    const categoryCounts: {[key: string]: number} = {}
    allQuotes.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1
    })
    const topCategoriesList = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      total: allQuotes.length,
      favorites: favorites.length,
      custom: custom.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      totalDays,
      averagePerDay: parseFloat(averagePerDay.toString())
    })

    setTopAuthors(topAuthorsList)
    setTopCategories(topCategoriesList)

    // Pegar as 5 citações mais recentes
    const recent = allQuotes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    setRecentQuotes(recent)
  }

  const loadAchievements = () => {
    if (!currentUser) return
    // Por enquanto, vamos usar as conquistas do usuário atual
    setAchievements(currentUser.achievements || [])
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return

    const firebaseUser = firebaseAuthService.getCurrentUser()
    if (!firebaseUser) return

    try {
      const updatedUser = {
        ...currentUser,
        name: editForm.name,
        bio: editForm.bio,
        avatar: editForm.avatar
      }

      await firebaseAuthService.updateUser(firebaseUser.uid, {
        name: editForm.name,
        bio: editForm.bio,
        avatar: editForm.avatar
      })
      
      setCurrentUser(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
    }
  }

  const handleExportData = () => {
    const allQuotes = storageService.getQuotes()
    const dataStr = JSON.stringify(allQuotes, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sapientia-quotes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear()
      loadStats()
      alert('Dados limpos com sucesso!')
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: {[key: string]: string} = {
      'philosophy': 'Filosofia',
      'literature': 'Literatura',
      'psychology': 'Psicologia',
      'science': 'Ciência',
      'politics': 'Política'
    }
    return labels[category] || category
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar</span>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-100">
                Perfil
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Gerencie suas informações e veja suas estatísticas
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {currentUser && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <ProfilePhotoUpload
                  currentPhotoURL={currentUser.avatar}
                  onPhotoUpdate={(photoURL) => {
                    setCurrentUser({ ...currentUser, avatar: photoURL })
                    setEditForm({ ...editForm, avatar: photoURL })
                  }}
                  userId={currentUser.id}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                      {currentUser.name}
                    </h2>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-2">
                      {currentUser.email}
                    </p>
                    {currentUser.bio && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {currentUser.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-2 rounded-lg">
                      <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Nível {currentUser.level || 1}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('edit')}
                      className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
                      title="Editar perfil"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-1 mb-6 sm:mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'achievements', label: 'Conquistas', icon: Trophy }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon size={16} className="sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.favorites}</div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Favoritas</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.custom}</div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Personalizadas</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisWeek}</div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Esta semana</div>
              </div>
            </div>

            {/* Recent Quotes */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
                Citações Recentes
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {recentQuotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 sm:p-4">
                    <blockquote className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-serif italic mb-2">
                      "{quote.text}"
                    </blockquote>
                    <footer className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      — {quote.author}
                    </footer>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authors and Categories */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
                  Autores Favoritos
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {topAuthors.map((author, index) => (
                    <div key={author.author} className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
                        {index + 1}. {author.author}
                      </span>
                      <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500">
                        {author.count} citações
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
                  Categorias Populares
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
                        {index + 1}. {getCategoryLabel(category.category)}
                      </span>
                      <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500">
                        {category.count} citações
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
              Conquistas
            </h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`rounded-xl p-4 sm:p-6 border-2 transition-all duration-200 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-800/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked
                        ? 'bg-yellow-500 text-white'
                        : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500'
                    }`}>
                      {achievement.unlocked ? <Trophy size={16} className="sm:w-5 sm:h-5" /> : <Award size={16} className="sm:w-5 sm:h-5" />}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm sm:text-base ${
                        achievement.unlocked
                          ? 'text-neutral-800 dark:text-neutral-200'
                          : 'text-neutral-500 dark:text-neutral-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-xs sm:text-sm ${
                        achievement.unlocked
                          ? 'text-neutral-600 dark:text-neutral-400'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.progress && (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-yellow-500'
                            : 'bg-neutral-400'
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
              Editar Perfil
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <Save size={16} className="sm:w-5 sm:h-5" />
                  <span>Salvar</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile 