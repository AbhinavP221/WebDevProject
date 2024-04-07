// const app=require('express');
// const http=require('http').Server(app);

// const mongoose=require('mongoose');
// mongoose.connect("mongodb+srv://holmes221sherlockb:VfD0NXBnmAEjfXB7@counsel.zvrunke.mongodb.net/?retryWrites=true&w=majority&appName=counsel")


// const User = require('./models/userModel');

// async function insert()
// {
//     await User.create({
//         name: 'Abhinav',
//         email:'abhinav@gmail.com',
//         state:'Bihar',
//         contact:9999999999,
//         comments:'Hello'
//     });
// }
// insert();
// http.listen(3000,function()
// {
//     console.log('Server is running');
// });

var express = require("express");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');

// Replace this connection string with your MongoDB Atlas connection string
const atlasConnectionString = 'mongodb+srv://holmes221sherlockb:VfD0NXBnmAEjfXB7@counsel.zvrunke.mongodb.net/?retryWrites=true&w=majority&appName=counsel';

mongoose.connect(atlasConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("Error connecting to MongoDB Atlas:", err));

var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', function(callback){
   console.log("connection succeeded");
});

var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
   extended: true
}));

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
 });
 
 app.get('/register', function(req,res){
    res.sendFile(__dirname + '/register.html');
 });

 const statusSchema = new mongoose.Schema({
   applicationId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'details' // Reference to the details collection
   },
   status: {
       type: String,
       default: 'Pending'
   }
});

const Status = mongoose.model('Status', statusSchema);
 
app.get('/user_reg',async function(req,res){
    var name = req.query.Name;
    var email = req.query.mail;
    var state = req.query.state;
    var contact = req.query.contact;
    var comments = req.query.comments;

   var data = {
      "name": name,
      "email": email,
      "state": state,
      "contact": contact,
      "comments": comments
   };

   try {
      // Insert into details collection
      const detailsResult = await db.collection('details').insertOne(data);
      const appId = detailsResult.insertedId;

      // Insert into status collection
      const statusResult = await Status.create({ applicationId: appId.toString(), status: 'Pending' });

      console.log("Record inserted Successfully with ID:", appId.toString());
      res.send(`<script>displayAlertWithId('${appId.toString()}');</script>`); // Display alert with application ID
  } catch (error) {
      console.error("Error inserting record:", error);
      res.status(500).send("An error occurred during registration.");
  }
});

app.get('/contact_form', function(req,res){
   var name = req.query.Name;
   var email = req.query.mail;
   var query = req.query.queries;

  var data = {
     "name": name,
     "email": email,
     "query": query
  };

  db.collection('contact_form').insertOne(data, function(err, collection){
   if (err) throw err;
   console.log("Record inserted Successfully");
});
return res.redirect('/');
});

app.get('/check_status', async function(req, res) {
    try {
        const applicationId = req.query.appId;
        // Convert applicationId to string
        const applicationIdString = applicationId.toString();
        // Find the status of the application by its ID
        const status = await Status.findOne({ applicationId: applicationIdString }).exec();
        if (status) {
            res.send(`Application status: ${status.status}`);
        } else {
            res.status(404).send('Application not found');
        }
    } catch (error) {
        console.error("Error checking status:", error);
        res.status(500).send("An error occurred while checking application status.");
    }
});


app.listen(3000, function(){
    console.log("server listening at port 3000");
});
