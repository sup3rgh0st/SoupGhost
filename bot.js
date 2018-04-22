const Discord = require('discord.js');
const client = new Discord.Client();

// npm install image-size --save
var url = require('url');
var http = require('http');
var sizeOf = require('image-size');

const heartbeat_duration = 1000; // milliseconds

// SNACK BIN VARIABLES //
const sb_lifetime = 1800000;

function snackbin_msg(message, channel, timestamp, reactstate) {
    this.message = message;
    this.channel = channel;
    this.timestamp = timestamp;
	this.reactstate = reactstate
}

var clocks = ["🕛","🕒","🕕","🕘"];
var imgurRemarks = [
"Here's a fresh one!",
"Here you go!",
"Hope it's not a dick!",
"Hope it's some titties!",
"Not my finest hour...",
"You can judge me all you want",
"You might want to avert your eyes for this one...",
"deja vu!",
"deja vu!",
"What would your mother think?",
"What would your grandmother think?",
"Hope there's nobody looking behind you!",
"I think you mean ranDUMB, am I right?",
"I swear it's actually random!!",
"I think this breaks Imgur's TOS...",
"This one is super special to me."
];

var snackbin = new Map();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	heartbeat();
});

client.on('message', msg => {
	
	if (msg.channel.name == "snackbin") {
		msg.react("🕛");
		snackbin.set(new snackbin_msg(msg,msg.channel,0,0),0);
	}
	if (msg.content.substring(0, 1) == '&') {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            case 'ping':
                msg.reply('Pong!');
				break;
			case 'help':
				msg.channel.send(
					"SoupGhost Help Menu\n" +
					"made by sup3rgh0st\n" +
					"=== COMMANDS ===\n" +
					"imfeelinglucky: Find a Random Imgur image\n" +
					"ping: pong!\n" +
					"status: Server Status\n" +
					"=== ADVICE ===\n" +
					"Soup is like food you can drink."
				);
				break;
			case 'status':
				msg.channel.send(
					"Uptime: " + client.uptime + "ms\n" +
					"Tracked snackbin: " + snackbin.size + " messages on all servers\n" +
					"heartbeat_duration: " + heartbeat_duration + "ms\n" +
					"sb_lifetime: " + sb_lifetime + "ms\n"
				);
				break;
			case 'imfeelinglucky':
				replyRandomImgurLink(msg, 1);
				break;
         }
     }
});

function heartbeat(){
	//console.log(`Heartbeat`); // Debug
	// Start of Function
	
	snackbin.forEach(function(value, key){
		key.timestamp = key.timestamp + heartbeat_duration;
		
		if(key.timestamp >= sb_lifetime){
			console.log("Deleting Snackbin\n" + key.message.content); 
			key.message.delete();
			snackbin.delete(key);
		} else {
		
			var prev_reactstate = key.reactstate;
			key.reactstate = parseInt(key.timestamp / (sb_lifetime / 4));
			if(key.reactstate > clocks.size - 1){
				key.reactstate = clocks.size - 1
			}
			if(prev_reactstate != key.reactstate){ // Update reaction
				key.message.reactions.forEach(function(e_value, e_key){
					if(e_value.emoji == clocks[prev_reactstate]){
						e_value.remove();
					}
				});
				key.message.react(clocks[key.reactstate]);
			}
		}
	});
	// End of Function
	setTimeout(heartbeat, heartbeat_duration);
}

function replyRandomImgurLink(msg, iter) {
	
	// If we reach this, we're either unlucky, or something is broken. Either way, bail.
	if(iter == 20){
		msg.channel.send("Please try again!!");
	}
	var randURL = generateImgurURL();
	
	var options = url.parse(randURL);
	http.get(options, function (response) {
		var chunks = [];
		response.on('data', function (chunk) {
			chunks.push(chunk);
		}).on('end', function() {
			if(chunks.length !== 0){
				// Found a valid image
				var buffer = Buffer.concat(chunks);
				console.log("Feeling Lucky : " + iter + " tries with URL " + randURL);
				msg.channel.send("Random Image? " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [randURL]});
			} else {
				// Image wasn't valid, recurse
				replyRandomImgurLink(msg, iter + 1)
			}
		});
	});
}

// Generate an Imgur URL
function generateImgurURL() {
	var alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var url = "http://i.imgur.com/";
	for (var i = 0; i < 5; i++) {
		url = url.concat(alpha[Math.floor(Math.random() * alpha.length)]);
	}
	return url.concat('.jpg');
}

client.login('TOKEN HERE');