import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { User } from '../types'

class FirebaseAuthService {
  async loginWithGoogle(rememberMe: boolean = false): Promise<User> {
    try {
      console.log('LoginWithGoogle - rememberMe:', rememberMe)
      
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      console.log('LoginWithGoogle - setting persistence:', persistence)
      
      await setPersistence(auth, persistence)
      
      console.log('LoginWithGoogle - starting popup')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      const user = result.user
      console.log('LoginWithGoogle - successful, user:', user.uid)
      
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = await this.getUserData(user.uid)
        if (userData) {
          console.log('LoginWithGoogle - user data loaded')
          return userData
        }
      }
      
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'Usuário',
        bio: '',
        avatar: user.photoURL || '',
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
        achievements: this.getInitialAchievements() as any,
        goals: this.getInitialGoals() as any
      }
      
      await setDoc(doc(db, 'users', user.uid), newUser)
      console.log('LoginWithGoogle - new user created')
      
      return newUser
    } catch (error: any) {
      console.error('LoginWithGoogle - error:', error)
      throw new Error('Erro no login com Google: ' + error.message)
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: name,
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
        achievements: this.getInitialAchievements() as any,
        goals: this.getInitialGoals() as any
      }
      
      await setDoc(doc(db, 'users', user.uid), newUser)
      return newUser
    } catch (error: any) {
      throw new Error('Erro no registro: ' + error.message)
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      console.log('Login - rememberMe:', rememberMe)
      
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      console.log('Login - setting persistence:', persistence)
      
      await setPersistence(auth, persistence)
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Login - successful, user:', user.uid)
      
      const userData = await this.getUserData(user.uid)
      if (userData) {
        console.log('Login - user data loaded')
        return userData
      }
      
      throw new Error('Dados do usuário não encontrados')
    } catch (error: any) {
      console.error('Login - error:', error)
      throw new Error('Erro no login: ' + error.message)
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error('Erro no logout: ' + error.message)
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), userData)
    } catch (error: any) {
      throw new Error('Erro ao atualizar usuário: ' + error.message)
    }
  }

  async getUserData(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const data = userDoc.data()
        console.log('Raw Firestore data:', data)
        
        const userData: User = {
          id: String(data.id || userId),
          email: String(data.email || ''),
          name: String(data.name || ''),
          bio: String(data.bio || ''),
          avatar: String(data.avatar || ''),
          level: Number(data.level || 1),
          experience: Number(data.experience || 0),
          totalQuotes: Number(data.totalQuotes || 0),
          totalFavorites: Number(data.totalFavorites || 0),
          totalCustom: Number(data.totalCustom || 0),
          streak: Number(data.streak || 0),
          createdAt: String(data.createdAt || new Date().toISOString()),
          lastLogin: String(data.lastLogin || new Date().toISOString()),
          preferences: {
            theme: (data.preferences?.theme || 'light') as 'light' | 'dark' | 'auto',
            notifications: Boolean(data.preferences?.notifications !== false),
            autoBackup: Boolean(data.preferences?.autoBackup !== false),
            language: (data.preferences?.language || 'pt-BR') as 'pt-BR' | 'en',
            privacy: (data.preferences?.privacy || 'private') as 'public' | 'private'
          },
          achievements: Array.isArray(data.achievements) ? data.achievements.map((achievement: any, index: number) => ({
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
          goals: Array.isArray(data.goals) ? data.goals.map((goal: any, index: number) => ({
            id: String(goal?.id || `goal-${index}`),
            title: String(goal?.title || 'Goal'),
            description: String(goal?.description || 'Descrição padrão'),
            target: Number(goal?.target) || 1,
            progress: Number(goal?.progress) || 0,
            type: (goal?.type || 'quotes') as 'quotes' | 'favorites' | 'custom' | 'streak',
            deadline: goal?.deadline ? String(goal.deadline) : undefined,
            completed: Boolean(goal?.completed)
          })) : []
        }
        
        console.log('Processed user data:', userData)
        console.log('Achievements count:', userData.achievements.length)
        console.log('Goals count:', userData.goals.length)
        
        return userData
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      return null
    }
  }

  getInitialAchievements() {
    return [
      {
        id: 'first-quote',
        title: 'Primeira Citação',
        description: 'Adicionou sua primeira citação',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        category: 'collection' as const
      },
      {
        id: 'favorite-collector',
        title: 'Colecionador de Favoritas',
        description: 'Marcou 10 citações como favoritas',
        icon: '❤️',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        category: 'collection' as const
      },
      {
        id: 'quote-master',
        title: 'Mestre das Citações',
        description: 'Atingiu 50 citações salvas',
        icon: '📚',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        category: 'collection' as const
      },
      {
        id: 'custom-creator',
        title: 'Criador Personalizado',
        description: 'Criou 5 citações personalizadas',
        icon: '✍️',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        category: 'activity' as const
      },
      {
        id: 'daily-user',
        title: 'Usuário Diário',
        description: 'Usou o app por 7 dias consecutivos',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 7,
        category: 'activity' as const
      },
      {
        id: 'quote-enthusiast',
        title: 'Entusiasta das Citações',
        description: 'Atingiu 100 citações salvas',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        category: 'collection' as const
      },
      {
        id: 'streak-master',
        title: 'Mestre da Sequência',
        description: 'Manteve uma sequência de 30 dias',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 30,
        category: 'activity' as const
      },
      {
        id: 'level-10',
        title: 'Nível 10',
        description: 'Atingiu o nível 10',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        category: 'special' as const
      }
    ]
  }

  getInitialGoals() {
    return [
      {
        id: 'monthly-quotes',
        title: 'Meta Mensal',
        description: 'Adicionar 20 citações este mês',
        target: 20,
        progress: 0,
        type: 'quotes' as const,
        completed: false
      },
      {
        id: 'weekly-favorites',
        title: 'Favoritas da Semana',
        description: 'Marcar 5 citações como favoritas',
        target: 5,
        progress: 0,
        type: 'favorites' as const,
        completed: false
      }
    ]
  }
}

export const firebaseAuthService = new FirebaseAuthService() 