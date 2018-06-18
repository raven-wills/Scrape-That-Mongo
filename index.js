const app = require("./app");

var PORT = process.env.PORT || 3050;
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
