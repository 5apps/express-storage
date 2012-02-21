// Module dependencies

var express = require('express');
var util = require('util');
var _ = require('./lib/vendor/underscore.js')._;
var config = require('./config.js').config;
var webfinger = require('./lib/webfinger.js').webfinger;
var storage = require('./lib/express-storage.js').storage;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
	app.set('view options', {layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
	app.use('/', express.errorHandler({ dump: true, stack: true }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express Storage'
  });
});

app.get('/.well-known', function(req, res){
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/xrd+xml');
  res.send(webfinger.genHostMeta(config.origin));
});

app.get(/^\/webfinger\/acct:(?:(.+))/, function(req, res){
  var userId = req.params[0];
  config.api = 'simple';
  config.authUrl = config.origin+'/_oauth/'+userId;
  config.template = config.origin+'/'+userId+'/{category}/';

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/xrd+xml');
  res.send(webfinger.genWebfinger(config.api, config.authUrl, config.template));
});

app.get('/_oauth/:user', function(req, res){
  var userId = req.params.user;

  res.render('oauth', {
    userId: userId,
    redirectUri: req.param('redirect_uri'),
    scope: req.param('scope', 'public')
  });
});

app.post(/^\/_oauth\/(?:(.+))/, function(req, res){
    var token = "yo-ho"; //TODO generate proper token

    storage.createToken(req.param('userId'), req.param('password'), token, req.param('categories'), function(result) {
      if(result) {
        res.redirect(redirectUri+'#access_token='+token);
      } else {
        res.send("No, bro.", 401);
      }
    });
});

app.options('*', function(req, res){
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');
  res.end();
});

app.all('/:user/:category/:key', function(req, res){
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');

  try {
    auth_header = req.header('authorization', 'Bearer ');

    reqObj = {
      method: req.method,
      token: auth_header.substring('Bearer '.length),
      userId: req.params.user,
      category: req.params.category,
      key: req.params.key,
      value: req.body
    };
    console.log(reqObj);

    doReq(reqObj, function(status_code, data) {
      res.send(data, status_code);
    });
  }
  catch (e) {
    res.send(e, 500);
    console.log(e);
  }
});

if (!module.parent) {
  app.listen(4000);
  console.log("Express server listening on port %d", app.address().port);

  storage.addUser('jimmy@surf.unhosted.org', '12345678', function() {
    console.log('created user jimmy@surf.unhosted.org with password 12345678');
  });
}
