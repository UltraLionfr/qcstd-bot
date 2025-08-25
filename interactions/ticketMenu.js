const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getModal } = require("../handlers/modalHandler");
const { createTicket } = require("../handlers/database");
const { config } = require("../handlers/configLoader");

module.exports = {
  id: "ticket_select",
  async execute(interaction, client) {
    const selected = interaction.values[0];
    const modalConfig = getModal(selected);

    if (!modalConfig || modalConfig.Enabled === false) {
      const guild = interaction.guild;
      const member = interaction.member;

      const categories = config.TicketPanel.Panel.Categories;
      const parentCategory = categories && categories.length > 0 ? categories[0] : null;

      const channel = await guild.channels.create({
        name: `ticket-${member.user.username}`.toLowerCase(),
        type: 0,
        parent: parentCategory || undefined,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          ...config.staffRoles.map(roleId => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }))
        ]
      });

      createTicket(member.id, channel.id);

      await interaction.reply({
        content: `✅ Ton ticket a été créé : ${channel}`,
        flags: 64
      });

      await channel.send(`🎟️ Bonjour ${member}, un membre du staff va bientôt te répondre.`);

      const logChannel = await client.channels.fetch(config.logsChannel).catch(() => null);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle("🎟️ Nouveau ticket (sans formulaire - via SelectMenu)")
          .addFields(
            { name: "Utilisateur", value: `${member.user.tag} (${member.id})` },
            { name: "Salon", value: `${channel}` },
            { name: "Type de ticket", value: selected }
          )
          .setColor(0x2ecc71)
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`ticket_modal_${selected}`)
      .setTitle(modalConfig.Title || "Création de ticket");

    modalConfig.Inputs.forEach(input => {
      const textInput = new TextInputBuilder()
        .setCustomId(input.CustomId)
        .setLabel(input.Label)
        .setStyle(TextInputStyle[input.Style] || TextInputStyle.Short)
        .setRequired(input.Required ?? false);

      modal.addComponents(new ActionRowBuilder().addComponents(textInput));
    });

    await interaction.showModal(modal);
  }
};