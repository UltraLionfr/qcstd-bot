const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, '../tickets.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        channelId TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open'
      )
    `);
    saveDB();
  }
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function createTicket(userId, channelId) {
  db.run(
    "INSERT INTO tickets (userId, channelId, status) VALUES (?, ?, 'open')",
    [String(userId), String(channelId)]
  );
  saveDB();
}

function getTicketByChannel(channelId) {
  const stmt = db.prepare(
    "SELECT * FROM tickets WHERE channelId = ? AND status = 'open'"
  );
  stmt.bind([String(channelId)]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function closeTicket(channelId) {
  db.run("UPDATE tickets SET status = 'closed' WHERE channelId = ?", [
    String(channelId),
  ]);
  saveDB();
}

module.exports = { initDB, createTicket, getTicketByChannel, closeTicket };
