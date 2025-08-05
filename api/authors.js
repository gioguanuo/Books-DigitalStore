// api/authors.js
export default function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const authors = [
    { 
      id: 1, 
      name: "Umberto Eco", 
      nationality: "Italiana", 
      born: 1932, 
      died: 2016, 
      books: 12,
      biography: "Scrittore, filosofo e semiologo italiano, famoso per i suoi romanzi storici e saggi.",
      genres: ["Romanzo storico", "Filosofia", "Semiotica"],
      awards: ["Premio Strega", "Premio Viareggio"],
      website: "https://www.umbertoeco.it"
    },
    { 
      id: 2, 
      name: "George Orwell", 
      nationality: "Britannica", 
      born: 1903, 
      died: 1950, 
      books: 8,
      biography: "Scrittore e giornalista britannico, noto per le sue distopie politiche.",
      genres: ["Distopia", "Saggistica politica", "Romanzo"],
      awards: ["Prometheus Hall of Fame Award"],
      website: null
    },
    { 
      id: 3, 
      name: "Antoine de Saint-Exupéry", 
      nationality: "Francese", 
      born: 1900, 
      died: 1944, 
      books: 5,
      biography: "Aviatore e scrittore francese, autore del celebre 'Il Piccolo Principe'.",
      genres: ["Letteratura per l'infanzia", "Memorialistica", "Avventura"],
      awards: ["Prix Femina", "Grand Prix du roman de l'Académie française"],
      website: null
    },
    { 
      id: 4, 
      name: "Gabriel García Márquez", 
      nationality: "Colombiana", 
      born: 1927, 
      died: 2014, 
      books: 15,
      biography: "Scrittore colombiano, premio Nobel per la letteratura nel 1982, maestro del realismo magico.",
      genres: ["Realismo magico", "Romanzo", "Giornalismo"],
      awards: ["Premio Nobel per la letteratura", "Premio Neustadt"],
      website: null
    },
    { 
      id: 5, 
      name: "J.R.R. Tolkien", 
      nationality: "Britannica", 
      born: 1892, 
      died: 1973, 
      books: 7,
      biography: "Scrittore, filologo e professore britannico, creatore della Terra di Mezzo.",
      genres: ["Fantasy", "Mitologia", "Linguistica"],
      awards: ["Commander of the Order of the British Empire", "International Fantasy Award"],
      website: "https://www.tolkiensociety.org"
    },
    { 
      id: 6, 
      name: "Jane Austen", 
      nationality: "Britannica", 
      born: 1775, 
      died: 1817, 
      books: 6,
      biography: "Scrittrice britannica, famosa per i suoi romanzi sulla società inglese del XIX secolo.",
      genres: ["Romanzo", "Commedia di costume", "Romanzo sentimentale"],
      awards: ["Postumo riconoscimento come uno dei più grandi scrittori inglesi"],
      website: null
    }
  ];

  // Filter by nationality if specified
  const { nationality, alive } = request.query;
  let filteredAuthors = authors;

  if (nationality) {
    filteredAuthors = filteredAuthors.filter(author => 
      author.nationality.toLowerCase().includes(nationality.toLowerCase())
    );
  }

  if (alive !== undefined) {
    const isAlive = alive === 'true';
    filteredAuthors = filteredAuthors.filter(author => 
      isAlive ? !author.died : author.died
    );
  }

  response.status(200).json({
    success: true,
    count: filteredAuthors.length,
    data: filteredAuthors
  });
}