const env = require('@dotenvx/dotenvx').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./handlers/eventHandler');
const { loadCommands } = require('./handlers/commandHandler');
const { loadButtons } = require('./handlers/buttonHandler');
const { loadModals } = require('./handlers/modalHandler');
const { loadMenus } = require('./handlers/menuHandler');
const { initDB } = require('./handlers/database');
const logger = require('./handlers/logger');
const chalk = require('chalk');

const count = Object.keys(env.parsed || {}).length;
const keys = Object.keys(env.parsed || {}).join(', ');
const colors = [
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.magenta,
  chalk.cyan,
  chalk.white,
];
const coloredKeys = Object.keys(env.parsed || {})
  .map((key, i) => colors[i % colors.length](key))
  .join(', ');

logger.success(`🚀 ${process.env.BOT_START_MESSAGE}`);
logger.info(`🔑 Variables .env détectées (${count}) : ${coloredKeys}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

loadEvents(client);
loadCommands(client);
loadButtons(client);
loadModals(client);
loadMenus(client);

(async () => {
  try {
    await initDB();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.error(`Erreur au démarrage : ${error.message}`);
    process.exit(1);
  }
})();