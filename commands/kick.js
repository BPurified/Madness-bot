module.exports = message => {
  const member = message.mentions.members.first()
  if (!member) {
    return message.reply(`Vous devez mentionner un utilisateur pour pouvoir le kicker.`)
  }
  if (!member.kickable) {
    return message.reply(`Désolé, je ne peux pas kicker cet utilisateur !`)
  }
  return member
    .kick()
    .then(() => message.reply(`${member.user.tag} a été kické.`))
    .catch(error => message.reply(`Désolé, une erreur est intervenue.`))
}