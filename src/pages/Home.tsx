import { useState, useEffect } from 'react'
import { Search, Filter, Heart, Copy, Share2, RefreshCw, Check, AlertCircle, Trash2, Cloud, Database, Trophy } from 'lucide-react'
import { quoteApi } from '../services/api'
import { storageService } from '../services/storage'
import { Quote, ApiQuote } from '../types'
import { useQuotes } from '../hooks/useQuotes'
import { firebaseAuthService } from '../services/firebaseAuth'
import FriendsSection from '../components/FriendsSection'

const Home = () => {
  const currentUser = firebaseAuthService.getCurrentUser()
  const { 
    quotes: savedQuotes, 
    addQuote,
    deleteQuote,
    toggleFavorite,
    migrateFromLocalStorage,
    fixFavoriteStatus,
    resetAllFavorites,
    removeDuplicates
  } = useQuotes(currentUser?.uid || null)

  const [quoteOfDay, setQuoteOfDay] = useState<ApiQuote | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilter, setSearchFilter] = useState<'all' | 'saved' | 'api' | 'philosophy' | 'literature' | 'psychology' | 'science' | 'politics'>('all')
  const [apiSearchResults, setApiSearchResults] = useState<ApiQuote[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCopied, setShowCopied] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false)
  const [savedQuotesFilter, setSavedQuotesFilter] = useState<'all' | 'favorites' | 'custom' | 'recent'>('all')
  const [savedQuotesSort, setSavedQuotesSort] = useState<'date' | 'author' | 'text'>('date')
  const [savedQuotesOrder, setSavedQuotesOrder] = useState<'asc' | 'desc'>('desc')
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar citação do dia
      const dailyQuote = await quoteApi.getRandomQuote()
      setQuoteOfDay(dailyQuote)
      
      // Verificar se há citações no localStorage para migrar
      if (currentUser && migrationStatus === 'idle') {
        const localQuotes = storageService.getQuotes()
        if (localQuotes.length > 0 && savedQuotes.length === 0) {
          setMigrationStatus('migrating')
          try {
            await migrateFromLocalStorage(localQuotes)
            setMigrationStatus('completed')
            // Limpar localStorage após migração bem-sucedida
            localStorage.removeItem('sapientia_quotes')
            console.log('Migração concluída com sucesso!')
          } catch (error) {
            console.error('Erro na migração:', error)
            setMigrationStatus('error')
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshDaily = async () => {
    try {
      setIsRefreshingQuote(true)
      const newQuote = await quoteApi.getRandomQuote()
      
      // Animação de entrada para nova citação
      setQuoteOfDay(null) // Limpar temporariamente
      setTimeout(() => {
        setQuoteOfDay(newQuote)
      }, 200)
      
    } catch (error) {
      console.error('Erro ao buscar nova citação:', error)
    } finally {
      setIsRefreshingQuote(false)
    }
  }

  const handleSaveQuoteOfDay = async () => {
    if (!quoteOfDay) return
    
    // Verificar se já existe (comparação mais robusta)
    const alreadyExists = savedQuotes.some(quote => 
      quote.text.toLowerCase().trim() === quoteOfDay.content.toLowerCase().trim() && 
      quote.author.toLowerCase().trim() === quoteOfDay.author.toLowerCase().trim()
    )
    
    if (alreadyExists) {
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
      return
    }
    
    const newQuote: Quote = {
      id: Date.now().toString(),
      text: quoteOfDay.content,
      author: quoteOfDay.author,
      source: '',
      category: 'philosophy',
      tags: quoteOfDay.tags || [],
      isFavorite: false,
      isCustom: false,
      createdAt: new Date().toISOString()
    }
    
    await addQuote(newQuote)
    
    // Feedback visual
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  // Verificar se a citação atual já está salva
  const isCurrentQuoteSaved = quoteOfDay ? savedQuotes.some(quote => 
    quote.text.toLowerCase().trim() === quoteOfDay.content.toLowerCase().trim() && 
    quote.author.toLowerCase().trim() === quoteOfDay.author.toLowerCase().trim()
  ) : false

  const handleCopyQuoteOfDay = async () => {
    if (!quoteOfDay) return
    
    const textToCopy = `"${quoteOfDay.content}" — ${quoteOfDay.author}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setApiSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      if (searchFilter === 'api' || searchFilter === 'all') {
        // Buscar na API
        const results = await quoteApi.searchQuotes(searchTerm)
        setApiSearchResults(results)

        if (results.length === 0) {
          setSearchError('Nenhuma citação encontrada. Tente outros termos ou adicione manualmente.')
        }
      } else if (searchFilter === 'saved') {
        // Buscar apenas nas citações salvas
        const savedResults = savedQuotes.filter(quote =>
          quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setApiSearchResults([])
        setSearchError(savedResults.length === 0 ? 'Nenhuma citação salva encontrada.' : null)
      } else {
        // Buscar por categoria específica
        const categoryResults = await quoteApi.searchQuotes(searchTerm)
        const filteredByCategory = categoryResults.filter(quote => 
          quote.tags.some(tag => tag.toLowerCase().includes(searchFilter))
        )
        setApiSearchResults(filteredByCategory)
        
        if (filteredByCategory.length === 0) {
          setSearchError(`Nenhuma citação de ${getCategoryLabel(searchFilter)} encontrada.`)
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchError('Erro ao buscar citações. Verifique sua conexão.')
    } finally {
      setIsSearching(false)
    }
  }

  // Função para obter o label da categoria
  const getCategoryLabel = (category: string) => {
    const labels = {
      'philosophy': 'Filosofia',
      'literature': 'Literatura', 
      'psychology': 'Psicologia',
      'science': 'Ciência',
      'politics': 'Política'
    }
    return labels[category as keyof typeof labels] || category
  }

  const handleToggleFavorite = async (quoteId: string) => {
    try {
      const quote = savedQuotes.find(q => q.id === quoteId)
      if (quote) {
        await toggleFavorite(quoteId, !quote.isFavorite)
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
    }
  }

  const handleSaveFromApi = async (apiQuote: ApiQuote) => {
    if (!currentUser) return

    try {
      // Verificar se já existe (comparação mais robusta)
      const alreadyExists = savedQuotes.some(quote => 
        quote.text.toLowerCase().trim() === apiQuote.content.toLowerCase().trim() && 
        quote.author.toLowerCase().trim() === apiQuote.author.toLowerCase().trim()
      )
      
      if (alreadyExists) {
        return // Não adiciona se já existe
      }
      
      const newQuoteData = {
        text: apiQuote.content,
        author: apiQuote.author,
        source: '',
        category: 'philosophy' as const,
        tags: apiQuote.tags || [],
        isFavorite: false,
        isCustom: false
      }
      
      await addQuote(newQuoteData)
    } catch (error) {
      console.error('Erro ao salvar citação:', error)
    }
  }

  const handleRemoveQuote = async (quoteId: string) => {
    const quoteToRemove = savedQuotes.find(q => q.id === quoteId);
    if (!quoteToRemove) return;

    const confirmed = confirm(
      `Tem certeza que deseja remover a citação:\n\n"${quoteToRemove.text}"\n— ${quoteToRemove.author}\n\nEsta ação não pode ser desfeita.`
    );

    if (confirmed) {
      try {
        await deleteQuote(quoteId);
      } catch (error) {
        console.error('Erro ao remover citação:', error);
      }
    }
  }

  const handleCopyQuote = async (quote: Quote) => {
    const textToCopy = `"${quote.text}" — ${quote.author}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      // Feedback visual temporário
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const filteredSavedQuotes = savedQuotes
    .filter(quote => {
      // Filtro por termo de busca
      const matchesSearch = !searchTerm || 
        quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Filtro por tipo
      const matchesFilter = 
        savedQuotesFilter === 'all' ||
        (savedQuotesFilter === 'favorites' && quote.isFavorite) ||
        (savedQuotesFilter === 'custom' && quote.isCustom) ||
        (savedQuotesFilter === 'recent' && 
          new Date().getTime() - new Date(quote.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (savedQuotesSort) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'author':
          comparison = a.author.localeCompare(b.author)
          break
        case 'text':
          comparison = a.text.localeCompare(b.text)
          break
      }
      
      return savedQuotesOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section - Citação Aleatória */}
        <div className="mb-8 sm:mb-12">
          {quoteOfDay && (
            <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8 quote-entrance">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                    Citação Aleatória
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">Descubra pensamentos inspiradores</p>
                </div>
                <button
                  onClick={handleRefreshDaily}
                  disabled={isRefreshingQuote}
                  className="p-2 sm:p-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                  title="Nova citação"
                >
                  <RefreshCw size={18} className={isRefreshingQuote ? 'animate-spin' : ''} />
                </button>
              </div>
              
              <div className="mb-6 sm:mb-8">
                <blockquote className="text-lg sm:text-2xl text-neutral-700 dark:text-neutral-300 font-serif italic mb-4 sm:mb-6 leading-relaxed">
                  "{quoteOfDay.content}"
                </blockquote>
                <footer className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg">
                  — {quoteOfDay.author}
                  {quoteOfDay.tags && quoteOfDay.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quoteOfDay.tags.map(tag => (
                        <span key={tag} className="px-2 sm:px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </footer>
              </div>
              
              {/* Ações da citação do dia */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSaveQuoteOfDay}
                  disabled={isCurrentQuoteSaved}
                  className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                    isCurrentQuoteSaved || showSaved
                      ? 'bg-green-600 text-white scale-105 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'
                  }`}
                >
                  {isCurrentQuoteSaved || showSaved ? <Check size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  <span className="font-medium text-sm sm:text-base">{isCurrentQuoteSaved ? 'Salvo' : (showSaved ? 'Salvo!' : 'Salvar')}</span>
                </button>
                
                <button
                  onClick={handleCopyQuoteOfDay}
                  className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                    showCopied 
                      ? 'bg-green-600 text-white scale-105' 
                      : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 hover:scale-105'
                  }`}
                >
                  {showCopied ? <Check size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  <span className="font-medium text-sm sm:text-base">{showCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                
                <button
                  onClick={() => {
                    const text = `"${quoteOfDay.content}" — ${quoteOfDay.author}`
                    if (navigator.share) {
                      navigator.share({
                        title: 'Citação Aleatória - Sapientia',
                        text: text
                      })
                    } else {
                      handleCopyQuoteOfDay()
                    }
                  }}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="font-medium text-sm sm:text-base">Compartilhar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
              Buscar Citações
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Barra de busca principal */}
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 sm:w-5 sm:h-5" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por citação, autor, palavras-chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-lg"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Filtrar por:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Tudo' },
                    { value: 'saved', label: 'Salvas' },
                    { value: 'api', label: 'API' },
                    { value: 'philosophy', label: 'Filosofia' },
                    { value: 'literature', label: 'Literatura' },
                    { value: 'psychology', label: 'Psicologia' },
                    { value: 'science', label: 'Ciência' },
                    { value: 'politics', label: 'Política' }
                  ].map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setSearchFilter(filter.value as any)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        searchFilter === filter.value
                          ? 'bg-primary-600 text-white scale-105'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:scale-105'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 hover:scale-105"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados da Busca */}
        {(searchTerm && (searchFilter === 'api' || searchFilter === 'all' || searchFilter === 'philosophy' || searchFilter === 'literature' || searchFilter === 'psychology' || searchFilter === 'science' || searchFilter === 'politics')) && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
                {searchFilter === 'all' ? 'Resultados da API' : 
                 searchFilter === 'api' ? 'Resultados da API' :
                 `Resultados de ${getCategoryLabel(searchFilter)}`} ({apiSearchResults.length} encontrados)
              </h3>

              {searchError && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={18} className="sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200">{searchError}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {apiSearchResults.map((quote) => {
                  const isAlreadySaved = savedQuotes.some(saved => 
                    saved.text.toLowerCase().trim() === quote.content.toLowerCase().trim() && 
                    saved.author.toLowerCase().trim() === quote.author.toLowerCase().trim()
                  )
                  
                  return (
                    <div key={quote._id} className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                      <blockquote className="text-neutral-700 dark:text-neutral-300 font-serif italic mb-4">
                        "{quote.content}"
                      </blockquote>
                      <footer className="text-neutral-600 dark:text-neutral-400 mb-4">
                        — {quote.author}
                      </footer>
                      <div className="flex flex-wrap gap-1 mb-4">
                          {quote.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSaveFromApi(quote)}
                          disabled={isAlreadySaved}
                          className={`text-sm font-medium transition-colors ${
                            isAlreadySaved
                              ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                              : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                          }`}
                        >
                          {isAlreadySaved ? 'Já salvo' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Resultados das Citações Salvas */}
        {searchTerm && searchFilter === 'saved' && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-4 sm:mb-6">
                Suas Citações Salvas
              </h3>

              {searchError && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={18} className="sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200">{searchError}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSavedQuotes.map((quote) => (
                  <div key={quote.id} className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                    <blockquote className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-serif italic mb-3 sm:mb-4">
                      "{quote.text}"
                    </blockquote>
                    <footer className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4">
                      — {quote.author}
                    </footer>
                    
                    {/* Tags */}
                    {quote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                        {quote.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Ações */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleToggleFavorite(quote.id)}
                          className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            quote.isFavorite
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400'
                          }`}
                          title={quote.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                        >
                          <Heart className={`w-4 h-4 ${quote.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => handleCopyQuote(quote)}
                          className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            const text = `"${quote.text}" — ${quote.author}`
                            if (navigator.share) {
                              navigator.share({
                                title: 'Citação - Sapientia',
                                text: text
                              })
                            } else {
                              handleCopyQuote(quote)
                            }
                          }}
                          className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Compartilhar"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {quote.isCustom && (
                          <span className="text-xs text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-2 py-1 rounded-full">
                            Personalizada
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleRemoveQuote(quote.id)}
                          className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suas Citações Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                Suas Citações
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">{filteredSavedQuotes.length} de {savedQuotes.length} citações</p>
              
              {/* Indicador de Migração */}
              {migrationStatus === 'migrating' && (
                <div className="mt-2 flex items-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  <Cloud className="w-4 h-4 animate-pulse" />
                  <span>Migrando citações para a nuvem...</span>
                </div>
              )}
              {migrationStatus === 'completed' && (
                <div className="mt-2 flex items-center space-x-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
                  <Database className="w-4 h-4" />
                  <span>Migração concluída! Citações sincronizadas na nuvem.</span>
                </div>
              )}
              {migrationStatus === 'error' && (
                <div className="mt-2 flex items-center space-x-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Erro na migração. Tente novamente.</span>
                </div>
              )}
            </div>
            
            {/* Controles de Filtro e Ordenação */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">Filtrar:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: 'all', label: 'Todas' },
                    { value: 'favorites', label: 'Favoritas' },
                    { value: 'custom', label: 'Personalizadas' },
                    { value: 'recent', label: 'Recentes' }
                  ].map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setSavedQuotesFilter(filter.value as any)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        savedQuotesFilter === filter.value
                          ? 'bg-primary-600 text-white scale-105'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:scale-105'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">Ordenar:</span>
                <select
                  value={savedQuotesSort}
                  onChange={(e) => setSavedQuotesSort(e.target.value as any)}
                  className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                >
                  <option value="date">Data</option>
                  <option value="author">Autor</option>
                  <option value="text">Texto</option>
                </select>
                
                <button
                  onClick={() => setSavedQuotesOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  title={`Ordenar ${savedQuotesOrder === 'asc' ? 'decrescente' : 'crescente'}`}
                >
                  {savedQuotesOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Limpar Duplicações */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que quer remover todas as duplicações? Esta ação não pode ser desfeita.')) {
                      try {
                        await removeDuplicates()
                        alert('Duplicações removidas com sucesso!')
                      } catch (error) {
                        alert('Erro ao remover duplicações: ' + error)
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/30 transition-all duration-200"
                  title="Remover citações duplicadas"
                >
                  Limpar Duplicações
                </button>

                {/* Validar e Corrigir */}
                <button
                  onClick={() => {
                    alert('Funcionalidade de validar citações será implementada em breve.')
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-all duration-200"
                  title="Validar e corrigir citações"
                >
                  Validar Citações
                </button>

                {/* Recuperação de Emergência */}
                <button
                  onClick={() => {
                    alert('Funcionalidade de recuperar backup será implementada em breve.')
                  }}
                  className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-all duration-200"
                  title="Tentar recuperar de backup"
                >
                  Recuperar Backup
                </button>

                {/* Corrigir Favoritas */}
                <button
                  onClick={async () => {
                    try {
                      await fixFavoriteStatus()
                      alert('Status das favoritas corrigido com sucesso!')
                    } catch (error) {
                      alert('Erro ao corrigir favoritas: ' + error)
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-all duration-200"
                  title="Corrigir status das favoritas após migração"
                >
                  Corrigir Favoritas
                </button>

                {/* Resetar Favoritas */}
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que quer desmarcar TODAS as favoritas? Esta ação não pode ser desfeita.')) {
                      try {
                        await resetAllFavorites()
                        alert('Todas as favoritas foram desmarcadas!')
                      } catch (error) {
                        alert('Erro ao resetar favoritas: ' + error)
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/30 transition-all duration-200"
                  title="Desmarcar todas as favoritas"
                >
                  Resetar Favoritas
                </button>
              </div>
            </div>
          </div>
          
          {/* Estatísticas Rápidas */}
          {savedQuotes.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{savedQuotes.length}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Total</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-500 dark:text-red-400">{savedQuotes.filter(q => q.isFavorite).length}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Favoritas</div>
              </div>
              <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">{savedQuotes.filter(q => q.isCustom).length}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Personalizadas</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {savedQuotes.filter(q => 
                    new Date().getTime() - new Date(q.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
                  ).length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Esta semana</div>
              </div>
            </div>
          )}
          
          {filteredSavedQuotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {searchTerm ? 'Nenhuma citação encontrada.' : 'Você ainda não tem citações salvas.'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  Adicione suas primeiras citações ou busque na API!
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSavedQuotes.map((quote) => (
                <div key={quote.id} className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
                  <blockquote className="text-neutral-700 dark:text-neutral-300 font-serif italic mb-4">
                    "{quote.text}"
                  </blockquote>
                  <footer className="text-neutral-600 dark:text-neutral-400 mb-4">
                    — {quote.author}
                  </footer>
                  
                  {/* Tags */}
                  {quote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {quote.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Data de criação */}
                  <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                    Adicionado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFavorite(quote.id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          quote.isFavorite
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                        title={quote.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                      >
                        <Heart className={`w-4 h-4 ${quote.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => handleCopyQuote(quote)}
                        className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const text = `"${quote.text}" — ${quote.author}`
                          if (navigator.share) {
                            navigator.share({
                              title: 'Citação - Sapientia',
                              text: text
                            })
                          } else {
                            handleCopyQuote(quote)
                          }
                        }}
                        className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {quote.isCustom && (
                        <span className="text-xs text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-2 py-1 rounded-full">
                          Personalizada
                        </span>
                      )}
                      
                      <button
                        onClick={() => handleRemoveQuote(quote.id)}
                        className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conquistas Section */}
        <div id="achievements-section" className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-2">
                Conquistas
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">Desbloqueie conquistas ao usar o app</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 'first-quote',
                title: 'Primeira Citação',
                description: 'Adicione sua primeira citação',
                unlocked: savedQuotes.length > 0,
                icon: '📝'
              },
              {
                id: 'favorite-master',
                title: 'Mestre dos Favoritos',
                description: 'Tenha 10 citações favoritas',
                unlocked: savedQuotes.filter(q => q.isFavorite).length >= 10,
                icon: '❤️'
              },
              {
                id: 'custom-creator',
                title: 'Criador Personalizado',
                description: 'Crie 5 citações personalizadas',
                unlocked: savedQuotes.filter(q => q.isCustom).length >= 5,
                icon: '✨'
              },
              {
                id: 'weekly-active',
                title: 'Ativo Semanal',
                description: 'Adicione citações por 7 dias seguidos',
                unlocked: false, // Implementar lógica
                icon: '📅'
              },
              {
                id: 'quote-collector',
                title: 'Colecionador',
                description: 'Tenha 50 citações salvas',
                unlocked: savedQuotes.length >= 50,
                icon: '📚'
              },
              {
                id: 'diverse-reader',
                title: 'Leitor Diverso',
                description: 'Citações de 10 autores diferentes',
                unlocked: new Set(savedQuotes.map(q => q.author)).size >= 10,
                icon: '🎭'
              }
            ].map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-xl border transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-800/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                    achievement.unlocked
                      ? 'bg-yellow-500 text-white'
                      : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      achievement.unlocked
                        ? 'text-neutral-800 dark:text-neutral-200'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {achievement.title}
                    </div>
                    <div className={`text-sm ${
                      achievement.unlocked
                        ? 'text-neutral-600 dark:text-neutral-400'
                        : 'text-neutral-500 dark:text-neutral-500'
                    }`}>
                      {achievement.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comunidade Section */}
        <div id="friends-section">
          <FriendsSection currentUser={currentUser} />
        </div>
      </div>
    </div>
  )
}

export default Home 