const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');
const { getTicketByChannel, closeTicket } = require('../../handlers/database');
const { config, lang } = require('../../handlers/configLoader');

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

    closeTicket(interaction.channel.id);

    await interaction.reply(lang.ticket.closing);

    // Log fermeture
    const logChannel = await interaction.client.channels
      .fetch(config.logsChannel)
      .catch(() => null);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket fermé')
        .addFields(
          { name: 'Salon', value: `${interaction.channel.name}`, inline: true },
          {
            name: 'Fermé par',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: true,
          }
        )
        .setColor(0xe74c3c)
        .setTimestamp();
      logChannel.send({ embeds: [embed] });
    }

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};
