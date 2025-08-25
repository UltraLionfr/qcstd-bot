const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadMenus(client) {
  const interactionsPath = path.join(__dirname, '../interactions');
  client.menus = new Collection();

  if (!fs.existsSync(interactionsPath)) return client.menus;

  const files = fs
    .readdirSync(interactionsPath)
    .filter((f) => f.toLowerCase().includes('menu') && f.endsWith('.js'));

  for (const file of files) {
    const menu = require(path.join(interactionsPath, file));
    client.menus.set(menu.id, menu);
  }

  return client.menus;
}

async function handleMenu(interaction, client) {
  for (const menu of client.menus.values()) {
    if (typeof menu.id === 'string' && menu.id === interaction.customId) {
      return menu.execute(interaction, client);
    }
    if (menu.id instanceof RegExp && menu.id.test(interaction.customId)) {
      return menu.execute(interaction, client);
    }
  }
}

module.exports = { loadMenus, handleMenu };
