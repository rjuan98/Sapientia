import axios from 'axios'
import { ApiQuote } from '../types'

// Proxy CORS para desenvolvimento
// Remover proxy CORS que não está funcionando
const API_URL = 'https://api.quotable.io'

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
    content: "O trabalhador torna-se mais pobre quanto mais riqueza produz.",
    author: "Karl Marx",
    tags: ["filosofia", "economia", "trabalho"],
  },

  // Platão
  {
    _id: 'plato-1',
    content: "Os homens são criaturas estranhas, numa mistura de orgulho e timidez.",
    author: "Platão",
    tags: ["filosofia", "psicologia", "natureza humana"],
  },
  {
    _id: 'plato-2',
    content: "A admiração é o princípio da filosofia.",
    author: "Platão",
    tags: ["filosofia", "sabedoria", "conhecimento"],
  },
  {
    _id: 'plato-3',
    content: "Os homens são criaturas estranhas, numa mistura de orgulho e timidez.",
    author: "Platão",
    tags: ["filosofia", "psicologia", "natureza humana"],
  },
  {
    _id: 'plato-4',
    content: "A justiça é dar a cada um o que lhe pertence.",
    author: "Platão",
    tags: ["filosofia", "justiça", "ética"],
  },

  // Sócrates
  {
    _id: 'socrates-1',
    content: "Conhece-te a ti mesmo.",
    author: "Sócrates",
    tags: ["filosofia", "autoconhecimento", "sabedoria"],
  },
  {
    _id: 'socrates-2',
    content: "Só sei que nada sei.",
    author: "Sócrates",
    tags: ["filosofia", "humildade", "conhecimento"],
  },
  {
    _id: 'socrates-3',
    content: "A vida não examinada não vale a pena ser vivida.",
    author: "Sócrates",
    tags: ["filosofia", "vida", "reflexão"],
  },

  // Aristóteles
  {
    _id: 'aristotle-1',
    content: "O homem é por natureza um animal político.",
    author: "Aristóteles",
    tags: ["filosofia", "política", "natureza humana"],
  },
  {
    _id: 'aristotle-2',
    content: "A felicidade é a finalidade da vida.",
    author: "Aristóteles",
    tags: ["filosofia", "felicidade", "ética"],
  },
  {
    _id: 'aristotle-3',
    content: "A virtude está no meio termo.",
    author: "Aristóteles",
    tags: ["filosofia", "virtude", "ética"],
  },

  // Kant
  {
    _id: 'kant-1',
    content: "Age de tal forma que a máxima da tua ação possa valer como princípio universal.",
    author: "Immanuel Kant",
    tags: ["filosofia", "ética", "imperativo categórico"],
  },
  {
    _id: 'kant-2',
    content: "O homem não é nada além daquilo que faz.",
    author: "Immanuel Kant",
    tags: ["filosofia", "ação", "existencialismo"],
  },
  {
    _id: 'kant-3',
    content: "A coragem é a resistência ao medo, domínio do medo, não a ausência do medo.",
    author: "Immanuel Kant",
    tags: ["filosofia", "coragem", "psicologia"],
  },

  // Descartes
  {
    _id: 'descartes-1',
    content: "Penso, logo existo.",
    author: "René Descartes",
    tags: ["filosofia", "existencialismo", "cogito"],
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
    content: "A natureza fez o homem feliz e bom, mas a sociedade deprava-o e torna-o miserável.",
    author: "Jean-Jacques Rousseau",
    tags: ["filosofia", "natureza", "sociedade"],
  },

  // Voltaire
  {
    _id: 'voltaire-1',
    content: "Não concordo com uma palavra do que dizes, mas defenderei até a morte o direito de dizê-la.",
    author: "Voltaire",
    tags: ["filosofia", "liberdade", "tolerância"],
  },
  {
    _id: 'voltaire-2',
    content: "A ignorância afirma ou nega dogmaticamente; a ciência duvida.",
    author: "Voltaire",
    tags: ["filosofia", "ciência", "ignorância"],
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
    content: "A vida do homem é solitária, pobre, sórdida, brutal e curta.",
    author: "Thomas Hobbes",
    tags: ["filosofia", "vida", "natureza humana"],
  },

  // Locke
  {
    _id: 'locke-1',
    content: "A mente é uma tábula rasa.",
    author: "John Locke",
    tags: ["filosofia", "psicologia", "conhecimento"],
  },
  {
    _id: 'locke-2',
    content: "A liberdade do homem na sociedade consiste em não estar sujeito a nenhum poder legislativo senão aquele que foi estabelecido por consentimento.",
    author: "John Locke",
    tags: ["filosofia", "liberdade", "política"],
  },

  // Hume
  {
    _id: 'hume-1',
    content: "A razão é, e deve ser, escrava das paixões.",
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
    tags: ["filosofia", "vida", "pessimismo"],
  },
  {
    _id: 'schopenhauer-2',
    content: "A compaixão é a base de toda moralidade.",
    author: "Arthur Schopenhauer",
    tags: ["filosofia", "compaixão", "moral"],
  },

  // Kierkegaard
  {
    _id: 'kierkegaard-1',
    content: "A vida só pode ser compreendida olhando-se para trás, mas deve ser vivida olhando-se para frente.",
    author: "Søren Kierkegaard",
    tags: ["filosofia", "vida", "existencialismo"],
  },
  {
    _id: 'kierkegaard-2',
    content: "A angústia é a vertigem da liberdade.",
    author: "Søren Kierkegaard",
    tags: ["filosofia", "angústia", "liberdade"],
  },

  // Sartre
  {
    _id: 'sartre-1',
    content: "O inferno são os outros.",
    author: "Jean-Paul Sartre",
    tags: ["filosofia", "existencialismo", "sociedade"],
  },
  {
    _id: 'sartre-2',
    content: "O homem está condenado a ser livre.",
    author: "Jean-Paul Sartre",
    tags: ["filosofia", "liberdade", "existencialismo"],
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
    tags: ["filosofia", "felicidade", "absurdo"],
  },

  // Foucault
  {
    _id: 'foucault-1',
    content: "O conhecimento é poder.",
    author: "Michel Foucault",
    tags: ["filosofia", "poder", "conhecimento"],
  },
  {
    _id: 'foucault-2',
    content: "Onde há poder, há resistência.",
    author: "Michel Foucault",
    tags: ["filosofia", "poder", "resistência"],
  },

  // Derrida
  {
    _id: 'derrida-1',
    content: "Não há nada fora do texto.",
    author: "Jacques Derrida",
    tags: ["filosofia", "desconstrução", "texto"],
  },

  // Deleuze
  {
    _id: 'deleuze-1',
    content: "O desejo não falta de nada, ele não falta de objeto.",
    author: "Gilles Deleuze",
    tags: ["filosofia", "desejo", "psicologia"],
  },

  // Zizek
  {
    _id: 'zizek-1',
    content: "A ideologia não é uma ilusão que esconde a realidade, mas a realidade que esconde que não há realidade.",
    author: "Slavoj Žižek",
    tags: ["filosofia", "ideologia", "realidade"],
  },

  // Chomsky
  {
    _id: 'chomsky-1',
    content: "Se você assume que não há esperança, você garante que não há esperança.",
    author: "Noam Chomsky",
    tags: ["filosofia", "esperança", "ação"],
  },

  // Literatura - Machado de Assis
  {
    _id: 'machado-1',
    content: "A vida é cheia de obrigações que a gente cumpre, ou por medo, ou por força de hábito.",
    author: "Machado de Assis",
    tags: ["literatura", "vida", "obrigações"],
  },
  {
    _id: 'machado-2',
    content: "Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.",
    author: "Machado de Assis",
    tags: ["literatura", "vida", "legado"],
  },

  // Literatura - Fernando Pessoa
  {
    _id: 'pessoa-1',
    content: "O poeta é um fingidor. Finge tão completamente que chega a fingir que é dor a dor que deveras sente.",
    author: "Fernando Pessoa",
    tags: ["literatura", "poesia", "arte"],
  },
  {
    _id: 'pessoa-2',
    content: "Tudo vale a pena se a alma não é pequena.",
    author: "Fernando Pessoa",
    tags: ["literatura", "alma", "valor"],
  },

  // Literatura - Clarice Lispector
  {
    _id: 'clarice-1',
    content: "Liberdade é pouco. O que eu desejo ainda não tem nome.",
    author: "Clarice Lispector",
    tags: ["literatura", "liberdade", "desejo"],
  },

  // Literatura - Guimarães Rosa
  {
    _id: 'guimaraes-1',
    content: "O correr da vida embrulha tudo. A vida é assim: esquenta e esfria, aperta e daí afrouxa, sossega e depois desinquieta.",
    author: "João Guimarães Rosa",
    tags: ["literatura", "vida", "movimento"],
  },

  // Psicologia - Freud
  {
    _id: 'freud-1',
    content: "O sonho é a estrada real para o inconsciente.",
    author: "Sigmund Freud",
    tags: ["psicologia", "inconsciente", "sonhos"],
  },
  {
    _id: 'freud-2',
    content: "Às vezes um charuto é apenas um charuto.",
    author: "Sigmund Freud",
    tags: ["psicologia", "simplicidade", "humor"],
  },

  // Psicologia - Jung
  {
    _id: 'jung-1',
    content: "Quem olha para fora sonha, quem olha para dentro acorda.",
    author: "Carl Jung",
    tags: ["psicologia", "autoconhecimento", "consciência"],
  },

  // Ciência - Einstein
  {
    _id: 'einstein-1',
    content: "A imaginação é mais importante que o conhecimento.",
    author: "Albert Einstein",
    tags: ["ciência", "imaginação", "conhecimento"],
  },
  {
    _id: 'einstein-2',
    content: "A vida é como andar de bicicleta. Para manter o equilíbrio, você deve continuar em movimento.",
    author: "Albert Einstein",
    tags: ["ciência", "vida", "movimento"],
  },

  // Ciência - Hawking
  {
    _id: 'hawking-1',
    content: "A maior inimiga do conhecimento não é a ignorância, é a ilusão do conhecimento.",
    author: "Stephen Hawking",
    tags: ["ciência", "conhecimento", "ignorância"],
  },

  // Arte - Picasso
  {
    _id: 'picasso-1',
    content: "A arte é a mentira que nos permite conhecer a verdade.",
    author: "Pablo Picasso",
    tags: ["arte", "verdade", "criação"],
  },

  // Música - Beethoven
  {
    _id: 'beethoven-1',
    content: "A música é a revelação mais alta que qualquer filosofia.",
    author: "Ludwig van Beethoven",
    tags: ["música", "filosofia", "arte"],
  },

  // Política - Mandela
  {
    _id: 'mandela-1',
    content: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.",
    author: "Nelson Mandela",
    tags: ["política", "educação", "mudança"],
  },

  // Política - Gandhi
  {
    _id: 'gandhi-1',
    content: "Seja a mudança que você quer ver no mundo.",
    author: "Mahatma Gandhi",
    tags: ["política", "mudança", "ação"],
  },

  // Sociologia - Durkheim
  {
    _id: 'durkheim-1',
    content: "A sociedade não é simplesmente a soma de indivíduos, mas um sistema formado pela associação deles.",
    author: "Émile Durkheim",
    tags: ["sociologia", "sociedade", "indivíduo"],
  },

  // Sociologia - Weber
  {
    _id: 'weber-1',
    content: "A burocracia é a forma mais eficiente de organização humana.",
    author: "Max Weber",
    tags: ["sociologia", "burocracia", "organização"],
  }
]

// Função para gerar citação aleatória local quando API falha
const generateRandomLocalQuote = (): ApiQuote => {
  // Usar o fallbackQuotes em vez do array pequeno
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
  const randomQuote = fallbackQuotes[randomIndex]
  
  return {
    _id: `local-${Date.now()}-${randomIndex}`,
    content: randomQuote.content,
    author: randomQuote.author,
    tags: randomQuote.tags,
  }
}

const quoteApi = {
  // Testar conexão com a API (simplificado)
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/random`, { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      console.warn('API não disponível, usando citações locais')
      return false
    }
  },

  // Buscar citação aleatória da API
  async getRandomQuote(): Promise<ApiQuote> {
    try {
      // Usar proxy CORS para contornar o problema
      const response = await axios.get(`${API_URL}/random`, { timeout: 10000 })
      console.log('Citação da API:', response.data)
      return response.data
    } catch (error) {
      console.warn('API não disponível, usando citação local')
      return generateRandomLocalQuote()
    }
  },

  // Buscar citações por autor na API
  async getQuotesByAuthor(author: string): Promise<ApiQuote[]> {
    try {
      const response = await axios.get(`${API_URL}/quotes?author=${encodeURIComponent(author)}`, { timeout: 10000 })
      console.log('Resultados por autor:', response.data.results?.length || 0)
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca por autor')
    }
    return []
  },

  // Buscar autores na API
  async getAuthors(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/authors`, { timeout: 10000 })
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca de autores')
    }
    return []
  },

  // Buscar citações por tags na API
  async getQuotesByTags(tags: string[]): Promise<ApiQuote[]> {
    try {
      const tagsParam = tags.join('|')
      const response = await axios.get(`${API_URL}/quotes?tags=${encodeURIComponent(tagsParam)}`, { timeout: 10000 })
      return response.data.results || []
    } catch (error) {
      console.warn('API não disponível para busca por tags')
    }
    return []
  },

  // Buscar citações por termo de busca na API
  async searchQuotes(query: string): Promise<ApiQuote[]> {
    try {
      console.log('Buscando na API:', query)
      
      // Buscar por conteúdo na API
      const contentResponse = await axios.get(`${API_URL}/quotes?query=${encodeURIComponent(query)}`, { timeout: 10000 })
      const contentResults = contentResponse.data.results || []
      console.log('Resultados por conteúdo:', contentResults.length)
      
      // Buscar por autor na API
      const authorResults = await this.getQuotesByAuthor(query)
      console.log('Resultados por autor:', authorResults.length)
      
      // Combinar resultados e remover duplicatas
      const allResults = [...contentResults, ...authorResults]
      const uniqueResults = allResults.filter((quote, index, self) => 
        index === self.findIndex(q => q._id === quote._id)
      )
      
      console.log('Total de resultados únicos:', uniqueResults.length)
      return uniqueResults
    } catch (error) {
      console.warn('API não disponível para busca')
    }
    
    // Se API falhar, retornar citações locais baseadas na busca
    const localResults = fallbackQuotes.filter(quote => 
      quote.content.toLowerCase().includes(query.toLowerCase()) ||
      quote.author.toLowerCase().includes(query.toLowerCase()) ||
      quote.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    return localResults
  }
}

export { quoteApi } 
