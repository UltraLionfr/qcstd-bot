const logger = require("../../handlers/logger");

module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    logger.success(`Connecté en tant que ${client.user.tag}`);
  }
};