// api/books.js
export default function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
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
      description: "Un romanzo storico ambientato in un monastero medievale.",
      rating: 4.5,
      available: true
    },
    { 
      id: 2, 
      title: "1984", 
      author: "George Orwell", 
      year: 1949, 
      category: "Distopia", 
      pages: 328, 
      isbn: "978-88-452-2222-2",
      description: "Una distopia futuristica sul controllo totalitario.",
      rating: 4.7,
      available: true
    },
    { 
      id: 3, 
      title: "Il Piccolo Principe", 
      author: "Antoine de Saint-Exupéry", 
      year: 1943, 
      category: "Favola", 
      pages: 96, 
      isbn: "978-88-452-3333-3",
      description: "Un racconto poetico per tutte le età.",
      rating: 4.6,
      available: false
    },
    { 
      id: 4, 
      title: "Cent'anni di solitudine", 
      author: "Gabriel García Márquez", 
      year: 1967, 
      category: "Realismo magico", 
      pages: 417, 
      isbn: "978-88-452-4444-4",
      description: "Un capolavoro del realismo magico latinoamericano.",
      rating: 4.4,
      available: true
    },
    { 
      id: 5, 
      title: "Il Signore degli Anelli", 
      author: "J.R.R. Tolkien", 
      year: 1954, 
      category: "Fantasy", 
      pages: 1216, 
      isbn: "978-88-452-5555-5",
      description: "L'epica saga fantasy più famosa al mondo.",
      rating: 4.8,
      available: true
    },
    { 
      id: 6, 
      title: "Orgoglio e Pregiudizio", 
      author: "Jane Austen", 
      year: 1813, 
      category: "Romanzo", 
      pages: 432, 
      isbn: "978-88-452-6666-6",
      description: "Un classico romanzo romantico inglese.",
      rating: 4.3,
      available: true
    }
  ];

  // Filter by category if specified
  const { category, author, available } = request.query;
  let filteredBooks = books;

  if (category) {
    filteredBooks = filteredBooks.filter(book => 
      book.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (available !== undefined) {
    filteredBooks = filteredBooks.filter(book => 
      book.available === (available === 'true')
    );
  }

  response.status(200).json({
    success: true,
    count: filteredBooks.length,
    data: filteredBooks
  });
}