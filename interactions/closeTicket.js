const { config, lang } = require('../handlers/configLoader');
const { closeTicketWithTranscript } = require('../handlers/ticketCloser');

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

    await interaction.reply({ content: lang.ticket.closing });

    setTimeout(async () => {
      await closeTicketWithTranscript(interaction.channel, interaction.user);
    }, 5000);
  },
};
