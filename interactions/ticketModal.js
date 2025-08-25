const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { createTicket } = require("../handlers/database");
const { config } = require("../handlers/configLoader");

module.exports = {
  id: /^ticket_modal_.+$/,
  async execute(interaction, client) {
    const originalId = interaction.customId.replace("ticket_modal_", "");
    const modalConfig = config.TicketPanel?.Modals?.[originalId];

    if (!modalConfig) {
      return interaction.reply({
        content: "❌ Aucun formulaire configuré pour ce ticket.",
        flags: 64
      });
    }

    const member = interaction.member;
    const guild = interaction.guild;

    const categories = config.TicketPanel.Panel.Categories;
    const parentCategory = categories && categories.length > 0 ? categories[0] : null;

    const staffRoles = (Array.isArray(config.staffRoles) ? config.staffRoles : [config.staffRoles])
      .filter(r => r && r.trim() !== "");

    const overwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];

    for (const roleId of staffRoles) {
      overwrites.push({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      });
    }

    const channel = await guild.channels.create({
      name: `ticket-${member.user.username}`.toLowerCase(),
      type: 0,
      parent: parentCategory || undefined,
      permissionOverwrites: overwrites
    });

    createTicket(member.id, channel.id);

    const fieldsOutput = modalConfig.Inputs.map(input => {
      const value = interaction.fields.getTextInputValue(input.CustomId);
      return `**${input.Label}** : ${value}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`🎟️ ${modalConfig.Title || "Nouveau ticket"}`)
      .setDescription(`👤 Ouvert par: ${member}\n\n${fieldsOutput}`)
      .setColor(0x5e99ff)
      .setTimestamp();

    await channel.send({
      content: staffRoles.map(r => `<@&${r}>`).join(" "),
      embeds: [embed]
    });

    await interaction.reply({
      content: `✅ Ton ticket a été créé : ${channel}`,
      flags: 64
    });

    const logChannel = await client.channels.fetch(config.logsChannel).catch(() => null);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle("🎟️ Nouveau ticket")
        .setDescription(`Formulaire utilisé: \`${originalId}\``)
        .addFields(
          { name: "Utilisateur", value: `${member.user.tag} (${member.id})` },
          { name: "Salon", value: `${channel}` },
          { name: "Réponses", value: fieldsOutput }
        )
        .setColor(0x2ecc71)
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    }
  }
};