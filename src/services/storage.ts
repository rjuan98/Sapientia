import { Quote } from '../types'

const STORAGE_KEYS = {
  QUOTES: 'quotes',
  USER: 'user'
}

const storageService = {
  // Salvar citações
  saveQuotes(quotes: Quote[]): void {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes))
  },

  // Carregar citações
  loadQuotes(): Quote[] {
    const quotes = localStorage.getItem(STORAGE_KEYS.QUOTES)
    return quotes ? JSON.parse(quotes) : []
  },

  // Obter citações (alias para loadQuotes)
  getQuotes(): Quote[] {
    return this.loadQuotes()
  },

  // Adicionar nova citação
  addQuote(quote: Quote): void {
    const quotes = this.loadQuotes()
    quotes.push(quote)
    this.saveQuotes(quotes)
  },

  // Atualizar citação existente
  updateQuote(id: string, updates: Partial<Quote>): void {
    const quotes = this.loadQuotes()
    const index = quotes.findIndex(q => q.id === id)
    if (index !== -1) {
      quotes[index] = { ...quotes[index], ...updates }
      this.saveQuotes(quotes)
    }
  },

  // Remover citação
  removeQuote(id: string): void {
    const quotes = this.loadQuotes()
    const filteredQuotes = quotes.filter(q => q.id !== id)
    this.saveQuotes(filteredQuotes)
  },

  // Limpar duplicações (versão segura que preserva favoritas)
  removeDuplicates(): void {
    const quotes = this.loadQuotes()
    const seen = new Set<string>()
    const uniqueQuotes: Quote[] = []
    
    for (const quote of quotes) {
      const key = `${quote.text.toLowerCase().trim()}-${quote.author.toLowerCase().trim()}`
      
      if (seen.has(key)) {
        // Se já vimos esta citação, verificar se devemos substituir
        const existingIndex = uniqueQuotes.findIndex(q => 
          `${q.text.toLowerCase().trim()}-${q.author.toLowerCase().trim()}` === key
        )
        
        if (existingIndex !== -1) {
          const existingQuote = uniqueQuotes[existingIndex]
          
          // Se a atual é favorita e a existente não, substituir
          if (quote.isFavorite && !existingQuote.isFavorite) {
            uniqueQuotes[existingIndex] = quote
          }
          // Se ambas são favoritas ou nenhuma é, manter a primeira
          // Se a existente é favorita e a atual não, manter a existente
        }
      } else {
        seen.add(key)
        uniqueQuotes.push(quote)
      }
    }
    
    this.saveQuotes(uniqueQuotes)
  },

  // Salvar dados do usuário
  saveUser(user: any): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  // Carregar dados do usuário
  loadUser(): any {
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  },

  // Fazer backup das citações
  backupQuotes(): void {
    const quotes = this.loadQuotes()
    if (quotes.length > 0) {
      const backupKey = `quotes_backup_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(quotes))
      console.log(`Backup criado: ${backupKey} com ${quotes.length} citações`)
    }
  },

  // Restaurar de backup
  restoreFromBackup(): Quote[] | null {
    const allKeys = Object.keys(localStorage)
    const backupKeys = allKeys.filter(key => key.startsWith('quotes_backup_'))
    
    if (backupKeys.length > 0) {
      // Pegar o backup mais recente
      const latestBackup = backupKeys.sort().pop()
      if (latestBackup) {
        try {
          const data = localStorage.getItem(latestBackup)
          if (data) {
            const quotes = JSON.parse(data)
            if (Array.isArray(quotes) && quotes.length > 0) {
              this.saveQuotes(quotes)
              console.log(`Restaurado backup: ${latestBackup} com ${quotes.length} citações`)
              return quotes
            }
          }
        } catch (e) {
          console.error('Erro ao restaurar backup:', e)
        }
      }
    }
    return null
  },

  // Verificar e corrigir inconsistências nas citações
  validateAndFixQuotes(): Quote[] {
    const quotes = this.loadQuotes()
    let hasChanges = false
    
    // Garantir que todas as citações tenham as propriedades necessárias
    const fixedQuotes = quotes.map(quote => {
      const fixedQuote = {
        id: quote.id || Date.now().toString(),
        text: quote.text || '',
        author: quote.author || '',
        source: quote.source || '',
        category: quote.category || 'philosophy',
        tags: Array.isArray(quote.tags) ? quote.tags : [],
        isFavorite: Boolean(quote.isFavorite),
        isCustom: Boolean(quote.isCustom),
        createdAt: quote.createdAt || new Date().toISOString()
      }
      
      // Verificar se houve mudanças
      if (JSON.stringify(quote) !== JSON.stringify(fixedQuote)) {
        hasChanges = true
      }
      
      return fixedQuote
    })
    
    // Se houve correções, salvar
    if (hasChanges) {
      this.saveQuotes(fixedQuotes)
      console.log('Citações corrigidas e salvas')
    }
    
    return fixedQuotes
  },

  // Obter estatísticas das citações
  getQuotesStats(): { total: number, favorites: number, custom: number, recent: number } {
    const quotes = this.loadQuotes()
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      total: quotes.length,
      favorites: quotes.filter(q => q.isFavorite).length,
      custom: quotes.filter(q => q.isCustom).length,
      recent: quotes.filter(q => new Date(q.createdAt) > oneWeekAgo).length
    }
  }
}

export { storageService } 