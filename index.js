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
  if (!message.content.startsWith('!embed')) return;

  const args = message.content.slice(6).split('|');

  const title = args[0]?.trim();
  const description = args[1]?.trim();
  const image = args[2]?.trim();
  const thumb = args[3]?.trim();

  const embed = new EmbedBuilder()
    .setTitle(title || 'No title')
    .setDescription(description || 'No description')
    .setColor('#fee1f2');

  if (image) embed.setImage(image);
  if (thumb) embed.setThumbnail(thumb);

  message.channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);
