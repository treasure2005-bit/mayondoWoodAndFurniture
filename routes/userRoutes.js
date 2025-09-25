const express = require("express");
const router = express.Router();

router.get("/registerUser", (req, res) => {
  res.render("login");
});

router.post("/registerUser", (req, res) => {
  console.log(req.body);
});

module.exports = router;
