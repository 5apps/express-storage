/*
 * express-storage
 * https://github.com/5apps/express-storage
 *
 * Copyright (c) 2012 Michiel De Jong, Sebastian Kippe, Garret Alfert
 * Licensed under the MIT license.
 */

exports.storage = (function() {
  var config = require('../config').config;
  var redis = require('redis');
  var redisClient;

  function initRedis(callback) {
    redisClient = redis.createClient(config.redisPort, config.redisHost);
    redisClient.on("error", function (err) {
      console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
    });
    if (config.redisPwd == "") {
      callback();
    }
    else {
      redisClient.auth(config.redisPwd, function() {
        callback();
      });
    }
  }

  function checkToken(userId, token, category, method, callback) {
    if (category == 'public' && method == 'GET') {
      console.log('public GET access ok');
      callback(true);
    } else {
      console.log('looking for "'+category+'" in key "token:'+userId+':'+token+'"');

      redisClient.get('token:'+userId+':'+token, function(err, categoriesStr) {
        var categories;
        try {
          categories = categoriesStr.split(',');
        } catch(e) {
          console.log('5-0');
          callback(false);
          return;
        }

        console.log('For user "'+userId+'", token "'+token+'", wanting "'+category+'", found categories: '+JSON.stringify(categories));

        var i;
        for(i in categories) {
          console.log('considering '+categories[i]);
          if(categories[i] == category) {
            callback(true);
            return;
          }
        }

        console.log('sorry');
        callback(false);
      });
    }
  }

  function doReq(reqObj, callback) {
    initRedis(function(){
      checkToken(reqObj.userId, reqObj.token, reqObj.category, reqObj.method, function(result) {
        if (result) {
          if (reqObj.method=='GET') {
            console.log('it\'s a GET');
            redisClient.get('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, function(err, value) {
              console.log('redis says:');console.log(err);console.log(value);
              redisClient.quit();
              callback(200, value);
            });
          } else if (reqObj.method=='PUT') {
            console.log('it\'s a PUT');
            redisClient.set('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, reqObj.value, function(err, data) {
              console.log('redis says:');console.log(err);console.log(data);
              redisClient.quit();
              callback(200, data);
            });
          } else if (reqObj.method=='DELETE') {
            console.log('it\'s a DELETE');
            redisClient.del('value:'+reqObj.userId+':'+reqObj.category+':'+reqObj.key, function(err, data) {
              console.log('redis says:');console.log(err);console.log(data);
              redisClient.quit();
              callback(200);
            });
          }
        } else {
          redisClient.quit();
          callback(403);
        }
      });
    });
  }

  function addToken(userId, token, categories, callback) {
    initRedis(function(){
      console.log('created token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
      redisClient.set('token:'+userId+':'+token, JSON.stringify(categories), function(err, data) {
        redisClient.quit();
        callback();
      });
    });
  }

  function removeToken(userId, token, callback) {
    initRedis(function(){
      console.log('removed token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
      redisClient.del('token:'+userId+':'+token, function(err, data) {
        redisClient.quit();
        callback();
      });
    });
  }

  function addUser(userId, password, callback) {
    console.log('creating user '+userId+' with password '+password);
    initRedis(function(){
      redisClient.set('user:'+userId, password, function(err, data) {
        redisClient.quit();
        callback();
      });
    });
  }

  function createToken(userId, password, token, categories, callback) {
    console.log(userId+' - '+password+' - '+token+' - '+JSON.stringify(categories));
    initRedis(function(){
      redisClient.get('user:'+userId, function(err, data) {
        if(data == password) {
          console.log('creating token "'+token+'" for user "'+userId+'", categories: '+JSON.stringify(categories));
          redisClient.set('token:'+userId+':'+token, categories, function(err, data) {
            redisClient.quit();
            callback(true);
          });
        } else {
          redisClient.quit();
          callback(false);
        }
      });
    });
  }

  function generateToken() {
    var tokenLength = 32;
    var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var token = "";

    for(var i=0; i < tokenLength; i++)
      token += charSet.charAt(Math.floor(Math.random() * charSet.length));

    return token;
  }

  return {
    addToken: addToken,
    removeToken: removeToken,
    addUser: addUser,
    createToken: createToken,
    doReq: doReq,
    generateToken: generateToken
  };
})();
