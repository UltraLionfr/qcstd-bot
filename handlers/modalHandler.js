const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const { config } = require("./configLoader");

function loadModals(client) {
  const interactionsPath = path.join(__dirname, "../interactions");
  client.modals = new Collection();

  const files = fs.readdirSync(interactionsPath).filter(f => f.toLowerCase().includes("modal") && f.endsWith(".js"));

  for (const file of files) {
    const modal = require(path.join(interactionsPath, file));
    client.modals.set(modal.id, modal);
  }

  return client.modals;
}

function getModal(customId) {
  return config.TicketPanel?.Modals?.[customId] || null;
}

module.exports = { loadModals, getModal };