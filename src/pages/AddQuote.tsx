import { useState } from 'react';
import { Save, Plus, X, ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Quote, QuoteCategory } from '../types';
import { storageService } from '../services/storage';

const AddQuote = () => {
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    source: '',
    category: 'other' as QuoteCategory,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);

  const categories = [
    { value: 'philosophy', label: 'Filosofia' },
    { value: 'sociology', label: 'Sociologia' },
    { value: 'psychology', label: 'Psicologia' },
    { value: 'literature', label: 'Literatura' },
    { value: 'politics', label: 'Política' },
    { value: 'science', label: 'Ciência' },
    { value: 'art', label: 'Arte' },
    { value: 'music', label: 'Música' },
    { value: 'other', label: 'Outro' },
  ];

  // Lista de autores comuns para autocomplete
  const commonAuthors = [
    'Friedrich Nietzsche', 'Karl Marx', 'Sigmund Freud', 'Jean-Paul Sartre',
    'Albert Camus', 'Michel Foucault', 'Simone de Beauvoir', 'Hannah Arendt',
    'Noam Chomsky', 'Judith Butler', 'Slavoj Žižek', 'Cornel West',
    'Paulo Freire', 'Clarice Lispector', 'Machado de Assis', 'Carlos Drummond de Andrade',
    'Vinicius de Moraes', 'Cecília Meireles', 'Mário de Andrade', 'Oswald de Andrade',
    'Guimarães Rosa', 'Jorge Amado', 'Érico Veríssimo', 'Lygia Fagundes Telles',
    'Adélia Prado', 'Manoel de Barros', 'Ferreira Gullar', 'Drummond de Andrade',
    'William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Virginia Woolf',
    'James Joyce', 'F. Scott Fitzgerald', 'Ernest Hemingway', 'Gabriel García Márquez',
    'Pablo Neruda', 'Octavio Paz', 'Jorge Luis Borges', 'Julio Cortázar',
    'Mario Vargas Llosa', 'Isabel Allende', 'Eduardo Galeano', 'Elena Poniatowska'
  ];

  // Sugestões de tags por categoria
  const tagSuggestions = {
    philosophy: ['existencialismo', 'estoicismo', 'epicurismo', 'ética', 'moral', 'metafísica', 'lógica'],
    sociology: ['sociedade', 'cultura', 'política', 'economia', 'desigualdade', 'movimentos sociais'],
    psychology: ['mente', 'comportamento', 'emoções', 'cognição', 'desenvolvimento', 'terapia'],
    literature: ['poesia', 'romance', 'drama', 'crítica', 'escrita', 'narrativa'],
    politics: ['democracia', 'liberdade', 'justiça', 'poder', 'governo', 'revolução'],
    science: ['descoberta', 'inovação', 'método', 'teoria', 'experimento', 'conhecimento'],
    art: ['criatividade', 'beleza', 'expressão', 'inspiração', 'estética', 'criação'],
    music: ['harmonia', 'ritmo', 'melodia', 'expressão', 'inspiração', 'arte'],
    other: ['vida', 'amor', 'sucesso', 'felicidade', 'sabedoria', 'reflexão']
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Lógica de autocomplete para o campo autor
    if (field === 'author' && value.trim()) {
      const suggestions = commonAuthors.filter(author =>
        author.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limitar a 5 sugestões
      
      setAuthorSuggestions(suggestions);
      setShowAuthorSuggestions(suggestions.length > 0);
    } else if (field === 'author' && !value.trim()) {
      setShowAuthorSuggestions(false);
      setAuthorSuggestions([]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAuthorSuggestionClick = (author: string) => {
    setFormData(prev => ({
      ...prev,
      author: author
    }));
    setShowAuthorSuggestions(false);
    setAuthorSuggestions([]);
  };

  const handleClearForm = () => {
    const confirmed = confirm('Tem certeza que deseja limpar o formulário? Todos os dados serão perdidos.');
    if (confirmed) {
      setFormData({
        text: '',
        author: '',
        source: '',
        category: 'other',
        tags: [],
      });
      setNewTag('');
    }
  };

  const checkForDuplicate = (text: string, author: string): boolean => {
    const existingQuotes = storageService.getQuotes();
    return existingQuotes.some(quote => 
      quote.text.toLowerCase().trim() === text.toLowerCase().trim() &&
      quote.author.toLowerCase().trim() === author.toLowerCase().trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.author.trim()) {
      alert('Por favor, preencha pelo menos o texto e o autor.');
      return;
    }

    // Verificar duplicatas
    if (checkForDuplicate(formData.text.trim(), formData.author.trim())) {
      alert('Esta citação já existe na sua biblioteca. Verifique se não foi adicionada anteriormente.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newQuote: Quote = {
        id: Date.now().toString(),
        text: formData.text.trim(),
        author: formData.author.trim(),
        source: formData.source.trim() || '',
        category: formData.category,
        tags: formData.tags,
        isFavorite: false,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      storageService.addQuote(newQuote);
      storageService.backupQuotes();

      // Limpar formulário
      setFormData({
        text: '',
        author: '',
        source: '',
        category: 'other',
        tags: [],
      });

      // Mostrar feedback de sucesso
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar citação:', error);
      alert('Erro ao salvar citação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSuggestions = tagSuggestions[formData.category] || [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 pt-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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
                Adicionar Citação
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Compartilhe suas citações favoritas
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Citação salva com sucesso!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sua citação foi adicionada à sua biblioteca pessoal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Citação */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                Citação *
              </label>
              <textarea
                required
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                placeholder="Digite a citação aqui..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base resize-none"
              />
            </div>

            {/* Autor */}
            <div className="relative">
              <label className="block text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                Autor *
              </label>
              <input
                required
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Nome do autor..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              />
              
              {/* Autocomplete Suggestions */}
              {showAuthorSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {authorSuggestions.map((author, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAuthorSuggestionClick(author)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                    >
                      {author}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fonte */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                Fonte (opcional)
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Livro, artigo, discurso..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                Categoria
              </label>
              <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      formData.category === category.value
                        ? 'bg-primary-600 text-white scale-105'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:scale-105'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 mb-2 sm:mb-3">
                Tags
              </label>
              
              {/* Tag Input */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Adicionar tag..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Adicionar
                </button>
              </div>

              {/* Tag Suggestions */}
              {tagSuggestions[formData.category] && (
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500 mb-2">
                    Sugestões para {categories.find(c => c.value === formData.category)?.label}:
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {tagSuggestions[formData.category].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }));
                          }
                        }}
                        disabled={formData.tags.includes(tag)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                          formData.tags.includes(tag)
                            ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs sm:text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        <X size={12} className="sm:w-3 sm:h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-neutral-200 dark:border-neutral-600">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw size={16} className="sm:w-5 sm:h-5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="sm:w-5 sm:h-5" />
                    <span>Salvar Citação</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClearForm}
                className="flex items-center justify-center space-x-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
              >
                <RotateCcw size={16} className="sm:w-5 sm:h-5" />
                <span>Limpar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
};

export default AddQuote; 