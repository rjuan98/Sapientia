import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 group">
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-neutral-800 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Voltar ao topo
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
      </div>
      
      {/* Botão */}
      <button
        onClick={scrollToTop}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-600 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group-hover:rotate-12 mobile-touch"
        title="Voltar ao topo"
      >
        <ChevronUp size={20} className="sm:w-6 sm:h-6" />
      </button>
    </div>
  )
}

export default ScrollToTopButton 