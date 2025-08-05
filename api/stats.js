export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  const stats = {
    totalBooks: 1247,
    totalAuthors: 89,
    totalCategories: 23,
    totalUsers: 15432,
    monthlyActiveUsers: 3421,
    averageRating: 4.2,
    newBooksThisMonth: 47,
    mostPopularCategory: "Fantasy",
    booksReadThisMonth: 2891,
    lastUpdated: new Date().toISOString()
  };

  response.status(200).json({ success: true, data: stats });
}