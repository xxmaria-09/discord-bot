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
  if (message.content === '!embed') {

    const embed = new EmbedBuilder()
      .setTitle('Railway Bot 🚂')
      .setDescription('Your bot is hosted on Railway!')
      .setColor(0x5865F2);

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
