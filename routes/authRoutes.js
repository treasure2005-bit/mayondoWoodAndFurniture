const express = require("express");
const router = express.Router();
const passport = require("passport");
const userModel = require("../models/userModel");

// Getting the register form
router.get("/signup", (req, res) => {
  res.render("signup", { title: "signup" });
});

// GETTING LANDING PAGE
router.get("/", (req, res) => {
  res.render("index");
});

// SIGNUP POST
router.post("/signup", async (req, res) => {
  try {
    const user = new userModel(req.body);
    console.log(req.body);
    let existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send("Already exists!");
    } else {
      await userModel.register(user, req.body.password, (error) => {
        if (error) {
          throw error;
        }
        res.redirect("/login");
      });
    }
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
});

// LOGIN GET
router.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN POST - WITH DEBUG LOGGING
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    // ADD THESE DEBUG LOGS
    console.log("=== LOGIN SUCCESS ===");
    console.log("User:", req.user);
    console.log("User Role:", req.user.role);
    console.log("Session:", req.session);
    console.log("===================");

    req.session.user = req.user;

    if (req.user.role === "Manager") {
      console.log("Redirecting Manager to /dashboard");
      res.redirect("/dashboard");
    } else if (req.user.role === "Attendant") {
      console.log("Redirecting Attendant to /attendant");
      res.redirect("/attendant");
    } else {
      console.log("Unknown role, showing noneuser page");
      res.render("noneuser");
    }
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).send("Error loggingOut");
      }
      res.redirect("/");
    });
  }
});

module.exports = router;
