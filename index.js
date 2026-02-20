const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials
} = require('discord.js');

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


// ===============================
// READY
// ===============================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});


// ===============================
// COMMANDS
// ===============================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // =====================================================
  // NORMAL EMBED
  // !embed Title | Description | Image(optional) | Thumb(optional)
  // =====================================================
  if (message.content.startsWith('!embed')) {

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

    return message.channel.send({ embeds: [embed] });
  }


  // =====================================================
  // ROLE PANEL EMBED
  // !roles Title | Description | Image(optional) | Thumb(optional)
  // =====================================================
  if (message.content.startsWith('!roles')) {

    const args = message.content.slice(6).split('|');

    const title = args[0]?.trim();
    const description = args[1]?.trim();
    const image = args[2]?.trim();
    const thumb = args[3]?.trim();

    const embed = new EmbedBuilder()
      .setTitle(title || 'Pick your roles')
      .setDescription(description || 'React to get roles')
      .setColor('#fee1f2');

    if (image) embed.setImage(image);
    if (thumb) embed.setThumbnail(thumb);

    const msg = await message.channel.send({ embeds: [embed] });

    // 🔥 YOUR 5 EMOJIS
    await msg.react('<:bowbydelaDNS:1472242557881815050>');
    await msg.react('<:cherrybydelaDNS:1472242466609434789>');
    await msg.react('<:wing1bydelaDNS:1472241395975585844>');
    await msg.react('<:wing2bydelaDNS:1472242032700559598>');
    await msg.react('<:heartbydelaDNS:1471859515266830449>');
  }
});


// =====================================================
// EMOJI ➜ ROLE MAP (ROLE IDs ONLY)
// =====================================================
const reactionRoles = {
  'bowbydelaDNS': '1449123125202518016',
  'cherrybydelaDNS': '1449123286914175039',
  'wing1bydelaDNS': '1449122330423853106',
  'wing2bydelaDNS': '1449123442183110920',
  'heartbydelaDNS': '1460633553883631814'
};


// ===============================
// ADD ROLE
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
// REMOVE ROLE
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




