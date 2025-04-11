const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(text) {
  return new Promise((resolve) => rl.question(text, resolve));
}

module.exports = { question };
