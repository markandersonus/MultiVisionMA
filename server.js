var express = require('express'),
  stylus = require('stylus'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser());
app.use(stylus.middleware(
  {
    src: __dirname + '/public',
    compile: compile
  }
));
// Any requests coming into public will be served up as static files
app.use(express.static(__dirname + '/public'));

if (env === 'development') {
    mongoose.connect('mongodb://localhost/multivision');
} else{
    mongoose.connect('mongodb://markandersonus:multivision@ds053597.mongolab.com:53597/multivision');
}



var db = mongoose.connection;
// Listen for errors and log
db.on('error', console.error.bind(console, 'connection error...'));
// Listen for open ONCE and log
db.once('open', function callback() {
  console.log('multivision db opened');
});

// Create schema for collection of messages
var messageSchema = mongoose.Schema({message: String});
// Create model based on schema
var Message = mongoose.model('Message', messageSchema);
// Create variable to hold date from DB
var mongoMessage;
// Find first doc in collection (as no param passed to find(). Callback sets variable to error or message doc
Message.findOne().exec(function(err, messageDoc) {
  mongoMessage = messageDoc.message;
});

// need to add message to local collection using shell commands
/*
    mongo
    use multivision
    db.messages.insert({message: 'Hello Mongo'})     // will create the db and collection
    show collections
 */

// need to add message to MongoLab collection using shell commands
/*
 mongo ds053597.mongolab.com:53597/multivision -u markandersonus -p multivision
 use multivision
 db.messages.insert({message: 'Hello Mongo'})     // will create the db and collection
 show collections
 */

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
  res.render('index', {
    mongoMessage: mongoMessage
  });
});

var port = process.env.PORT || 3030;
app.listen(port);
console.log('Listening on port ' + port + '...');