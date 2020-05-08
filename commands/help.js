module.exports = message => {
	var help = message.content.substr("!".length);
	var help_args = help.split(' ');
	var response = "";

	const commands = require('../datas/help-commands.json');;

	if(!help_args[1]) {
		response = "Voici la liste des commandes disponibles :\n\n" + commands.map(
			i => `- ${i.name}`
		).join('\n') + "\n\nPour en savoir plus sur l'une des commandes, tapez '!help [commande] (sans les [])'";
	} else {
		for (var i = 0; i < commands.length; ++i) {
			if(commands[i].name == help_args[1]) {
				response = "A propos de la commande '" + help_args[1] + "': \n" + `Commande ${commands[i].values.title} : ${commands[i].values.desc}\n\nLes commandes existantes :\n${commands[i].values.ex}\n\n${commands[i].values.more}`
			}
		}
	}
	return message.channel.send(response, { code: true })
	.then(message => console.log('Sent #' + message.id + ': ' + message.content))
	.catch(console.error);
}