/*
Handling Routes with jquery
This should be moved to Angular
*/


// Tracking View
$("#tracking").click(function() {
  $.ajax({
    async: true,
    type: "GET",
    url: "user/tracking",
    contentType: "application/html"
  }).done(function(data) {
    $("#mainView").html(data);
  });
});

// Add View
$("#add").click(function() {
  $.ajax({
    async: true,
    type: "GET",
    url: "user/add",
    contentType: "application/html"
  }).done(function(data) {
    $("#mainView").html(data);
  });
});
