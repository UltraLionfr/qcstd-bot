const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const cron = require("node-cron");
const { config } = require("../../handlers/configLoader");
const logger = require("../../handlers/logger");

// Générer l'embed ---
function generateScheduleEmbed() {
  const horaires = config.Schedule.Hours;
  const infoMessages = config.Schedule.InfoMessages || [];
  const now = new Date();
  const jours = Object.keys(horaires);
  const jourActuel = jours[now.getDay() === 0 ? 6 : now.getDay() - 1]; // lundi=0, dimanche=6

  let desc = "";
  for (const jour of jours) {
    if (jour === jourActuel) {
      desc += `➡️ **${jour} ${horaires[jour]}**\n`;
    } else {
      desc += `**${jour}** ${horaires[jour]}\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🕒 Horaires d'ouverture")
    .setDescription(desc)
    .addFields({
      name: "ℹ Informations",
      value: infoMessages.join("\n"),
    })
    .setFooter({
      text: `© ${new Date().getFullYear()} Quantumcraft Studios — Mise à jour automatique`,
    })
    .setTimestamp(now);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🌐 Visitez notre site")
      .setStyle(ButtonStyle.Link)
      .setURL(config.Schedule.WebsiteURL || "https://quantumcraft-studios.com")
  );

  return { embeds: [embed], components: [row] };
}

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    const channelId = config.Schedule.Channel;
    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return logger.error("❌ Impossible de trouver le salon défini dans config.Schedule.Channel");
    }

    let sentMessage;

    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      sentMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title?.includes("Horaires d'ouverture"));

      if (sentMessage) {
        await sentMessage.edit(generateScheduleEmbed());
        logger.success("✅ Message des horaires mis à jour (reboot)");
      } else {
        sentMessage = await channel.send(generateScheduleEmbed());
        logger.success("✅ Nouveau message des horaires envoyé");
      }
    } catch (err) {
      logger.error("❌ Erreur lors de la récupération/envoi du message des horaires :", err);
    }

    // Mise à jour chaque jour à minuit
    cron.schedule("0 0 * * *", async () => {
      try {
        await sentMessage.edit(generateScheduleEmbed());
        logger.info("🔄 Message des horaires mis à jour (00h00)");
      } catch {
        sentMessage = await channel.send(generateScheduleEmbed());
        logger.warn("⚠️ Ancien message introuvable, nouveau message envoyé pour les horaires");
      }
    });

    logger.success("✅ Gestion automatique des horaires activée !");
  },
};