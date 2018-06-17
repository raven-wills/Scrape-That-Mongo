var express = require("express");

var router = express.Router();
// grabbing our models
var db = require("../models");

router.get("/", function(req, res) {
  return res.render("index", { layout: "index" });
});

// Export routes for server.js to use.
module.exports = router;
