
import express from "express";
import cors from "cors";
import { pathToFileURL } from "node:url";

import {
  getAllBooks,
  getBookById,
  createBook,
  replaceBook,
  updateBook,
  deleteBook,
  getBookStats
} from "./booksStore.js";

import {
  validateBook,
  filterBookFields
} from "./validate.js";

const app = express();
export { app };

const PORT = process.env.PORT || 3000;

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

const genres = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other"
];

// CORS middleware
app.use(cors({
  origin: CLIENT_ORIGIN
}));

// JSON body parser
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  return res.status(200).json({
    message: "Reading List API is running"
  });
});

// GET /api/books
app.get("/api/books", async (req, res) => {
  const allowedParams = [
    "genre",
    "read",
    "q",
    "sort",
    "order",
    "limit",
    "page"
  ];

  const query = req.query;

  for (const key of Object.keys(query)) {
    if (
      !allowedParams.includes(key) ||
      Array.isArray(query[key])
    ) {
      return res.status(400).json({
        error: `Invalid or repeated query parameter: ${key}`
      });
    }
  }

  const {
    genre,
    read,
    q,
    sort = "id",
    order = "asc",
    limit = "50",
    page = "1"
  } = query;

  if (genre !== undefined && !genres.includes(genre)) {
    return res.status(400).json({
      error: "Invalid genre"
    });
  }

  if (
    read !== undefined &&
    read !== "true" &&
    read !== "false"
  ) {
    return res.status(400).json({
      error: "Read must be true or false"
    });
  }

  if (q !== undefined && typeof q !== "string") {
    return res.status(400).json({
      error: "Invalid search query"
    });
  }

  if (!["id", "title", "author", "year", "rating"].includes(sort)) {
    return res.status(400).json({
      error: "Invalid sort field"
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "Order must be asc or desc"
    });
  }

  const pageSize = Number(limit);
  const pageNumber = Number(page);

  if (
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 50
  ) {
    return res.status(400).json({
      error: "Limit must be between 1 and 50"
    });
  }

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1
  ) {
    return res.status(400).json({
      error: "Page must be a positive integer"
    });
  }

  let books = await getAllBooks();

  if (genre) {
    books = books.filter(book => book.genre === genre);
  }

  if (read !== undefined) {
    books = books.filter(
      book => book.read === (read === "true")
    );
  }

  if (q !== undefined) {
    const search = q.toLowerCase();

    books = books.filter(book =>
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search)
    );
  }

  // Sort without modifying stored data
  books = [...books].sort((a, b) => {
    if (sort === "rating") {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;

      return order === "asc"
        ? a.rating - b.rating
        : b.rating - a.rating;
    }

    let result;

    if (sort === "title" || sort === "author") {
      result = a[sort].localeCompare(b[sort]);
    } else {
      result = a[sort] - b[sort];
    }

    return order === "asc" ? result : -result;
  });

  // Pagination
  const startIndex = (pageNumber - 1) * pageSize;

  const paginatedBooks = books.slice(
    startIndex,
    startIndex + pageSize
  );

  return res.status(200).json(paginatedBooks);
});

// GET /api/books/:id
app.get("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID must be a positive integer"
    });
  }

  const book = await getBookById(id);

  if (!book) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(200).json(book);
});

// POST /api/books
app.post("/api/books", async (req, res) => {
  const validation = validateBook(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors.join("; ")
    });
  }

  const newBookData = validation.book;
  const books = await getAllBooks();

  const duplicate = books.some(book =>
    book.title.toLowerCase() === newBookData.title.toLowerCase() &&
    book.author.toLowerCase() === newBookData.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "A book with this title and author already exists"
    });
  }

  const newBook = await createBook(newBookData);

  return res
    .location(`/api/books/${newBook.id}`)
    .status(201)
    .json(newBook);
});

// PUT /api/books/:id
app.put("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID must be a positive integer"
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  const validation = validateBook(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors.join("; ")
    });
  }

  const updatedData = validation.book;
  const books = await getAllBooks();

  const duplicate = books.some(book =>
    book.id !== id &&
    book.title.toLowerCase() === updatedData.title.toLowerCase() &&
    book.author.toLowerCase() === updatedData.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "A book with this title and author already exists"
    });
  }

  const updatedBook = await replaceBook(id, updatedData);

  return res.status(200).json(updatedBook);
});

// PATCH /api/books/:id
app.patch("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID must be a positive integer"
    });
  }

  const existingBook = await getBookById(id);

  if (!existingBook) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      error: "Request body must be a JSON object"
    });
  }

  const changes = filterBookFields(req.body);

  const mergedBook = {
    ...existingBook,
    ...changes,
    id
  };

  const validation = validateBook(mergedBook);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors.join("; ")
    });
  }

  const books = await getAllBooks();

  const duplicate = books.some(book =>
    book.id !== id &&
    book.title.toLowerCase() === validation.book.title.toLowerCase() &&
    book.author.toLowerCase() === validation.book.author.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({
      error: "A book with this title and author already exists"
    });
  }

  const updatedBook = await updateBook(id, validation.book);

  return res.status(200).json(updatedBook);
});

// DELETE /api/books/:id
app.delete("/api/books/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID must be a positive integer"
    });
  }

  const deleted = await deleteBook(id);

  if (!deleted) {
    return res.status(404).json({
      error: "Book not found"
    });
  }

  return res.status(204).end();
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  const stats = await getBookStats();

  return res.status(200).json(stats);
});

// API 404 fallback
app.use("/api", (req, res) => {
  return res.status(404).json({
    error: "Not found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      error: "Invalid JSON body"
    });
  }

  return res.status(500).json({
    error: "Something went wrong"
  });
});

// Start server only when this file is run directly
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  app.listen(PORT, () => {
    console.log(`Reading List API running on port ${PORT}`);
  });
}
