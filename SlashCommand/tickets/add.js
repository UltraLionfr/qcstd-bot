const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { config, lang } = require("../../handlers/configLoader");
const { getTicketByChannel } = require("../../handlers/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription(lang.commands.add.description)
    .addUserOption(option =>
      option.setName("utilisateur")
        .setDescription("L'utilisateur à ajouter au ticket")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    const staffRoles = (Array.isArray(config.staffRoles) ? config.staffRoles : [config.staffRole || config.staffRoles])
      .filter(r => r && r.trim() !== "");

    if (!staffRoles.some(roleId => member.roles.cache.has(roleId))) {
      return interaction.reply({
        content: lang.permissions.staff_only,
        flags: 64
      });
    }

    const ticket = getTicketByChannel(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        content: lang.ticket.not_in_ticket,
        flags: 64
      });
    }

    const userToAdd = interaction.options.getUser("utilisateur");

    const existingOverwrite = interaction.channel.permissionOverwrites.cache.get(userToAdd.id);
    if (existingOverwrite && existingOverwrite.allow.has(PermissionFlagsBits.ViewChannel)) {
      return interaction.reply({
        content: lang.commands.add.already_added.replace("{user}", userToAdd),
        flags: 64
      });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(userToAdd.id, {
        [PermissionFlagsBits.ViewChannel]: true,
        [PermissionFlagsBits.SendMessages]: true,
        [PermissionFlagsBits.ReadMessageHistory]: true,
      });

      await interaction.reply({
        content: lang.commands.add.success.replace("{user}", userToAdd),
        flags: 64
      });

      await interaction.channel.send(
        lang.commands.add.welcome.replace("{user}", userToAdd)
      );

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: lang.commands.add.error,
        flags: 64
      });
    }
  }
};