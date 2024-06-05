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
const fetchBooks = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 100);
    });
  };

  public_users.get('/', async (req, res) => {
    try {
      const booksData = await fetchBooks();
      res.json(booksData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Get book details based on ISBN
const fetchBookByISBN = async (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books[isbn]);
      }, 100);
    });
  };
  
  public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const book = await fetchBookByISBN(isbn);
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: `Book not found with ISBN: ${isbn}` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// Get book details based on author
const fetchBooksByAuthor = async (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      resolve(booksByAuthor);
    }, 100);
  });
};

public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const booksByAuthor = await fetchBooksByAuthor(author);
    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
    } else {
      res.status(404).json({ message: `No books found by author: ${author}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all books based on title
const fetchBooksByTitle = async (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        resolve(booksByTitle);
      }, 100);
    });
  };
  
  public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const booksByTitle = await fetchBooksByTitle(title);
      if (booksByTitle.length > 0) {
        res.json(booksByTitle);
      } else {
        res.status(404).json({ message: `No books found by title: ${title}` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
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
