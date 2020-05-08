const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: 'database2.sqlite',
});

const Characters = sequelize.import("models/Characters");
const Madnesses = sequelize.import("models/Madness");
sequelize.import("models/Users");
sequelize.import("models/UserCharacter");
sequelize.import("models/UserIndice");
sequelize.import("models/Players");

let characters_list = require('./datas/characters.json');
let madness_list = require('./datas/madness-cards.json');

function insert_char() {
  var array = [];
    for (var i = 0; i < characters_list.length; ++i) {
      array.push(Characters.upsert({
        name: characters_list[i].name,
        title: characters_list[i].title,
        health: characters_list[i].health,
        mental: characters_list[i].mental,
        description: characters_list[i].description,
        strength: characters_list[i].strength,
        agility: characters_list[i].agility,
        observation: characters_list[i].observation,
        knowledge: characters_list[i].knowledge,
        influence: characters_list[i].influence,
        willpower: characters_list[i].willpower,
        characterId: characters_list[i].characterId
      }));
    }
    return array;
}
function insert_mad() {
  var array = [];
    for (var i = 0; i < madness_list.length; ++i) {
      array.push(Madnesses.upsert({
        name: madness_list[i].name,
        description: madness_list[i].description,
        effect: madness_list[i].effect,
        madness_id: madness_list[i].madness_id,
        min_players: madness_list[i].min_players,
      }));
    }
    return array;
}
const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize
  .sync({ force })
  .then(async () => {
    const characters = insert_char(characters_list);
    const madnesses = insert_mad(madness_list);
    await Promise.all(characters);
    await Promise.all(madnesses);
    console.log("Database synced");
    sequelize.close();
  })
  .catch(console.error);