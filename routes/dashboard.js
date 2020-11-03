const express = require("express");


const router = express.Router();

// Display the dashboard page
router.get("/", (req, res) => {
  res.render("dashboard");
});

router.get("/test", (req, res) => {
    res.render("test");
    res.json({ profile: req.user ? req.user.profile : null });
  });



module.exports = router;