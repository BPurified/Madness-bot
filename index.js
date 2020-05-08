const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});
const fs = require("fs");
const http = require("http");
const express = require("express");
const { prefix, token } = require("./config.json");
const app = express();

const { Users, Characters } = require("./dbObjects");
const { Op } = require("sequelize");
const sheets = new Discord.Collection();
const guild = new Discord.Guild();
const character_set = require("./commands/character");

let characters_datas;

async function list_chara(id, server_id) {
  var number = 0;
  const characs = await Characters.findAll();
  if (characs.length) {
    for (let [key, value] of Object.entries(characs)) {
      number++;
    }
  }

  characters_datas = JSON.parse(
    fs.readFileSync("./datas/datas-characters.json", "utf8")
  );
  var index = 0;

  for (var i = 0; i < number; ++i) {
    index = "" + server_id + i;
    if (characters_datas[index][0].message_id.replace(server_id, "") == id) {
      return characters_datas[index][0].characterId;
    }
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.get("/", (request, response) => {
  console.log("Ping received!");
  response.sendStatus(200);
});

fs.readdir("./events/", (err, files) => {
  files.forEach(file => {
    const eventHandler = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, (...arg) => eventHandler(client, ...arg));
  });
});

client.on("messageReactionAdd", async (reaction, user) => {
  // File B
  // When we receive a reaction we check if the reaction is partial or not
  if (reaction.partial) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
      await reaction.fetch();
    } catch (error) {
      console.log("Something went wrong when fetching the message: ", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  let message = reaction.message,
    emoji = reaction.emoji;

  if (emoji.name == "👍" && user.id != message.author.id) {
    var game_chan = require("./events/message.js").chanId;
    var get_char = await list_chara(message.id, message.guild.id);

    var character_name = character_set(
      "auto",
      message,
      get_char,
      message.guild.id,
      user.id
    );

    // Remove the user's reaction
    reaction
      .remove(!message.author.id)
      .then()
      .catch(console.error);
    message.react("👍");

    character_name.then(value => {
      return message.guild.channels.cache
        .find(channel => channel.name === "le-manoir")
        .send({
          embed: {
            color: 3447003,
            fields: [
              {
                name: "Infos joueur",
                value: `${user} joue maintenant ${value}.`
              }
            ]
          }
        });
    });
  }
});

// This keeps the bot running 24/7
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

client.login(process.env.BOT_TOKEN);

client.on("debug", console.log);
