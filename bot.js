const Discord = require('discord.js');
const client = new Discord.Client();

// npm install image-size --save
var url = require('url');
var http = require('http');
var https = require('https');
var sizeOf = require('image-size');

// GENERAL GLOBAL VARIABLES //
const version = "05032018-2328"
const heartbeat_duration = 1000; // milliseconds
var super_admin = ["242754101593636866"];

// SNACK BIN VARIABLES //
const sb_lifetime = 1800000; // milliseconds
function snackbin_msg(message, channel, timestamp, reactstate) {
    this.message = message;
    this.channel = channel;
    this.timestamp = timestamp;
	this.reactstate = reactstate
}

// IM FEELING LUCKY VARIABLES //
const min_dim = 80; // Minimum Height and width of a valid image
var can_feel_lucky = true
var rate_limit = 0; // We don't want this command to be abused, it's expensive
					// to run, so we limit it to once every 'rate_limit_min' milliseconds.
const rate_limit_min = 1000; // ms
var prev_newest_url = "";

// BULK DELETE VARIABLES //
var bd_are_you_sure = false;
var bd_user_id;
var bd_timestamp;
var bd_expiration = 10000; // ms

// IM FEELING BRAVE VARIABLES //
var can_feel_brave = true;

// LOGGING //
//var fs = require('fs');
//var rawLog = fs.createWriteStream('rawLog.txt');

var clocks = ["ðŸ•›","ðŸ•’","ðŸ••","ðŸ•˜"];
var imgurRemarks = [
"Here's a fresh one!",
"Here you go!",
"Hope it's not a dick!",
"Hope it's some titties!",
"Hope it's some booty!",
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
"I think I've seen this one before.",
"Looks like a repost to me.",
"This is pretty tame compared to some of the other things I've found.",
"It's my OC, you like it?",
"I guess there really is Rule 34 for everything...",
"There are some things you just can't unsee",
"Can you believe someone took the time to upload this?",
"Does this count as a selfie?",
"Yes it is!",
"ðŸ‘…ðŸ’¦ðŸ†ðŸ’¦",
"This one is super special to me."
];

var snackbin = new Map();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	heartbeat();
});

client.on('raw', (rawObj) => {
	//console.log(rawObj);
    //rawLog.write(String(rawObj));
});

client.on('error', function(message) {
    console.log('error recieved', message);
});

client.on('message', msg => {
	
	if (msg.channel.name == "snackbin") {
		msg.react("ðŸ•›");
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
					"ðŸ‘» SoupGhost Help Menu ðŸ‘»\n" +
					"version " + version + "\n" +
					"made by sup3rgh0st\n" +
					"=== COMMANDS ===\n" +
					"imfeelinglucky: Find a Random Imgur image\n" +
					"imfeelingbrave: Find a Random Deviant Art image\n" +
					"ping: pong!\n" +
					"help: this\n" +
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
					"sb_lifetime: " + sb_lifetime + "ms\n" +
					"can_feel_lucky: " + can_feel_lucky + "\n"
				);
				break;
			case 'imfeelinglucky':
				// This command is expensive, so limit it to once every rate_limit_min ms
				if(can_feel_lucky == true) {
					can_feel_lucky = false;
					if(Math.floor(Math.random() * 3) == 0){
						getImgurNewest(msg);
					} else {
						replyRandomImgurLink(msg, 1);
					}
				} else {
					msg.reply("Slow Down!! I'm just one bot you know...");
				}
				break;
			case 'imfeelingbrave':
				if(can_feel_brave == true) {
					can_feel_brave = false;
					getDeviantNewest(msg);
				} else {
					msg.reply("Slow Down!! I'm just one bot you know...");
				}
				break;
			case 'getuserid':
				msg.reply("Your ID is: " + msg.author.id);
				break;
			case 'bulkdelete':
				if(idIsAdmin(msg.author.id) == false){
					msg.reply("Illegal SuperUser Command");
					break;
				}
				if(bd_are_you_sure == false){
					msg.reply("Repeat Command to confirm.");
					bd_user_id = msg.author.id;
					bd_are_you_sure = true;
					bd_timestamp = client.uptime;
				} else {
					if(bd_user_id == msg.author.id) {
						if(bd_timestamp + bd_expiration > client.uptime) {
							msg.reply("Deleting " + args[0] + " messages.");
							msg.channel.bulkDelete(args[0]).then().catch(/*console.error*/);
						} else {
							msg.reply("Your request has timed out. (" + (bd_expiration/1000) + " seconds)");
						}
					}
					bd_are_you_sure = false;
				}
				break;
			case 'cuttingedge':
				var http_content = getImgurNewest(msg);
				break;
         }
     }
});

client.on ('messageDelete', msg => {
	// Check to see if a Snack Bin message was deleted
	snackbin.forEach(function(value, key){
		// If the IDs match, then it's the same message
		if(msg.id == key.message.id){
			// Delete it
			console.log("Deleting Snackbin\n\t" + key.message.content); 
			snackbin.delete(key);
		}
	});
});

function heartbeat(){
	// Start of Function
	
	// SNACK BIN CODE //
	// Loop through all tracked Snack Bin messages
	snackbin.forEach(function(value, key){
		// Increment the message lifetime
		key.timestamp = key.timestamp + heartbeat_duration;
		
		// Check if the message has been alive for the Maximum amount of time
		if(key.timestamp >= sb_lifetime){
			// Delete the Message
			console.log("Deleting Snackbin\n" + key.message.content); 
			try{
				// There may be a Race Condition where heartbeat fires before the messageDelete
				// event fires? Using a Try/Catch just in case...
				key.message.delete();
			} catch(error) {
				console.log(error);
			}
			snackbin.delete(key);
		} else {
			// Keep Track of previous clock state
			var prev_reactstate = key.reactstate;
			// Calculate the current clock state
			key.reactstate = parseInt(key.timestamp / (sb_lifetime / 4));
			// Sanity Check, shouldn't ever actually ever be called
			if(key.reactstate > clocks.size - 1){
				// Something got messed up, patch it
				key.reactstate = clocks.size - 1
			}
			// Check if the clock needs to be updated
			if(prev_reactstate != key.reactstate){
				// Loop through all reactions to find our clock
				key.message.reactions.forEach(function(e_value, e_key){
					// Check if the reaction is the old clock
					if(e_value.emoji == clocks[prev_reactstate]){
						// Remove it
						e_value.remove();
					}
				});
				try{
					// Not sure if there is a race condition with messageDelete again, but lets
					// just be safe here...
					// React with new clock
					key.message.react(clocks[key.reactstate]);
				} catch(error) {
					console.log(error);
				}
			}
		}
	});
	// End of Function
	
	// Call this function again after heartbeat_duration seconds
	setTimeout(heartbeat, heartbeat_duration);
}

// Send a message with a random Imgur Image
function replyRandomImgurLink(msg, iter) {
	
	// If this function recurses 20 times, we're either unlucky, or something is broken.
	// Either way, bail here.
	if(iter == 20){
		msg.channel.send("Please try again!! You're either unlucky or something broke.");
		return;
	}
	// Get a random Imgur URL
	var randURL = generateImgurURL();
	// Parse that URL
	var options = url.parse(randURL);
	// Get the image from Imgur
	http.get(options, function (response) {
		var chunks = [];
		// When we get data...
		response.on('data', function (chunk) {
			// Add the data to the chunks array
			chunks.push(chunk);
		}).on('end', function() { // We got all the data!
			
			if(chunks.length == 0) {
				// Image wasn't valid, recurse
				replyRandomImgurLink(msg, iter + 1)
			}else{
				var buffer = Buffer.concat(chunks);
				var dim = sizeOf(buffer)
				// Check if we found a valid image
				if (dim.height < min_dim || dim.width < min_dim){
					// Image wasn't valid, recurse
					replyRandomImgurLink(msg, iter + 1)
				}else{
					// Found a valid image;
					console.log("Feeling Lucky : " + iter + " tries with URL " + randURL);
					// Send the Image with a quirky and lovable message
					msg.channel.send("Random Image? " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [randURL]});
				}
			}
		});
	});
	can_feel_lucky = true;
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

// Returns TRUE if id is in the admin array
function idIsAdmin(id) {
	var is_super_admin = false;
	super_admin.forEach(function(admin_id){
		if(admin_id == id){
			is_super_admin = true;
		}
	});
	return is_super_admin;
}

function getImgurNewest(msg)
{
	var options = {
		host: 'imgur.com',
		path : '/new/time',
		method : 'GET'
	};
	var data = "";
	// Get the image from Imgur
	https.get(options, function (response) {
		// When we get data...
		response.on('data', function (chunk) {
			// Add the data to the chunks array
			data += chunk;
		}).on('end', function() { // We got all the data!
			//var fp_index = data.indexOf('<div class="cards">');
			//data = data.substring(fp_index+215, fp_index + 223);
			var fp_index = data.indexOf('<img alt="" src="//i.imgur.com/');
			data = data.substring(fp_index + 31, fp_index + 38);
			if(data == prev_newest_url){
				console.log("imgur hasn't gotten a new message, grabbing a random...");
				replyRandomImgurLink(msg, 1);
			} else {
				// We got the ID, now get the image...
				var first_img = "http://i.imgur.com/" + data + ".jpg";
				console.log("Grabbing Imgur Newest at URL: " + first_img);
				msg.channel.send("Here's one from Imgur's Newest! " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [first_img]});
			}
			prev_newest_url = data;
			can_feel_lucky = true;
		});
	});
}

function getDeviantNewest(msg)
{
	var options = {
		host: 'www.deviantart.com',
		path : '/newest',
		method : 'GET',
		headers: {
			'Connection': 'keep-alive',
			'Accept': '*/*',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
        }
	};
	var data = "";
	// Get the image from Imgur
	https.get(options, function (response) {
		// When we get data...
		response.on('data', function (chunk) {
			// Add the data to the chunks array
			data += chunk;
		}).on('end', function() { // We got all the data!
			//console.log(data);
			//var fp_index = data.indexOf('<div class="cards">');
			//data = data.substring(fp_index+215, fp_index + 223);
			var fp_index = data.indexOf('data-super-full-img="');
			data = data.substring(fp_index + 0, fp_index + 200);
			var png_find = data.indexOf('.png');
			var jpg_find = data.indexOf('.jpg');
			var end_index;
			if(png_find != -1 && jpg_find == -1){
				end_index = png_find;
				data = data.substring(21, end_index+4);
				console.log(data);
				msg.channel.send("Here's one from Deviant Art's Newest! " + data);
				//msg.channel.send("Here's one from Deviant Art's Newest! " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [data]});
			} else if (jpg_find != -1) {
				end_index = jpg_find;
				data = data.substring(21, end_index+4);
				console.log(data);
				msg.channel.send("Here's one from Deviant Art's Newest! " + data);
				//msg.channel.send("Here's one from Deviant Art's Newest! " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [data]});
			} else {
				console.log("Failed =( " + png_find + " " + jpg_find);
				console.log(data.substring(0, 200));
				msg.channel.send("Couldn't find an image, Try Again!");
			}
			can_feel_brave = true;
			// We got the ID, now get the image...
			//var first_img = "http://i.imgur.com/" + data + ".jpg";
			//console.log("Grabbing Imgur Newest at URL: " + first_img);
			//msg.channel.send("Here's one from Imgur's Newest! " + imgurRemarks[Math.floor(Math.random() * imgurRemarks.length)], {files: [first_img]});
			

		});
	});
}

client.login('Token Here');

