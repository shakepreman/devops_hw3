var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var http = require('http')
var appProxy = require('http-proxy')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var length
///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
	client.lpush("history",req.url)
	client.ltrim("history",0, 4)
	client.llen("history", function(err, reply){
		console.log(reply)
	});
	next(); // Passing the request to the next handler in the stack.
});

var httpServer = http.createServer(function(req, res)
{
	client.rpoplpush('urlQueue', 'urlQueue', function(err, reply) {
		console.log(reply);
		console.log(req.url)
		var proxyServer = appProxy.createProxyServer({target: reply})
		proxyServer.web(req, res)
	})
})

httpServer.listen(80)

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img);
	  		client.rpush("img_queue", img)
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	{
		res.writeHead(200, {'content-type':'text/html'});
		var imagedata
		client.rpop("img_queue", function(err, reply){
			if(err) console.log(err)
			console.log(reply)
			res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+reply+"'/>");
   			res.end();
		});
	}
})


// HTTP SERVER
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  client.del("urlQueue")
  client.lpush("urlQueue", "http://localhost:"+port)
  console.log('Example app listening at http://%s:%s', host, port)
})

var server2 = app.listen(3001, function () {

  var host = server2.address().address
  var port = server2.address().port
  client.lpush("urlQueue", "http://localhost:"+port)
  console.log('Example app listening at http://%s:%s', host, port)
})

app.get('/', function(req, res) {
  res.send('hello world')
})

app.get('/set', function(req, res) {
  client.set("key", "this message will self-destruct in 10 seconds")
  client.expire("key",10)
  res.send("done")
})

app.get('/get', function(req, res) {
  client.get("key", function(err,value){ res.send(value)})
})

app.get('/recent', function(req, res) {
	client.lrange("history",0,4,function(err, reply){
		res.send(reply);
	});  
})
