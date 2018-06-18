jQuery(document).ready(function() {
  if ($(".cd-stretchy-nav").length > 0) {
    var stretchyNavs = $(".cd-stretchy-nav");

    stretchyNavs.each(function() {
      var stretchyNav = $(this),
        stretchyNavTrigger = stretchyNav.find(".cd-nav-trigger");

      stretchyNavTrigger.on("click", function(event) {
        event.preventDefault();
        stretchyNav.toggleClass("nav-is-visible");
      });
    });

    $(document).on("click", function(event) {
      !$(event.target).is(".cd-nav-trigger") &&
        !$(event.target).is(".cd-nav-trigger span") &&
        stretchyNavs.removeClass("nav-is-visible");
    });
  }

  MicroModal.init({
    awaitCloseAnimation: true
  });
});

const onSave = clickedButton => {
  const id = String(clickedButton.dataset.id);
  axios.post(`/saved/${id}`);
  clickedButton.style["background-color"] = "#cd9591";
  clickedButton.innerText = "Saved";
  clickedButton.style["box-shadow"] = "none";
  clickedButton.style["transform"] = "none";
};

const onUnsave = clickedButton => {
  const id = String(clickedButton.dataset.id);
  axios.post(`/unsaved/${id}`).then(function() {
    console.log("hello");
  });
  window.location.reload();
};
