var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");

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

  axios
    .get("https://www.tastemade.com/recipes/healthy")
    .then(function(response) {
      var $ = cheerio.load(response.data);

      $("div.MediaCard").each(function(i, element) {
        var result = {};

        result.link = $(this)
          .children()
          .attr("href");
        result.title = $(this)
          .find("h2")
          .text();
        result.description = $(this)
          .find("p")
          .text();

        link = requestLink + link;

        db.Recipe.create(result)
          .then(function(dbRecipe) {
            console.log(dbRecipe);
          })
          .catch(function(err) {
            return res.json(err);
          });
      });
      res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Recipe.find({})
    .then(function(dbRecipes) {
      // If we were able to successfully find Articles, send them back to the client
      return res.render("index", {
        recipes: dbRecipes
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
