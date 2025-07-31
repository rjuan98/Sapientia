import { useState, useEffect } from 'react'
import { Heart, Copy, Share2, Trash2, ArrowLeft, Search, Filter, RefreshCw, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { storageService } from '../services/storage'
import { Quote } from '../types'

const Favorites = () => {
  const [favoriteQuotes, setFavoriteQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'author' | 'text'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showCopied, setShowCopied] = useState<string | null>(null)
  const [showShared, setShowShared] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    // Validar e corrigir citações antes de carregar
    const validatedQuotes = storageService.validateAndFixQuotes()
    const allQuotes = validatedQuotes.length > 0 ? validatedQuotes : storageService.getQuotes()
    const favorites = allQuotes.filter(quote => quote.isFavorite)
    setFavoriteQuotes(favorites)
    setLoading(false)
  }

  const handleToggleFavorite = (quoteId: string) => {
    const updatedQuotes = favoriteQuotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, isFavorite: !quote.isFavorite }
        : quote
    )
    setFavoriteQuotes(updatedQuotes.filter(q => q.isFavorite))
    storageService.updateQuote(quoteId, { isFavorite: !favoriteQuotes.find(q => q.id === quoteId)?.isFavorite })
  }

  const handleCopyQuote = async (quote: Quote) => {
    const textToCopy = `"${quote.text}" — ${quote.author}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setShowCopied(quote.id)
      setTimeout(() => setShowCopied(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const handleShareQuote = async (quote: Quote) => {
    const text = `"${quote.text}" — ${quote.author}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Citação Favorita - Sapientia',
          text: text
        })
        setShowShared(quote.id)
        setTimeout(() => setShowShared(null), 2000)
      } else {
        handleCopyQuote(quote)
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handleRemoveQuote = (quoteId: string) => {
    const quoteToRemove = favoriteQuotes.find(q => q.id === quoteId);
    if (!quoteToRemove) return;

    const confirmed = confirm(
      `Tem certeza que deseja remover a citação:\n\n"${quoteToRemove.text}"\n— ${quoteToRemove.author}\n\nEsta ação não pode ser desfeita.`
    );

    if (confirmed) {
      const updatedQuotes = favoriteQuotes.filter(quote => quote.id !== quoteId);
      setFavoriteQuotes(updatedQuotes);
      storageService.removeQuote(quoteId);
    }
  }

  // Filtrar e ordenar citações
  const filteredAndSortedQuotes = favoriteQuotes
    .filter(quote => 
      !searchTerm || 
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
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
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Estatísticas
  const stats = {
    total: favoriteQuotes.length,
    custom: favoriteQuotes.filter(q => q.isCustom).length,
    recent: favoriteQuotes.filter(q => 
      new Date().getTime() - new Date(q.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length,
    thisMonth: favoriteQuotes.filter(q => {
      const quoteDate = new Date(q.createdAt)
      const now = new Date()
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear()
    }).length
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
                Favoritas
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                {filteredAndSortedQuotes.length} de {favoriteQuotes.length} citações favoritas
              </p>
            </div>
          </div>
          
          <button
            onClick={loadFavorites}
            className="p-2 sm:p-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
            title="Atualizar"
          >
            <RefreshCw size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 sm:w-5 sm:h-5" size={18} />
              <input
                type="text"
                placeholder="Buscar em suas favoritas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-lg"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-neutral-500 dark:text-neutral-400" />
                <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">Ordenar por:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'date', label: 'Data' },
                  { value: 'author', label: 'Autor' },
                  { value: 'text', label: 'Texto' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      sortBy === option.value
                        ? 'bg-primary-600 text-white scale-105'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:scale-105'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    sortOrder === 'asc'
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Carregando favoritas...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && favoriteQuotes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Nenhuma favorita ainda
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500 mb-6">
              Comece a favoritar citações que você gostar!
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              <span>Explorar Citações</span>
            </Link>
          </div>
        )}

        {/* No Results */}
        {!loading && favoriteQuotes.length > 0 && filteredAndSortedQuotes.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}

        {/* Quotes Grid */}
        {!loading && filteredAndSortedQuotes.length > 0 && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedQuotes.map((quote) => (
              <div key={quote.id} className="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200">
                <div className="mb-4 sm:mb-6">
                  <blockquote className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-serif italic mb-3 sm:mb-4 leading-relaxed">
                    "{quote.text}"
                  </blockquote>
                  <footer className="text-sm text-neutral-600 dark:text-neutral-400">
                    — {quote.author}
                  </footer>
                </div>

                {/* Tags */}
                {quote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4 sm:mb-6">
                    {quote.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(quote.id)}
                      className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Remover dos favoritos"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    
                    <button
                      onClick={() => handleCopyQuote(quote)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        showCopied === quote.id
                          ? 'text-green-500'
                          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400'
                      }`}
                      title={showCopied === quote.id ? 'Copiado!' : 'Copiar'}
                    >
                      {showCopied === quote.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleShareQuote(quote)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        showShared === quote.id
                          ? 'text-green-500'
                          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400'
                      }`}
                      title={showShared === quote.id ? 'Compartilhado!' : 'Compartilhar'}
                    >
                      {showShared === quote.id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
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
        )}
      </div>
    </div>
  )
}

export default Favorites 