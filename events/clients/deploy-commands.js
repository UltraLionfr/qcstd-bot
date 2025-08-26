const { REST, Routes } = require('discord.js');
const { getCommandsJSON } = require('../../handlers/commandHandler');
const logger = require('../../handlers/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute() {
    const commands = getCommandsJSON();
    const rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_TOKEN
    );

    try {
      logger.info('⏳ Déploiement des slash commands...');
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      logger.success(
        `✅ ${commands.length} slash commands déployées avec succès !`
      );
    } catch (error) {
      logger.error(
        `❌ Erreur lors du déploiement des commandes : ${error.message}`
      );
    }
  },
};
