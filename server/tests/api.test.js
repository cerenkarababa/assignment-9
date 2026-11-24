
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../server.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);

  await new Promise(resolve => {
    server.once("listening", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => {
      if (error) reject(error);
      else resolve();
    });
  });
});

test("GET /api/health should return 200", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.message, "Reading List API is running");
});

test("GET /api/books should return the seed books", async () => {
  const response = await fetch(`${baseUrl}/api/books`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 6);
});

test("GET /api/books/1 should return a single book", async () => {
  const response = await fetch(`${baseUrl}/api/books/1`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.id, 1);
  assert.equal(data.title, "The Great Gatsby");
});

test("GET /api/books with invalid genre should return 400", async () => {
  const response = await fetch(
    `${baseUrl}/api/books?genre=romance`
  );

  assert.equal(response.status, 400);
});

test("GET /api/books with missing ID should return 404", async () => {
  const response = await fetch(`${baseUrl}/api/books/99999`);

  assert.equal(response.status, 404);
});

test("GET /api/stats should return reading statistics", async () => {
  const response = await fetch(`${baseUrl}/api/stats`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.total, 6);
  assert.equal(data.read + data.unread, data.total);
});

test("POST /api/books should create a new book", async () => {
  const response = await fetch(`${baseUrl}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Test Book",
      author: "Test Author",
      year: 2020,
      genre: "fiction",
      read: false,
      rating: null
    })
  });

  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(data.title, "Test Book");
  assert.ok(data.id > 0);
  assert.equal(
    response.headers.get("location"),
    `/api/books/${data.id}`
  );
});

test("POST /api/books should reject duplicate books", async () => {
  const response = await fetch(`${baseUrl}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      year: 1925,
      genre: "fiction",
      read: true,
      rating: 5
    })
  });

  assert.equal(response.status, 409);
});

test("PATCH /api/books/1 should update only selected fields", async () => {
  const response = await fetch(`${baseUrl}/api/books/1`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      rating: 4
    })
  });

  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.rating, 4);
  assert.equal(data.title, "The Great Gatsby");
});

test("DELETE /api/books/1 should return 204", async () => {
  const response = await fetch(`${baseUrl}/api/books/1`, {
    method: "DELETE"
  });

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
});

test("GET /api/books should filter books by genre and read status", async () => {
  const response = await fetch(
    `${baseUrl}/api/books?genre=fantasy&read=false`
  );

  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(data.length > 0);
  assert.ok(data.every(book =>
    book.genre === "fantasy" && book.read === false
  ));
});

test("GET /api/books should reject repeated query parameters", async () => {
  const response = await fetch(
    `${baseUrl}/api/books?genre=fiction&genre=fantasy`
  );

  assert.equal(response.status, 400);
});

test("PUT /api/books/2 should replace the complete book", async () => {
  const response = await fetch(`${baseUrl}/api/books/2`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Updated Science Book",
      author: "Test Author",
      year: 2022,
      genre: "science",
      read: false,
      rating: null
    })
  });

  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.title, "Updated Science Book");
  assert.equal(data.author, "Test Author");
  assert.equal(data.rating, null);
});

test("POST /api/books should reject malformed JSON", async () => {
  const response = await fetch(`${baseUrl}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: '{"title":'
  });

  const data = await response.json();

  assert.equal(response.status, 400);
  assert.equal(data.error, "Invalid JSON body");
});

test("OPTIONS preflight should return the allowed frontend origin", async () => {
  const response = await fetch(`${baseUrl}/api/books/1`, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:5173",
      "Access-Control-Request-Method": "PATCH",
      "Access-Control-Request-Headers": "content-type"
    }
  });

  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://localhost:5173"
  );
});

