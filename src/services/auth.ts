import { User, Achievement, Goal, ActivityLog } from '../types'

const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  USERS: 'users',
  ACTIVITY_LOGS: 'activityLogs'
}

const authService = {
  // Registrar novo usuário
  register(email: string, _password: string, name: string): User {
    const users = this.getAllUsers()
    
    // Verificar se email já existe
    if (users.find(u => u.email === email)) {
      throw new Error('Email já está em uso')
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
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
      achievements: this.getInitialAchievements(),
      goals: this.getInitialGoals()
    }

    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser))
    
    return newUser
  },

  // Fazer login
  login(email: string, _password: string): User {
    const users = this.getAllUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Atualizar último login
    user.lastLogin = new Date().toISOString()
    this.updateUser(user)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    
    return user
  },

  // Fazer logout
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  // Obter usuário atual
  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  },

  // Atualizar usuário
  updateUser(user: User): void {
    const users = this.getAllUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users[index] = user
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    }
  },

  // Obter todos os usuários
  getAllUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  },

  // Adicionar experiência
  addExperience(userId: string, amount: number): void {
    const user = this.getCurrentUser()
    if (!user || user.id !== userId) return

    user.experience += amount
    
    // Calcular novo nível (100 XP por nível)
    const newLevel = Math.floor(user.experience / 100) + 1
    if (newLevel > user.level) {
      user.level = newLevel
      this.logActivity(userId, 'level_up', { newLevel })
    }

    this.updateUser(user)
  },

  // Adicionar atividade
  logActivity(userId: string, action: string, data: any): void {
    const logs = this.getActivityLogs()
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId,
      action: action as any,
      data,
      timestamp: new Date().toISOString()
    }
    
    logs.push(newLog)
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs))
  },

  // Obter logs de atividade
  getActivityLogs(): ActivityLog[] {
    const logs = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)
    return logs ? JSON.parse(logs) : []
  },

  // Obter conquistas iniciais
  getInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first-quote',
        title: 'Primeira Citação',
        description: 'Adicionou sua primeira citação',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        category: 'collection'
      },
      {
        id: 'favorite-collector',
        title: 'Colecionador de Favoritas',
        description: 'Marcou 10 citações como favoritas',
        icon: '❤️',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        category: 'collection'
      },
      {
        id: 'quote-master',
        title: 'Mestre das Citações',
        description: 'Atingiu 50 citações salvas',
        icon: '📚',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        category: 'collection'
      },
      {
        id: 'custom-creator',
        title: 'Criador Personalizado',
        description: 'Criou 5 citações personalizadas',
        icon: '✍️',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        category: 'activity'
      },
      {
        id: 'daily-user',
        title: 'Usuário Diário',
        description: 'Usou o app por 7 dias consecutivos',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 7,
        category: 'activity'
      },
      {
        id: 'quote-enthusiast',
        title: 'Entusiasta das Citações',
        description: 'Atingiu 100 citações salvas',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        category: 'collection'
      },
      {
        id: 'streak-master',
        title: 'Mestre da Sequência',
        description: 'Manteve uma sequência de 30 dias',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 30,
        category: 'activity'
      },
      {
        id: 'level-10',
        title: 'Nível 10',
        description: 'Atingiu o nível 10',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        category: 'special'
      }
    ]
  },

  // Obter metas iniciais
  getInitialGoals(): Goal[] {
    return [
      {
        id: 'monthly-quotes',
        title: 'Meta Mensal',
        description: 'Adicionar 20 citações este mês',
        target: 20,
        current: 0,
        type: 'quotes',
        completed: false
      },
      {
        id: 'weekly-favorites',
        title: 'Favoritas da Semana',
        description: 'Marcar 5 citações como favoritas',
        target: 5,
        current: 0,
        type: 'favorites',
        completed: false
      }
    ]
  },

  // Verificar e desbloquear conquistas
  checkAchievements(user: User): Achievement[] {
    const achievements = user.achievements
    let updated = false

    achievements.forEach(achievement => {
      if (achievement.unlocked) return

      let shouldUnlock = false
      switch (achievement.id) {
        case 'first-quote':
          shouldUnlock = user.totalQuotes >= 1
          achievement.progress = user.totalQuotes
          break
        case 'favorite-collector':
          shouldUnlock = user.totalFavorites >= 10
          achievement.progress = user.totalFavorites
          break
        case 'quote-master':
          shouldUnlock = user.totalQuotes >= 50
          achievement.progress = user.totalQuotes
          break
        case 'custom-creator':
          shouldUnlock = user.totalCustom >= 5
          achievement.progress = user.totalCustom
          break
        case 'daily-user':
          shouldUnlock = user.streak >= 7
          achievement.progress = user.streak
          break
        case 'quote-enthusiast':
          shouldUnlock = user.totalQuotes >= 100
          achievement.progress = user.totalQuotes
          break
        case 'streak-master':
          shouldUnlock = user.streak >= 30
          achievement.progress = user.streak
          break
        case 'level-10':
          shouldUnlock = user.level >= 10
          achievement.progress = user.level
          break
      }

      if (shouldUnlock && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date().toISOString()
        this.logActivity(user.id, 'achievement_unlocked', { achievementId: achievement.id })
        updated = true
      }
    })

    if (updated) {
      this.updateUser(user)
    }

    return achievements
  },

  // Atualizar estatísticas do usuário
  updateUserStats(userId: string, stats: Partial<User>): void {
    const user = this.getCurrentUser()
    if (!user || user.id !== userId) return

    Object.assign(user, stats)
    this.updateUser(user)
  }
}

export { authService } 