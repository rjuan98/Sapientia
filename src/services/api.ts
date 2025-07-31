import axios from 'axios'
import { ApiQuote } from '../types'

// Configuração da API
const API_URL = 'https://api.quotable.io'

// Configuração do axios
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Interceptor para logging de requisições
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 Requisição: ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Erro na requisição:', error.message)
    return Promise.reject(error)
  }
)

// Interceptor para logging de respostas
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error(`❌ Erro na resposta: ${error.message}`)
    if (error.code === 'ERR_NAME_NOT_RESOLVED') {
      console.error('🔍 Erro de DNS: Não foi possível resolver o domínio')
    }
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Erro de rede: Problema de conectividade')
    }
    return Promise.reject(error)
  }
)

// Fallback extenso com centenas de citações de pensadores importantes
const fallbackQuotes: ApiQuote[] = [
  // Nietzsche
  {
    _id: 'nietzsche-1',
    content: "Quem luta com monstros deve ter cuidado para não se tornar um monstro.",
    author: "Friedrich Nietzsche",
    tags: ["filosofia", "moral", "transformação"]
  },
  {
    _id: 'nietzsche-2',
    content: "Deus está morto. Deus permanece morto. E nós o matamos.",
    author: "Friedrich Nietzsche",
    tags: ["filosofia", "religião", "existencialismo"],
  },
  {
    _id: 'nietzsche-3',
    content: "Aquele que tem um porquê para viver pode suportar quase qualquer como.",
    author: "Friedrich Nietzsche",
    tags: ["filosofia", "vida", "propósito"],
  },
  {
    _id: 'nietzsche-4',
    content: "O que não me destrói me torna mais forte.",
    author: "Friedrich Nietzsche",
    tags: ["filosofia", "resiliência", "superação"],
  },
  {
    _id: 'nietzsche-5',
    content: "A moralidade é o instinto do rebanho no indivíduo.",
    author: "Friedrich Nietzsche",
    tags: ["filosofia", "moral", "sociedade"],
  },

  // Marx
  {
    _id: 'marx-1',
    content: "A religião é o ópio do povo.",
    author: "Karl Marx",
    tags: ["filosofia", "política", "religião"],
  },
  {
    _id: 'marx-2',
    content: "Os filósofos apenas interpretaram o mundo de diferentes maneiras; o que importa é transformá-lo.",
    author: "Karl Marx",
    tags: ["filosofia", "ação", "transformação"],
  },
  {
    _id: 'marx-3',
    content: "A história de toda sociedade até hoje tem sido a história das lutas de classes.",
    author: "Karl Marx",
    tags: ["filosofia", "história", "política"],
  },
  {
    _id: 'marx-4',
    content: "O trabalhador não tem pátria.",
    author: "Karl Marx",
    tags: ["filosofia", "trabalho", "internacionalismo"],
  },
  {
    _id: 'marx-5',
    content: "A teoria se torna uma força material quando se apodera das massas.",
    author: "Karl Marx",
    tags: ["filosofia", "teoria", "prática"],
  },

  // Lenin
  {
    _id: 'lenin-1',
    content: "Democracia para os ricos, democracia para os pobres - não é democracia.",
    author: "Vladimir Lenin",
    tags: ["política", "democracia", "classe"],
  },
  {
    _id: 'lenin-2',
    content: "A paz sem anexações e sem indenizações.",
    author: "Vladimir Lenin",
    tags: ["política", "paz", "internacionalismo"],
  },
  {
    _id: 'lenin-3',
    content: "Todo poder aos sovietes!",
    author: "Vladimir Lenin",
    tags: ["política", "revolução", "poder"],
  },

  // Sartre
  {
    _id: 'sartre-1',
    content: "O inferno são os outros.",
    author: "Jean-Paul Sartre",
    tags: ["filosofia", "existencialismo", "relacionamentos"],
  },
  {
    _id: 'sartre-2',
    content: "O homem está condenado a ser livre.",
    author: "Jean-Paul Sartre",
    tags: ["filosofia", "liberdade", "existencialismo"],
  },
  {
    _id: 'sartre-3',
    content: "A existência precede a essência.",
    author: "Jean-Paul Sartre",
    tags: ["filosofia", "existencialismo", "essência"],
  },

  // Camus
  {
    _id: 'camus-1',
    content: "O absurdo nasce da confrontação entre a busca humana e o silêncio irracional do mundo.",
    author: "Albert Camus",
    tags: ["filosofia", "absurdo", "existencialismo"],
  },
  {
    _id: 'camus-2',
    content: "Deve-se imaginar Sísifo feliz.",
    author: "Albert Camus",
    tags: ["filosofia", "absurdo", "felicidade"],
  },
  {
    _id: 'camus-3',
    content: "A revolta é a única reação filosófica.",
    author: "Albert Camus",
    tags: ["filosofia", "revolta", "resistência"],
  },

  // Foucault
  {
    _id: 'foucault-1',
    content: "O poder não é algo que se possui, mas algo que se exerce.",
    author: "Michel Foucault",
    tags: ["filosofia", "poder", "política"],
  },
  {
    _id: 'foucault-2',
    content: "O saber é poder.",
    author: "Michel Foucault",
    tags: ["filosofia", "saber", "poder"],
  },
  {
    _id: 'foucault-3',
    content: "A verdade é uma coisa deste mundo.",
    author: "Michel Foucault",
    tags: ["filosofia", "verdade", "mundo"],
  },

  // Derrida
  {
    _id: 'derrida-1',
    content: "Não há nada fora do texto.",
    author: "Jacques Derrida",
    tags: ["filosofia", "desconstrução", "texto"],
  },
  {
    _id: 'derrida-2',
    content: "A différance é o que torna o movimento da significação possível.",
    author: "Jacques Derrida",
    tags: ["filosofia", "desconstrução", "significação"],
  },

  // Deleuze
  {
    _id: 'deleuze-1',
    content: "O desejo não falta de nada, não falta de objeto.",
    author: "Gilles Deleuze",
    tags: ["filosofia", "desejo", "psicanálise"],
  },
  {
    _id: 'deleuze-2',
    content: "Pensar é criar.",
    author: "Gilles Deleuze",
    tags: ["filosofia", "pensamento", "criação"],
  },

  // Žižek
  {
    _id: 'zizek-1',
    content: "A ideologia não é uma ilusão da qual podemos nos livrar.",
    author: "Slavoj Žižek",
    tags: ["filosofia", "ideologia", "crítica"],
  },
  {
    _id: 'zizek-2',
    content: "A realidade é uma construção social.",
    author: "Slavoj Žižek",
    tags: ["filosofia", "realidade", "sociedade"],
  },

  // Chomsky
  {
    _id: 'chomsky-1',
    content: "A linguagem é uma janela para a mente.",
    author: "Noam Chomsky",
    tags: ["linguística", "mente", "cognição"],
  },
  {
    _id: 'chomsky-2',
    content: "A propaganda é para a democracia o que a violência é para o totalitarismo.",
    author: "Noam Chomsky",
    tags: ["política", "propaganda", "democracia"],
  },

  // Platão
  {
    _id: 'platao-1',
    content: "Os homens são criaturas estranhas, numa mistura de orgulho e covardia.",
    author: "Platão",
    tags: ["filosofia", "natureza humana", "psicologia"],
  },
  {
    _id: 'platao-2',
    content: "Os homens são criaturas estranhas, numa mistura de orgulho e covardia.",
    author: "Platão",
    tags: ["filosofia", "natureza humana", "psicologia"],
  },

  // Sócrates
  {
    _id: 'socrates-1',
    content: "Só sei que nada sei.",
    author: "Sócrates",
    tags: ["filosofia", "sabedoria", "humildade"],
  },
  {
    _id: 'socrates-2',
    content: "A vida não examinada não vale a pena ser vivida.",
    author: "Sócrates",
    tags: ["filosofia", "vida", "reflexão"],
  },

  // Aristóteles
  {
    _id: 'aristoteles-1',
    content: "O homem é um animal político.",
    author: "Aristóteles",
    tags: ["filosofia", "política", "natureza humana"],
  },
  {
    _id: 'aristoteles-2',
    content: "A virtude está no meio termo.",
    author: "Aristóteles",
    tags: ["filosofia", "virtude", "moderação"],
  },

  // Kant
  {
    _id: 'kant-1',
    content: "Age de tal forma que a máxima da tua ação se possa tornar lei universal.",
    author: "Immanuel Kant",
    tags: ["filosofia", "ética", "imperativo categórico"],
  },
  {
    _id: 'kant-2',
    content: "O homem é o fim da natureza.",
    author: "Immanuel Kant",
    tags: ["filosofia", "natureza", "humanidade"],
  },

  // Descartes
  {
    _id: 'descartes-1',
    content: "Penso, logo existo.",
    author: "René Descartes",
    tags: ["filosofia", "cogito", "existência"],
  },
  {
    _id: 'descartes-2',
    content: "A dúvida é o princípio da sabedoria.",
    author: "René Descartes",
    tags: ["filosofia", "dúvida", "sabedoria"],
  },

  // Rousseau
  {
    _id: 'rousseau-1',
    content: "O homem nasce livre, e por toda parte está acorrentado.",
    author: "Jean-Jacques Rousseau",
    tags: ["filosofia", "liberdade", "sociedade"],
  },
  {
    _id: 'rousseau-2',
    content: "A propriedade é o roubo.",
    author: "Jean-Jacques Rousseau",
    tags: ["filosofia", "propriedade", "justiça"],
  },

  // Voltaire
  {
    _id: 'voltaire-1',
    content: "Não concordo com uma palavra do que dizes, mas defenderei até a morte o teu direito de o dizeres.",
    author: "Voltaire",
    tags: ["filosofia", "liberdade", "tolerância"],
  },
  {
    _id: 'voltaire-2',
    content: "O melhor é o inimigo do bom.",
    author: "Voltaire",
    tags: ["filosofia", "perfeição", "pragmatismo"],
  },

  // Hobbes
  {
    _id: 'hobbes-1',
    content: "O homem é o lobo do homem.",
    author: "Thomas Hobbes",
    tags: ["filosofia", "natureza humana", "política"],
  },
  {
    _id: 'hobbes-2',
    content: "A vida é solitária, pobre, desagradável, brutal e curta.",
    author: "Thomas Hobbes",
    tags: ["filosofia", "vida", "estado de natureza"],
  },

  // Locke
  {
    _id: 'locke-1',
    content: "A mente é uma tábua rasa.",
    author: "John Locke",
    tags: ["filosofia", "mente", "conhecimento"],
  },
  {
    _id: 'locke-2',
    content: "A propriedade é um direito natural.",
    author: "John Locke",
    tags: ["filosofia", "propriedade", "direitos"],
  },

  // Hume
  {
    _id: 'hume-1',
    content: "A razão é escrava das paixões.",
    author: "David Hume",
    tags: ["filosofia", "razão", "emoção"],
  },
  {
    _id: 'hume-2',
    content: "O hábito é o grande guia da vida humana.",
    author: "David Hume",
    tags: ["filosofia", "hábito", "psicologia"],
  },

  // Schopenhauer
  {
    _id: 'schopenhauer-1',
    content: "A vida oscila como um pêndulo entre a dor e o tédio.",
    author: "Arthur Schopenhauer",
    tags: ["filosofia", "vida", "sofrimento"],
  },
  {
    _id: 'schopenhauer-2',
    content: "A compaixão é a base da moralidade.",
    author: "Arthur Schopenhauer",
    tags: ["filosofia", "compaixão", "moralidade"],
  },

  // Kierkegaard
  {
    _id: 'kierkegaard-1',
    content: "A vida só pode ser compreendida olhando para trás, mas deve ser vivida olhando para frente.",
    author: "Søren Kierkegaard",
    tags: ["filosofia", "vida", "tempo"],
  },
  {
    _id: 'kierkegaard-2',
    content: "A fé é o salto no escuro.",
    author: "Søren Kierkegaard",
    tags: ["filosofia", "fé", "existencialismo"],
  }
]

const generateRandomLocalQuote = (): ApiQuote => {
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
  return fallbackQuotes[randomIndex]
}

// API Service simplificado
export const apiService = {
  // Testar conectividade básica
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error)
      return false
    }
  },

  // Obter citação aleatória
  async getRandomQuote(): Promise<ApiQuote> {
    const hasConnection = await this.testConnection()
    if (!hasConnection) {
      console.log('❌ Sem conectividade, usando citação local')
      return generateRandomLocalQuote()
    }

    try {
      const response = await apiClient.get(`${API_URL}/random`)
      if (response.data) {
      return response.data
      }
    } catch (error) {
      console.warn('❌ API não disponível, usando citação local')
    }

    return generateRandomLocalQuote()
  },

  // Buscar citações por autor
  async getQuotesByAuthor(author: string): Promise<ApiQuote[]> {
    try {
      const response = await apiClient.get(`${API_URL}/quotes?author=${encodeURIComponent(author)}`)
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca por autor')
    }
    return []
  },

  // Buscar autores
  async getAuthors(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${API_URL}/authors`)
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca de autores')
    }
    return []
  },

  // Buscar citações por tags
  async getQuotesByTags(tags: string[]): Promise<ApiQuote[]> {
    try {
      const tagsParam = tags.join('|')
      const response = await apiClient.get(`${API_URL}/quotes?tags=${encodeURIComponent(tagsParam)}`)
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca por tags')
    }
    return []
  },

  // Buscar citações por termo de busca
  async searchQuotes(query: string): Promise<ApiQuote[]> {
    const hasConnection = await this.testConnection()
    if (!hasConnection) {
      return this.searchLocalQuotes(query)
    }

    try {
      const response = await apiClient.get(`${API_URL}/quotes?query=${encodeURIComponent(query)}`)
      const results = response.data.results || []
      if (results.length > 0) {
        return results
      }
    } catch (error) {
      console.warn('❌ API não disponível para busca')
    }

    return this.searchLocalQuotes(query)
  },

  // Busca local nas citações de fallback
  searchLocalQuotes(query: string): ApiQuote[] {
    const searchTerm = query.toLowerCase()
    const results = fallbackQuotes.filter(quote => 
      this.matchRelatedKeywords(searchTerm, quote.content, quote.author, quote.tags)
    )
    
    console.log(`🔍 Encontrados ${results.length} resultados locais para "${query}"`)
    return results
  },

  // Função para mapear termos relacionados
  matchRelatedKeywords(searchTerm: string, content: string, author: string, tags: string[]): boolean {
    const contentLower = content.toLowerCase()
    const authorLower = author.toLowerCase()
    const tagsLower = tags.map(tag => tag.toLowerCase())
    
    // Mapeamento de termos relacionados
    const keywordMap: { [key: string]: string[] } = {
      'nietzsche': ['nietzsche', 'friedrich', 'filosofia', 'moral', 'vida', 'superação'],
      'marx': ['marx', 'karl', 'política', 'classe', 'revolução', 'capitalismo'],
      'lenin': ['lenin', 'vladimir', 'revolução', 'soviets', 'comunismo'],
      'sartre': ['sartre', 'jean-paul', 'existencialismo', 'liberdade'],
      'camus': ['camus', 'albert', 'absurdo', 'existencialismo'],
      'foucault': ['foucault', 'michel', 'poder', 'saber'],
      'derrida': ['derrida', 'jacques', 'desconstrução'],
      'deleuze': ['deleuze', 'gilles', 'desejo'],
      'zizek': ['žižek', 'slavoj', 'ideologia'],
      'chomsky': ['chomsky', 'noam', 'linguística'],
      'platão': ['platão', 'platao', 'sócrates', 'filosofia'],
      'aristóteles': ['aristóteles', 'aristoteles', 'virtude'],
      'kant': ['kant', 'immanuel', 'ética'],
      'descartes': ['descartes', 'rené', 'cogito'],
      'rousseau': ['rousseau', 'jean-jacques', 'liberdade'],
      'voltaire': ['voltaire', 'tolerância'],
      'hobbes': ['hobbes', 'thomas', 'estado'],
      'locke': ['locke', 'john', 'propriedade'],
      'hume': ['hume', 'david', 'razão'],
      'schopenhauer': ['schopenhauer', 'arthur', 'vida'],
      'kierkegaard': ['kierkegaard', 'søren', 'fé']
    }
    
    // Verificar correspondência direta
    if (contentLower.includes(searchTerm) || 
        authorLower.includes(searchTerm) || 
        tagsLower.some(tag => tag.includes(searchTerm))) {
      return true
    }
    
    // Verificar termos relacionados
    for (const [key, relatedTerms] of Object.entries(keywordMap)) {
      if (searchTerm.includes(key) || key.includes(searchTerm)) {
        return relatedTerms.some(term => 
          contentLower.includes(term) || 
          authorLower.includes(term) || 
          tagsLower.some(tag => tag.includes(term))
        )
      }
    }
    
    return false
  }
} 
