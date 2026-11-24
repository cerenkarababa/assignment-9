# Reading List Application

## 1. Project Overview

This project is a full-stack Reading List application developed for Web Programming - Fall 2026, Assignment 9.

The application consists of:

- A REST API built with Node.js and Express 5.

- A React frontend created with Vite.

- A dedicated API module that communicates with the backend using the Fetch API.

Users can view, search, filter, sort, add, edit, rate, and delete books. The application also displays reading statistics.

The backend stores data in memory. There is no database or authentication system. When the server restarts, the data returns to the initial seed data.

## 2. Technologies Used

- Node.js

- Express 5

- JavaScript ES Modules

- React

- Vite

- Fetch API

- HTML and CSS

- Git and GitHub

- CORS

## 3. Project Structure

```text

assignment9/

├── server/

│   ├── server.js

│   ├── booksStore.js

│   ├── validate.js

│   ├── package.json

│   └── package-lock.json

│

├── client/

│   ├── src/

│   │   ├── api/

│   │   │   └── books.js

│   │   ├── components/

│   │   ├── App.jsx

│   │   └── main.jsx

│   ├── .env.example

│   ├── index.html

│   └── package.json

│

├── .gitignore

└── README.md

```

## 4. Installation and Running the Project

### Requirements

- Node.js

- npm

### Backend Setup

Open a terminal and navigate to the server directory:

```bash

cd server

npm install

```

Start the backend:

```bash

npm run dev

```

The backend runs on:

```text

http://localhost:3000

```

The server uses the `PORT` environment variable and defaults to port `3000`.

The allowed frontend origin is configured using `CLIENT_ORIGIN`. Its default value is:

```text

http://localhost:5173

```

### Frontend Setup

Open another terminal and navigate to the client directory:

```bash

cd client

npm install

```

Create a `.env` file using `.env.example` as a reference:

```env

VITE_API_URL=http://localhost:3000

```

Start the frontend:

```bash

npm run dev

```

The frontend runs on:

```text

http://localhost:5173

```

### Running Automated Tests

From the `server` directory, run:

```bash
npm test
```

The test suite uses the Node.js built-in test runner and covers API endpoints, validation, error responses, and CORS preflight.

---

## 5. API Endpoints

| Method | Endpoint | Description |

|---|---|---|

| GET | `/api/books` | Get all books |

| GET | `/api/books/:id` | Get one book |

| POST | `/api/books` | Create a book |

| PUT | `/api/books/:id` | Replace a book |

| PATCH | `/api/books/:id` | Update selected book fields |

| DELETE | `/api/books/:id` | Delete a book |

| GET | `/api/stats` | Get reading statistics |

### Book Fields

- `id`: Server-assigned unique identifier.

- `title`: Book title.

- `author`: Author name.

- `year`: Publication year.

- `genre`: Book genre.

- `read`: Reading status.

- `rating`: Rating from 1 to 5, or null.

### Query Parameters

The books endpoint supports:

- `genre`: Filter by genre.

- `read`: Filter by reading status.

- `q`: Search in title or author.

- `sort`: Sort by title, author, year, or rating.

- `order`: Ascending or descending order.

- `limit`: Number of results per page.

- `page`: Page number.

Multiple query parameters can be combined.

## 6. Testing Evidence

The following examples were tested using `curl --include`. The responses include HTTP status codes, headers, and response bodies.

### Test 1: GET Books with Multiple Query Parameters

**Request:**

```bash

curl --include "http://localhost:3000/api/books?genre=fantasy&read=true"

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 103

ETag: W/"67-TkoXRp6ZVufdtQag8lZH+TSfEis"

Date: Mon, 23 Nov 2026 20:57:04 GMT

Connection: keep-alive

Keep-Alive: timeout=5

[{"id":6,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fantasy","read":true,"rating":4}]

```

### Test 2: GET a Single Book

**Request:**

```bash

curl --include http://localhost:3000/api/books/1

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 119

ETag: W/"77-LWCc9zJzG+qhJ0n/mT2KE3I7o6o"

Date: Mon, 23 Nov 2026 20:57:31 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"id":1,"title":"The Great Gatsby","author":"F. Scott Fitzgerald","year":1925,"genre":"fiction","read":true,"rating":5}

```

### Test 3: POST a New Book

**Request:**

```bash

curl --include -X POST http://localhost:3000/api/books \

-H "Content-Type: application/json" \

-d '{"title":"The Midnight Library","author":"Matt Haig","year":2020,"genre":"fiction","read":false,"rating":null}'

```

**Response:**

```http

HTTP/1.1 201 Created

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Location: /api/books/7

Content-Type: application/json; charset=utf-8

Content-Length: 117

ETag: W/"75-TdFQ1fkh7MH9bTUTs/ak1kiRvSg"

Date: Mon, 23 Nov 2026 20:57:59 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"title":"The Midnight Library","author":"Matt Haig","year":2020,"genre":"fiction","read":false,"rating":null,"id":7}

```

### Test 4: POST with an Invalid Body

**Request:**

```bash

curl --include -X POST http://localhost:3000/api/books \

-H "Content-Type: application/json" \

-d '{"title":"Invalid Book","author":"Test Author","year":999,"genre":"fiction","read":false}'

```

**Response:**

```http

HTTP/1.1 400 Bad Request

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 69

ETag: W/"45-NAA+58+oi/lUniXWJeSIoL9RX+U"

Date: Mon, 23 Nov 2026 20:58:35 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"error":"Year must be an integer between 1000 and the current year"}

```

### Test 5: Repeated Query Parameter

**Request:**

```bash

curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"

```

**Response:**

```http

HTTP/1.1 400 Bad Request

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 54

ETag: W/"36-eWIQheY9O7QXLeBXlRo8gfVZkyI"

Date: Mon, 23 Nov 2026 20:58:56 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"error":"Invalid or repeated query parameter: genre"}

```

### Test 6: GET a Book That Does Not Exist

**Request:**

```bash

curl --include http://localhost:3000/api/books/999

```

**Response:**

```http

HTTP/1.1 404 Not Found

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 26

ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"

Date: Mon, 23 Nov 2026 20:59:26 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"error":"Book not found"}

```

### Test 7: POST a Duplicate Book

**Request:**

```bash

curl --include -X POST http://localhost:3000/api/books \

-H "Content-Type: application/json" \

-d '{"title":"The Midnight Library","author":"Matt Haig","year":2020,"genre":"fiction","read":false,"rating":null}'

```

**Response:**

```http

HTTP/1.1 409 Conflict

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 60

ETag: W/"3c-YJy0XpDp5agPe/8cl8QkvyagI8A"

Date: Mon, 23 Nov 2026 20:59:43 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}

```

### Test 8: PUT a Book

PUT replaces the complete book resource.

**Request:**

```bash

curl --include -X PUT http://localhost:3000/api/books/7 \

-H "Content-Type: application/json" \

-d '{"title":"The Midnight Library Updated","author":"Matt Haig","year":2021,"genre":"fiction","read":true,"rating":5}'

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 121

ETag: W/"79-a18o6Y1JGxKwkqmLHSbSEl0SR74"

Date: Mon, 23 Nov 2026 21:00:00 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"title":"The Midnight Library Updated","author":"Matt Haig","year":2021,"genre":"fiction","read":true,"rating":5,"id":7}

```

### Test 9: PATCH the Same Book

PATCH changes only the fields included in the request.

**Request:**

```bash

curl --include -X PATCH http://localhost:3000/api/books/7 \

-H "Content-Type: application/json" \

-d '{"rating":4}'

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 121

ETag: W/"79-YXUyXK8URIiTo3r64rluVv0myXs"

Date: Mon, 23 Nov 2026 21:00:18 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"title":"The Midnight Library Updated","author":"Matt Haig","year":2021,"genre":"fiction","read":true,"rating":4,"id":7}

```

### Test 10: DELETE a Book

**\*\*Successful DELETE (`204 No Content`)\*\***

**Request:**

```bash

curl --include -X DELETE http://localhost:3000/api/books/8

```

**Response:**

```http

HTTP/1.1 204 No Content

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Date: Mon, 23 Nov 2026 21:02:51 GMT

Connection: keep-alive

Keep-Alive: timeout=5

```

**\*\*Repeated DELETE (`404 Not Found`)\*\***

The same request was sent again after the book had been deleted.

**Request:**

```bash

curl --include -X DELETE http://localhost:3000/api/books/8

```

**Response:**

```http

HTTP/1.1 404 Not Found

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 26

ETag: W/"1a-9K7Ys+5Z9m3qczPTmMk82VGBL7g"

Date: Mon, 23 Nov 2026 21:03:10 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"error":"Book not found"}

```

### Test 11: Statistics Before and After a Change

**\*\*GET /api/stats before deleting a book\*\***

**Request:**

```bash

curl --include http://localhost:3000/api/stats

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 127

ETag: W/"7f-4ileki6zHc++PITMADx+ixANbSk"

Date: Mon, 23 Nov 2026 21:01:26 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"total":7,"read":4,"unread":3,"averageRating":4.5,"byGenre":{"fiction":2,"science":1,"fantasy":2,"history":1,"non-fiction":1}}

```

**\*\*GET /api/stats after deleting a book\*\***

**Request:**

```bash

curl --include http://localhost:3000/api/stats

```

**Response:**

```http

HTTP/1.1 200 OK

X-Powered-By: Express

Access-Control-Allow-Origin: http://localhost:5173

Vary: Origin

Content-Type: application/json; charset=utf-8

Content-Length: 127

ETag: W/"7f-CRty3gtSBK/uk7sfE5znPO7SmpY"

Date: Mon, 23 Nov 2026 21:03:24 GMT

Connection: keep-alive

Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.5,"byGenre":{"fiction":1,"science":1,"fantasy":2,"history":1,"non-fiction":1}}

```

The total number of books decreased from 7 to 6. The unread count decreased from 3 to 2. The average rating remained 4.5.

## 7. CORS Preflight Evidence

The frontend and backend use different local ports:

- Frontend: `http://localhost:5173`

- Backend: `http://localhost:3000`

Because these are different origins, the backend uses the `cors` package to allow requests from the exact frontend origin.

A browser can send an `OPTIONS` preflight request before a cross-origin request that uses certain methods or headers.

**Automated preflight test:** The backend test suite sends an `OPTIONS` request and verifies that the server responds with `204 No Content` and the allowed frontend origin in the `Access-Control-Allow-Origin` response header (`http://localhost:5173`).

**Browser Network tab note:** I did not capture a conclusive `OPTIONS` request in the browser Network tab during testing. The evidence above is from the automated API test, not a browser screenshot.

## 8. Reasoning Questions

### 1. Parameters

The book ID is a route parameter because it identifies one specific resource. Genre and sort are query parameters because they change how the list is filtered or displayed. If the ID were in the query string, the endpoint would need to use a query parameter to identify the book instead of the resource path.

### 2. Body Parsing

I temporarily disabled `express.json()` and sent a POST request with a JSON body. The server returned `400 Bad Request` with the message `Request body must be a JSON object`, because the route did not receive a parsed JSON object. I restored the middleware before the routes afterward.

### 3. One Response

I temporarily removed the `return` before the 404 response in the book lookup route and requested a book with a missing ID. The server still returned `404 Not Found` with the message `Book not found`, and no additional error appeared in the server terminal during this test. I restored the `return` afterward. The `return` is important because it stops the handler from continuing after sending a response and helps prevent a second response from being sent.

### 4. PUT and PATCH

PUT is useful when replacing the complete information of a book, for example changing its title, author, year, genre, and reading status. PATCH is better when changing only one field, such as updating the rating or toggling the read status. PATCH avoids sending the entire book when only a small change is needed.

### 5. CORS

I temporarily set `CLIENT_ORIGIN` to the incorrect value `http://localhost:9999` and restarted the server. In Chrome DevTools Console, I observed a CORS error stating that the `Access-Control-Allow-Origin` header had the value `http://localhost:9999`, which did not match the frontend origin `http://localhost:5173`. The browser displayed `Failed to fetch` because it blocked JavaScript from accessing the response. I did not observe a request log in the server terminal during this experiment. `curl` still works because it does not enforce browser CORS policies.

### 6. Validation

Client-side validation improves the user experience by showing errors before sending a request. However, the server must also validate data because requests can be sent without using the frontend. Server-side validation protects the application from invalid or unexpected data.

### 7. State

The application stores its books in memory on the server instead of a database. When the server restarts, the stored changes are lost and the initial seed data is loaded again. To keep the data permanently, the application would need persistent storage such as a database or file storage.

## 9. Self-Study Notes

### URLSearchParams

`URLSearchParams` is a JavaScript feature used to build query strings safely. It handles encoding parameter values and makes it easier to combine filters and sorting options.

I used it in the client API module to construct query parameters for book searches, filters, and sorting.

### localeCompare

`localeCompare()` compares strings alphabetically. It is useful when sorting text such as book titles and author names.

It provides locale-aware string comparison rather than relying only on basic character comparisons.

### Vite Environment Variables

Vite exposes environment variables through `import.meta.env`. Variables that need to be available in client-side code must use the `VITE_` prefix.

I used `VITE_API_URL` to configure the backend URL without hardcoding it throughout the application.

### HTTP 204 No Content

HTTP status `204` indicates that a request was successful but the server does not return a response body.

The DELETE endpoint uses this status after successfully deleting a book.

### AbortController and Fetch

`AbortController` can cancel an ongoing Fetch API request. Its signal is passed to `fetch()`.

I used request cancellation in the React application so that older requests do not overwrite newer search or filter results. An aborted request can produce an `AbortError`, which should be handled separately from normal errors.

## 10. Challenges Faced

During development, I faced several challenges:

- Configuring the backend and frontend to communicate correctly.

- Understanding CORS and the browser's cross-origin restrictions.

- Implementing validation and returning the correct HTTP status codes.

- Understanding the difference between PUT and PATCH.

- Handling asynchronous requests and errors.

- Keeping the React interface synchronized with the server after successful changes.

- Implementing search, filtering, sorting, and request cancellation.

- Displaying statistics based on the current server data.

Working through these challenges helped me understand how a frontend application communicates with a REST API and how server-side validation, HTTP methods, status codes, and error handling work together.

## 11. Conclusion

This project helped me practice building a full-stack application using Express and React. I implemented a REST API, connected it to a frontend through a dedicated API module, and practiced CRUD operations, validation, CORS, asynchronous requests, and statistics.

The project also helped me understand the importance of organizing code into separate modules and handling communication between the client and server correctly.

### Browser Network Tab – CORS Preflight Evidence

The CORS preflight request was verified in Chrome DevTools Network tab while changing a book's read status in the React application.

Observed request and response:

- Request type: `preflight` (OPTIONS)
- Response status: `204 No Content`
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Content-Type: application/json; charset=utf-8`
- `Vary: Origin`
- `X-Powered-By: Express`

The browser successfully completed the preflight request before sending the actual PATCH request. This confirms that the Express API allows requests from the React client's configured origin.