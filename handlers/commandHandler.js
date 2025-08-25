const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

function walkCommands(dir, callback) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      walkCommands(filePath, callback);
    } else if (file.name.endsWith(".js")) {
      const command = require(filePath);
      callback(command);
    }
  }
}

function loadCommands(client) {
  const commandsPath = path.join(__dirname, "../SlashCommand");
  client.commands = new Collection();

  walkCommands(commandsPath, (command) => {
    client.commands.set(command.data.name, command);
  });

  return client.commands;
}

function getCommandsJSON() {
  const commandsPath = path.join(__dirname, "../SlashCommand");
  const commands = [];

  walkCommands(commandsPath, (command) => {
    commands.push(command.data.toJSON());
  });

  return commands;
}

module.exports = { loadCommands, getCommandsJSON };