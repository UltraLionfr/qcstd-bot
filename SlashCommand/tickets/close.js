const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTicketByChannel } = require('../../handlers/database');
const { lang } = require('../../handlers/configLoader');
const { closeTicketWithTranscript } = require('../../handlers/ticketCloser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Fermer un ticket'),

  async execute(interaction) {
    const ticket = getTicketByChannel(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({
        content: lang.ticket.not_in_ticket,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply(lang.ticket.closing);

    setTimeout(async () => {
      await closeTicketWithTranscript(interaction.channel, interaction.user);
    }, 5000);
  },
};
