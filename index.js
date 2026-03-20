const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials
} = require('discord.js');

const fs = require("fs");

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
// LOAD DATA
// ===============================
let embeds = JSON.parse(fs.readFileSync("./embeds.json", "utf8"));

// SAVE FUNCTION
function saveEmbeds() {
  fs.writeFileSync("./embeds.json", JSON.stringify(embeds, null, 2));
}

// ===============================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===============================
// ASK FUNCTION (BUILDER)
// ===============================
async function ask(question, message) {
  const filter = m => m.author.id === message.author.id;

  await message.channel.send(question);

  const collected = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  if (!collected.size) return null;

  const answer = collected.first().content;
  if (answer.toLowerCase() === "skip") return null;

  return answer;
}

// ===============================
// COMMANDS
// ===============================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // ===============================
  // BUILD EMBED
  // ===============================
  if (message.content.startsWith('!embed build')) {
    const name = message.content.split(' ')[2];
    if (!name) return message.reply("❌ Give a name");

    const title = await ask("📌 Title:", message);
    const description = await ask("📝 Description:", message);
    const image = await ask("🖼 Image (or skip):", message);
    const thumb = await ask("🔳 Thumbnail (or skip):", message);

    embeds[name] = {
      title,
      description,
      image,
      thumb,
      channelId: null,
      messageId: null,
      type: "normal"
    };

    saveEmbeds();

    message.channel.send(`✅ Saved embed **${name}**`);
  }

  // ===============================
  // BUILD ROLE EMBED
  // ===============================
  if (message.content.startsWith('!roles build')) {
    const name = message.content.split(' ')[2];
    if (!name) return message.reply("❌ Give a name");

    const title = await ask("📌 Title:", message);
    const description = await ask("📝 Description:", message);
    const image = await ask("🖼 Image (or skip):", message);
    const thumb = await ask("🔳 Thumbnail (or skip):", message);

    embeds[name] = {
      title,
      description,
      image,
      thumb,
      channelId: null,
      messageId: null,
      type: "roles"
    };

    saveEmbeds();

    message.channel.send(`✅ Saved ROLE embed **${name}**`);
  }

  // ===============================
  // SEND EMBED
  // ===============================
  if (message.content.startsWith('!embed send') || message.content.startsWith('!roles send')) {
    const name = message.content.split(' ')[2];
    const data = embeds[name];

    if (!data) return message.reply("❌ Not found");

    const embed = new EmbedBuilder()
      .setTitle(data.title || "No title")
      .setDescription(data.description || "No description")
      .setColor("#fee1f2");

    if (data.image) embed.setImage(data.image);
    if (data.thumb) embed.setThumbnail(data.thumb);

    const msg = await message.channel.send({ embeds: [embed] });

    embeds[name].channelId = message.channel.id;
    embeds[name].messageId = msg.id;

    saveEmbeds();

    // ADD REACTIONS IF ROLE EMBED
    if (data.type === "roles") {
      await msg.react('<:bowbydelaDNS:1472242557881815050>');
      await msg.react('<:cherrybydelaDNS:1472242466609434789>');
      await msg.react('<:wing1bydelaDNS:1472241395975585844>');
      await msg.react('<:wing2bydelaDNS:1472242032700559598>');
      await msg.react('<:heartbydelaDNS:1471859515266830449>');
    }
  }

  // ===============================
  // EDIT EMBED (AUTO UPDATE)
  // ===============================
  if (message.content.startsWith('!embed edit') || message.content.startsWith('!roles edit')) {
    const name = message.content.split(' ')[2];
    const data = embeds[name];

    if (!data) return message.reply("❌ Not found");

    const title = await ask("📌 New title (or skip):", message);
    const description = await ask("📝 New description (or skip):", message);
    const image = await ask("🖼 New image (or skip):", message);
    const thumb = await ask("🔳 New thumbnail (or skip):", message);

    if (title) data.title = title;
    if (description) data.description = description;
    if (image !== null) data.image = image;
    if (thumb !== null) data.thumb = thumb;

    saveEmbeds();

    // UPDATE MESSAGE
    if (data.channelId && data.messageId) {
      const channel = await client.channels.fetch(data.channelId);
      const msg = await channel.messages.fetch(data.messageId);

      const embed = new EmbedBuilder()
        .setTitle(data.title || "No title")
        .setDescription(data.description || "No description")
        .setColor("#fee1f2");

      if (data.image) embed.setImage(data.image);
      if (data.thumb) embed.setThumbnail(data.thumb);

      msg.edit({ embeds: [embed] });
    }

    message.channel.send(`✅ Updated **${name}**`);
  }
});

// ===============================
// REACTION ROLES
// ===============================
const reactionRoles = {
  'bowbydelaDNS': '1449123125202518016',
  'cherrybydelaDNS': '1449123286914175039',
  'wing1bydelaDNS': '1449122330423853106',
  'wing2bydelaDNS': '1449123442183110920',
  'heartbydelaDNS': '1460633553883631814'
};

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(roleId);
});

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
