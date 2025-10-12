const express = require("express");
const router = express.Router();
const passport = require("passport");
const userModel = require("../models/userModel");

// Landing page
router.get("/", (req, res) => {
  res.render("index"); 
});



// Login
router.get("/login", (req, res) => res.render("login"));

router.post("/login", async (req, res, next) => {
  if (req.is('application/json')) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'An error occurred during authentication' 
        });
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || 'Invalid email or password' 
        });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
          });
        }
        
        // Save user in session
        req.session.user = {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
        
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Session save failed' 
            });
          }
          
          let redirectUrl = '/dashboard';
          if (user.role === 'Attendant') redirectUrl = '/attendant';
          
          res.json({ 
            success: true, 
            message: 'Login successful',
            redirectUrl: redirectUrl,
            user: {
              fullName: user.fullName,
              email: user.email,
              role: user.role
            }
          });
        });
      });
    })(req, res, next);
  } else {
    // Traditional form submission
    passport.authenticate("local", { failureRedirect: "/login" })(req, res, next);
    
    if (req.isAuthenticated()) {
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
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
