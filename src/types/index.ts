export interface Quote {
  id: string
  text: string
  author: string
  source: string
  category: QuoteCategory
  tags: string[]
  isFavorite: boolean
  isCustom: boolean
  createdAt: string
  userId?: string
}

export type QuoteCategory = 'philosophy' | 'literature' | 'psychology' | 'science' | 'politics' | 'other'

export interface ApiQuote {
  _id: string
  content: string
  author: string
  tags: string[]
}

export interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar?: string
  level: number
  experience: number
  totalQuotes: number
  totalFavorites: number
  totalCustom: number
  streak: number
  createdAt: string
  lastLogin: string
  preferences: UserPreferences
  achievements: Achievement[]
  goals: Goal[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  autoBackup: boolean
  language: 'pt-BR' | 'en'
  privacy: 'public' | 'private'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  category: 'collection' | 'activity' | 'social' | 'special'
}

export interface Goal {
  id: string
  title: string
  description: string
  target: number
  progress: number
  type: 'quotes' | 'favorites' | 'custom' | 'streak'
  deadline?: string
  completed: boolean
}

export interface ActivityLog {
  id: string
  userId: string
  action: 'quote_added' | 'quote_favorited' | 'quote_removed' | 'achievement_unlocked' | 'goal_completed'
  data: any
  timestamp: string
}

export interface UserStats {
  totalQuotes: number
  totalFavorites: number
  totalCustom: number
  thisWeek: number
  thisMonth: number
  totalDays: number
  averagePerDay: number
  streak: number
  topAuthors: {author: string, count: number}[]
  topCategories: {category: string, count: number}[]
  recentActivity: ActivityLog[]
} 