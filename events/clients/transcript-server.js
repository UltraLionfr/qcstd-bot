const fs = require('fs');
const path = require('path');
const express = require('express');
const { config } = require('../../handlers/configLoader');
const logger = require('../../handlers/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute() {
    const app = express();
    const transcriptsPath = path.join(__dirname, '../../transcripts');

    app.use('/transcript', express.static(transcriptsPath));

    // Page d'accueil (http://localhost:5417/)
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Serveur Transcript</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #2c2f33;
                color: #fff;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
              }
              .container {
                background: #23272a;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 0 15px rgba(0,0,0,0.5);
              }
              h1 {
                color: #7289da;
                margin-bottom: 10px;
              }
              p {
                color: #ccc;
                font-size: 16px;
              }
              .highlight {
                color: #00aff4;
                font-weight: bold;
              }
              footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📑 Serveur Transcript</h1>
              <p>✅ Le service est actif.</p>
              <p>Accède à un transcript avec l’URL :</p>
              <p class="highlight">/transcript/<i>ID_DU_TICKET</i></p>
              <footer>QuantumCraft Studios - ${new Date().getFullYear()}</footer>
            </div>
          </body>
        </html>
      `);
    });

    // Page spéciale si quelqu’un tape /transcript/ sans ID
    app.get('/transcript/', (req, res) => {
      res.send(`
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Transcript</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #2c2f33;
                color: #fff;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .box {
                background: #23272a;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
              }
              h2 {
                color: #7289da;
              }
              p {
                color: #aaa;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>❌ Aucun transcript spécifié</h2>
              <p>👉 Utilise <span style="color:#00aff4;">/transcript/&lt;ID_DU_TICKET&gt;</span> pour accéder à un transcript.</p>
            </div>
          </body>
        </html>
      `);
    });

    // Page d'un transcript spécifique
    app.get('/transcript/:id', (req, res) => {
      const file = path.join(transcriptsPath, `${req.params.id}.html`);
      if (fs.existsSync(file)) {
        res.sendFile(file);
      } else {
        res.status(404).send(`
          <html>
            <head><meta charset="utf-8"/><title>Transcript introuvable</title></head>
            <body style="background:#2c2f33; color:#fff; text-align:center; padding:50px;">
              <h2 style="color:red;">❌ Transcript introuvable</h2>
              <p>L’ID <b>${req.params.id}</b> ne correspond à aucun ticket sauvegardé.</p>
            </body>
          </html>
        `);
      }
    });

    const PORT = process.env.TRANSCRIPT_PORT || 3000;
    const DOMAIN = process.env.TRANSCRIPT_DOMAIN || 'http://localhost';

    app.listen(PORT, () => {
      logger.success(`🌐 Serveur Transcript dispo sur ${DOMAIN}:${PORT}`);
    });
  },
};