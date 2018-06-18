var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
//Initialize Express
var app = express();

app.use(logger("dev"));

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);

app.set("view engine", "handlebars");

//Database configuration
var databaseUrl = "recipesdb";
var collections = ["recipes"];

// If deployed, use the deployed database. Otherwise use the local mongoRecipes database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/recipesdb";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Scrape Tastemade
app.get("/scrape", function(req, res) {
  var requestLink = "https://www.tastemade.com";

  request.get("https://www.tastemade.com/recipes/healthy", function(
    error,
    response,
    html
  ) {
    var $ = cheerio.load(html);

    $("div.MediaCard").each(function(i, element) {
      var result = {};
      result.link =
        requestLink +
        $(this)
          .find("a")
          .attr("href");
      result.title = $(this)
        .find("h2")
        .text();
      result.description = $(this)
        .find("p")
        .first()
        .text();

      db.Recipe.create(result)
        .then(function(dbRecipe) {
          // View the added result in the console
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });
    res.redirect("/");
  });
});

// Route for getting all Articles from the db
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Recipe.find({})
    .then(function(dbRecipes) {
      // If we were able to successfully find Articles, send them back to the client
      return res.render("index", {
        recipes: dbRecipes,
        _id: 0
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Recipe.find({ saved: true })
    .then(function(dbRecipes) {
      // If we were able to successfully find Articles, send them back to the client
      return res.render("saved", {
        recipes: dbRecipes,
        _id: 0
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("saved/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Recipe.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbRecipe) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbRecipe);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/saved/:id", function(req, res) {
  db.Recipe.findOneAndUpdate({ _id: req.params.id }, { saved: true }).then(
    function(dbRecipe) {
      // If we were able to successfully update an Article, send it back to the client
    }
  );
});

app.post("/unsaved/:id", function(req, res) {
  db.Recipe.findOneAndUpdate({ _id: req.params.id }, { saved: false }).then(
    function(dbRecipe) {
      // If we were able to successfully update an Article, send it back to the client
    }
  );
});

// // Route for saving/updating an Article's associated Note
// app.post("saved/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Recipe.findOneAndUpdate(
//         { _id: req.params.id },
//         { note: dbNote._id },
//         { new: true }
//       );
//     })
//     .then(function(dbRecipe) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbRecipe);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
