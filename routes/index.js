var express = require('express');
var router = express.Router();
var fun = require('../public/javascripts/server.js');
var messages = require('../public/javascripts/messages.js');
var dragonStory = require('../public/javascripts/dragon.js');
var results = ["Welcome! Type help for assistance."];
var line = "web-unix:~/workspace $";
var db = require('monk')('localhost/dragonScript')
var dragonScript = db.get('testUser')

router.get('/', function(req, res, next) {
  res.render('index', { input: fun.input(results), line: line});
});

router.post('/', function(req,res,next) {
  var command = req.body.command;
  if ( line === "web-unix:~/dragonScript $" && command.toLowerCase() === "draw sword") {
    res.redirect('/dragon');
  }
  else {
    if (command === "clear") {
      results = ["All clear. Type help for assistance."]
    }
    else if (command === "help") {
      results.push(fun.parser(messages.help))}
    else if (command.indexOf("top -r ") > -1) {
      results.push(fun.request(command))
    }
    else if (command === "dragon") {
      var trueDragon = (dragonStory.dragon);
      line = "web-unix:~/dragonScript $";
      results.push(trueDragon.join("<br>") + "<br>if this is your first time, draw sword to begin<br>" + "or login (name) to begin");
    }
    else if( line === "web-unix:~/dragonScript $" && command.indexOf("login ") > -1) {
      var name = command.replace("login ", "");
      res.redirect('/dragon/' + name.toLowerCase());
    }
    else if( line === "web-unix:~/dragonScript $" && command.toLowerCase() !== "draw sword") {
      results.push(command + ": command not found<br>" + "type dragon to re-enter")
      line = "web-unix:~/workspace $";
    }
    else if (command === "test") {
      results.push(dragonStory.test)
    }
    else {
      results.push(command + ": command not found");};
    res.redirect('/')
  }
})

module.exports = router;
