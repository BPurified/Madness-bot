const kick = require("../commands/kick");
const roll = require("../commands/dice");
const member = require("../commands/member");
const help = require("../commands/help");
const play = require("../commands/play");
const character = require("../commands/character");
const cards = require("../commands/cards");
const { prefix, token } = require("../config.json");

var chan_id;

const Discord = require("discord.js");
const client = new Discord.Client();
const guild = new Discord.Guild();
const {
  Users,
  Characters,
  UserCharacter,
  UserIndice
} = require("../dbObjects");

const fs = require("fs");

module.exports = async (client, message) => {
  const server_id = message.guild.id;
  //console.log(message.guild.id);
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  /*const args = message.content.slice(prefix.length).split(' +');
  const command = args.shift().toLowerCase();*/
  const args = message.content.slice(prefix.length).trim();
  if (!args.length) return;
  const [, command, commandArgs] = args.match(/(\w+)\s*([\s\S]*)/);

  if (command.startsWith("kick")) {
    return kick(message);
  } else if (command.startsWith("start") || command.startsWith("debut")) {
    return play(message, server_id, "new");
  } else if (command.startsWith("roll") || command.startsWith("des")) {
    return roll(message, server_id);
  } else if (command.startsWith("list")) {
    return character("list", message, commandArgs);
  } else if (command.startsWith("select")) {
    return character("select", message, commandArgs, server_id);
  } else if (command.startsWith("check")) {
    return character("check", message, commandArgs, server_id);
  } else if (command.startsWith("delete")) {
    return character("delete", message, commandArgs, server_id);
  } else if (
    command.startsWith("dégât") ||
    command.startsWith("degat") ||
    command.startsWith("vie")
  ) {
    return character("degat", message, commandArgs, server_id);
  } else if (command.startsWith("horreur") || command.startsWith("mental")) {
    return character("horreur", message, commandArgs, server_id);
  } else if (command.startsWith("heal") || command.startsWith("soin")) {
    return character("heal", message, commandArgs, server_id);
  } else if (command.startsWith("clue") || command.startsWith("indice")) {
    return character("clue", message, commandArgs, server_id);
  } else if (command.startsWith("hello")) {
    return member(message);
  } else if (command.startsWith("help") || command.startsWith("aide")) {
    return help(message);
  } else if (command.startsWith("draw") || command.startsWith("carte")) {
    return cards(message, commandArgs, server_id);
  } else if (command.startsWith("init")) {
    const items = await Characters.findAll();
    var n = 0;
    let mapToArray = Array.from(items.values());
    //var categ = client.channels.cache.find(channel => channel.name === "Salons textuels");
    var categ = message.guild.channels.cache.find(channel => channel.name === "Salons textuels");
    
    let datas = JSON.parse(
      fs.readFileSync("./datas/datas-characters.json", "utf8")
    );
    await message.guild.channels.create("personnages", { type: 0 })
      .then(async channel => {
          channel.setParent(categ.id);
          for (var n = 0; n < mapToArray.length; ++n) {
          let characterId = mapToArray[n].characterId;
          var index = 0;
          
          await channel
            .send(
              `${mapToArray[n].name}\n${mapToArray[n].title}\n- Points de vie: ${mapToArray[n].health}\n- Point de mental: ${mapToArray[n].mental}\n- ${mapToArray[n].description}\n- Force: ${mapToArray[n].strength}\n- Agilité: ${mapToArray[n].agility}\n- Observation: ${mapToArray[n].observation}\n- Savoir: ${mapToArray[n].knowledge}\n- Influence: ${mapToArray[n].influence}\n- Volonté: ${mapToArray[n].willpower}`,
              { code: true }
            )
            .then(sentMessage => {
              sentMessage.react("👍");
              var message_id = sentMessage.id;
              console.log("Creation de personnages");
              console.log(datas);
              index = "" + server_id + parseInt(characterId - 1);
              if (!datas[index]) {
                datas[index] = [{
                  characterId: characterId,
                  message_id: "" + server_id + message_id
                }];
              } else {
                datas[index].message_id = "" + server_id + message_id;
              }
            })
            .catch(console.error);
        }
      })
      .then(async message => console.log("Liste des personnages créés."))
      .catch(console.error);
    

    await message.guild.channels
      .create("le-manoir", { type: 0 })
      .then(channel => {
        channel.setParent(categ.id);
        chan_id = channel.id;
        module.exports = { chanId: chan_id };
      })
      .then(message => console.log("Terrain de jeu créé."))
      .catch(console.error);
      console.log(datas);
      fs.writeFileSync(
          "./datas/datas-characters.json",
          JSON.stringify(datas),
          err => {
            if (err) throw err;
          }
        )
  } else if (command.startsWith("restart")) {
    client.destroy();
    console.log("Stopped");
    client.login(process.env.BOT_TOKEN);
    console.log(`Logged in as ${client.user.tag}!`);
  } else if (command.startsWith("stop")) {
    client.destroy();
  } else {
    message.channel.send(
      "Cette commande n'existe pas. Pour connaître la liste des commandes disponibles, tapez '!help'.",
      { code: true }
    );
  }
};
