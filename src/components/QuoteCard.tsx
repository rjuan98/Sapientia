import { Heart, Share2, Copy, BookOpen } from 'lucide-react';
import { Quote } from '../types';

interface QuoteCardProps {
  quote: Quote;
  onToggleFavorite: (id: string) => void;
  onShare?: (quote: Quote) => void;
}

const QuoteCard = ({ quote, onToggleFavorite, onShare }: QuoteCardProps) => {
  const handleCopy = async () => {
    const textToCopy = `"${quote.text}" - ${quote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      // Aqui você poderia adicionar um toast de sucesso
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(quote);
    }
  };

  return (
    <div className="quote-card group">
      {/* Citação */}
      <blockquote className="quote-text">
        "{quote.text}"
      </blockquote>
      
      {/* Autor e fonte */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="author-name">— {quote.author}</p>
          {quote.source && (
            <p className="text-sm text-neutral-500 mt-1">
              <BookOpen className="inline w-3 h-3 mr-1" />
              {quote.source}
            </p>
          )}
        </div>
        
        {/* Tags */}
        {quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quote.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleFavorite(quote.id)}
            className={`p-2 rounded-md transition-colors duration-200 ${
              quote.isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-neutral-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${quote.isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleCopy}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors duration-200"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors duration-200"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de citação customizada */}
        {quote.isCustom && (
          <span className="text-xs text-accent-600 bg-accent-50 px-2 py-1 rounded-full">
            Personalizada
          </span>
        )}
      </div>
    </div>
  );
};

export default QuoteCard; 