var express = require('express');
var router = express.Router();
var fun = require('../public/javascripts/server.js');
var messages = require('../public/javascripts/messages.js');
var dragonStory = require('../public/javascripts/dragon.js');
var line = "web-unix:~/dragonScript $";
var db = require('monk')('localhost/dragonScript')
var dragonScript = db.get('testUser')
var results = [];
var logPlace = 0;
var dead = 3;
var lastPage = 0;

router.get('/dragon', function(req,res,next){
  res.render('dragon', {input: fun.input(results), log: fun.input(dragonStory.intro[logPlace]), line: line})
});

router.get('/dragon/:name', function(req, res, next) {
  dragonScript.findOne({name: req.params.name.toLowerCase()}, function (err, data) {
    res.render('dragon/show', {input: fun.input(results), log: fun.input(dragonStory.quest[data["log"]]), line: line})
  });
});

router.post('/dragon', function(req,res,next) {
  var command = req.body.command;
  if ( command.toLowerCase() === "quit") {
    results = [];
    logPlace = 0;
    dead = 1;
    res.redirect('/');
  }
  else if(dead === 0) {
    dead = 1;
    results = [];
    res.redirect('/');
  }
  else if (logPlace === 1) {
    dragonScript.findOne({"name": command.toLowerCase()}, function (err, data) {
    if (data === null) {
      logPlace ++;
      dragonScript.insert({"name": command.toLowerCase(), log: 0});
      res.redirect('/dragon/' + command.toLowerCase());
    }
    else {
      results.push("that name already exists<br> you can login or type a different name");
      res.redirect('/dragon');
    }
    });
  }
  else {
    if (command === "clear") {
      results = ["<br>All clear. Type help for assistance."]
    }
    else if (command === "help") {
      results.push(fun.parser(dragonStory.help))}
    else if(command === "a" && logPlace === 0) {
      results.push("Foolish attempt. You're dead and eventually dragon poop");
      line = "Press enter to exit";
      dead = 0;
    }
    else if(command === "b" && logPlace === 0) {
      results.push("Nice try but you can't outrun a dragon. Everybody knows that, except for you and now you're dead.");
      line = "Press enter to exit";
      dead = 0;
    }
    else if(command === "c" && logPlace === 0) {
      logPlace ++;
      res.redirect('/dragon')
    }
    else if(command.indexOf("login ") > -1) {
      var name = command.replace("login ", "");
      res.redirect('/dragon/' + name.toLowerCase());
    }
    else {
      results.push(command + ": command not found");};
    res.redirect('/dragon')
  }
})

router.post('/dragon/:name', function(req,res,next) {
  var command = req.body.command;
  if ( command.toLowerCase() === "quit") {
    results = [];
    dead = 1;
    res.redirect('/');
  }
  else if(dead === 0) {
    dead = 3;
    results = [];
    res.redirect('/');
  }
  else if(lastPage === 1) {
    dead = 3;
    lastPage --;
    results = [];
    res.redirect('/');
  }
  else {
    if (command === "clear") {
      results = ["<br>All clear. Type help for assistance."]
    }
    else if(command === "restart") {
      dragonScript.update({"name" : req.params.name}, {$set: {"log" : 0}})
      results = ["game reset"];
      res.redirect('/dragon/' + req.params.name);
    }
    else if (command === "go back") {
      dragonScript.findOne({name: req.params.name}, function(err, data) {
        dragonScript.update({name: req.params.name}, {$set: {log: (data.log > 0 ? data.log - 1 : 0)}});
        results = ["you went back in time"];
      });
    }
    else if (command === "help") {
      results.push(fun.parser(dragonStory.help))
    }
    else if(command.indexOf("login ") > -1) {
      var name = command.replace("login ", "");
      res.redirect('/dragon/' + name.toLowerCase());
    }
    else {
      dragonScript.findOne({name: req.params.name}, function(err, data){
        if (data.log === 0 && command === "0") {
          dragonScript.update({name: req.params.name}, {$set: {log: 1}});
          results = [];
          dead = 3;
        }
        else if (data.log === 1 && command === "['fizz']") {
          dragonScript.update({name: req.params.name}, {$set: {log: 2}});
          results = [];
          dead = 3;
        }
        else if (data.log === 2 && command === "undefined") {
          dragonScript.update({name: req.params.name}, {$set: {log: 3}});
          lastPage++;
          results = [];
          dead = 3;
        }
        else if (data.log === 3) {
          results.push("That's it, you beat the game. Enter restart or go back or whatever");
        }
        else if (dead === 1) {
          results.push("The dragon lost his patience and swallowed you and along with your computer.<br> Login to try again.");
          dead--;
        }
        else {
          results.push(dragonStory.quotes[Math.floor(Math.random()*dragonStory.quotes.length)]);
          dead--;
        }
      });
    };
    res.redirect('/dragon/' + req.params.name)
  }
})

module.exports = router;
