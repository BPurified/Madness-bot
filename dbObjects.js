const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: 'database2.sqlite',
});
  
const cards = require("./commands/cards");

const { Op } = require("sequelize");

const Users = sequelize.import("models/Users");
const Characters = sequelize.import("models/Characters");
const Madness = sequelize.import("models/Madness");
const UserCharacter = sequelize.import("models/UserCharacter");
const UserIndice = sequelize.import("models/UserIndice");
const Players = sequelize.import("models/Players");

UserCharacter.belongsTo(Characters, { foreignKey: "characterId" });

Users.prototype.addCharacter = async function(character, server) {
  const userCharacter = await UserCharacter.findOne({
    where: { userId: this.user_id }
  });
  const characterSheet = await Characters.findOne({
    where: { characterId: character },
    attributes: [
      "description",
      "health",
      "mental",
      "strength",
      "agility",
      "observation",
      "knowledge",
      "influence",
      "willpower"
    ]
  });

  if (userCharacter) {
    userCharacter.characterId = character;
    userCharacter.serverId = server;
    userCharacter.description = characterSheet.description;
    userCharacter.health = characterSheet.health;
    userCharacter.mental = characterSheet.mental;
    userCharacter.currentHealth = characterSheet.health;
    userCharacter.currentMental = characterSheet.mental;
    userCharacter.damage = 0;
    userCharacter.madness = 0;
    userCharacter.damageHidden = 0;
    userCharacter.madnessHidden = 0;
    userCharacter.wounded = "Non";
    userCharacter.mad = "Non";
    userCharacter.strength = characterSheet.strength;
    userCharacter.agility = characterSheet.agility;
    userCharacter.observation = characterSheet.observation;
    userCharacter.knowledge = characterSheet.knowledge;
    userCharacter.influence = characterSheet.influence;
    userCharacter.willpower = characterSheet.willpower;
    return userCharacter.save();
  }

  return UserCharacter.create({
    userId: this.user_id,
    characterId: character,
    serverId: server,
    description: characterSheet.description,
    health: characterSheet.health,
    mental: characterSheet.mental,
    currentHealth: characterSheet.health,
    currentMental: characterSheet.mental,
    damage: 0,
    madness: 0,
    damageHidden: 0,
    madnessHidden: 0,
    wounded: "Non",
    mad: "Non",
    strength: characterSheet.strength,
    agility: characterSheet.agility,
    observation: characterSheet.observation,
    knowledge: characterSheet.knowledge,
    influence: characterSheet.influence,
    willpower: characterSheet.willpower
  });
};

Users.prototype.getCharacter = function(id, server) {
  return UserCharacter.findAll({
    where: { [Op.and]: [{ userId: id }, { serverId: server }] },
    attributes: [
      "characterId",
      "description",
      "health",
      "mental",
      "currentHealth",
      "currentMental",
      "damage",
      "madness",
      "damageHidden",
      "madnessHidden",
      "wounded",
      "mad",
      "strength",
      "agility",
      "observation",
      "knowledge",
      "influence",
      "willpower"
    ]
  });
};
Users.prototype.getCharacterStat = function(id, server, stat) {
  return UserCharacter.findOne({
    where: { [Op.and]: [{ userId: id }, { serverId: server }] },
    attributes: [stat],
    raw: true
  });
};
Users.prototype.setCharacterHealth = async function(
  id,
  server,
  stat,
  value,
  hidden,
  message
) {
  const userCharacter = await UserCharacter.findOne({
    where: { [Op.and]: [{ userId: id }, { serverId: server }] }
  });
  var dead = false;

  if (userCharacter) {
    if (stat == "degat") {
      if (hidden == true) {
        userCharacter.damageHidden = userCharacter.damageHidden + value;
      } else {
        userCharacter.damage = userCharacter.damage + value;
      }

      userCharacter.currentHealth = userCharacter.currentHealth - value;
      if (userCharacter.currentHealth <= 0) {
        if (userCharacter.wounded == "Non") {
          userCharacter.wounded = "Oui";
          userCharacter.currentHealth =
          userCharacter.health - userCharacter.damage;
          userCharacter.damageHidden = 0;
          message.channel.send(
            `Vous êtes désormais blessé. Tenez bon, vous allez vous en sortir !`
          );
        } else {
          dead = true;
        }
      }
    }
    if (stat == "horreur") {
      if (hidden == true) {
        userCharacter.madnessHidden = userCharacter.madnessHidden + value;
      } else {
        userCharacter.madness = userCharacter.madness + value;
      }

      userCharacter.currentMental = userCharacter.currentMental - value;
      if (userCharacter.currentMental <= 0) {
        if (userCharacter.mad == "Non") {
          cards(message, "madness", server);
          userCharacter.mad = "Oui";
          userCharacter.currentMental =
          userCharacter.mental - userCharacter.madness;
          userCharacter.madnessHidden = 0;
          message.channel.send(
            `Vous êtes désormais fou. Et si les règles du jeu changeaient brusquement ?`
          );
        } else {
          dead = true;
        }
      }
    }
    if (dead == true) {
      message.channel.send(`Vous êtes mort. La partie s'achève dans un tour`);
    }
    return await userCharacter.save();
  }
};
Users.prototype.setCharacterRegen = async function(id, server, stat, value, hidden) {
  const userCharacter = await UserCharacter.findOne({
    where: { [Op.and]: [{ userId: id }, { serverId: server }] }
  });

  if (userCharacter) {
    if (stat == "degat") {
      if (hidden == true) {
        userCharacter.damageHidden = userCharacter.damageHidden - value;
        if (userCharacter.damageHidden < 0) {
          userCharacter.damageHidden = 0;
        }
      } else {
        userCharacter.damage = userCharacter.damage - value;
        if (userCharacter.damage < 0) {
          userCharacter.damage = 0;
        }
      }

      userCharacter.currentHealth = userCharacter.currentHealth + value;
      if (userCharacter.currentHealth > userCharacter.health) {
        userCharacter.currentHealth = userCharacter.health;
      }
    }
    if (stat == "horreur") {
      if (hidden == true) {
        userCharacter.madnessHidden = userCharacter.madnessHidden - value;
        if (userCharacter.madnessHidden < 0) {
          userCharacter.madnessHidden = 0;
        }
      } else {
        userCharacter.madness = userCharacter.madness - value;
        if (userCharacter.madness < 0) {
          userCharacter.madness = 0;
        }
      }

      userCharacter.currentMental = userCharacter.currentMental + value;
      if (userCharacter.currentMental > userCharacter.mental) {
        userCharacter.currentMental = userCharacter.mental;
      }
    }
    return await userCharacter.save();
  }
};
Users.prototype.setCharacterIndice = async function(id, server, value, type, message) {
  const userIndice = await UserIndice.findOne({
    where: { [Op.and]: [{ userId: id }, { serverId: server }] }
  });

  if (!userIndice) {
    return UserIndice.create({
      userId: id,
      indices: value,
      serverId: server
    });
  }

  if (userIndice) {
    if (type == "add") {
      userIndice.indices = userIndice.indices + value;
      
      if(userIndice.indices == 0) {
        return ;
      }
      
      message.channel.send(
        `Vous avez désormais ` + userIndice.indices + ` indice(s).`
      );
    }
    if (type == "remove") {
      if (userIndice.indices == 0) {
        return message.channel.send(`Vous n'avez aucun indice à dépenser.`);
      }
      if (value > userIndice.indices) {
        return message.channel.send(
          `Vous n'avez pas assez d'indices. Il vous reste ` +
            userIndice.indices +
            ` indice(s).`
        );
      }

      userIndice.indices = userIndice.indices - value;

      if (userIndice.indices < 0) {
        userIndice.indices = 0;
      }
      message.channel.send(
        `Vous avez dépensé ` +
          value +
          ` indice(s), il vous en reste ` +
          userIndice.indices +
          `.`
      );
    }
    return await userIndice.save();
  }
};

module.exports = { Users, Characters, Madness, UserCharacter, UserIndice, Players };
