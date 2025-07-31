import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Quote } from '../types'

class FirebaseQuotesService {
  // Obter todas as citações do usuário
  async getUserQuotes(userId: string): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const quotes: Quote[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        quotes.push({
          id: doc.id,
          text: data.text,
          author: data.author,
          source: data.source || '',
          category: data.category || 'other',
          tags: data.tags || [],
          isFavorite: data.isFavorite || false,
          isCustom: data.isCustom || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          userId: data.userId
        })
      })
      
      return quotes
    } catch (error: any) {
      console.error('Erro ao buscar citações:', error)
      throw new Error('Erro ao buscar citações: ' + error.message)
    }
  }

  // Adicionar nova citação
  async addQuote(userId: string, quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt'>): Promise<Quote> {
    try {
      const quoteToAdd = {
        ...quoteData,
        userId,
        createdAt: Timestamp.now(),
        isFavorite: quoteData.isFavorite || false,
        isCustom: quoteData.isCustom || false
      }

      const docRef = await addDoc(collection(db, 'quotes'), quoteToAdd)
      
      return {
        id: docRef.id,
        ...quoteData,
        userId,
        createdAt: quoteToAdd.createdAt.toDate().toISOString()
      }
    } catch (error: any) {
      console.error('Erro ao adicionar citação:', error)
      throw new Error('Erro ao adicionar citação: ' + error.message)
    }
  }

  // Atualizar citação
  async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<void> {
    try {
      const quoteRef = doc(db, 'quotes', quoteId)
      await updateDoc(quoteRef, updates)
    } catch (error: any) {
      console.error('Erro ao atualizar citação:', error)
      throw new Error('Erro ao atualizar citação: ' + error.message)
    }
  }

  // Remover citação
  async deleteQuote(quoteId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'quotes', quoteId))
    } catch (error: any) {
      console.error('Erro ao remover citação:', error)
      throw new Error('Erro ao remover citação: ' + error.message)
    }
  }

  // Alternar favorito
  async toggleFavorite(quoteId: string, isFavorite: boolean): Promise<void> {
    try {
      await this.updateQuote(quoteId, { isFavorite })
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error)
      throw new Error('Erro ao alternar favorito: ' + error.message)
    }
  }

  // Buscar citações por texto ou autor
  async searchQuotes(userId: string, searchTerm: string): Promise<Quote[]> {
    try {
      const allQuotes = await this.getUserQuotes(userId)
      const term = searchTerm.toLowerCase()
      
      return allQuotes.filter(quote => 
        quote.text.toLowerCase().includes(term) ||
        quote.author.toLowerCase().includes(term) ||
        quote.tags.some(tag => tag.toLowerCase().includes(term))
      )
    } catch (error: any) {
      console.error('Erro ao buscar citações:', error)
      throw new Error('Erro ao buscar citações: ' + error.message)
    }
  }

  // Obter citações favoritas
  async getFavoriteQuotes(userId: string): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, 'quotes'),
        where('userId', '==', userId),
        where('isFavorite', '==', true),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const quotes: Quote[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        quotes.push({
          id: doc.id,
          text: data.text,
          author: data.author,
          source: data.source || '',
          category: data.category || 'other',
          tags: data.tags || [],
          isFavorite: data.isFavorite || false,
          isCustom: data.isCustom || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          userId: data.userId
        })
      })
      
      return quotes
    } catch (error: any) {
      console.error('Erro ao buscar favoritas:', error)
      throw new Error('Erro ao buscar favoritas: ' + error.message)
    }
  }

  // Migrar citações do localStorage para Firebase
  async migrateFromLocalStorage(userId: string, localQuotes: Quote[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      for (const quote of localQuotes) {
        const quoteToAdd = {
          text: quote.text,
          author: quote.author,
          source: quote.source || '',
          category: quote.category || 'other',
          tags: quote.tags || [],
          isFavorite: quote.isFavorite || false,
          isCustom: quote.isCustom || false,
          createdAt: Timestamp.now(),
          userId
        }
        
        const docRef = doc(collection(db, 'quotes'))
        batch.set(docRef, quoteToAdd)
      }
      
      await batch.commit()
      console.log(`Migradas ${localQuotes.length} citações para Firebase`)
    } catch (error: any) {
      console.error('Erro ao migrar citações:', error)
      throw new Error('Erro ao migrar citações: ' + error.message)
    }
  }

  // Corrigir status das favoritas após migração
  async fixFavoriteStatus(userId: string): Promise<void> {
    try {
      const quotes = await this.getUserQuotes(userId)
      const batch = writeBatch(db)
      let updatedCount = 0
      
      for (const quote of quotes) {
        // Se a citação tem texto específico que você sabe que deveria ser favorita
        const shouldBeFavorite = this.shouldBeFavorite(quote.text, quote.author)
        
        if (shouldBeFavorite !== quote.isFavorite) {
          const quoteRef = doc(db, 'quotes', quote.id)
          batch.update(quoteRef, { isFavorite: shouldBeFavorite })
          updatedCount++
        }
      }
      
      if (updatedCount > 0) {
        await batch.commit()
        console.log(`Corrigido status de ${updatedCount} citações`)
      }
    } catch (error: any) {
      console.error('Erro ao corrigir favoritas:', error)
      throw new Error('Erro ao corrigir favoritas: ' + error.message)
    }
  }

  // Função para determinar se uma citação deveria ser favorita
  private shouldBeFavorite(text: string, author: string): boolean {
    // Lista de citações que você sabe que deveriam ser favoritas
    const favoriteQuotes = [
      // Adicione aqui as citações que você quer que sejam favoritas
      // Exemplo: "Quem luta com monstros deve ter cuidado para não se tornar um monstro"
    ]
    
    const lowerText = text.toLowerCase()
    return favoriteQuotes.some(favorite => 
      lowerText.includes(favorite.toLowerCase())
    )
  }

  // Função para marcar todas as citações como não favoritas (reset)
  async resetAllFavorites(userId: string): Promise<void> {
    try {
      const quotes = await this.getUserQuotes(userId)
      const batch = writeBatch(db)
      let updatedCount = 0
      
      for (const quote of quotes) {
        if (quote.isFavorite) {
          const quoteRef = doc(db, 'quotes', quote.id)
          batch.update(quoteRef, { isFavorite: false })
          updatedCount++
        }
      }
      
      if (updatedCount > 0) {
        await batch.commit()
        console.log(`Resetadas ${updatedCount} favoritas`)
      }
    } catch (error: any) {
      console.error('Erro ao resetar favoritas:', error)
      throw new Error('Erro ao resetar favoritas: ' + error.message)
    }
  }

  // Remover duplicações baseadas em texto e autor
  async removeDuplicates(userId: string): Promise<void> {
    try {
      const quotes = await this.getUserQuotes(userId)
      const uniqueQuotes = new Map<string, Quote>()
      let removedCount = 0
      
      for (const quote of quotes) {
        // Criar chave única baseada em texto e autor
        const key = `${quote.text.toLowerCase().trim()}-${quote.author.toLowerCase().trim()}`
        
        if (uniqueQuotes.has(key)) {
          // Se já existe, manter a que tem isFavorite = true ou a mais recente
          const existing = uniqueQuotes.get(key)!
          if (quote.isFavorite && !existing.isFavorite) {
            // Substituir pela versão favorita
            uniqueQuotes.set(key, quote)
            removedCount++
          } else if (quote.createdAt > existing.createdAt) {
            // Substituir pela mais recente
            uniqueQuotes.set(key, quote)
            removedCount++
          } else {
            // Manter a existente
            removedCount++
          }
        } else {
          // Primeira ocorrência
          uniqueQuotes.set(key, quote)
        }
      }
      
      // Se há duplicações para remover
      if (removedCount > 0) {
        const batch = writeBatch(db)
        
        // Deletar todas as citações do usuário
        for (const quote of quotes) {
          const quoteRef = doc(db, 'quotes', quote.id)
          batch.delete(quoteRef)
        }
        
        // Adicionar apenas as únicas
        for (const quote of uniqueQuotes.values()) {
          const quoteToAdd = {
            text: quote.text,
            author: quote.author,
            source: quote.source || '',
            category: quote.category || 'other',
            tags: quote.tags || [],
            isFavorite: quote.isFavorite || false,
            isCustom: quote.isCustom || false,
            createdAt: Timestamp.now(),
            userId
          }
          
          const docRef = doc(collection(db, 'quotes'))
          batch.set(docRef, quoteToAdd)
        }
        
        await batch.commit()
        console.log(`Removidas ${removedCount} duplicações. Mantidas ${uniqueQuotes.size} citações únicas.`)
      } else {
        console.log('Nenhuma duplicação encontrada.')
      }
    } catch (error: any) {
      console.error('Erro ao remover duplicações:', error)
      throw new Error('Erro ao remover duplicações: ' + error.message)
    }
  }

  // Escutar mudanças em tempo real
  onQuotesChange(userId: string, callback: (quotes: Quote[]) => void) {
    const q = query(
      collection(db, 'quotes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const quotes: Quote[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        quotes.push({
          id: doc.id,
          text: data.text,
          author: data.author,
          source: data.source || '',
          category: data.category || 'other',
          tags: data.tags || [],
          isFavorite: data.isFavorite || false,
          isCustom: data.isCustom || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          userId: data.userId
        })
      })
      
      callback(quotes)
    })
  }

  // Obter estatísticas do usuário
  async getUserStats(userId: string): Promise<{
    totalQuotes: number
    totalFavorites: number
    totalCustom: number
    topAuthors: string[]
    topCategories: string[]
  }> {
    try {
      const quotes = await this.getUserQuotes(userId)
      
      const authorCount: { [key: string]: number } = {}
      const categoryCount: { [key: string]: number } = {}
      
      quotes.forEach(quote => {
        authorCount[quote.author] = (authorCount[quote.author] || 0) + 1
        categoryCount[quote.category] = (categoryCount[quote.category] || 0) + 1
      })
      
      const topAuthors = Object.entries(authorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([author]) => author)
      
      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category)
      
      return {
        totalQuotes: quotes.length,
        totalFavorites: quotes.filter(q => q.isFavorite).length,
        totalCustom: quotes.filter(q => q.isCustom).length,
        topAuthors,
        topCategories
      }
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error)
      throw new Error('Erro ao obter estatísticas: ' + error.message)
    }
  }
}

export const firebaseQuotesService = new FirebaseQuotesService() 