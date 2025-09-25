const express = require("express");
const router = express.Router();
const passport = require("passport");


const userModel = require("../models/userModel");
const stockModel = require("../models/stockModel");

// Getting the register form
router.get("/signup", (req, res) => {
  res.render("signup", { title: "signup" });
});


//todo GETTING LANDING PAGE
router.get("/", (req,res) => {
  res.render("index")
});




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
    // user.save();
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
});



router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login",passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    if (req.user.role === "Manager") {
      res.redirect("/dashboard");
    } else if (req.user.role === "Attendant") {
      res.redirect("/recordingSales");
    } else res.render("noneuser");
  }
);

//  todo   Handle insertion of duplicate data using a try and catch(check if the individual exists, redirect to the login)

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


router.get("/dashboard", async (req, res) => {
res.render("manager");
});

//todo handle insertion of duplicate data using a try and catch (check if the individual exists, redirect to the login)

module.exports = router;
