const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");
const { config } = require("../../handlers/configLoader");
const logger = require("../../handlers/logger");

function parseColor(raw) {
  if (!raw) return 0x5865F2;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    if (raw.startsWith("0x")) return parseInt(raw, 16);
    if (raw.startsWith("#")) return parseInt(raw.slice(1), 16);
    const asInt = parseInt(raw);
    if (!isNaN(asInt)) return asInt;
  }
  return 0x5865F2;
}

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    const panelConfig = config.TicketPanel.Panel;
    const channelId = Array.isArray(panelConfig.Channel)
      ? panelConfig.Channel[0]
      : panelConfig.Channel;

    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return logger.error("❌ Impossible de trouver le salon défini pour le panel de ticket.");
    }

    // === Embed principal ===
    const embed = new EmbedBuilder()
      .setTitle(panelConfig.Embed.Title || "")
      .setDescription(panelConfig.Embed.Description || "")
      .setColor(parseColor(panelConfig.Embed.Color));

    if (panelConfig.Embed.PanelImage) embed.setImage(panelConfig.Embed.PanelImage);
    if (panelConfig.Embed.CustomThumbnailURL) embed.setThumbnail(panelConfig.Embed.CustomThumbnailURL);
    if (panelConfig.Embed.Timestamp) embed.setTimestamp();

    if (panelConfig.Embed.Footer && panelConfig.Embed.Footer.Enabled) {
      embed.setFooter({
        text: panelConfig.Embed.Footer.Text || "",
        iconURL: panelConfig.Embed.Footer.CustomIconURL || null
      });
    }

    let row;

    // === Gestion des interactions ===
    if (panelConfig.InteractionType === "select" && panelConfig.SelectMenu) {
      // 📌 Mode Select Menu
      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder(panelConfig.SelectMenu.Placeholder || "Choisis une option...");

      for (const opt of panelConfig.SelectMenu.Options) {
        const option = {
          label: opt.Label,
          value: opt.Value,
        };

        if (opt.Description) option.description = opt.Description;
        if (opt.Emoji) option.emoji = opt.Emoji;

        menu.addOptions(option);
      }

      row = new ActionRowBuilder().addComponents(menu);

    } else {
      // 📌 Mode Boutons par défaut
      row = new ActionRowBuilder();
      if (panelConfig.Buttons && Array.isArray(panelConfig.Buttons)) {
        for (const btn of panelConfig.Buttons) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(btn.CustomId)
              .setLabel(btn.Label)
              .setStyle(ButtonStyle[btn.Style])
          );
        }
      }
    }

    // === Nettoyage & envoi ===
    await channel.bulkDelete(10).catch(() => {});
    await channel.send({ embeds: [embed], components: [row] });

    logger.success(`✅ Panel "${panelConfig.Name}" envoyé avec succès !`);
  }
};