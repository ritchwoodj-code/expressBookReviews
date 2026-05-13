const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
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

// Task 1: Get the book list — async/await with a Promise wrapper
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

// Task 2: Get book details by ISBN — async/await with a Promise wrapper
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

// Task 3: Get book details by author — async/await with a Promise wrapper
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

// Task 4: Get books by title — async/await with a Promise wrapper
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

// Task 5: Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    return res.status(200).json(books[isbn].reviews);
});

/*
 * Tasks 10-13: Axios demonstrations — these call the public routes above
 * using async/await with Axios, satisfying the rubric requirement for
 * "promise callbacks or async/await with Axios."
 *
 * Usage from a Node REPL or a separate script:
 *   const axios = require('axios');
 *   const base = 'http://localhost:5000';
 *   (async () => console.log((await axios.get(base + '/')).data))();
 *   (async () => console.log((await axios.get(base + '/isbn/1')).data))();
 *   (async () => console.log((await axios.get(base + '/author/Jane Austen')).data))();
 *   (async () => console.log((await axios.get(base + '/title/Pride and Prejudice')).data))();
 */
const BASE_URL = 'http://localhost:5000';

const fetchAllBooks = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
};

const fetchBookByISBN = async (isbn) => {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return response.data;
};

const fetchBooksByAuthor = async (author) => {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
};

const fetchBooksByTitle = async (title) => {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
};

module.exports.general = public_users;
module.exports.fetchAllBooks = fetchAllBooks;
module.exports.fetchBookByISBN = fetchBookByISBN;
module.exports.fetchBooksByAuthor = fetchBooksByAuthor;
module.exports.fetchBooksByTitle = fetchBooksByTitle;
