const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

function loadButtons(client) {
  const interactionsPath = path.join(__dirname, "../interactions");
  client.buttons = new Collection();

  if (!fs.existsSync(interactionsPath)) return client.buttons;

  const files = fs.readdirSync(interactionsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const button = require(path.join(interactionsPath, file));

    if (button.id) {
      client.buttons.set(button.id, button);
    }
  }

  return client.buttons;
}

async function handleButton(interaction, client) {
  const button = client.buttons.get(interaction.customId);

  if (button) return button.execute(interaction, client);

  for (const btn of client.buttons.values()) {
    if (btn.id instanceof RegExp && btn.id.test(interaction.customId)) {
      return btn.execute(interaction, client);
    }
  }
}

module.exports = { loadButtons, handleButton };