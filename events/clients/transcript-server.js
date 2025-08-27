const fs = require('fs');
const path = require('path');
const express = require('express');
const { config } = require('../../handlers/configLoader');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute() {
    const app = express();
    const transcriptsPath = path.join(__dirname, '../../transcripts');

    app.use('/transcript', express.static(transcriptsPath));

    app.get('/', (req, res) => {
      res.send('✅ Serveur Transcript actif. Utilise /transcript/:id pour voir un ticket.');
    });

    app.get('/transcript/:id', (req, res) => {
      const file = path.join(transcriptsPath, `${req.params.id}.html`);
      if (fs.existsSync(file)) {
        res.sendFile(file);
      } else {
        res.status(404).send('❌ Transcript introuvable');
      }
    });

    const PORT = process.env.TRANSCRIPT_PORT || 3000;
    const DOMAIN = process.env.TRANSCRIPT_DOMAIN || 'http://localhost';

    app.listen(PORT, () => {
      console.log(`🌐 Serveur Transcript dispo sur ${DOMAIN}:${PORT}`);
    });
  },
};