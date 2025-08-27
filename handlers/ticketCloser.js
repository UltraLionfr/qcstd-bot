const fs = require('fs');
const path = require('path');
const { EmbedBuilder, StickerFormatType } = require('discord.js');
const { closeTicket } = require('./database');
const { config } = require('./configLoader');

async function generateTranscript(channel, user) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();

  let html = `
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Transcript - ${channel.name}</title>
        <style>
          body { font-family: sans-serif; background: #2c2f33; color: #fff; }
          .msg { border-bottom: 1px solid #444; padding: 5px; }
          .author { font-weight: bold; color: #7289da; }
          .time { color: #999; font-size: 12px; }
          img { max-width: 400px; margin-top: 5px; border-radius: 5px; }
          .embed { border-left: 3px solid #7289da; margin: 5px; padding-left: 5px; background: #23272a; }
          .sticker { margin-top: 10px; }
        </style>
      </head>
      <body>
        <h2>Transcript - ${channel.name}</h2>
  `;

  for (const msg of sorted) {
    const time = msg.createdAt.toLocaleString();
    const avatar = msg.author.displayAvatarURL();
    let content = msg.content || '';

    // Mentions
    if (content) {
      content = content.replace(/<@!?(\d+)>/g, (match, id) => {
        const u = channel.client.users.cache.get(id);
        return u ? `@${u.username}` : match;
      });

      // Emojis custom
      content = content.replace(/<a?:\w+:(\d+)>/g, (match, id) => {
        const isAnimated = match.startsWith('<a:');
        const ext = isAnimated ? 'gif' : 'png';
        return `<img src="https://cdn.discordapp.com/emojis/${id}.${ext}" height="24" style="vertical-align:middle;">`;
      });
    }

    html += `
      <div class="msg">
        <img src="${avatar}" width="32" height="32" style="border-radius:50%; vertical-align:middle; margin-right:5px;">
        <span class="author">${msg.author.tag}</span>
        <span class="time">(${time})</span>
        <div style="white-space: pre-wrap; margin-left:37px;">${content}</div>
    `;

    // Pièces jointes
    if (msg.attachments.size > 0) {
      msg.attachments.forEach((att) => {
        if (att.contentType?.startsWith('image/')) {
          html += `<div class="attachment"><img src="${att.url}"/></div>`;
        } else {
          html += `<div class="attachment"><a href="${att.url}" target="_blank">📎 ${att.name}</a></div>`;
        }
      });
    }

    // Stickers
    if (msg.stickers.size > 0) {
      msg.stickers.forEach((sticker) => {
        if (sticker.format === StickerFormatType.LOTTIE) {
          html += `<div class="sticker">[Sticker Lottie non supporté]</div>`;
          return;
        }
        const url = `https://cdn.discordapp.com/stickers/${sticker.id}.png`;
        html += `
          <div class="sticker">
            <img src="${url}" alt="${sticker.name}" 
                 style="width:320px; height:320px; border-radius:8px; display:block;"/>
            <div style="color:#aaa; font-size:12px;">${sticker.name}</div>
          </div>
        `;
      });
    }

    // Embeds
    if (msg.embeds.length > 0) {
      msg.embeds.forEach((embed) => {
        html += `<div class="embed">`;
        if (embed.title) html += `<div><strong>${embed.title}</strong></div>`;
        if (embed.description) html += `<div>${embed.description}</div>`;
        if (embed.url)
          html += `<div><a href="${embed.url}" target="_blank">🔗 Lien</a></div>`;
        if (embed.thumbnail?.url) {
          html += `<img src="${embed.thumbnail.url}" style="max-width:150px;"/>`;
        }
        html += `</div>`;
      });
    }

    html += `</div>`;
  }

  html += `</body></html>`;

  const transcriptsDir = path.join(__dirname, '../transcripts');
  if (!fs.existsSync(transcriptsDir)) fs.mkdirSync(transcriptsDir);

  const filePath = path.join(transcriptsDir, `${channel.id}.html`);
  fs.writeFileSync(filePath, html, 'utf8');

  // === Lecture domaine/port depuis .env ===
  const DOMAIN = process.env.TRANSCRIPT_DOMAIN || 'http://localhost';
  const PORT = process.env.TRANSCRIPT_PORT || 3000;

  // Logs
  const logChannel = await channel.client.channels
    .fetch(config.logsChannel)
    .catch(() => null);
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🔒 Ticket fermé')
      .addFields(
        { name: 'Salon', value: `${channel.name}`, inline: true },
        {
          name: 'Fermé par',
          value: user ? `${user.tag} (${user.id})` : 'Automatique',
          inline: true,
        },
        {
          name: 'Transcript',
          value: `${DOMAIN}:${PORT}/transcript/${channel.id}`,
        }
      )
      .setColor(0xe74c3c)
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  }
}

async function closeTicketWithTranscript(channel, user) {
  await generateTranscript(channel, user);
  closeTicket(channel.id);
  await channel.delete().catch(() => {});
}

module.exports = { closeTicketWithTranscript };