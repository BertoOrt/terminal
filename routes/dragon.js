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
var dead = 1;
var tempName = ""

router.get('/dragon', function(req,res,next){
  res.render('dragon', {input: fun.input(results), log: fun.input(dragonStory.quest[Math.floor(logPlace)]), line: line})
});

router.get('/dragon/:name', function(req, res, next) {
  dragonScript.findOne({name: req.params.name}, function (err, data) {
  res.render('dragon/show', {input: fun.input(results), log: fun.input(dragonStory.quest[data["log"]]), line: line})
  });
});

router.post('/dragon', function(req,res,next) {
  var command = req.body.command;
  if ( command.toLowerCase() === "quit") {
    results = [];
    res.redirect('/');
  }
  else if(dead === 0) {
    dead = 1;
    results = [];
    res.redirect('/');
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
    else if (logPlace === 1) {
      dragonScript.insert({"name": command.toLowerCase(), log: 2});
      res.redirect('/dragon/' + command);
      logPlace ++;
    }
    else if(command.indexOf("login ") > -1) {
      var name = command.replace("login ", "");
      res.redirect('/dragon/' + name.toLowerCase());
    }
    // else if (logPlace === 1) {
    //   dragonScript.findOne({"name": command}, function (err, data) {
    //   if (data.name === command) {
    //     results.push("that name already exists<br> you can login or type a different name");
    //   }
    //   else {
    //     dragonScript.insert({"name": command});
    //     res.redirect('/dragon');
    //     logPlace ++;
    //   }
    //   });
    // }
    else {
      results.push(command + ": command not found");};
    res.redirect('/dragon')
  }
})

router.post('/dragon/:name', function(req,res,next) {
  var command = req.body.command;
  if ( command.toLowerCase() === "quit") {
    results = [];
    res.redirect('/');
  }
  else if(dead === 0) {
    dead = 1;
    results = [];
    res.redirect('/');
  }
  else {
    if (command === "clear") {
      results = ["<br>All clear. Type help for assistance."]
    }
    else if(command === "restart") {
      dragonScript.update({"name" : req.params.name}, {$set: {"log" : 2}})
      res.redirect('/dragon/' + req.params.name)
    }
    else if (command === "help") {
      results.push(fun.parser(dragonStory.help))
    }
    else if(command.indexOf("login ") > -1) {
      var name = command.replace("login ", "");
      res.redirect('/dragon/' + name.toLowerCase());
    }
    // else if (logPlace === 2) {
    //   dragonScript.findOne({"name": command}, function (err, data) {
    //   });
    // }
    else {
      results.push(command + ": command not found");};
    res.redirect('/dragon/' + req.params.name)
  }
})

module.exports = router;
