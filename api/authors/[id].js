// api/authors/[id].js
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
      biography: "Umberto Eco è stato uno scrittore, filosofo, semiologo, traduttore e professore universitario italiano. Ha scritto numerosi saggi di semiotica, estetica medievale, linguistica e filosofia, oltre a romanzi di successo.",
      genres: ["Romanzo storico", "Filosofia", "Semiotica"],
      awards: ["Premio Strega (1981)", "Premio Viareggio", "Medaglia d'oro dei Benemeriti della Cultura"],
      website: "https://www.umbertoeco.it",
      famousWorks: ["Il nome della rosa", "Il pendolo di Foucault", "L'isola del giorno prima"],
      quotes: ["I libri non sono fatti per essere creduti, ma per essere sottoposti a indagine."]
    },
    { 
      id: 2, 
      name: "George Orwell", 
      nationality: "Britannica", 
      born: 1903, 
      died: 1950, 
      books: 8,
      biography: "Eric Arthur Blair, noto con lo pseudonimo di George Orwell, è stato uno scrittore, giornalista e critico letterario britannico. È conosciuto soprattutto per i romanzi distopici '1984' e 'La fattoria degli animali'.",
      genres: ["Distopia", "Saggistica politica", "Romanzo"],
      awards: ["Prometheus Hall of Fame Award"],
      website: null,
      famousWorks: ["1984", "La fattoria degli animali", "Omaggio alla Catalogna"],
      quotes: ["La libertà è il diritto di dire alla gente quello che non vuole sentire."]
    },
    { 
      id: 3, 
      name: "Antoine de Saint-Exupéry", 
      nationality: "Francese", 
      born: 1900, 
      died: 1944, 
      books: 5,
      biography: "Antoine de Saint-Exupéry è stato uno scrittore e aviatore francese. È famoso principalmente per il romanzo 'Il piccolo principe', una delle opere più tradotte al mondo.",
      genres: ["Letteratura per l'infanzia", "Memorialistica", "Avventura"],
      awards: ["Prix Femina", "Grand Prix du roman de l'Académie française"],
      website: null,
      famousWorks: ["Il piccolo principe", "Volo di notte", "Terra degli uomini"],
      quotes: ["Si vede bene solo con il cuore. L'essenziale è invisibile agli occhi."]
    },
    { 
      id: 4, 
      name: "Gabriel García Márquez", 
      nationality: "Colombiana", 
      born: 1927, 
      died: 2014, 
      books: 15,
      biography: "Gabriel García Márquez è stato uno scrittore, giornalista e attivista colombiano. Premio Nobel per la Letteratura nel 1982, è considerato uno dei più significativi autori del XX secolo e il maestro del realismo magico.",
      genres: ["Realismo magico", "Romanzo", "Giornalismo"],
      awards: ["Premio Nobel per la letteratura (1982)", "Premio Neustadt", "Premio Rómulo Gallegos"],
      website: null,
      famousWorks: ["Cent'anni di solitudine", "L'amore ai tempi del colera", "Cronaca di una morte annunciata"],
      quotes: ["La vita non è quella che si è vissuta, ma quella che si ricorda e come la si ricorda per raccontarla."]
    },
    { 
      id: 5, 
      name: "J.R.R. Tolkien", 
      nationality: "Britannica", 
      born: 1892, 
      died: 1973, 
      books: 7,
      biography: "John Ronald Reuel Tolkien è stato uno scrittore, filologo, glottoteta e professore universitario britannico. È l'autore de 'Il Signore degli Anelli' e de 'Lo Hobbit', opere che hanno definito il genere fantasy moderno.",
      genres: ["Fantasy", "Mitologia", "Linguistica"],
      awards: ["Commander of the Order of the British Empire", "International Fantasy Award"],
      website: "https://www.tolkiensociety.org",
      famousWorks: ["Il Signore degli Anelli", "Lo Hobbit", "Il Silmarillion"],
      quotes: ["Non tutto ciò che è d'oro brilla, né gli erranti sono perduti."]
    },
    { 
      id: 6, 
      name: "Jane Austen", 
      nationality: "Britannica", 
      born: 1775, 
      died: 1817, 
      books: 6,
      biography: "Jane Austen è stata una scrittrice britannica. È famosa principalmente per i suoi sei romanzi, che criticano con ironia la società e le convenzioni dell'aristocrazia terriera del XVIII secolo.",
      genres: ["Romanzo", "Commedia di costume", "Romanzo sentimentale"],
      awards: ["Riconoscimento postumo come una dei più grandi scrittori inglesi"],
      website: null,
      famousWorks: ["Orgoglio e pregiudizio", "Emma", "Ragione e sentimento"],
      quotes: ["È una verità universalmente riconosciuta che uno scapolo in possesso di una buona fortuna debba essere in cerca di moglie."]
    }
  ];

  const { id } = request.query;
  const author = authors.find(a => a.id === parseInt(id));

  if (!author) {
    return response.status(404).json({
      success: false,
      error: 'Autore non trovato',
      message: `Nessun autore trovato con ID: ${id}`
    });
  }

  response.status(200).json({
    success: true,
    data: author
  });
}