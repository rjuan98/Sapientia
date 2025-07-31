import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { User } from '../types'

class FirebaseAuthService {
  // Login com Google
  async loginWithGoogle(rememberMe: boolean = false): Promise<User> {
    try {
      console.log('LoginWithGoogle - rememberMe:', rememberMe)
      
      // Configurar persistência ANTES de fazer login
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      console.log('LoginWithGoogle - setting persistence:', persistence)
      await setPersistence(auth, persistence)
      
      const provider = new GoogleAuthProvider()
      console.log('LoginWithGoogle - starting popup')
      const userCredential = await signInWithPopup(auth, provider)
      const firebaseUser = userCredential.user
      console.log('LoginWithGoogle - popup successful, user:', firebaseUser.uid)

      // Verificar se o usuário já existe no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        // Usuário já existe, retornar dados existentes
        const userData = userDoc.data() as User
        
        // Atualizar último login
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: new Date().toISOString()
        })

        console.log('LoginWithGoogle - existing user logged in')
        return userData
      } else {
        // Novo usuário, criar documento no Firestore
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Usuário',
          bio: '',
          avatar: firebaseUser.photoURL || '',
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userData)
        console.log('LoginWithGoogle - new user created')
        return userData
      }
    } catch (error: any) {
      console.error('LoginWithGoogle - error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelado pelo usuário')
      }
      throw new Error('Erro ao fazer login com Google: ' + error.message)
    }
  }

  // Registrar novo usuário
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Atualizar display name
      await updateProfile(firebaseUser, { displayName: name })

      // Criar documento do usuário no Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: email,
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

      await setDoc(doc(db, 'users', firebaseUser.uid), userData)

      return userData
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email já está em uso')
      }
      throw new Error('Erro ao criar conta: ' + error.message)
    }
  }

  // Fazer login
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      console.log('Login - rememberMe:', rememberMe)
      
      // Configurar persistência ANTES de fazer login
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      console.log('Login - setting persistence:', persistence)
      await setPersistence(auth, persistence)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      console.log('Login - successful, user:', firebaseUser.uid)

      // Buscar dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados')
      }

      const userData = userDoc.data() as User

      // Atualizar último login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: new Date().toISOString()
      })

      console.log('Login - user data loaded')
      return userData
    } catch (error: any) {
      console.error('Login - error:', error)
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado')
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta')
      }
      throw new Error('Erro ao fazer login: ' + error.message)
    }
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error('Erro ao fazer logout: ' + error.message)
    }
  }

  // Obter usuário atual
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  // Escutar mudanças de autenticação
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Atualizar usuário no Firestore
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), userData)
    } catch (error: any) {
      throw new Error('Erro ao atualizar usuário: ' + error.message)
    }
  }

  // Obter dados do usuário do Firestore
  async getUserData(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const data = userDoc.data()
        console.log('Raw Firestore data:', data)
        
        // Garantir que os dados estão no formato correto e são serializáveis
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
          achievements: [],
          goals: []
        }
        
        console.log('Processed user data:', userData)
        return userData
      }
      return null
    } catch (error: any) {
      console.error('Error in getUserData:', error)
      throw new Error('Erro ao buscar dados do usuário: ' + error.message)
    }
  }

  // Obter conquistas iniciais
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
  }

  // Obter metas iniciais
  getInitialGoals() {
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
  }
}

export const firebaseAuthService = new FirebaseAuthService() 