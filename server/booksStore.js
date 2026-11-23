
const delay = () => new Promise(resolve => setTimeout(resolve, 100));

let books = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    genre: "fiction",
    read: true,
    rating: 5
  },
  {
    id: 2,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "science",
    read: true,
    rating: 4
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: false,
    rating: null
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: true,
    rating: 5
  },
  {
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "non-fiction",
    read: false,
    rating: null
  },
  {
    id: 6,
    title: "Dune",
    author: "Frank Herbert",
    year: 1965,
    genre: "fantasy",
    read: true,
    rating: 4
  }
];

let nextId = 7;

export async function getAllBooks() {
  await delay();
  return books.map(book => ({ ...book }));
}

export async function getBookById(id) {
  await delay();

  const book = books.find(book => book.id === id);

  return book ? { ...book } : null;
}

export async function createBook(bookData) {
  await delay();

  const newBook = {
    ...bookData,
    id: nextId++
  };

  books = [...books, newBook];

  return { ...newBook };
}

export async function replaceBook(id, bookData) {
  await delay();

  const existingBook = books.find(book => book.id === id);

  if (!existingBook) return null;

  const updatedBook = {
    ...bookData,
    id
  };

  books = books.map(book =>
    book.id === id ? updatedBook : book
  );

  return { ...updatedBook };
}

export async function updateBook(id, changes) {
  await delay();

  const existingBook = books.find(book => book.id === id);

  if (!existingBook) return null;

  const updatedBook = {
    ...existingBook,
    ...changes,
    id
  };

  books = books.map(book =>
    book.id === id ? updatedBook : book
  );

  return { ...updatedBook };
}

export async function deleteBook(id) {
  await delay();

  const existingBook = books.find(book => book.id === id);

  if (!existingBook) return false;

  books = books.filter(book => book.id !== id);

  return true;
}

export async function getBookStats() {
  await delay();

  const total = books.length;
  const read = books.filter(book => book.read).length;
  const ratedBooks = books.filter(book => book.rating !== null);

  const averageRating = ratedBooks.length
    ? Number(
        (
          ratedBooks.reduce((sum, book) => sum + book.rating, 0) /
          ratedBooks.length
        ).toFixed(1)
      )
    : null;

  const byGenre = {};

  books.forEach(book => {
    byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
  });

  return {
    total,
    read,
    unread: total - read,
    averageRating,
    byGenre
  };
}
