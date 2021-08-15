// jshint esversion:6;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting to MongoDB via Mongoose
mongoose.connect('mongodb+srv://Admin-satyam:Satyam_1985@cluster0.epbix.mongodb.net/todoListDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});



// let items = [];
// let workItems = [];

const itemSchema = new mongoose.Schema({name:String});
const Item = mongoose.model('Item', itemSchema);
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

const item1 = new Item({name:"Welcome to ToDO App"});
const item2 = new Item({name:"Please press + button to add items"});
const item3 = new Item({name:"<--- press checkbox to remove items"});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res){

  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Updated successfully");
        }
      });
      res.redirect("/");
    }
    res.render("list", {listTitle: "Today", newListItems:foundItems });
  });
});
// Express Auto route is used to have custom route
app.get("/:customListItem", function(req, res){
  const customListItem = _.capitalize(req.params.customListItem);
  List.findOne({name: customListItem},function(err, list){
    if(!err){
      if(list){
        //Show an existing list
        res.render("list", {listTitle: list, newListItems:list.items });
      }else{
        //Create a new list
        const list = new List({
          name: customListItem,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListItem);
      }
    }
  });

});

//adding Items
app.post("/",(req, res)=>{
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:itemName});

  if(listName === "Today") //checking if browser is on Root Route
  {

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, list){ //finding browser is on which Route
      list.items.push(item); //pushing it data to todoList array of respective Route
      list.save();
      res.redirect("/"+listName); // redirecting to the found Route
    })
  }

});

//Deleting the Items
app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") { // deleting the item if it is on Root Route
    Item.findByIdAndDelete(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate( //finding the Route and deleting the items by findOneAndUpdate method
      {name: listName},
      {$pull: {items:{_id:checkedItemId}}},
      function(err, list){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }
});

app.listen(3000,()=>{
  console.log("server is running on port 3000");
});
