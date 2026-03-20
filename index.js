const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

process.on('unhandledRejection', err => {
  console.error('❌ UNHANDLED ERROR:', err);
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN)
  .then(() => console.log("🔥 LOGIN SUCCESS"))
  .catch(err => console.error("❌ LOGIN ERROR:", err));

// EXPRESS (keep Render happy)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
