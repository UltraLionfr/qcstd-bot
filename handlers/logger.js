const chalk = require('chalk');

function timestamp() {
  return chalk.gray(`[${new Date().toLocaleTimeString('fr-FR')}]`);
}

const logger = {
  info: (msg) => {
    console.log(`${timestamp()} ${chalk.blue('[INFO]')} ${msg}`);
  },
  success: (msg) => {
    console.log(`${timestamp()} ${chalk.green('[SUCCESS]')} ${msg}`);
  },
  warn: (msg) => {
    console.warn(`${timestamp()} ${chalk.yellow('[WARN]')} ${msg}`);
  },
  error: (msg) => {
    console.error(`${timestamp()} ${chalk.red('[ERROR]')} ${msg}`);
  },
  debug: (msg) => {
    if (process.env.DEBUG === 'true') {
      console.log(`${timestamp()} ${chalk.magenta('[DEBUG]')} ${msg}`);
    }
  },
};

module.exports = logger;
