const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials
} = require('discord.js');

const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

let embeds = require('./embeds.json');

function saveEmbeds() {
  fs.writeFileSync('./embeds.json', JSON.stringify(embeds, null, 2));
}

// ===============================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===============================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.split(' ');

  // ===============================
  // CREATE EMBED
  // !embed create name
  // ===============================
  if (args[0] === '!embed' && args[1] === 'create') {
    const name = args[2];
    if (!name) return message.reply('give a name');

    embeds[name] = {
      title: 'Title',
      description: 'Description',
      image: '',
      thumb: '',
      messageId: null,
      channelId: null
    };

    saveEmbeds();
    message.reply(`✅ embed "${name}" created`);
  }

  // ===============================
  // EDIT EMBED
  // !embed edit name Title | Desc | img | thumb
  // ===============================
  if (args[0] === '!embed' && args[1] === 'edit') {
    const name = args[2];
    if (!embeds[name]) return message.reply('not found');

    const data = message.content.split('|');

    embeds[name].title = data[0].split(name)[1]?.trim() || embeds[name].title;
    embeds[name].description = data[1]?.trim() || embeds[name].description;
    embeds[name].image = data[2]?.trim() || embeds[name].image;
    embeds[name].thumb = data[3]?.trim() || embeds[name].thumb;

    saveEmbeds();

    // UPDATE EXISTING MESSAGE
    if (embeds[name].messageId) {
      const channel = await client.channels.fetch(embeds[name].channelId);
      const msg = await channel.messages.fetch(embeds[name].messageId);

      const embed = new EmbedBuilder()
        .setTitle(embeds[name].title)
        .setDescription(embeds[name].description)
        .setColor('#fee1f2');

      if (embeds[name].image) embed.setImage(embeds[name].image);
      if (embeds[name].thumb) embed.setThumbnail(embeds[name].thumb);

      msg.edit({ embeds: [embed] });
    }

    message.reply(`✏️ updated "${name}"`);
  }

  // ===============================
  // SHOW EMBED
  // !embed show name
  // ===============================
  if (args[0] === '!embed' && args[1] === 'show') {
    const name = args[2];
    if (!embeds[name]) return message.reply('not found');

    const embed = new EmbedBuilder()
      .setTitle(embeds[name].title)
      .setDescription(embeds[name].description)
      .setColor('#fee1f2');

    if (embeds[name].image) embed.setImage(embeds[name].image);
    if (embeds[name].thumb) embed.setThumbnail(embeds[name].thumb);

    const msg = await message.channel.send({ embeds: [embed] });

    embeds[name].messageId = msg.id;
    embeds[name].channelId = message.channel.id;
    saveEmbeds();
  }

  // ===============================
  // ROLE PANEL
  // !roles create name
  // ===============================
  if (args[0] === '!roles' && args[1] === 'create') {
    const name = args[2];

    embeds[name] = {
      type: 'roles',
      title: 'Pick roles',
      description: 'React below',
      messageId: null,
      channelId: null
    };

    saveEmbeds();
    message.reply(`✅ role panel "${name}" created`);
  }

  // ===============================
  // SHOW ROLE PANEL
  // ===============================
  if (args[0] === '!roles' && args[1] === 'show') {
    const name = args[2];
    if (!embeds[name]) return;

    const embed = new EmbedBuilder()
      .setTitle(embeds[name].title)
      .setDescription(embeds[name].description)
      .setColor('#fee1f2');

    const msg = await message.channel.send({ embeds: [embed] });

    // CUSTOM EMOJIS (FIXED)
    await msg.react('1472242557881815050');
    await msg.react('1472242466609434789');
    await msg.react('1472241395975585844');
    await msg.react('1472242032700559598');
    await msg.react('1471859515266830449');

    embeds[name].messageId = msg.id;
    embeds[name].channelId = message.channel.id;
    saveEmbeds();
  }
});

// ===============================
const reactionRoles = {
  'bowbydelaDNS': '1449123125202518016',
  'cherrybydelaDNS': '1449123286914175039',
  'wing1bydelaDNS': '1449122330423853106',
  'wing2bydelaDNS': '1449123442183110920',
  'heartbydelaDNS': '1460633553883631814'
};

// ===============================
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(roleId);
});

// ===============================
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.remove(roleId);
});

// ===============================
client.login(process.env.TOKEN);
