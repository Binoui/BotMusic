'use strict';

var DiscordClient = require('discord.io');
var YoutubeSong = require('./youtubesong.js');
var auth = require('../auth.json');
var http = require('http');
var fs = require('fs');
var URL = require('url');

var audioStream = null;
var currentSong = null;
var queue = Array();

var bot = new DiscordClient({
  autorun: true,
  email: auth.email,
  password: auth.password
});


bot.on('ready', function(rawEvent) {
  console.log(bot.username + " connected (" + bot.id + ")");
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
  var cmd = message.toLowerCase().split(" ")[0];

  switch (cmd) {
    case "!come":
    case "!came": {
      joinChannel(user, userID, channelID);
    } break;

    case "!addsong": {
      var url = message.toLowerCase().split(" ")[1];
      queue.push(new YoutubeSong(url, user, userID));
    } break;

    case "!skip": {
      //TODO: Ajouter un skip si plus de 50% des personnes veulent changer
    } break;

    case "!reset": {
      reset();
    } break;

    case "!stop": {
      stop();
    } break;
  }
});

//reset the queue
function reset() {
  queue.length = 0
}

//Stop the audio
function stop() {
  stream.stopAudioFile();
}

//Return the voice channel where the user is
function findVoiceChannelIdWhereUserIs(userID) {
  var voiceChannel = null;
  for(var s in bot.servers) {
    for(var uID in bot.servers[s].members) {
      if(uID == userID) {
        voiceChannel = bot.servers[s].members[uID].voice_channel_id;
      }
    }
  }

  return voiceChannel;
}

function joinChannel(user, userID, channelID) {
  var voiceChannel = findVoiceChannelIdWhereUserIs(userID);

  if(voiceChannel != null) {
    bot.joinVoiceChannel(voiceChannel, function () {
      bot.getAudioContext({channel: voiceChannel, stereo: true}, function(stream) {
          audioStream = stream;
          stream.playAudioFile('test.mp3'); //To start playing an audio file, will stop when it's done.

          stream.once('fileEnd', function() {
            console.log('Audio file ended');
          });
      });
    });

    sendMessage('@' + user + " YES SIR, I'M COMING!", channelID);
  } else {
    sendMessage('@' + user + " You aren't in a voice channel!", channelID);
  }
}

function sendMessage(message, channelID) {
  bot.sendMessage({
    to: channelID,
    message: bot.fixMessage(message)
  });
}

function debug() {
  console.log("currentSong :");
  console.log(currentSong);

  console.log("queue :");
  console.log(queue);
}

setInterval(debug, 2000);
