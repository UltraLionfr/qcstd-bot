module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) return command.execute(interaction, client);
      }

      // Buttons
      if (interaction.isButton()) {
        for (const button of client.buttons.values()) {
          if (typeof button.id === "string" && button.id === interaction.customId) {
            return button.execute(interaction, client);
          }
          if (button.id instanceof RegExp && button.id.test(interaction.customId)) {
            return button.execute(interaction, client);
          }
        }
      }

      // Modals
      if (interaction.isModalSubmit()) {
        for (const modal of client.modals.values()) {
          if (typeof modal.id === "string" && modal.id === interaction.customId) {
            return modal.execute(interaction, client);
          }
          if (modal.id instanceof RegExp && modal.id.test(interaction.customId)) {
            return modal.execute(interaction, client);
          }
        }
      }

      // Menus
      if (
        interaction.isStringSelectMenu() ||
        interaction.isUserSelectMenu() ||
        interaction.isRoleSelectMenu() ||
        interaction.isChannelSelectMenu()
      ) {
        for (const menu of client.menus.values()) {
          if (typeof menu.id === "string" && menu.id === interaction.customId) {
            return menu.execute(interaction, client);
          }
          if (menu.id instanceof RegExp && menu.id.test(interaction.customId)) {
            return menu.execute(interaction, client);
          }
        }
      }
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Une erreur est survenue.", flags: 64 });
      } else {
        await interaction.reply({ content: "❌ Une erreur est survenue.", flags: 64 });
      }
    }
  }
};