var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cheerio = require("cheerio");
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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoRecipes";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Scrape Tastemade
app.get("/", function(req, res) {
  var requestLink = "https://www.tastemade.com";

  request("https://www.tastemade.com/recipes/healthy", function(
    error,
    response,
    html
  ) {
    var $ = cheerio.load(html);

    $("div.MediaCard").each(function(i, element) {
      var link = $(element)
        .children()
        .attr("href");
      var title = $(element)
        .find("h2")
        .text();
      var description = $(element)
        .find("p")
        .text();

      if (title && link && description) {
        db.recipes.insert(
          {
            title: title,
            link: link,
            description: description
          },
          function(err, inserted) {
            if (err) {
              console.log(err);
            } else {
              console.log(inserted);
            }
          }
        );
      }
    });
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
