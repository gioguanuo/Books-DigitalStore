export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  const categories = [
    { id: 1, name: "Romanzo storico", count: 45, description: "Romanzi ambientati nel passato" },
    { id: 2, name: "Distopia", count: 23, description: "Visioni pessimistiche del futuro" },
    { id: 3, name: "Favola", count: 67, description: "Racconti per tutte le età" },
    { id: 4, name: "Realismo magico", count: 34, description: "Realtà mischiata a elementi fantastici" },
    { id: 5, name: "Fantasy", count: 156, description: "Mondi immaginari e creature magiche" },
    { id: 6, name: "Romanzo", count: 234, description: "Narrativa classica e moderna" }
  ];

  response.status(200).json({ success: true, data: categories });
}