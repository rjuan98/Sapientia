import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface Friend {
  id: string
  name: string
  avatar?: string
  level: number
  experience: number
  totalQuotes: number
  totalFavorites: number
  isOnline: boolean
  lastSeen: string
  mutualFriends: number
  achievements: number
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUserName: string
  fromUserAvatar?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  message?: string
}

export interface UserFriends {
  friends: string[] // Array de IDs de amigos
  sentRequests: string[] // Array de IDs de solicitações enviadas
  receivedRequests: string[] // Array de IDs de solicitações recebidas
}

class FriendsService {
  // Buscar amigos do usuário
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const userFriendsDoc = await getDoc(doc(db, 'userFriends', userId))
      
      if (!userFriendsDoc.exists()) {
        return []
      }

      const userFriends = userFriendsDoc.data() as UserFriends
      const friends: Friend[] = []

      // Buscar dados de cada amigo
      for (const friendId of userFriends.friends) {
        const friendDoc = await getDoc(doc(db, 'users', friendId))
        if (friendDoc.exists()) {
          const userData = friendDoc.data()
          friends.push({
            id: friendId,
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level || 1,
            experience: userData.experience || 0,
            totalQuotes: userData.totalQuotes || 0,
            totalFavorites: userData.totalFavorites || 0,
            isOnline: this.isUserOnline(userData.lastSeen),
            lastSeen: this.formatLastSeen(userData.lastSeen),
            mutualFriends: 0, // Implementar lógica de amigos em comum
            achievements: Object.keys(userData.achievements || {}).length
          })
        }
      }

      return friends
    } catch (error) {
      console.error('Erro ao buscar amigos:', error)
      return []
    }
  }

  // Buscar usuários para descobrir
  async getDiscoverUsers(userId: string, limitCount: number = 20): Promise<Friend[]> {
    try {
      console.log('🔍 Iniciando busca de usuários para descobrir...')
      console.log('👤 User ID:', userId)
      
      // Buscar usuários que não são amigos e não têm solicitações pendentes
      const userFriendsDoc = await getDoc(doc(db, 'userFriends', userId))
      const userFriends = userFriendsDoc.exists() ? userFriendsDoc.data() as UserFriends : { friends: [], sentRequests: [], receivedRequests: [] }
      
      console.log('📋 Dados de amigos do usuário:', userFriends)
      
      const excludedUsers = new Set([
        userId,
        ...userFriends.friends,
        ...userFriends.sentRequests,
        ...userFriends.receivedRequests
      ])

      console.log('🚫 Usuários excluídos:', Array.from(excludedUsers))

      // Buscar todos os usuários primeiro
      const usersQuery = query(
        collection(db, 'users'),
        limit(50) // Buscar mais usuários para ter mais opções
      )

      const usersSnapshot = await getDocs(usersQuery)
      console.log(`📊 Total de usuários encontrados na query: ${usersSnapshot.size}`)
      
      const discoverUsers: Friend[] = []

      usersSnapshot.forEach(doc => {
        const userData = doc.data()
        
        // Verificar se o usuário deve ser excluído
        if (excludedUsers.has(doc.id)) {
          console.log(`❌ Usuário ${userData.name || doc.id} excluído (já é amigo ou tem solicitação)`)
          return
        }
        
        // Verificar se o usuário tem nome válido
        if (!userData.name || userData.name.trim() === '') {
          console.log(`❌ Usuário ${doc.id} excluído (sem nome)`)
          return
        }
        
        console.log(`✅ Usuário ${userData.name} adicionado à lista de descoberta`)
        discoverUsers.push({
          id: doc.id,
          name: userData.name,
          avatar: userData.avatar || '',
          level: userData.level || 1,
          experience: userData.experience || 0,
          totalQuotes: userData.totalQuotes || 0,
          totalFavorites: userData.totalFavorites || 0,
          isOnline: this.isUserOnline(userData.lastSeen || userData.lastLogin),
          lastSeen: this.formatLastSeen(userData.lastSeen || userData.lastLogin),
          mutualFriends: 0,
          achievements: Array.isArray(userData.achievements) ? userData.achievements.length : 0
        })
      })

      console.log(`🎯 Encontrados ${discoverUsers.length} usuários para descobrir`)
      console.log('👥 Usuários encontrados:', discoverUsers.map(u => ({ id: u.id, name: u.name })))
      
      // Retornar os primeiros usuários encontrados
      return discoverUsers.slice(0, limitCount)
    } catch (error) {
      console.error('Erro ao buscar usuários para descobrir:', error)
      return []
    }
  }

  // Buscar solicitações de amizade recebidas
  async getReceivedRequests(userId: string): Promise<Friend[]> {
    try {
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )

      const requestsSnapshot = await getDocs(requestsQuery)
      const requests: Friend[] = []

      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data() as FriendRequest
        const fromUserDoc = await getDoc(doc(db, 'users', requestData.fromUserId))
        
        if (fromUserDoc.exists()) {
          const userData = fromUserDoc.data()
          requests.push({
            id: requestData.fromUserId,
            name: userData.name,
            avatar: userData.avatar,
            level: userData.level || 1,
            experience: userData.experience || 0,
            totalQuotes: userData.totalQuotes || 0,
            totalFavorites: userData.totalFavorites || 0,
            isOnline: this.isUserOnline(userData.lastSeen),
            lastSeen: this.formatLastSeen(userData.lastSeen),
            mutualFriends: 0,
            achievements: Object.keys(userData.achievements || {}).length
          })
        }
      }

      return requests
    } catch (error) {
      console.error('Erro ao buscar solicitações recebidas:', error)
      return []
    }
  }

  // Enviar solicitação de amizade
  async sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<void> {
    try {
      // Verificar se já existe uma solicitação
      const existingRequestQuery = query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
      )

      const existingRequestSnapshot = await getDocs(existingRequestQuery)
      if (!existingRequestSnapshot.empty) {
        throw new Error('Solicitação de amizade já enviada')
      }

      // Buscar dados do usuário que está enviando a solicitação
      const fromUserDoc = await getDoc(doc(db, 'users', fromUserId))
      if (!fromUserDoc.exists()) {
        throw new Error('Usuário não encontrado')
      }

      const fromUserData = fromUserDoc.data()

      // Criar solicitação
      const requestData: FriendRequest = {
        id: `${fromUserId}_${toUserId}`,
        fromUserId,
        toUserId,
        fromUserName: fromUserData.name,
        fromUserAvatar: fromUserData.avatar,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message
      }

      await setDoc(doc(db, 'friendRequests', requestData.id), requestData)

      // Atualizar lista de solicitações enviadas do usuário
      const userFriendsRef = doc(db, 'userFriends', fromUserId)
      const userFriendsDoc = await getDoc(userFriendsRef)
      
      if (userFriendsDoc.exists()) {
        await updateDoc(userFriendsRef, {
          sentRequests: arrayUnion(toUserId)
        })
      } else {
        await setDoc(userFriendsRef, {
          friends: [],
          sentRequests: [toUserId],
          receivedRequests: []
        })
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error)
      throw error
    }
  }

  // Aceitar solicitação de amizade
  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'friendRequests', requestId)
      const requestDoc = await getDoc(requestRef)
      
      if (!requestDoc.exists()) {
        throw new Error('Solicitação não encontrada')
      }

      const requestData = requestDoc.data() as FriendRequest
      if (requestData.toUserId !== userId) {
        throw new Error('Solicitação não pertence a este usuário')
      }

      // Atualizar status da solicitação
      await updateDoc(requestRef, { status: 'accepted' })

      // Adicionar amigos mutuamente
      await this.addFriendToUser(requestData.fromUserId, requestData.toUserId)
      await this.addFriendToUser(requestData.toUserId, requestData.fromUserId)

      // Remover das listas de solicitações
      await this.removeFromRequests(requestData.fromUserId, requestData.toUserId)
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade:', error)
      throw error
    }
  }

  // Rejeitar solicitação de amizade
  async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'friendRequests', requestId)
      const requestDoc = await getDoc(requestRef)
      
      if (!requestDoc.exists()) {
        throw new Error('Solicitação não encontrada')
      }

      const requestData = requestDoc.data() as FriendRequest
      if (requestData.toUserId !== userId) {
        throw new Error('Solicitação não pertence a este usuário')
      }

      // Atualizar status da solicitação
      await updateDoc(requestRef, { status: 'rejected' })

      // Remover das listas de solicitações
      await this.removeFromRequests(requestData.fromUserId, requestData.toUserId)
    } catch (error) {
      console.error('Erro ao rejeitar solicitação de amizade:', error)
      throw error
    }
  }

  // Remover amigo
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Remover amigo de ambos os usuários
      await this.removeFriendFromUser(userId, friendId)
      await this.removeFriendFromUser(friendId, userId)
    } catch (error) {
      console.error('Erro ao remover amigo:', error)
      throw error
    }
  }

  // Métodos auxiliares privados
  private async addFriendToUser(userId: string, friendId: string): Promise<void> {
    const userFriendsRef = doc(db, 'userFriends', userId)
    const userFriendsDoc = await getDoc(userFriendsRef)
    
    if (userFriendsDoc.exists()) {
      await updateDoc(userFriendsRef, {
        friends: arrayUnion(friendId)
      })
    } else {
      await setDoc(userFriendsRef, {
        friends: [friendId],
        sentRequests: [],
        receivedRequests: []
      })
    }
  }

  private async removeFriendFromUser(userId: string, friendId: string): Promise<void> {
    const userFriendsRef = doc(db, 'userFriends', userId)
    const userFriendsDoc = await getDoc(userFriendsRef)
    
    if (userFriendsDoc.exists()) {
      await updateDoc(userFriendsRef, {
        friends: arrayRemove(friendId)
      })
    }
  }

  private async removeFromRequests(fromUserId: string, toUserId: string): Promise<void> {
    // Remover da lista de solicitações enviadas
    const fromUserFriendsRef = doc(db, 'userFriends', fromUserId)
    const fromUserFriendsDoc = await getDoc(fromUserFriendsRef)
    
    if (fromUserFriendsDoc.exists()) {
      await updateDoc(fromUserFriendsRef, {
        sentRequests: arrayRemove(toUserId)
      })
    }

    // Remover da lista de solicitações recebidas
    const toUserFriendsRef = doc(db, 'userFriends', toUserId)
    const toUserFriendsDoc = await getDoc(toUserFriendsRef)
    
    if (toUserFriendsDoc.exists()) {
      await updateDoc(toUserFriendsRef, {
        receivedRequests: arrayRemove(fromUserId)
      })
    }
  }

  private isUserOnline(lastSeen: string): boolean {
    if (!lastSeen) return false
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
    
    return diffInMinutes < 5 // Considerar online se foi visto há menos de 5 minutos
  }

  private formatLastSeen(lastSeen: string): string {
    if (!lastSeen) return 'Nunca'
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} horas atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    
    return lastSeenDate.toLocaleDateString('pt-BR')
  }

  // Listener em tempo real para mudanças nos amigos
  subscribeToFriends(userId: string, callback: (friends: Friend[]) => void) {
    return onSnapshot(doc(db, 'userFriends', userId), async (snapshot) => {
      if (snapshot.exists()) {
        const friends = await this.getFriends(userId)
        callback(friends)
      } else {
        callback([])
      }
    })
  }
}

export const friendsService = new FriendsService() 