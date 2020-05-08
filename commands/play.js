module.exports = async (message, server_id, type) => {
  const {
    UserCharacter,
    Players
  } = require("../dbObjects");
  const { Op } = require("sequelize");
  var number = 0;
  
  const salon = await Players.findOne({ where: { serverID: server_id } }).catch(
    function(err) {
      // print the error details
      console.log(err);
    }
  );                                                    
  const players = await UserCharacter.findAll({
      where: { serverID: server_id, characterId: { [Op.not]: 0 } } 
      })
  if (players.length) {
    for (let [key, value] of Object.entries(players)) {
      number++;
    }
  }

  if (number == 0) {
    return message.channel.send("Personne ne semble être prêt à jouer. Veuillez sélectionner vos personnages.");
  }

  if (salon) {
    salon.players = number;
    console.log("Update salon");
    console.log(salon.serverID);
    console.log(salon.players);
    salon.save();
    return message.channel.send("Il est temps pour la partie de commencer.");
  } else {
    const newSalon = await Players.create({ serverID: server_id, players: number });
    console.log("New salon");
    console.log(newSalon.serverID);
    console.log(newSalon.players);
    return message.channel.send("Il est temps pour la partie de commencer.");
  }
  
}