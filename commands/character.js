module.exports = async function(type, message, args, server_id, channel_id) {
  const Discord = require("discord.js");
  const client = new Discord.Client();
  const {
    Users,
    Characters,
    UserCharacter,
    UserIndice
  } = require("../dbObjects");
  const { Op } = require("sequelize");
  const sheets = new Discord.Collection();

  Reflect.defineProperty(sheets, "setCharacter", {
    value: async function setCharacter(id, value, server) {
      const user = await Users.findOne({ where: { user_id: id } }).catch(
        function(err) {
          // print the error details
          console.log(err);
        }
      );
      //const user = sheets.get(id);
      if (user) {
        user.character = value;
        await user.addCharacter(value, server).catch(function(err) {
          // print the error details
          console.log(err);
        });
        await user
          .setCharacterIndice(id, server, 0, "add", message)
          .catch(function(err) {
            // print the error details
            console.log(err);
          });
        return user.save();
      } else {
        const newUser = await Users.create({ user_id: id, character: value });
        sheets.set(id, newUser);
        await newUser.addCharacter(value, server).catch(function(err) {
          // print the error details
          console.log(err);
        });
        await newUser
          .setCharacterIndice(id, server, 0, "add", message)
          .catch(function(err) {
            // print the error details
            console.log(err);
          });
        return newUser;
      }
    }
  });

  if (type === "list") {
    var list_args = args.split(" ");

    if (!list_args[0]) {
      const items = await Characters.findAll();
      return message.channel.send(
        items.map(i => `${i.name}\n${i.health}V / ${i.mental}M `).join("\n\n"),
        { code: true }
      );
    } else {
      const items = await Characters.findAll({
        where: { name: { [Op.substring]: list_args[0] } }
      });
      return message.channel.send(
        items
          .map(
            i =>
              `${i.name}\n${i.title}\n- Points de vie: ${i.health}\n- Point de mental: ${i.mental}\n- ${i.description}\n- Force: ${i.strength}\n- Agilité: ${i.agility}\n- Observation: ${i.observation}\n- Savoir: ${i.knowledge}\n- Influence: ${i.influence}\n- Volonté: ${i.willpower}`
          )
          .join("\n\n"),
        { code: true }
      );
    }
  } else if (type === "check") {
    const user = await Users.findOne({
      where: { user_id: message.author.id }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    if (!user) {
      const user = await Users.create({
        user_id: message.author.id,
        character: 0
      });
      return message.channel.send("Vous ne jouez personne actuellement.");
    }
    const user_char = await UserCharacter.findOne({
      where: {
        [Op.and]: [{ userId: message.author.id }, { serverId: server_id }]
      }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    if (!user_char || user_char === 0)
      return message.channel.send("Vous ne jouez personne actuellement.");
    const target = message.mentions.users.first() || message.author;
    const character = await Characters.findOne({
      attributes: ["name"],
      raw: true,
      where: { characterId: user_char.characterId }
    });
    if (!character || character === 0)
      return message.channel.send("Vous ne jouez personne actuellement.");
    const character_stats = await user.getCharacter(message.author.id, server_id);
    if (!character_stats.length)
      return message.channel.send(`${target} n'a pas choisi de personnage.`);
    var character_name = "";
    for (let [key, value] of Object.entries(character)) {
      character_name = value;
    }

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `${target} joue actuellement ${character_name}.\n${character_stats
              .map(
                t =>
                  `Sa capacité spéciale :\n- ${t.description}\nSes stats actuelles sont \n- Points de vie: ${t.currentHealth}/${t.health}\n(${t.damage} dégât(s) et ${t.damageHidden} dégât(s) face cachée)\n- Points de mental: ${t.currentMental}/${t.mental}\n(${t.madness} horreur(s) et ${t.madnessHidden} horreur(s) face cachée)\n- Blessure: ${t.wounded}\n- Folie: ${t.mad}\n\n- Force: ${t.strength}\n- Agilité: ${t.agility}\n- Observation: ${t.observation}\n- Savoir: ${t.knowledge}\n- Influence: ${t.influence}\n- Volonté: ${t.willpower}`
              )
              .join(", ")}`
          }
        ]
      }
    });
  } else if (type === "select") {
    const character = await Characters.findOne({
      attributes: ["characterId"],
      raw: true,
      where: { name: { [Op.substring]: args } }
    });
    if (!character) return message.channel.send("Ce personnage n'existe pas.");
    var character_id = "";
    for (let [key, value] of Object.entries(character)) {
      character_id = value;
    }
    await sheets
      .setCharacter(message.author.id, character_id, server_id)
      .catch(function(err) {
        // print the error details
        console.log(err);
      });

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `Vous jouez maintenant ${args}.`
          }
        ]
      }
    });
  } else if (type === "auto") {
    const character = await Characters.findOne({
      attributes: ["name"],
      raw: true,
      where: { characterId: args }
    });
    var character_name = "";

    for (let [key, value] of Object.entries(character)) {
      character_name = value;
    }
    await sheets.setCharacter(channel_id, args, server_id).catch(function(err) {
      // print the error details
      console.log(err);
    });

    return character_name;
  } else if (type === "delete") {
    const fiches = await UserCharacter.destroy({
      where: {
        [Op.and]: [{ userId: message.author.id }, { serverId: server_id }]
      }
    });
    const indices = await UserIndice.destroy({
      where: {
        [Op.and]: [{ userId: message.author.id }, { serverId: server_id }]
      }
    });
    if (!fiches)
      return message.reply("Vous n'avez aucun personnage à supprimer.");

      const user = await Users.findOne({ where: { user_id: message.author.id } }).catch(
        function(err) {
          // print the error details
          console.log(err);
        }
      );
      if (user) {
        user.character = 0;
        return user.save();
      }

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `Vous avez cessé de jouer.`
          }
        ]
      }
    });
  } else if (type === "degat") {
    const user = await Users.findOne({
      where: { user_id: message.author.id }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    const character = await UserCharacter.findOne({
      where: { [Op.and]: [{ userId: message.author.id }, { serverId: server_id }] }
    });

    if (!character || character === 0)
      return message.channel.send("Vous ne jouez personne actuellement.");

    var value = 0;
    var value_args = args.split(" ");

    if (!value_args[0]) {
      value = 1;
    } else {
      value = parseInt(value_args[0]);
    }
    if (value_args[1] && value_args[1] == "h") {
      var hidden = true;
    }

    await user
      .setCharacterHealth(
        message.author.id,
        server_id,
        "degat",
        value,
        hidden,
        message
      )
      .catch(function(err) {
        // print the error details
        console.log(err);
      });

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `Vous avez perdu ` + value + ` point(s) de vie.`
          }
        ]
      }
    });
  } else if (type === "horreur") {
    const user = await Users.findOne({
      where: { user_id: message.author.id }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    const character = await UserCharacter.findOne({
      where: { [Op.and]: [{ userId: message.author.id }, { serverId: server_id }] }
    });

    if (!character || character === 0)
      return message.channel.send("Vous ne jouez personne actuellement.");

    var value = 0;
    var value_args = args.split(" ");

    if (!value_args[0]) {
      value = 1;
    } else {
      value = parseInt(value_args[0]);
    }
    if (value_args[1] && value_args[1] == "h") {
      var hidden = true;
    }

    await user
      .setCharacterHealth(
        message.author.id,
        server_id,
        "horreur",
        value,
        hidden,
        message
      )
      .catch(function(err) {
        // print the error details
        console.log(err);
      });

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `Vous avez perdu ` + value + ` point(s) de santé mentale.`
          }
        ]
      }
    });
  } else if (type === "heal") {
    const user = await Users.findOne({
      where: { user_id: message.author.id }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    const character = await UserCharacter.findOne({
      where: { [Op.and]: [{ userId: message.author.id }, { serverId: server_id }] }
    });

    if (!character || character === 0)
      return message.channel.send("Vous ne jouez personne actuellement.");

    var type = "";
    var type_text = "";
    var value = 0;
    var value_args = args.split(" ");

    if (
      !value_args[0] ||
      (value_args[0] != "horreur" && value_args[0] != "degat")
    ) {
      return message.channel.send(`Vous devez préciser la nature du soin.`);
    } else {
      if (value_args[0] == "horreur") {
        type = "horreur";
        type_text = "horreur(s)";
      } else if (value_args[0] == "degat") {
        type = "degat";
        type_text = "dégât(s)";
      }
    }
    if (!value_args[1]) {
      value = 1;
    } else {
      if (value_args[1] == "h") {
        value = 1;
        var hidden = true;
        type_text += " caché(e)(s)";
      } else {
        value = parseInt(value_args[1]);
      }
    }
    if (value_args[2] && value_args[2] == "h") {
      var hidden = true;
      type_text += " caché(e)(s)";
    }

    await user
      .setCharacterRegen(message.author.id, server_id, type, value, hidden)
      .catch(function(err) {
        // print the error details
        console.log(err);
      });

    return message.channel.send({
      embed: {
        color: 3447003,
        fields: [
          {
            name: "Infos joueur",
            value: `Vous avez supprimé ` + value + ` ` + type_text + `.`
          }
        ]
      }
    });
  } else if (type === "clue") {
    const user = await Users.findOne({
      where: { user_id: message.author.id }
    }).catch(function(err) {
      // print the error details
      console.log(err);
    });
    const indices = await UserIndice.findOne({
      attributes: ["indices"],
      raw: true,
      where: { [Op.and]: [{ userId: message.author.id }, { serverId: server_id }] }
    });

    if (!indices)
      return message.channel.send("Vous n'avez pas choisi de personnage.");

    for (let [key, value] of Object.entries(indices)) {
      var indices_i = value;
    }

    var number = 0;
    var number_args = args.split(" ");

    if (!number_args[1]) {
      number = 1;
    } else {
      number = parseInt(number_args[1]);
    }

    if (
      !number_args[0] ||
      (number_args[0] != "add" && number_args[0] != "remove") ||
      !number_args[0] == "check"
    ) {
      return message.channel.send(`Vous avez ` + indices_i + ` indice(s).`);
    } else {
      if (number_args[0] == "add") {
        await user
          .setCharacterIndice(
            message.author.id,
            server_id,
            number,
            "add",
            message
          )
          .catch(function(err) {
            // print the error details
            console.log(err);
          });
      } else if (number_args[0] == "remove") {
        await user
          .setCharacterIndice(
            message.author.id,
            server_id,
            number,
            "remove",
            message
          )
          .catch(function(err) {
            // print the error details
            console.log(err);
          });
      }
    }
  }
};
