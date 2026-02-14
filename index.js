const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ]
});


// ===============================
// BOT READY
// ===============================
client.once('ready', () => {
  console.log('Bot is online!');
});


// ===============================
// EMBED COMMAND
// !embed Title | Description | Image(optional) | Thumbnail(optional)
// ===============================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // ---------- NORMAL EMBED ----------
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


  // ---------- REACTION ROLES EMBED ----------
  if (message.content === '!roles') {

    const embed = new EmbedBuilder()
      .setTitle('Choose your roles')
      .setDescription(
        '꒰ <:bowbydelaDNS:1472242557881815050> ꒱ ˖. **__comms__**
 <:emojicdelaDNS:1471853478262472918> ˖.  <@&1449123125202518016>

꒰ <:cherrybydelaDNS:1472242466609434789>  ꒱ ˖. **__annc__**
 <:emojicdelaDNS:1471853478262472918> ˖.  <@&1449123286914175039>

꒰ <:wing1bydelaDNS:1472241395975585844>   ꒱ ˖. **__giveaways__**
 <:emojicdelaDNS:1471853478262472918> ˖.  <@&1449122330423853106>

꒰ <:wing2bydelaDNS:1472242032700559598>   ꒱ ˖. **__sales__**
 <:emojicdelaDNS:1471853478262472918> ˖.  <@&1449123442183110920>

꒰ <:heartbydelaDNS:1471859515266830449>   ꒱ ˖. **__stocks__**
 <:emojicdelaDNS:1471853478262472918> ˖.  <@&1460633553883631814>
      )
      .setColor('#fee1f2');

    const msg = await message.channel.send({ embeds: [embed] });

    // 🔥 PUT YOUR 5 EMOJIS HERE
    await msg.react('<:emojicdelaDNS:1471853478262472918>');
    await msg.react('<:cherrybydelaDNS:1472242466609434789>');
    await msg.react('<:wing1bydelaDNS:1472241395975585844>');
    await msg.react('<:wing2bydelaDNS:1472242032700559598>');
    await msg.react('<:heartbydelaDNS:1471859515266830449>');
  }
});


// ===============================
// ROLE IDs + EMOJIS MAP
// 🔥 EDIT HERE ONLY
// ===============================
const reactionRoles = {
  '<:emojicdelaDNS:1471853478262472918>': '<@&1449123125202518016>',
  '<:cherrybydelaDNS:1472242466609434789>': '<@&1449123286914175039>',
  '<:wing1bydelaDNS:1472241395975585844>': '<@&1449122330423853106>',
  '<:wing2bydelaDNS:1472242032700559598>': '<@&1449123442183110920>',
  '<:heartbydelaDNS:1471859515266830449>': '<@&1460633553883631814>'
};


// ===============================
// ADD ROLE WHEN REACT
// ===============================
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(roleId);
});


// ===============================
// REMOVE ROLE WHEN UNREACT
// ===============================
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.remove(roleId);
});


client.login(process.env.TOKEN);


