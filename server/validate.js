
const genres = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other"
];

const allowedFields = [
  "title",
  "author",
  "year",
  "genre",
  "read",
  "rating"
];

export function validateBook(data) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Request body must be a JSON object"]
    };
  }

  const title = typeof data.title === "string"
    ? data.title.trim()
    : "";

  const author = typeof data.author === "string"
    ? data.author.trim()
    : "";

  if (title.length < 1 || title.length > 100) {
    errors.push("Title must be between 1 and 100 characters");
  }

  if (author.length < 1 || author.length > 100) {
    errors.push("Author must be between 1 and 100 characters");
  }

  if (
    !Number.isInteger(data.year) ||
    data.year < 1000 ||
    data.year > new Date().getFullYear()
  ) {
    errors.push("Year must be an integer between 1000 and the current year");
  }

  if (!genres.includes(data.genre)) {
    errors.push("Genre must be a valid genre");
  }

  if (data.read !== undefined && typeof data.read !== "boolean") {
    errors.push("Read must be a boolean");
  }

  const read = data.read ?? false;
  const rating = data.rating ?? null;

  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    errors.push("Rating must be an integer between 1 and 5 or null");
  }

  if (!read && rating !== null) {
    errors.push("A rating is only allowed when the book is read");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    book: {
      title,
      author,
      year: data.year,
      genre: data.genre,
      read,
      rating
    }
  };
}

export function filterBookFields(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      allowedFields.includes(key)
    )
  );
}
