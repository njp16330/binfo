var express = require('express');
var app = express(); // create our app w/ express
var bodyParser = require('body-parser'); 
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

//set the static directory to /public
app.use(express.static(__dirname + '/public')); 

app.use(bodyParser.urlencoded({
	'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
}));

app.get('/uploaded', function(req, res) {

	fs.readdir(path.join(__dirname, '/uploads/'), (err, files) => {
		if (err)
			res.send(err)

		res.json(files);
	});
});

app.post('/deleteFile', function(req, res){
	if(!req.body.file){
		res.json('Invalid File Name');
	}

	fs.unlink(path.join(__dirname, ('/uploads/' + req.body.file)), function(err){
		if(err){
			res.send(err);
		}

		else{
			res.json(1);
		}
	});
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.get('/ngtest', function(req, res) {
	res.sendfile('./public/ngtest.html'); // load the single view file (angular will handle the page changes on the front-end)
});
app.get('/index', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");