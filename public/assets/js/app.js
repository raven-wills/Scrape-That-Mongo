// Grab the articles as a json
$.getJSON("/", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#recipes").append(
      "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        "<br />" +
        data[i].link +
        "<br />" +
        data[i].description +
        "</p>"
    );
  }
});
