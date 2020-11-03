const express = require("express");


const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("index");
});

// About page
router.get("/about", (req, res) => {
  res.render("about");
});

// Contact page
router.get("/contact", (req, res) => {
  res.render("contact");
});

// Gallery page
router.get("/shop", (req, res) => {
  res.render("shop");
});

module.exports = router;