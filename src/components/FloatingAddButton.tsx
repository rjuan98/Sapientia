import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

const FloatingAddButton = () => {
  const location = useLocation()
  const [isOnAddPage, setIsOnAddPage] = useState(false)
  
  useEffect(() => {
    const currentPath = location.pathname
    const onAddPage = currentPath === '/add'
    setIsOnAddPage(onAddPage)
  }, [location.pathname])
  
  // Don't render the button if we're on the add page
  if (isOnAddPage) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group">
      {/* Tooltip animado */}
      <div className="absolute bottom-full right-0 mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-neutral-800 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Adicionar Pensamento
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
      </div>
      
      {/* Botão */}
      <Link
        to="/add"
        className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 group-hover:rotate-90 mobile-touch"
        title="Adicionar Pensamento"
        aria-label="Adicionar Pensamento"
      >
        <Plus size={20} className="sm:w-6 sm:h-6" />
      </Link>
    </div>
  )
}

export default FloatingAddButton 