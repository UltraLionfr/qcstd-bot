const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes disponibles"),

  async execute(interaction, client) {
    const globalCommands = await client.application.commands.fetch();

    const commandList = globalCommands.map(
      cmd => `</${cmd.name}:${cmd.id}> — ${cmd.description || "Pas de description"}`
    ).join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📖 Aide du bot")
      .setDescription(
        commandList.length > 0
          ? "Voici la liste des commandes disponibles :\n\n" + commandList
          : "❌ Aucune commande trouvée."
      )
      .setColor(0x5e99ff)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({
        text: `QuantumCraft Studios • Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};