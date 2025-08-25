const { config, lang } = require('../handlers/configLoader');

module.exports = {
  id: 'cancelClosure',
  async execute(interaction) {
    const member = interaction.member;
    const isStaff = config.staffRoles.some((roleId) =>
      member.roles.cache.has(roleId)
    );

    if (!isStaff) {
      return interaction.reply({
        content: lang.permissions.staff_only,
        flags: 64,
      });
    }

    await interaction.reply({
      content: lang.commands.alert.cancelled,
      flags: 64,
    });
  },
};
