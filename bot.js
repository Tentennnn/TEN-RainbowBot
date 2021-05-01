var discord = require('discord.js');
var fs = require('fs');
var randomColour = require('randomcolor'); 
var Config = require('./config.json');

class Bot {
    constructor(){
        this.servers = require('./servers.json');
        this.discordClient = new discord.Client({sync: true});
        
        this.discordClient.on("ready", () => {
        this.discordClient.user.setActivity('tenmurai.xyz | TEN Rainbow Role', { type: 'PLAYING' })    
        this.initialize();});
        
        this.discordClient.on("message", (msg) => {this.processMessage(msg)});
        
        this.discordClient.login(Config.discord_token);
    }
    
    initialize() {
        this.log("Connected to discord.");
        
        setInterval(() => {
            this.randomizeRoleColors();
        }, Config.randomize_delay*1000);
    }
    
    processMessage(msg) {
        if(msg.content.startsWith(`${Config.prefix}addrole`)) {
            for(var role of msg.mentions.roles.array()) {
                msg.reply("☑️ Added `" + role.name + "` to list of rainbow roles.");
                
                this.addRainbowRole(msg.guild.id, role.id);
            }
        }
    }
    
    randomizeRoleColors() {
        for(var server in this.servers) {
            var liveGuild = this.discordClient.guilds.cache.get(server);
            
            if (!liveGuild) {
                this.error("Guild with ID " + server+ " no longer exists or the bot has been removed from it.");
                continue;
            }
            
            for(var role of this.servers[server]) {
                var liveRole = liveGuild.roles.cache.get(role);
                
                liveRole.setColor(randomColour(), "TENAPI HAS CHANG ROLE COLOR!");
            }
        }
    }
    
    addRainbowRole(guild, role) {
        if(this.servers[guild] == undefined) {
            this.servers[guild] = [];
        }
        
        for(var existingRole of this.servers[guild]) {
            if(existingRole == role) {
                return "That role has already been added.";
            }
        }
        
        this.servers[guild].push(role);
        this.saveServers();
    } 
    
    saveServers() {
        fs.writeFileSync("./servers.json", JSON.stringify(this.servers), "utf8");
        this.log("Saved servers file.");
    }
    
    log(message) {
        console.log("\x1b[32mINFO\x1b[37m - \x1b[0m" + message);
    }
    
    error(message) {
        console.log("\x1b[31mERROR\x1b[37m - \x1b[0m" + message);
    }
}

var instance = new Bot();

