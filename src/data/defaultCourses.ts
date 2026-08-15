import { Course } from '../types';

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-python-fundamentals',
    title: 'Python Completo: Do Zero à Maestria',
    author: 'Curso em Vídeo & Gustavo Guanabara',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    description: 'Aprenda lógica de programação e Python moderno com exercícios práticos e estrutura passo a passo.',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLvE-ZafRgX8hnECDn1v9HNTI71veL3oW0',
    playlistId: 'PLvE-ZafRgX8hnECDn1v9HNTI71veL3oW0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastWatchedLessonId: 'py-lesson-1',
    lessons: [
      {
        id: 'py-lesson-1',
        videoId: 'S9uPNppGsGo',
        title: '01. Introdução ao Python e Instalação do Ambiente',
        duration: '18:42',
        thumbnail: 'https://i.ytimg.com/vi/S9uPNppGsGo/hqdefault.jpg',
        description: 'Primeiros passos com a linguagem Python, instalação do interpretador e VS Code.',
        completed: true,
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: [
          {
            id: 'n1',
            timestamp: 120,
            formattedTime: '02:00',
            text: 'Python é uma linguagem de alto nível com sintaxe extremamente limpa.',
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'py-lesson-2',
        videoId: '31llNGKWDdo',
        title: '02. Primeiros Comandos e Função print()',
        duration: '22:15',
        thumbnail: 'https://i.ytimg.com/vi/31llNGKWDdo/hqdefault.jpg',
        description: 'Executando os primeiros scripts e entendendo a saída padrão com print e variáveis básicas.',
        completed: true,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        notes: []
      },
      {
        id: 'py-lesson-3',
        videoId: 'hdDGoQC132k',
        title: '03. Tipos Primitivos de Dados e Saída formatada',
        duration: '29:50',
        thumbnail: 'https://i.ytimg.com/vi/hdDGoQC132k/hqdefault.jpg',
        description: 'int, float, bool, str e métodos de verificação como .isnumeric() e .isalpha().',
        completed: false,
        notes: []
      },
      {
        id: 'py-lesson-4',
        videoId: 'Vw6gLypRKmY',
        title: '04. Operadores Aritméticos e Precedência',
        duration: '26:10',
        thumbnail: 'https://i.ytimg.com/vi/Vw6gLypRKmY/hqdefault.jpg',
        description: 'Soma, subtração, multiplicação, divisão inteira, módulo e exponenciação.',
        completed: false,
        notes: []
      },
      {
        id: 'py-lesson-5',
        videoId: 'oOUyhGNib2Q',
        title: '05. Módulos e Bibliotecas Nativas (math, random)',
        duration: '24:05',
        thumbnail: 'https://i.ytimg.com/vi/oOUyhGNib2Q/hqdefault.jpg',
        description: 'Importando bibliotecas com import e from ... import para funções matemáticas avançadas.',
        completed: false,
        notes: []
      },
      {
        id: 'py-lesson-6',
        videoId: 'bNmsAzj4s94',
        title: '06. Manipulação de Strings e Fatiamento de Texto',
        duration: '31:40',
        thumbnail: 'https://i.ytimg.com/vi/bNmsAzj4s94/hqdefault.jpg',
        description: 'Fatiamento [start:stop:step], replace, split, strip e contagem de caracteres.',
        completed: false,
        notes: []
      },
      {
        id: 'py-lesson-7',
        videoId: 'K10u3XIf1-Q',
        title: '07. Estruturas Condicionais: if, elif e else',
        duration: '35:20',
        thumbnail: 'https://i.ytimg.com/vi/K10u3XIf1-Q/hqdefault.jpg',
        description: 'Tomada de decisões em código com condições aninhadas e operadores lógicos.',
        completed: false,
        notes: []
      },
      {
        id: 'py-lesson-8',
        videoId: 'cL4hMlC454Y',
        title: '08. Estrutura de Repetição for (Laços de Iteração)',
        duration: '27:18',
        thumbnail: 'https://i.ytimg.com/vi/cL4hMlC454Y/hqdefault.jpg',
        description: 'Utilizando range(), contadores, acumuladores e repetições controladas.',
        completed: false,
        notes: []
      }
    ]
  },
  {
    id: 'course-react-tailwind',
    title: 'React 19 & Tailwind CSS: Engenharia Frontend',
    author: 'Code & Tech Academy',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    description: 'Construa interfaces modernas, performáticas e reativas com os mais recentes padrões da indústria.',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLillGF-RfqbZ2ybcoD2OamnhcwV26t8rn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastWatchedLessonId: 'react-1',
    lessons: [
      {
        id: 'react-1',
        videoId: 'w7ejDZ8SWv8',
        title: '01. React Crash Course: Arquitetura e Componentes',
        duration: '34:10',
        thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/hqdefault.jpg',
        description: 'Entendendo JSX, componentes funcionais, props e estrutura de pastas em projetos reais.',
        completed: true,
        notes: []
      },
      {
        id: 'react-2',
        videoId: '4UZrsTqkcW4',
        title: '02. Gerenciamento de Estado com useState e Hooks',
        duration: '28:45',
        thumbnail: 'https://i.ytimg.com/vi/4UZrsTqkcW4/hqdefault.jpg',
        description: 'Como atualizar interfaces reativamente, manipulação de arrays e objetos no estado.',
        completed: false,
        notes: []
      },
      {
        id: 'react-3',
        videoId: '0ZJgIjIuY7U',
        title: '03. Efeitos Colaterais com useEffect e Chamadas de API',
        duration: '32:00',
        thumbnail: 'https://i.ytimg.com/vi/0ZJgIjIuY7U/hqdefault.jpg',
        description: 'Ciclo de vida, cleanup functions e consumo de endpoints REST.',
        completed: false,
        notes: []
      },
      {
        id: 'react-4',
        videoId: 'dGcsHMXbSOA',
        title: '04. Estilização Moderna com Tailwind CSS',
        duration: '25:15',
        thumbnail: 'https://i.ytimg.com/vi/dGcsHMXbSOA/hqdefault.jpg',
        description: 'Design responsivo, modo escuro, flexbox e grids com utilitários elegantes.',
        completed: false,
        notes: []
      }
    ]
  }
];

export const PRESET_PLAYLIST_SUGGESTIONS = [
  {
    title: 'Python Completo (Guanabara)',
    url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dlKP6QQCekuIPky1CiwmdI6',
    category: 'Programação',
    lessonsCount: '48 aulas'
  },
  {
    title: 'JavaScript Moderno para Iniciantes',
    url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1',
    category: 'Web Dev',
    lessonsCount: '33 aulas'
  },
  {
    title: 'HTML5 e CSS3 Moderno',
    url: 'https://www.youtube.com/playlist?list=PLHz_AreHm4dlAnJ_jJtV29RFxnPHDuk9o',
    category: 'Frontend',
    lessonsCount: '40 aulas'
  },
  {
    title: 'Python Flask Web Development',
    url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTs4UjLw5MM6OjgkjFeUxCYH',
    category: 'Backend',
    lessonsCount: '15 aulas'
  }
];
