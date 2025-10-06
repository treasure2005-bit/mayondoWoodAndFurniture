const express = require("express");
const router = express.Router();
const passport = require("passport");
const userModel = require("../models/userModel");

// Landing page
router.get("/", (req, res) => {
  res.render("index"); // <-- untouched
});

// Signup
router.get("/signup", (req, res) => {
  res.render("signup", { title: "signup" });
});

router.post("/signup", async (req, res) => {
  try {
    const user = new userModel(req.body);
    let existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).send("Already exists!");

    await userModel.register(user, req.body.password, (error) => {
      if (error) throw error;
      res.redirect("/login");
    });
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
});

// Login
router.get("/login", (req, res) => res.render("login"));

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    // Save user in session
    req.session.user = {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      phoneNumber: req.user.phoneNumber,
    };
    req.session.save(() => {
      if (req.user.role === "Manager") return res.redirect("/dashboard");
      if (req.user.role === "Attendant") return res.redirect("/attendant");
      res.render("noneuser");
    });
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
