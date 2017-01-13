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
//initialize tooltips
$(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
  });

function showNotes(){
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
      $(".modal-footer").append("<a href='#!' id='cancel' class='modal-action modal-close waves-effect waves-green btn-flat'>Cancel</a> <a href='#!' id='savenote' data-id='"+ data._id + "' class='modal-action modal-close waves-effect waves-green btn-flat' >Save & Close</a>");
      // If there's a note in the article
      if (data.note.length >0) {
        data.note.forEach(function(note, i){
          $("#notesContent").append("<div id='note"+i+"'><p class='noteTitle'>"+note.title+"</p><a data-index='"+i+"' data-parent='"+data._id+"' data-id='"+ note._id + "' class='red darken-4 btn tooltipped trash' data-position='left' data-delay='50' data-tooltip='Delete this comment'><i  class=' material-icons'>delete</i></a><p>"+note.body+"</p><hr></div>")
        })
      } else{
        $("#notesContent").append("<p class='noteTitle'>No comments yet.</p>")
      }
       $(document).ready(function(){
        $('.tooltipped').tooltip({delay: 50});
        });
      // An input to enter a new title
      $("#notesContent").append("<br><br><div id='addComment'><h5>Add a Comment</h5><input id='titleinput' name='title' placeholder='Comment Title'><div class='input-field'><label for='bodyinput'>Comment Body</label><textarea class='materialize-textarea' id='bodyinput' name='body'></textarea></div><br></div>");

    });
}

// Whenever someone clicks a p tag
$(document).on("click", ".showNotes", showNotes);

$(document).on("click", "#cancel", function(){
  $('#notes').modal('close');
  $("#notesContent").empty();
})

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  if ($("#titleinput").val() !== "" && $("#bodyinput").val()!==""){
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
  } else{
    Materialize.toast('You need to enter both a title and comment!', 3000)
  }
  
});

//deleting a note
$(document).on("click",".trash", function(){
   $(this).tooltip('hide')
  var index = $(this).attr("data-index")
  console.log(index);
  $("#note"+index).empty();
  $.ajax({
    method:"POST",
    url:"/articles/"+$(this).attr("data-id")+"/delete",
    data:{ article:$(this).attr("data-parent"),
      index:$(this).attr("data-index")

    }
  }).done(function(data){
    $('.tooltipped').tooltip('remove');
    showNotes();
  })

})


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