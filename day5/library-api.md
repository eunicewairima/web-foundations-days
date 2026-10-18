# Library Books API

Base path: `/books`

## Endpoints

- **List books**
  - Method: `GET`
  - Path: `/books`
  - Description: Returns all books in the library.
  - Success: `200 OK`

- **Get one book**
  - Method: `GET`
  - Path: `/books/{bookId}`
  - Description: Returns the book with the specified ID.
  - Success: `200 OK`

- **Create a book**
  - Method: `POST`
  - Path: `/books`
  - Description: Adds a book to the library.
  - Example request body:
    ```json
    {
      "title": "The Hobbit",
      "author": "J. R. R. Tolkien",
      "publishedYear": 1937
    }
    ```
  - Success: `201 Created`

- **Update a book**
  - Method: `PUT`
  - Path: `/books/{bookId}`
  - Description: Replaces the details of the specified book.
  - Example request body:
    ```json
    {
      "title": "The Hobbit",
      "author": "J. R. R. Tolkien",
      "publishedYear": 1937
    }
    ```
  - Success: `200 OK`

- **Delete a book**
  - Method: `DELETE`
  - Path: `/books/{bookId}`
  - Description: Removes the specified book from the library.
  - Success: `204 No Content`

- **List books by author**
  - Method: `GET`
  - Path: `/books?author=J.%20R.%20R.%20Tolkien`
  - Description: Returns books matching the `author` query parameter.
  - Success: `200 OK`

## Error responses

- `400 Bad Request` — The request body is invalid, such as a create request that omits the required `title`.
- `404 Not Found` — The requested book does not exist, such as `GET /books/9999` when there is no book with ID `9999`.
