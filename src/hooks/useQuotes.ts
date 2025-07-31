import { useState, useEffect } from 'react'
import { firebaseQuotesService } from '../services/firebaseQuotes'
import { Quote } from '../types'

export const useQuotes = (userId: string | null) => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar citações iniciais
  useEffect(() => {
    if (!userId) {
      setQuotes([])
      setLoading(false)
      return
    }

    const loadQuotes = async () => {
      try {
        setLoading(true)
        setError(null)
        const userQuotes = await firebaseQuotesService.getUserQuotes(userId)
        setQuotes(userQuotes)
      } catch (err: any) {
        setError(err.message)
        console.error('Erro ao carregar citações:', err)
      } finally {
        setLoading(false)
      }
    }

    loadQuotes()
  }, [userId])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!userId) return

    const unsubscribe = firebaseQuotesService.onQuotesChange(userId, (updatedQuotes) => {
      setQuotes(updatedQuotes)
    })

    return () => unsubscribe()
  }, [userId])

  // Adicionar citação
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) throw new Error('Usuário não autenticado')

    try {
      setError(null)
      const newQuote = await firebaseQuotesService.addQuote(userId, quoteData)
      return newQuote
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Atualizar citação
  const updateQuote = async (quoteId: string, updates: Partial<Quote>) => {
    try {
      setError(null)
      await firebaseQuotesService.updateQuote(quoteId, updates)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Remover citação
  const deleteQuote = async (quoteId: string) => {
    try {
      setError(null)
      await firebaseQuotesService.deleteQuote(quoteId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Alternar favorito
  const toggleFavorite = async (quoteId: string, isFavorite: boolean) => {
    try {
      setError(null)
      await firebaseQuotesService.toggleFavorite(quoteId, isFavorite)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Buscar citações
  const searchQuotes = async (searchTerm: string) => {
    if (!userId) return []

    try {
      setError(null)
      return await firebaseQuotesService.searchQuotes(userId, searchTerm)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Obter favoritas
  const getFavorites = async () => {
    if (!userId) return []

    try {
      setError(null)
      return await firebaseQuotesService.getFavoriteQuotes(userId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

            // Migrar do localStorage
          const migrateFromLocalStorage = async (localQuotes: Quote[]) => {
            if (!userId) throw new Error('Usuário não autenticado')
        
            try {
              setError(null)
              await firebaseQuotesService.migrateFromLocalStorage(userId, localQuotes)
            } catch (err: any) {
              setError(err.message)
              throw err
            }
          }

          // Corrigir status das favoritas
          const fixFavoriteStatus = async () => {
            if (!userId) throw new Error('Usuário não autenticado')
        
            try {
              setError(null)
              await firebaseQuotesService.fixFavoriteStatus(userId)
            } catch (err: any) {
              setError(err.message)
              throw err
            }
          }

          // Resetar todas as favoritas
          const resetAllFavorites = async () => {
            if (!userId) throw new Error('Usuário não autenticado')
        
            try {
              setError(null)
              await firebaseQuotesService.resetAllFavorites(userId)
            } catch (err: any) {
              setError(err.message)
              throw err
            }
          }

  // Remover duplicações
  const removeDuplicates = async () => {
    if (!userId) throw new Error('Usuário não autenticado')

    try {
      setError(null)
      await firebaseQuotesService.removeDuplicates(userId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Obter estatísticas
  const getStats = async () => {
    if (!userId) return null

    try {
      setError(null)
      return await firebaseQuotesService.getUserStats(userId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    quotes,
    loading,
    error,
    addQuote,
    updateQuote,
    deleteQuote,
    toggleFavorite,
    searchQuotes,
    getFavorites,
    migrateFromLocalStorage,
    fixFavoriteStatus,
    resetAllFavorites,
    removeDuplicates,
    getStats
  }
} 