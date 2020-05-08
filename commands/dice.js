module.exports = async function(message, server_id) {

	const Discord = require("discord.js")
	const client = new Discord.Client()
	const { Users, Characters, UserCharacter } = require('../dbObjects');
	const { Op } = require('sequelize');
	const sheets = new Discord.Collection();

	var dice = message.content.substr("!roll ".length);
	var dice_args = dice.split(' ');
	var sides = ["Succès", "Succès", "Succès", "Loupe", "Loupe", "Echec", "Echec", "Echec"];
	let response = "";
	let numbers = "";
	let arrayMax = 0;
	let stat = 0;

	if (dice.length == 0) {
		numbers = "Résultat pour 1 dé";
		response = "- " + sides[Math.floor(Math.random()*sides.length)];
	}
	else {
		var n = 0;
		var array = []
		var character_stats = 0;
		let user = await Users.findOne({ where: { user_id: message.author.id } });
    if (!user) {
      user = await Users.create({ user_id: message.author.id, character: 0 });
    }
		arrayMax = 3;

		if(isNaN(dice_args[0])){
			if(dice_args[0] === "force" || dice_args[0] === "f") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "strength");
				dice = "force";
			}
			else if(dice_args[0] === "agilité" || dice_args[0] === "a") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "agility");
				dice = "agilité";
			}
			else if(dice_args[0] === "observation" || dice_args[0] === "o") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "observation");
				dice = "observation";
			}
			else if(dice_args[0] === "savoir" || dice_args[0] === "s") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "knowledge");
				dice = "savoir";
			}
			else if(dice_args[0] === "influence" || dice_args[0] === "i") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "influence");
				dice = "influence";
			}
			else if(dice_args[0] === "volonté" || dice_args[0] === "v") {
				character_stats = await user.getCharacterStat(message.author.id, server_id, "willpower");
				dice = "volonté";
			}
			else {
				return message.channel.send(`Le lancer de dés n'est pas valide.`);
			}

			if (!character_stats) {
				arrayMax = 3;
			} else {
				for (let [key, value] of Object.entries(character_stats)) {
				  stat = value;
				}
				arrayMax = parseInt(stat);
			}
		} 
		else {
			arrayMax = parseInt(dice_args[0]);
		}

		if(dice_args[1]) {
			if(isNaN(dice_args[1])){
				return message.channel.send(`Le lancer de dés n'est pas valide.`);
			}
			else {
				arrayMax += parseInt(dice_args[1]);
			}
		}

		while(n < arrayMax) {
			if(n != 0) {
				response = response.concat("\n");
			}
			response = response.concat("- " + sides[Math.floor(Math.random()*sides.length)]);
			n++;
		}
		numbers = "Résultat pour " + arrayMax + " dés ";

		if(isNaN(dice_args[0])){
			numbers += dice;
		}
	}

  	return message.channel.send({embed: {
	  	color: 3447003,
	  	fields: [
		  	{
		  		name: numbers,
		  		value: response
		  	}
	  	]
	  }
  	})
  	.then(message => console.log('Dés lancés'))
    .catch(console.error);
}