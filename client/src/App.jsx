
import { useEffect, useState } from "react";
import {
  getBooks,
  createBook,
  updateBook,
  patchBook,
  deleteBook,
} from "./api/books";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [read, setRead] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("asc");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeBookId, setActiveBookId] = useState(null);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    year: "",
    genre: "fiction",
  });

  const [editingBookId, setEditingBookId] = useState(null);
  const [editBook, setEditBook] = useState({
    title: "",
    author: "",
    year: "",
    genre: "fiction",
    read: false,
    rating: null,
  });

  async function loadBooks(signal) {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks(
        { q: search, genre, read, sort, order },
        signal
      );

      setBooks(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadBooks(controller.signal);
    return () => controller.abort();
  }, [search, genre, read, sort, order]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setNewBook((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAddBook(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      await createBook({
        ...newBook,
        year: Number(newBook.year),
        read: false,
        rating: null,
      });

      setNewBook({
        title: "",
        author: "",
        year: "",
        genre: "fiction",
      });

      setShowForm(false);
      setSearch("");
      setGenre("");
      setRead("");
      setSort("id");
      setOrder("asc");

      await loadBooks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRead(book) {
    try {
      setActiveBookId(book.id);
      setError("");

      await patchBook(book.id, {
        read: !book.read,
        rating: book.read ? null : book.rating,
      });

      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActiveBookId(null);
    }
  }

  async function handleRatingChange(book, rating) {
    try {
      setActiveBookId(book.id);
      setError("");

      await patchBook(book.id, { rating });
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActiveBookId(null);
    }
  }

  async function handleDeleteBook(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      setActiveBookId(book.id);
      setError("");

      await deleteBook(book.id);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActiveBookId(null);
    }
  }

  function handleEditClick(book) {
    setEditingBookId(book.id);

    setEditBook({
      title: book.title,
      author: book.author,
      year: book.year,
      genre: book.genre,
      read: book.read,
      rating: book.rating,
    });
  }

  function handleEditInputChange(event) {
    const { name, value } = event.target;

    setEditBook((previous) => ({
      ...previous,
      [name]: name === "year" ? Number(value) : value,
    }));
  }

  async function handleUpdateBook(event) {
    event.preventDefault();

    try {
      setActiveBookId(editingBookId);
      setError("");

      await updateBook(editingBookId, {
        ...editBook,
        year: Number(editBook.year),
      });

      setEditingBookId(null);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActiveBookId(null);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">YOUR PERSONAL LIBRARY</p>
          <h1>Reading List</h1>
          <p className="subtitle">
            Keep track of the books you love and the stories waiting for you.
          </p>
        </div>

        <div className="book-count">
          <span>{books.length}</span>
          <small>Books</small>
        </div>
      </header>

      <section className="book-section">
        <div className="section-heading">
          <h2>My Books</h2>
          <button
            className="add-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close" : "+ Add Book"}
          </button>
        </div>

        {showForm && (
          <form className="book-form" onSubmit={handleAddBook}>
            <h3>Add a New Book</h3>

            <input
              name="title"
              placeholder="Book title"
              value={newBook.title}
              onChange={handleInputChange}
              maxLength={100}
              required
            />

            <input
              name="author"
              placeholder="Author"
              value={newBook.author}
              onChange={handleInputChange}
              maxLength={100}
              required
            />

            <input
              name="year"
              type="number"
              placeholder="Publication year"
              value={newBook.year}
              onChange={handleInputChange}
              min="1000"
              max={new Date().getFullYear()}
              required
            />

            <select
              name="genre"
              value={newBook.genre}
              onChange={handleInputChange}
            >
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="fantasy">Fantasy</option>
              <option value="other">Other</option>
            </select>

            {formError && <p className="error">{formError}</p>}

            <button type="submit" disabled={saving}>
              {saving ? "Adding..." : "Save Book"}
            </button>
          </form>
        )}

        <div className="section-heading">
          <h2>My Bookshelf</h2>
          <span>{books.length} books in your library</span>
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="Search by title or author..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="">All genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="fantasy">Fantasy</option>
            <option value="other">Other</option>
          </select>

          <select
            value={read}
            onChange={(event) => setRead(event.target.value)}
          >
            <option value="">All books</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="id">Default order</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>

          <select
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {loading && <p className="status">Loading books...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="status">No books found.</p>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="book-grid">
            {books.map((book) => (
              <article className="book-card" key={book.id}>
                <div className="book-card-top">
                  <span className="genre">{book.genre}</span>

                  <span className={book.read ? "read-badge" : "unread-badge"}>
                    {book.read ? "Read" : "Unread"}
                  </span>
                </div>

                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>

                <div className="book-details">
                  <span>{book.year}</span>
                  <span>
                    {book.rating === null
                      ? "Not rated"
                      : `★ ${book.rating}/5`}
                  </span>
                </div>

                {editingBookId === book.id && (
                  <form className="edit-form" onSubmit={handleUpdateBook}>
                    <h4>Edit Book</h4>

                    <input
                      name="title"
                      value={editBook.title}
                      onChange={handleEditInputChange}
                      maxLength={100}
                      required
                    />

                    <input
                      name="author"
                      value={editBook.author}
                      onChange={handleEditInputChange}
                      maxLength={100}
                      required
                    />

                    <input
                      name="year"
                      type="number"
                      value={editBook.year}
                      onChange={handleEditInputChange}
                      min="1000"
                      max={new Date().getFullYear()}
                      required
                    />

                    <select
                      name="genre"
                      value={editBook.genre}
                      onChange={handleEditInputChange}
                    >
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      <option value="science">Science</option>
                      <option value="history">History</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="other">Other</option>
                    </select>

                    <button
                      type="submit"
                      disabled={activeBookId === book.id}
                    >
                      {activeBookId === book.id
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingBookId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                <div className="book-actions">
                  <button
                    type="button"
                    disabled={activeBookId === book.id}
                    onClick={() => handleEditClick(book)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={activeBookId === book.id}
                    onClick={() => handleToggleRead(book)}
                  >
                    {activeBookId === book.id
                      ? "Updating..."
                      : book.read
                        ? "Mark Unread"
                        : "Mark Read"}
                  </button>

                  <select
                    aria-label={`Rating for ${book.title}`}
                    value={book.rating ?? ""}
                    disabled={!book.read || activeBookId === book.id}
                    onChange={(event) =>
                      handleRatingChange(book, Number(event.target.value))
                    }
                  >
                    <option value="" disabled>
                      Rate book
                    </option>

                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} / 5
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="delete-button"
                    disabled={activeBookId === book.id}
                    onClick={() => handleDeleteBook(book)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
