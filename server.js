// 1 . Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const moment = require("moment");
const methodOverride = require("method-override");

require("dotenv").config();

// import models
const UserModel = require("./models/userModel");
const attendantstockModel = require("./models/attendantstockModel")


// import routes
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const attendantsRoutes = require("./routes/attendantsRoutes");
const salesRoutes = require("./routes/salesRoutes");
const stockRoutes = require("./routes/stockRoutes");
const userRoutes = require("./routes/userRoutes");
const attendantstockRoutes = require("./routes/attendantstockRoutes");
const reportsRoutes = require("./routes/reportsRoutes")
const suppliersRoutes = require("./routes/suppliersRoutes");


// 2 . Instantiations
const app = express();
const port = 3000;

// 3 . Configurations
app.locals.moment = moment;
//SETTING UP MONGODB CONNECTIONS
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

mongoose.connection
  .on("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

// SETTING VIEW ENGINE TO PUG
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 4 . Middleware
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(express.urlencoded({ extended: true })); //helps to pass data from forms
app.use(express.json());
//EXPRESS SESSION CONFIGS
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //one day
  })
);
//PASSPORT CONFIGS
app.use(passport.initialize());
app.use(passport.session());

//AUTHENTICATE WITH PASSPORT LOCAL STRATEGY
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// 5 . Routes
//USING IMPORTED ROUTES

// app.use("/",studyRoutes)
app.use("/dashboard", dashboardRoutes);
app.use("/", authRoutes);
app.use("/", attendantsRoutes);
app.use("/", salesRoutes);
app.use("/", stockRoutes);
app.use("/userRoutes", userRoutes);
app.use("/", attendantstockRoutes);
app.use("/", reportsRoutes);
app.use("/", suppliersRoutes);



//non existent route handler Second last
app.use((req, res) => {
  res.status(404).send("Oops! Route not found.");
});

// 6 . Bootstrapping Server
//this should always be the last line in this file.
app.listen(port, () => console.log(`listening on port ${port}`));
