const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if(!username || !password) {
    return res.status(400).json({message:"Username and password are required"});
  }

  const userExists = users.find(user => user.username === username);
  if(userExists){
    res.status(400).json({message:"Username already exists."})
  }

  users.push({ username, password });
  return res.status(201).json({message:"User registered successfully."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
        res.send(booksByAuthor);
    } else {
        res.status(404).json({ message: `No books found by author: ${author}` });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title);
  
  if (booksByTitle.length > 0) {
    res.send(booksByTitle);
  }
  else {
    res.status(404).json({message:`No books found by title: ${title}`});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.review) {
        res.send(book.review);
    } else {
        res.status(404).json({ message: "Review not found" });
    }
});

module.exports.general = public_users;
