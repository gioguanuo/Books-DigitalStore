// api/books/[id].js
export default function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const books = [
    { 
      id: 1, 
      title: "Il Nome della Rosa", 
      author: "Umberto Eco", 
      year: 1980, 
      category: "Romanzo storico", 
      pages: 624, 
      isbn: "978-88-452-1111-1",
      description: "Un romanzo storico ambientato in un monastero medievale del XIV secolo. Il frate francescano Guglielmo da Baskerville indaga su una serie di misteriosi omicidi.",
      rating: 4.5,
      available: true,
      reviews: 1247,
      language: "Italiano",
      publisher: "Mondadori"
    },
    { 
      id: 2, 
      title: "1984", 
      author: "George Orwell", 
      year: 1949, 
      category: "Distopia", 
      pages: 328, 
      isbn: "978-88-452-2222-2",
      description: "Una distopia futuristica che descrive un mondo totalitario dove il Grande Fratello controlla ogni aspetto della vita.",
      rating: 4.7,
      available: true,
      reviews: 2156,
      language: "Inglese",
      publisher: "Penguin Books"
    },
    { 
      id: 3, 
      title: "Il Piccolo Principe", 
      author: "Antoine de Saint-Exupéry", 
      year: 1943, 
      category: "Favola", 
      pages: 96, 
      isbn: "978-88-452-3333-3",
      description: "Un racconto poetico che narra l'incontro tra un pilota e un piccolo principe venuto da un asteroide.",
      rating: 4.6,
      available: false,
      reviews: 1891,
      language: "Francese",
      publisher: "Gallimard"
    },
    { 
      id: 4, 
      title: "Cent'anni di solitudine", 
      author: "Gabriel García Márquez", 
      year: 1967, 
      category: "Realismo magico", 
      pages: 417, 
      isbn: "978-88-452-4444-4",
      description: "La saga della famiglia Buendía attraverso sette generazioni nel villaggio immaginario di Macondo.",
      rating: 4.4,
      available: true,
      reviews: 934,
      language: "Spagnolo",
      publisher: "Editorial Sudamericana"
    },
    { 
      id: 5, 
      title: "Il Signore degli Anelli", 
      author: "J.R.R. Tolkien", 
      year: 1954, 
      category: "Fantasy", 
      pages: 1216, 
      isbn: "978-88-452-5555-5",
      description: "L'epica saga di Frodo Baggins e la sua missione per distruggere l'Anello del Potere nella Terra di Mezzo.",
      rating: 4.8,
      available: true,
      reviews: 3567,
      language: "Inglese",
      publisher: "George Allen & Unwin"
    },
    { 
      id: 6, 
      title: "Orgoglio e Pregiudizio", 
      author: "Jane Austen", 
      year: 1813, 
      category: "Romanzo", 
      pages: 432, 
      isbn: "978-88-452-6666-6",
      description: "La storia d'amore tra Elizabeth Bennet e Mr. Darcy nell'Inghilterra del XIX secolo.",
      rating: 4.3,
      available: true,
      reviews: 2234,
      language: "Inglese",
      publisher: "T. Egerton"
    }
  ];

  const { id } = request.query;
  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return response.status(404).json({
      success: false,
      error: 'Libro non trovato',
      message: `Nessun libro trovato con ID: ${id}`
    });
  }

  response.status(200).json({
    success: true,
    data: book
  });
}