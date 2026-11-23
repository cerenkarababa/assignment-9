
import { useEffect, useState } from "react";
import { getBooks } from "./api/books";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        setLoading(true);
        setError("");

        const data = await getBooks({}, controller.signal);
        setBooks(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, []);

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
          <span>{books.length} books in your library</span>
        </div>

        {loading && <p className="status">Loading books...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="status">Your reading list is empty.</p>
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
