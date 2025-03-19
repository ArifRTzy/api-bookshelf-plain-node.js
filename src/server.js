const http = require("http");
const { nanoid } = require("nanoid");
const books = [];

const requestListener = (request, response) => {
  const { method, url } = request;

  if (method === "GET" && url === "/books") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        status: "success",
        data: {
          books: books.map(({ id, name, publisher }) => ({
            id,
            name,
            publisher,
          })),
        },
      })
    );
  }

  if (method === "GET" && url.startsWith("/books/")) {
    const bookId = url.split("/")[2];
    const book = books.find((b) => b.id === bookId);

    if (!book) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({ status: "fail", message: "Buku tidak ditemukan" })
      );
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "success", data: { book } }));
  }

  if (method === "POST" && url === "/books") {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = JSON.parse(body);

      if (!name) {
        response.writeHead(400, { "Content-Type": "application/json" });
        return response.end(
          JSON.stringify({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku",
          })
        );
      }

      if (readPage > pageCount) {
        response.writeHead(400, { "Content-Type": "application/json" });
        return response.end(
          JSON.stringify({
            status: "fail",
            message:
              "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
          })
        );
      }

      const id = nanoid();
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;
      const finished = pageCount === readPage;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };
      books.push(newBook);

      response.writeHead(201, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: { bookId: id },
        })
      );
    });
  }

  if (method === "PUT" && url.startsWith("/books/")) {
    const bookId = url.split("/")[2];
    let body = "";
    request.on("data", (chunk) => (body += chunk.toString()));
    request.on("end", () => {
      const index = books.findIndex((b) => b.id === bookId);
      if (index === -1) {
        response.writeHead(404, { "Content-Type": "application/json" });
        return response.end(
          JSON.stringify({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
        );
      }
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = JSON.parse(body);
      if (!name) {
        response.writeHead(400, { "Content-Type": "application/json" });
        return response.end(
          JSON.stringify({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
        );
      }
      if (readPage > pageCount) {
        response.writeHead(400, { "Content-Type": "application/json" });
        return response.end(
          JSON.stringify({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
        );
      }
      const updatedAt = new Date().toISOString();
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
        finished: pageCount === readPage,
      };
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
      );
    });
  }

  if (method === "DELETE" && url.startsWith("/books/")) {
    const bookId = url.split("/")[2];
    const index = books.findIndex((b) => b.id === bookId);
    if (index === -1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          status: "fail",
          message: "Buku gagal dihapus. Id tidak ditemukan",
        })
      );
    }
    books.splice(index, 1);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({ status: "success", message: "Buku berhasil dihapus" })
    );
  }
};

const server = http.createServer(requestListener);

const port = 9000;
const host = "localhost";

server.listen(port, host, () => {
  console.log(`server run on http://${host}:${port}`);
});
