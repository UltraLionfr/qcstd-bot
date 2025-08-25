const { getTicketByChannel } = require('../../handlers/database');
const { cancelTicketClosure } = require('../../handlers/alertManager');
const { lang } = require('../../handlers/configLoader');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    const ticket = getTicketByChannel(message.channel.id);
    if (!ticket) return;

    if (message.author.id === ticket.userId) {
      if (cancelTicketClosure(message.channel.id)) {
        const embed = new EmbedBuilder()
          .setDescription(lang.commands.alert.auto_cancelled)
          .setColor(0x2ecc71)
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });
      }
    }
  },
};
