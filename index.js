var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

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
	client.get("my_new_user", function(error, reply){
		var hashName = "user:" + reply;
		client.set(username, reply);
		client.hmset(hashName, "name", username);
		client.hmset(hashName, "password", password);
		client.incr("my_new_user");
	});
	console.log("hi " + username);
	res.sendFile(__dirname + '/main.html');
});

app.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	console.log(username, password);
	var checkThis = client.exists(username, function(error, exists){
		if(!exists){
			res.sendFile(__dirname + '/login.html');
		} else {
			res.sendFile(__dirname + '/main.html');
		}
	});
	
});

http.listen(8080, function(){
	console.log('listening on *:8080');
});