import { Quote } from '../types'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'

const STORAGE_KEYS = {
  QUOTES: 'quotes',
  USER: 'user'
}

class StorageService {
  // Upload de foto de perfil
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos')
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB')
      }

      // Criar referência para o arquivo
      const storageRef = ref(storage, `profile-photos/${userId}/${Date.now()}_${file.name}`)
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file)
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('Foto de perfil enviada com sucesso:', downloadURL)
      return downloadURL
    } catch (error: any) {
      console.error('Erro ao enviar foto de perfil:', error)
      throw new Error('Erro ao enviar foto de perfil: ' + error.message)
    }
  }

  // Deletar foto de perfil antiga
  async deleteProfilePhoto(userId: string, photoURL: string): Promise<void> {
    try {
      if (!photoURL || photoURL.includes('default')) {
        return // Não deletar fotos padrão
      }

      // Extrair o caminho do arquivo da URL
      const urlParts = photoURL.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const fileRef = ref(storage, `profile-photos/${userId}/${fileName}`)
      
      await deleteObject(fileRef)
      console.log('Foto de perfil antiga deletada')
    } catch (error: any) {
      console.error('Erro ao deletar foto de perfil:', error)
      // Não lançar erro pois não é crítico
    }
  }

  // Upload de imagem para citações
  async uploadQuoteImage(userId: string, quoteId: string, file: File): Promise<string> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos')
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 10MB')
      }

      // Criar referência para o arquivo
      const storageRef = ref(storage, `quote-images/${userId}/${quoteId}/${Date.now()}_${file.name}`)
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file)
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('Imagem da citação enviada com sucesso:', downloadURL)
      return downloadURL
    } catch (error: any) {
      console.error('Erro ao enviar imagem da citação:', error)
      throw new Error('Erro ao enviar imagem da citação: ' + error.message)
    }
  }

  // Deletar imagem de citação
  async deleteQuoteImage(imageURL: string): Promise<void> {
    try {
      if (!imageURL) {
        return
      }

      // Extrair o caminho do arquivo da URL
      const urlParts = imageURL.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const fileRef = ref(storage, `quote-images/${fileName}`)
      
      await deleteObject(fileRef)
      console.log('Imagem da citação deletada')
    } catch (error: any) {
      console.error('Erro ao deletar imagem da citação:', error)
      // Não lançar erro pois não é crítico
    }
  }

  // Obter URL de imagem padrão
  getDefaultProfilePhoto(): string {
    return 'https://via.placeholder.com/150x150/cccccc/666666?text=Usuário'
  }

  // Validar arquivo de imagem
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Apenas arquivos de imagem são permitidos' }
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'A imagem deve ter no máximo 5MB' }
    }

    // Verificar extensão
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return { isValid: false, error: 'Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP' }
    }

    return { isValid: true }
  }

  // Salvar citações
  saveQuotes(quotes: Quote[]): void {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes))
  }

  // Carregar citações
  loadQuotes(): Quote[] {
    const quotes = localStorage.getItem(STORAGE_KEYS.QUOTES)
    return quotes ? JSON.parse(quotes) : []
  }

  // Obter citações (alias para loadQuotes)
  getQuotes(): Quote[] {
    return this.loadQuotes()
  }

  // Adicionar nova citação
  addQuote(quote: Quote): void {
    const quotes = this.loadQuotes()
    quotes.push(quote)
    this.saveQuotes(quotes)
  }

  // Atualizar citação existente
  updateQuote(id: string, updates: Partial<Quote>): void {
    const quotes = this.loadQuotes()
    const index = quotes.findIndex(q => q.id === id)
    if (index !== -1) {
      quotes[index] = { ...quotes[index], ...updates }
      this.saveQuotes(quotes)
    }
  }

  // Remover citação
  removeQuote(id: string): void {
    const quotes = this.loadQuotes()
    const filteredQuotes = quotes.filter(q => q.id !== id)
    this.saveQuotes(filteredQuotes)
  }

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
  }

  // Salvar dados do usuário
  saveUser(user: any): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  // Carregar dados do usuário
  loadUser(): any {
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  }

  // Fazer backup das citações
  backupQuotes(): void {
    const quotes = this.loadQuotes()
    if (quotes.length > 0) {
      const backupKey = `quotes_backup_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(quotes))
      console.log(`Backup criado: ${backupKey} com ${quotes.length} citações`)
    }
  }

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
  }

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
  }

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

export const storageService = new StorageService() 