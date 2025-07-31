import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAphx3rmh-O5SD9t8DnL8M0-i3GHeKj6lE",
  authDomain: "sapientia-699c2.firebaseapp.com",
  projectId: "sapientia-699c2",
  storageBucket: "sapientia-699c2.firebasestorage.app",
  messagingSenderId: "331824802793",
  appId: "1:331824802793:web:7cb0e76f5d1e39f69a7978",
  measurementId: "G-2BC5DD3X0N"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
console.log('Firebase initialized with project:', firebaseConfig.projectId)

// Exportar serviços
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

console.log('Firebase services initialized:', {
  auth: !!auth,
  db: !!db,
  storage: !!storage
})

export default app 