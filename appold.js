// jshint esversion:6;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

mongoose.connect('mongodb://localhost:27017/todoListDB', {useNewUrlParser: true});


const app = express();
let items = [];
let workItems = [];

const itemSchema = new mongoose.Schema({name:String});
const Item = mongoose.model('Item', itemSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function(req, res){

  let day = date.getDate();
  res.render("list",
  {listTitle: day, newListItems:items });

});


app.post("/",(req, res)=>{
  let item = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});
app.get("/work",(req, res)=>{
  res.render("list",{listTitle: "Work", newListItems: workItems});
});

app.get("/about",(req, res)=>{
  res.render("about");
});



app.listen(3000,()=>{
  console.log("server is running on port 3000");
});
