// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_87t9wbh1:jam1i9vvoo6982ns3ok19rmlbm@ds163718.mlab.com:63718/heroku_87t9wbh1");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://news.ycombinator.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("a.storylink").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).attr("href");


      // Using findOneAndUpdate here allows us to ensure that each article scraped is unique. 
      Article.findOneAndUpdate({"title":result.title},{$set: {"title":result.title, "link":result.link}}, {upsert:true}, function(err, doc) {
        // Log any errors
        if (err) {
        }
      });

    });
  });
  res.sendStatus(200);
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "note": doc._id }})
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

//delete a note route
app.post("/articles/:id/delete", function(req,res){
  console.log("deleting the note");
  console.log(req.params.id);
  console.log(req.body);
  Note.remove({"_id":req.params.id}, function(data){
    console.log(data)
  })

  Article.findOneAndUpdate({"_id": req.body.article}, { $pull:{"note": req.params.id}}, function(err){
    if (err) console.log(err);
  })
});


// Listen on port 3000
app.listen(process.env.PORT|| 3000, function() {
  console.log("App running on port 3000!");
});
