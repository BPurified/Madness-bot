module.exports = message => {
  const member = message.member
  return message.channel.send(`Bonjour ${member}, cela fait plaisir de vous voir ! Amusez-vous bien !`)
  	.then(message => console.log('Sent #' + message.id + ': ' + message.content))
    .catch(console.error);
}