const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { config, lang } = require('../../handlers/configLoader');
const { getTicketByChannel } = require('../../handlers/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription(lang.commands.remove.description)
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription("L'utilisateur à retirer du ticket")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    const staffRoles = (
      Array.isArray(config.staffRoles)
        ? config.staffRoles
        : [config.staffRole || config.staffRoles]
    ).filter((r) => r && r.trim() !== '');

    if (!staffRoles.some((roleId) => member.roles.cache.has(roleId))) {
      return interaction.reply({
        content: lang.permissions.staff_only,
        flags: 64,
      });
    }

    const ticket = getTicketByChannel(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        content: lang.ticket.not_in_ticket,
        flags: 64,
      });
    }

    const userToRemove = interaction.options.getUser('utilisateur');

    const existingOverwrite =
      interaction.channel.permissionOverwrites.cache.get(userToRemove.id);
    if (
      !existingOverwrite ||
      !existingOverwrite.allow.has(PermissionFlagsBits.ViewChannel)
    ) {
      return interaction.reply({
        content: lang.commands.remove.not_in_ticket.replace(
          '{user}',
          userToRemove
        ),
        flags: 64,
      });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(userToRemove.id, {
        [PermissionFlagsBits.ViewChannel]: false,
        [PermissionFlagsBits.SendMessages]: false,
        [PermissionFlagsBits.ReadMessageHistory]: false,
      });

      await interaction.reply({
        content: lang.commands.remove.success.replace('{user}', userToRemove),
        flags: 64,
      });

      await interaction.channel.send(
        lang.commands.remove.goodbye.replace('{user}', userToRemove)
      );
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: lang.commands.remove.error,
        flags: 64,
      });
    }
  },
};
