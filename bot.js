const Discord = require('discord.js');
const client = new Discord.Client();

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

var snackbin = new Map();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	heartbeat();
});

client.on('message', msg => {
	
	if (msg.channel.name == "snackbin") { // 🕛
		msg.react("🕛");
		//var temp = ;
		snackbin.set(new snackbin_msg(msg,msg.channel,0,0),0);
		//msg.delete(10000);
	}
	if (msg.content.substring(0, 1) == '&') {
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                msg.reply('Pong!');
				break;
			case 'status':
				msg.channel.send(
					"Uptime: " + client.uptime + "ms\n" +
					"Tracked snackbin: " + snackbin.size + " messages on all servers\n" +
					"heartbeat_duration: " + heartbeat_duration + "ms\n" +
					"sb_lifetime: " + sb_lifetime + "ms\n"
				);
				break;
            // Just add any case commands if you want to..
         }
     }
});

function heartbeat(){
	//console.log(`Heartbeat`); // Debug
	// Start of Function
	
	//console.log(client.channels.find("snackbin").type);
	
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

client.login('TOKEN HERE');
