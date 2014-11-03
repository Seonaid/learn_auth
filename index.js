var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); //create an http server with socket.io capacities
var bodyParser = require('body-parser'); // this used to be part of express; parses the request body in post request objects

var redis = require ("redis");
var client = redis.createClient();
var clear = client.setnx("my_new_user", 1000);

app.use(bodyParser.urlencoded({extended: false }));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.use('/', express.static(__dirname + '/public'));

app.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	client.exists(username, function(error, exists){
		if(!exists){
			client.get("my_new_user", function(error, reply){
				var hashName = "user:" + reply;
				client.set(username, reply); //now we can look up by username
				client.hmset(hashName, "name", username); // and we can then look up username:Id
				client.hmset(hashName, "password", password);
				client.incr("my_new_user");
			});
			console.log("hi " + username);
			res.sendFile(__dirname + '/main.html');
		} else {
			res.send("User already exists.");

		} // end of if structure
	}); // end of client.exists

});

app.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	console.log(username, password);
	client.exists(username, function(error, exists){
		if(!exists){
			res.sendFile(__dirname + '/login.html'); //if the user is not registered
		} else {
			client.get(username, function(error, reply){
				hashName = "user:" + reply;
				console.log("Looking in " + hashName);
				client.hget(hashName, "password", function(error, reply){
					console.log("password is " + password);
					console.log("returned is " + reply);
					if(reply === password){
						res.sendFile(__dirname + '/main.html'); // success!
					} else {
						res.sendFile(__dirname + '/login.html'); // if the password is wrong
					}
				});
			});

			
		}
	});

});

http.listen(8080, function(){
	console.log('listening on *:8080');
});