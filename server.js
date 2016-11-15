var express = require('express');
var app = express(); // create our app w/ express
var bodyParser = require('body-parser');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

const spawn = require('child_process').spawn;

var R = require("r-script");

//set the static directory to /public
var uploadsDir = __dirname + '/uploads';
//var uploadsDir = 'D:/uploads';

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
	'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
}));

app.get('/uploaded', function(req, res) {

	fs.readdir(path.join(uploadsDir + '/'), (err, files) => {
		if (err)
			res.send(err)

		res.json(files);
	});
});

app.post('/deleteFile', function(req, res) {
	if (!req.body.file) {
		res.json('Invalid File Name');
	}

	fs.unlink(path.join((uploadsDir + '/' + req.body.file)), function(err) {
		if (err) {
			res.send(err);
		} else {
			res.json(1);
		}
	});
});

app.post('/upload', function(req, res) {

	// create an incoming form object
	var form = new formidable.IncomingForm();

	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = true;

	// store all uploads in the /uploads directory
	form.uploadDir = path.join(uploadsDir);

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

app.get('/run_r', function(req, res) {

	var retval = "";

	const bat = spawn('Rscript.exe', ['rstest.R'], {
		cwd: __dirname + '/r-in/',
		env: process.env,
		//stdio: [process.stdin, 'pipe', 'pipe']
	});

	bat.stdin.setEncoding('utf-8');

	fs.readFile(__dirname + '/r-in/attitude.json', function(err, data){
		bat.stdin.write(data);
		bat.stdin.end();
	});
	
	

	bat.stdout.on('data', (data) => {
		console.log(data.toString());
		retval += data.toString();
	});

	bat.stderr.on('data', (data) => {
		console.log('std err');
	});

	bat.on('exit', (code) => {
		console.log('Child exited with code ' + code);
		res.json(retval);
	});



	/*var attitude = JSON.parse(require("fs").readFileSync("r-in/attitude.json", "utf8"));

  var status = 0;
  //console.log(attitude);

R(__dirname + '/r-in/ex-async.R')
  .data({df: attitude, nGroups: 3, fxn: "mean" })
  .call(function(err, d) {
    if(status) return;
    if (err) {
      res.send(err);
      status = 1;
    }
    else
    {
      res.json(d);
    }
  });*/
});



app.get('/ngtest', function(req, res) {
	res.sendfile('./public/ngtest.html');
});
app.get('/index', function(req, res) {
	res.sendfile('./public/index.html');
});

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");