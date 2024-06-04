const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
    if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0) {
        return true;
    }else{
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query; // Assuming review is passed as a query parameter
    const token = req.session.authorization.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    jwt.verify(token, 'access', (err) => {
        if (err) {
            return res.status(401).json({ message: "Access token is missing or invalid" });
        }

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!Array.isArray(books[isbn].reviews)) {
            books[isbn].reviews = [];
        }

        const existingReviewIndex = books[isbn].reviews.findIndex(r => r.user === req.session.authorization.username);
        if (existingReviewIndex !== -1) {
            books[isbn].reviews[existingReviewIndex].review = review;
        } else {
            books[isbn].reviews.push({ user: req.session.authorization.username, review });
        }

        return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.session.authorization.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    jwt.verify(token, 'access', (err) => {
        if (err) {
            return res.status(401).json({ message: "Access token is missing or invalid" });
        }

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!Array.isArray(books[isbn].reviews)) {
            return res.status(404).json({ message: "No reviews found for this book" });
        }

        const initialReviewsCount = books[isbn].reviews.length;
        books[isbn].reviews = books[isbn].reviews.filter(r => r.user !== req.session.authorization.username);

        if (initialReviewsCount === books[isbn].reviews.length) {
            return res.status(404).json({ message: "Review not found for the user" });
        }

        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
