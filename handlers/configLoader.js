const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

function loadYAML(file) {
  const filePath = path.join(__dirname, "..", file);
  const content = fs.readFileSync(filePath, "utf8");
  return YAML.parse(content);
}

const config = loadYAML("config.yml");
const lang = loadYAML("lang.yml");

module.exports = { config, lang };