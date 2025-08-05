export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  const detailedStats = {
    overview: {
      totalBooks: 1247,
      totalAuthors: 89,
      totalCategories: 23,
      totalUsers: 15432
    },
    userActivity: {
      monthlyActiveUsers: 3421,
      dailyActiveUsers: 456,
      averageReadingTime: "2.5 hours",
      booksReadThisMonth: 2891
    },
    topCategories: [
      { name: "Fantasy", books: 156, popularity: 89 },
      { name: "Romanzo", books: 234, popularity: 76 },
      { name: "Favola", books: 67, popularity: 65 }
    ],
    recentBooks: [
      { title: "Il Nome della Rosa", addedDate: "2024-12-01", category: "Romanzo storico" },
      { title: "1984", addedDate: "2024-11-28", category: "Distopia" },
      { title: "Il Piccolo Principe", addedDate: "2024-11-25", category: "Favola" }
    ],
    ratings: {
      average: 4.2,
      distribution: {
        "5": 45,
        "4": 32,
        "3": 15,
        "2": 6,
        "1": 2
      }
    }
  };

  response.status(200).json({ success: true, data: detailedStats });
}