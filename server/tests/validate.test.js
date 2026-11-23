
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBook, filterBookFields } from "../validate.js";

const validBook = {
  title: "The Hobbit",
  author: "J.R.R. Tolkien",
  year: 1937,
  genre: "fantasy",
  read: true,
  rating: 5
};

test("valid book should pass validation", () => {
  const result = validateBook(validBook);

  assert.equal(result.valid, true);
  assert.equal(result.book.title, "The Hobbit");
});

test("title and author should be trimmed", () => {
  const result = validateBook({
    ...validBook,
    title: "  Dune  ",
    author: " Frank Herbert "
  });

  assert.equal(result.book.title, "Dune");
  assert.equal(result.book.author, "Frank Herbert");
});

test("invalid year should fail validation", () => {
  const result = validateBook({
    ...validBook,
    year: 999
  });

  assert.equal(result.valid, false);
});

test("invalid genre should fail validation", () => {
  const result = validateBook({
    ...validBook,
    genre: "romance"
  });

  assert.equal(result.valid, false);
});

test("unread book cannot have a rating", () => {
  const result = validateBook({
    ...validBook,
    read: false,
    rating: 5
  });

  assert.equal(result.valid, false);
});

test("rating must be between 1 and 5", () => {
  const result = validateBook({
    ...validBook,
    rating: 6
  });

  assert.equal(result.valid, false);
});

test("rating can be null", () => {
  const result = validateBook({
    ...validBook,
    rating: null
  });

  assert.equal(result.valid, true);
});

test("unknown fields should be filtered out", () => {
  const result = filterBookFields({
    ...validBook,
    unexpected: "value"
  });

  assert.equal("unexpected" in result, false);
});
