const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const { config, lang } = require('../../handlers/configLoader');
const { getTicketByChannel, closeTicket } = require('../../handlers/database');
const { scheduleTicketClosure } = require('../../handlers/alertManager');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alert')
    .setDescription(lang.commands.alert.description),

  async execute(interaction, client) {
    const ticket = getTicketByChannel(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({
        content: lang.ticket.not_in_ticket,
        flags: 64,
      });
    }

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

    const alertDuration = ms(config.TicketAlert.Time || '1h');
    const now = Date.now();
    const inactiveTime = `<t:${Math.floor(now / 1000)}:R>`;

    const closeBtn = new ButtonBuilder()
      .setCustomId('closeTicket')
      .setLabel(lang.commands.alert.close_now_label || '🔒 Fermer maintenant')
      .setStyle(ButtonStyle.Danger);

    const cancelBtn = new ButtonBuilder()
      .setCustomId('cancelClosure')
      .setLabel(lang.commands.alert.cancel_label || '🚫 Annuler la fermeture')
      .setStyle(ButtonStyle.Secondary);

    const linkBtn = new ButtonBuilder()
      .setLabel('🔗 Voir le ticket')
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`
      );

    const row1 = new ActionRowBuilder().addComponents(closeBtn, cancelBtn);
    const row2 = new ActionRowBuilder().addComponents(linkBtn);

    const alertEmbed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setDescription(
        lang.commands.alert.sent
          .replace(
            '{time}',
            `<t:${Math.floor((now + alertDuration) / 1000)}:R>`
          )
          .replace('{inactive-time}', inactiveTime)
      )
      .setTimestamp();

    const dmEmbed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setDescription(
        lang.commands.alert.sent
          .replace(
            '{time}',
            `<t:${Math.floor((now + alertDuration) / 1000)}:R>`
          )
          .replace('{inactive-time}', inactiveTime)
      )
      .setTimestamp();

    if (config.TicketAlert?.DMUser && ticket.userId) {
      const ticketCreator = await client.users
        .fetch(ticket.userId)
        .catch(() => null);
      if (ticketCreator) {
        try {
          await ticketCreator.send({ embeds: [dmEmbed], components: [row2] });
        } catch {
          await interaction.reply({
            content: lang.commands.alert.dm_unreachable,
            flags: 64,
          });
        }
      }
    }

    await interaction.reply({
      content: ticket.userId ? `<@${ticket.userId}>` : null,
      embeds: [alertEmbed],
      components: [row1],
    });

    scheduleTicketClosure(interaction.channel, alertDuration, async () => {
      closeTicket(interaction.channel.id);
      await interaction.channel.delete().catch(() => {});
    });
  },
};
