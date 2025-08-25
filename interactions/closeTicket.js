const { PermissionFlagsBits } = require('discord.js');
const { closeTicket } = require('../handlers/database');
const { config, lang } = require('../handlers/configLoader');

module.exports = {
  id: 'closeTicket',
  async execute(interaction) {
    const member = interaction.member;
    const isStaff = member.roles.cache.some((role) =>
      config.staffRoles.includes(role.id)
    );

    if (!isStaff) {
      return interaction.reply({
        content: lang.permissions.staff_only,
        flags: 64,
      });
    }

    const channel = interaction.channel;

    await interaction.reply({ content: lang.ticket.closing });

    setTimeout(async () => {
      closeTicket(channel.id);
      await channel.delete().catch(() => {});
    }, 5000);
  },
};
