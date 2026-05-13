const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(u => u.username === username && u.password === password);
};

// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Username and password required." });
    }
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", username });
    }
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    if (!review) {
        return res.status(400).json({ message: "Review text required as ?review= query parameter" });
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `Review for ISBN ${isbn} added/modified by ${username}`,
        reviews: books[isbn].reviews
    });
});

// Task 9: Delete a book review (only the logged-in user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({
            message: `Review for ISBN ${isbn} by ${username} deleted`,
            reviews: books[isbn].reviews
        });
    }
    return res.status(404).json({ message: `No review by ${username} found for ISBN ${isbn}` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
