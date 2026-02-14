const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // command: !embed Title | Description
  if (!message.content.startsWith('!embed')) return;

  const args = message.content.slice(7).split('|');

  const title = args[0]?.trim() || 'No title';
  const description = args[1]?.trim() || 'No description';

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(fee1f2)
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);


