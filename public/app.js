// Grab the articles as a json
function refreshArticles(){
  $.getJSON("/articles", function(data) {
    $("#articles").empty();
    // For each one
    for (var i = 0; i < data.length; i++) {
      var numComments;
      if(data[i].note.length > 0){
        numComments = data[i].note.length;
      }
      // Display the apropos information on the page
      $("#articles").append("<p class='title' data-id='" + data[i]._id + "'>" + data[i].title + "  -  <a href='" + data[i].link + "'>Link</a></p>" + "<a data-id='"+ 
        data[i]._id + "' href='#notes' data-target='notes' class='showNotes modal-trigger waves-effect waves-light btn  blue darken-1'>Comments ("+data[i].note.length + ")</button>");
    }
  });
}

refreshArticles();

$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
  });

// Whenever someone clicks a p tag
$(document).on("click", ".showNotes", function() {
  // Empty the notes from the note section
  $("#notes").modal("open");
  $("#notesContent").empty();
  $(".modal-footer").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {


      // The title of the article
      $("#notesContent").append("<h5>" + data.title + "</h5>");
      
      // A button to submit a new note, with the id of the article saved to it
      $(".modal-footer").append("<a href='#!' id='savenote' data-id='"+ data._id + "' class='modal-action modal-close waves-effect waves-green btn-flat' >Save</a>");
      // If there's a note in the article
      if (data.note.length >0) {
        data.note.forEach(function(note){
          $("#notesContent").append("<p class='noteTitle'>"+note.title+"</p><p>"+note.body+"</p><hr>")
        })
      } else{
        $("#notesContent").append("<p class='noteTitle'>No comments yet.</p>")
      }
      // An input to enter a new title
      $("#notesContent").append("<br><br><div id='addComment'><h5>Add a Comment</h5><input id='titleinput' name='title' placeholder='Comment Title'><div class='input-field'><label for='bodyinput'>Comment Body</label><textarea class='materialize-textarea' id='bodyinput' name='body'></textarea></div><br></div>");

    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      $('#notes').modal('close');
      // Empty the notes section

      $("#notesContent").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
  refreshArticles();
});


$("#grabNew").on("click", function(){
  $.ajax({
    method: "GET",
    url: "/scrape",
    success: function(data){
      Materialize.toast('New articles loading...', 2000)
      setTimeout(refreshArticles, 2000);
    }
  })
})