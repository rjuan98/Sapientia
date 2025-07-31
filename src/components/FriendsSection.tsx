import React, { useState, useEffect } from 'react'
import { Users, UserPlus, UserMinus, MessageCircle, Heart, Share2, Trophy, Crown } from 'lucide-react'
import { friendsService, Friend } from '../services/friendsService'

interface FriendsSectionProps {
  currentUser: any
}

const FriendsSection: React.FC<FriendsSectionProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'discover' | 'requests'>('friends')
  const [searchTerm, setSearchTerm] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  const [discover, setDiscover] = useState<Friend[]>([])
  const [requests, setRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados baseado na aba ativa
  useEffect(() => {
    if (!currentUser?.id) return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        switch (activeTab) {
          case 'friends':
            const friendsData = await friendsService.getFriends(currentUser.id)
            setFriends(friendsData)
            break
          case 'discover':
            const discoverData = await friendsService.getDiscoverUsers(currentUser.id)
            setDiscover(discoverData)
            break
          case 'requests':
            const requestsData = await friendsService.getReceivedRequests(currentUser.id)
            setRequests(requestsData)
            break
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Erro ao carregar dados. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeTab, currentUser?.id])

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser?.id) return

    try {
      setLoading(true)
      await friendsService.sendFriendRequest(currentUser.id, friendId)
      
      // Atualizar lista de usuários para descobrir
      const updatedDiscover = discover.filter(user => user.id !== friendId)
      setDiscover(updatedDiscover)
      
      // Mostrar feedback de sucesso
      console.log('Solicitação de amizade enviada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error)
      setError(error.message || 'Erro ao enviar solicitação de amizade')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser?.id) return

    try {
      setLoading(true)
      await friendsService.removeFriend(currentUser.id, friendId)
      
      // Atualizar lista de amigos
      const updatedFriends = friends.filter(friend => friend.id !== friendId)
      setFriends(updatedFriends)
      
      console.log('Amigo removido com sucesso!')
    } catch (error: any) {
      console.error('Erro ao remover amigo:', error)
      setError(error.message || 'Erro ao remover amigo')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (friendId: string) => {
    if (!currentUser?.id) return

    try {
      setLoading(true)
      const requestId = `${friendId}_${currentUser.id}`
      await friendsService.acceptFriendRequest(requestId, currentUser.id)
      
      // Atualizar listas
      const updatedRequests = requests.filter(request => request.id !== friendId)
      setRequests(updatedRequests)
      
      // Recarregar amigos
      const updatedFriends = await friendsService.getFriends(currentUser.id)
      setFriends(updatedFriends)
      
      console.log('Solicitação aceita com sucesso!')
    } catch (error: any) {
      console.error('Erro ao aceitar solicitação:', error)
      setError(error.message || 'Erro ao aceitar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async (friendId: string) => {
    if (!currentUser?.id) return

    try {
      setLoading(true)
      const requestId = `${friendId}_${currentUser.id}`
      await friendsService.rejectFriendRequest(requestId, currentUser.id)
      
      // Atualizar lista de solicitações
      const updatedRequests = requests.filter(request => request.id !== friendId)
      setRequests(updatedRequests)
      
      console.log('Solicitação rejeitada')
    } catch (error: any) {
      console.error('Erro ao rejeitar solicitação:', error)
      setError(error.message || 'Erro ao rejeitar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (friendId: string) => {
    // Implementar sistema de mensagens no futuro
    console.log('Enviar mensagem para:', friendId)
  }

  const renderFriendCard = (friend: Friend, showActions = true) => (
    <div key={friend.id} className="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start space-x-3 sm:space-x-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
            {friend.avatar ? (
              <img src={friend.avatar} alt={friend.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
            ) : (
              friend.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white dark:border-neutral-800 ${
            friend.isOnline ? 'bg-green-500' : 'bg-neutral-400'
          }`}></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm sm:text-base truncate">{friend.name}</h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Nível {friend.level}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-primary-600 dark:text-primary-400">{friend.totalQuotes}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">Citações</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-red-500 dark:text-red-400">{friend.totalFavorites}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">Favoritas</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className={`${
              friend.isOnline 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-neutral-500 dark:text-neutral-500'
            }`}>
              {friend.isOnline ? 'Online' : friend.lastSeen}
            </span>
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-neutral-600 dark:text-neutral-400">{friend.achievements} conquistas</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col space-y-1 sm:space-y-2 flex-shrink-0">
            {activeTab === 'friends' && (
              <>
                <button
                  onClick={() => handleSendMessage(friend.id)}
                  className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Enviar mensagem"
                >
                  <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Remover amigo"
                >
                  <UserMinus size={14} className="sm:w-4 sm:h-4" />
                </button>
              </>
            )}
            
            {activeTab === 'discover' && (
              <button
                onClick={() => handleAddFriend(friend.id)}
                className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:text-green-500 dark:hover:text-green-400 rounded-lg transition-all duration-200 hover:scale-110"
                title="Adicionar amigo"
              >
                <UserPlus size={14} className="sm:w-4 sm:h-4" />
              </button>
            )}

            {activeTab === 'requests' && (
              <div className="flex space-x-1">
                <button
                  onClick={() => handleAcceptRequest(friend.id)}
                  className="p-1.5 sm:p-2 text-green-500 hover:text-green-600 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Aceitar"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleRejectRequest(friend.id)}
                  className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Rejeitar"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Filtrar dados baseado no termo de busca
  const getFilteredData = (data: Friend[]) => {
    if (!searchTerm) return data
    return data.filter(friend => 
      friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const currentData = activeTab === 'friends' ? friends : 
                     activeTab === 'discover' ? discover : 
                     requests

  const filteredData = getFilteredData(currentData)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Comunidade
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">Conecte-se com outros amantes de citações</p>
        </div>
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-neutral-100 dark:bg-neutral-700 rounded-xl p-1 mb-4 sm:mb-6">
        <div className="flex space-x-1">
          {[
            { id: 'friends', label: 'Amigos', count: friends.length },
            { id: 'discover', label: 'Descobrir', count: discover.length },
            { id: 'requests', label: 'Solicitações', count: requests.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-4">
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">Nenhum amigo ainda</h4>
                  <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-500 mb-4">Adicione amigos para ver suas atividades</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm sm:text-base"
                  >
                    Descobrir Pessoas
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredData.map(friend => renderFriendCard(friend))}
                </div>
              )}
            </>
          )}

          {activeTab === 'discover' && (
            <>
              {discover.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <UserPlus className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">Nenhuma sugestão</h4>
                  <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-500">Tente novamente mais tarde</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredData.map(friend => renderFriendCard(friend))}
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <UserPlus className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">Nenhuma solicitação</h4>
                  <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-500">Você não tem solicitações pendentes</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredData.map(friend => renderFriendCard(friend))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default FriendsSection 