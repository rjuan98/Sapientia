import React, { useState, useRef } from 'react'
import { storageService } from '../services/storage'
import { firebaseAuthService } from '../services/firebaseAuth'

interface ProfilePhotoUploadProps {
  currentPhotoURL?: string
  onPhotoUpdate: (photoURL: string) => void
  userId: string
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoURL,
  onPhotoUpdate,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar arquivo
    const validation = storageService.validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Arquivo inválido')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Deletar foto antiga se existir
      if (currentPhotoURL && !currentPhotoURL.includes('default')) {
        await storageService.deleteProfilePhoto(userId, currentPhotoURL)
      }

      // Upload da nova foto
      const newPhotoURL = await storageService.uploadProfilePhoto(userId, file)
      
      // Atualizar no Firestore
      await firebaseAuthService.updateUser(userId, { avatar: newPhotoURL })
      
      // Notificar componente pai
      onPhotoUpdate(newPhotoURL)
      
      console.log('Foto de perfil atualizada com sucesso')
    } catch (error: any) {
      console.error('Erro ao atualizar foto de perfil:', error)
      setError(error.message || 'Erro ao enviar foto')
    } finally {
      setIsUploading(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getPhotoURL = () => {
    return currentPhotoURL || storageService.getDefaultProfilePhoto()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Preview da foto */}
      <div className="relative group">
        <img
          src={getPhotoURL()}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 transition-colors"
        />
        
        {/* Overlay de upload */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleClick}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>

        {/* Indicador de upload */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botão de upload */}
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? 'Enviando...' : 'Alterar Foto'}
      </button>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-red-500 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* Informações sobre formatos */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        Formatos aceitos: JPG, PNG, GIF, WebP. Máximo 5MB.
      </div>
    </div>
  )
}

export default ProfilePhotoUpload 