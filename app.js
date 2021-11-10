//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _=require("lodash")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-ashutosh:Test123@cluster0.9rr1k.mongodb.net/todolistDB", { useNewUrlParser: true });
const dbschema = ({
  name: String
});

const model = new mongoose.model("Item", dbschema);

const item1 = new model({
  name: "Welcome to the todo list"
});
const item2 = new model({
  name: "hit + button to add new item"
});
const item3 = new model({
  name: "Hit -- button to delete an item"
});

const defaultitem = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [dbschema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {

  model.find({}, function (err, founditems) {
    if (founditems.length === 0) {
      model.insertMany(defaultitem, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items into the DB");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }
  });




});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listname = req.body.lists;

  const item = new model({
    name: itemName
  });
  if(listname=== "Today"){
    item.save();
  res.redirect("/");
  } else{
     
    List.findOne({name:listname}, function(err,foundlist){
      foundlist.item.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }
  
});

app.post("/delete", function (req, res) {
  const value = req.body.checkbox;
  const listName = req.body.listname;
  if(listName==="Today"){
    model.findByIdAndRemove(value, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("item successfully deleted")
        res.redirect("/");
      }
    });

  } else{
    List.findOneAndUpdate({name:listName},{$pull: {item:{_id: value}}},function(err, foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
});

app.get("/:customListName", function (req, res) {
  const customurl = _.capitalize(req.params.customListName);


  List.findOne({ name: customurl }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {

        const list = new List({
          name: customurl,
          item: defaultitem
        });

        list.save();
        res.redirect("/"+customurl);

      } else {
        res.render("list",{listTitle: foundlist.name, newListItems: foundlist.item })
      }
    }
  })




});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
