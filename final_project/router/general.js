const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

/* =========================================================================
 * Task 6 — Register a new user
 * ========================================================================= */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (isValid(username)) {
        return res.status(409).json({ message: `User '${username}' already exists. Choose another username.` });
    }
    users.push({ username, password });
    return res.status(200).json({ message: `User '${username}' successfully registered. You can now login.` });
});

/* =========================================================================
 * Task 1 — Get the book list (async/await with a Promise)
 * Task 10 — Same endpoint demonstrated with Axios async/await
 * ========================================================================= */
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await new Promise((resolve, reject) => {
            books ? resolve(books) : reject(new Error("Book list unavailable"));
        });
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Task 10 — fetch all books via Axios (async/await)
public_users.get('/axios/books', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).send(response.data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

/* =========================================================================
 * Task 2 — Get book details by ISBN (async/await with a Promise)
 * Task 11 — Same endpoint demonstrated with Axios async/await
 * ========================================================================= */
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            books[isbn]
                ? resolve(books[isbn])
                : reject(new Error(`Book with ISBN ${isbn} not found`));
        });
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Task 11 — fetch book by ISBN via Axios (async/await)
public_users.get('/axios/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
        return res.status(200).json(response.data);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

/* =========================================================================
 * Task 3 — Get book details by author (async/await with a Promise)
 * Task 12 — Same endpoint demonstrated with Axios async/await
 * ========================================================================= */
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const matches = await new Promise((resolve, reject) => {
            const list = Object.entries(books)
                .filter(([, b]) => b.author === author)
                .map(([isbn, b]) => ({ isbn, ...b }));
            list.length > 0
                ? resolve(list)
                : reject(new Error(`No books found for author '${author}'`));
        });
        return res.status(200).json({ booksbyauthor: matches });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Task 12 — fetch books by author via Axios (async/await)
public_users.get('/axios/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
        return res.status(200).json(response.data);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

/* =========================================================================
 * Task 4 — Get books by title (async/await with a Promise)
 * Task 13 — Same endpoint demonstrated with Axios async/await
 * ========================================================================= */
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const matches = await new Promise((resolve, reject) => {
            const list = Object.entries(books)
                .filter(([, b]) => b.title === title)
                .map(([isbn, b]) => ({ isbn, ...b }));
            list.length > 0
                ? resolve(list)
                : reject(new Error(`No books found with title '${title}'`));
        });
        return res.status(200).json({ booksbytitle: matches });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

// Task 13 — fetch books by title via Axios (async/await)
public_users.get('/axios/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
        return res.status(200).json(response.data);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
});

/* =========================================================================
 * Task 5 — Get book review by ISBN
 * ========================================================================= */
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
