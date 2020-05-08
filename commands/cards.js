module.exports = async function(message, args, server_id) {
  const Discord = require("discord.js");
  const client = new Discord.Client();
  const { Madness, Players } = require("../dbObjects");
  var list_args = args.split(" ");
  const { Op } = require("sequelize");
  const Sequelize = require("sequelize");

  const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: 'database5.sqlite',
  });
  
  if (!list_args[0]) {
    return message.channel.send("Veuillez préciser la nature de la carte que vous souhaitez tirer.");
  }
  else if (list_args[0] === "madness" || list_args[0] === "folie") {
    const salon = await Players.findOne({
      attributes: ["players"],
      raw: true,
      where: { serverID: server_id, players: { [Op.not]: 0 } } 
    }).catch(
      function(err) {
        // print the error details
        console.log(err);
      }
    );
    var players_min = 0;
    if (salon) {
      for (let [key, value] of Object.entries(salon)) {
        players_min = value;
      }
    } else {
      return message.channel.send("La partie n'a pas encore commencé");
    }
    
    const madness = await Madness.findAll({ 
      order: [sequelize.fn('RANDOM')], 
      limit: 1, 
      where: { min_players: players_min }  
    })
    .catch(function(err) {
      // print the error details
      console.log(err);
    });

  	message.author.send({embed: {
	  	color: 3447003,
	  	fields: [
		  	{
		  		name: "Votre folie",
		  		value: madness.map(
                t =>
                  `**${t.name}**\n\n${t.description}\n\n${t.effect}`
              )
              .join(", ")
		  	}
	  	]
	  }
  	})
  	.then(message => console.log('Carte folie tirée'))
    .catch(console.error);
    return message.channel.send("Carte tirée. Vérifiez vos messages privés.");
  } else {
    return message.channel.send("Vous ne pouvez pas tirer ce type de carte.");
  }
};
