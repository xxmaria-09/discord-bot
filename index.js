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

function saveEmbeds() {
  fs.writeFileSync("./embeds.json", JSON.stringify(embeds, null, 2));
}

// ===============================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===============================
// ASK FUNCTION (CLEAN)
// ===============================
async function ask(question, message) {
  const filter = m => m.author.id === message.author.id;

  await message.channel.send(question);

  try {
    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 60000,
      errors: ["time"]
    });

    const answer = collected.first().content.trim();
    if (answer.toLowerCase() === "skip") return null;

    return answer;

  } catch {
    message.channel.send("❌ Timed out");
    return null;
  }
}

// ===============================
// PREVIEW EMBED
// ===============================
function createEmbed(data) {
  const embed = new EmbedBuilder().setColor("#fee1f2");

  if (data.title) embed.setTitle(data.title);
  if (data.description) embed.setDescription(data.description);
  if (data.image) embed.setImage(data.image);
  if (data.thumb) embed.setThumbnail(data.thumb);

  return embed;
}

// ===============================
// COMMANDS
// ===============================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const cmd = args[0];
  const sub = args[1];
  const name = args[2];

  // ===============================
  // BUILD (NORMAL + ROLES)
  // ===============================
  if ((cmd === "!embed" || cmd === "!roles") && sub === "build") {
    if (!name) return message.reply("❌ Give a name");

    let data = {
      title: null,
      description: null,
      image: null,
      thumb: null,
      channelId: null,
      messageId: null,
      type: cmd === "!roles" ? "roles" : "normal"
    };

    message.channel.send("🛠 Starting builder...");

    // TITLE
    data.title = await ask("📌 Title:", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    // DESCRIPTION
    data.description = await ask("📝 Description:", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    // IMAGE
    data.image = await ask("🖼 Image URL (or skip):", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    // THUMB
    data.thumb = await ask("🔳 Thumbnail URL (or skip):", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    embeds[name] = data;
    saveEmbeds();

    message.channel.send(`✅ Saved **${name}**`);
  }

  // ===============================
  // SEND
  // ===============================
  if ((cmd === "!embed" || cmd === "!roles") && sub === "send") {
    if (!embeds[name]) return message.reply("❌ Not found");

    const data = embeds[name];
    const embed = createEmbed(data);

    const msg = await message.channel.send({ embeds: [embed] });

    data.channelId = message.channel.id;
    data.messageId = msg.id;

    saveEmbeds();

    if (data.type === "roles") {
      await msg.react('<:bowbydelaDNS:1472242557881815050>');
      await msg.react('<:cherrybydelaDNS:1472242466609434789>');
      await msg.react('<:wing1bydelaDNS:1472241395975585844>');
      await msg.react('<:wing2bydelaDNS:1472242032700559598>');
      await msg.react('<:heartbydelaDNS:1471859515266830449>');
    }
  }

  // ===============================
  // EDIT (LIVE UPDATE)
  // ===============================
  if ((cmd === "!embed" || cmd === "!roles") && sub === "edit") {
    if (!embeds[name]) return message.reply("❌ Not found");

    let data = embeds[name];

    message.channel.send("✏️ Editing...");

    const title = await ask("📌 New title (or skip):", message);
    if (title) data.title = title;

    await message.channel.send({ embeds: [createEmbed(data)] });

    const desc = await ask("📝 New description (or skip):", message);
    if (desc) data.description = desc;

    await message.channel.send({ embeds: [createEmbed(data)] });

    const img = await ask("🖼 New image (or skip):", message);
    if (img !== null) data.image = img;

    await message.channel.send({ embeds: [createEmbed(data)] });

    const thumb = await ask("🔳 New thumbnail (or skip):", message);
    if (thumb !== null) data.thumb = thumb;

    saveEmbeds();

    // UPDATE MESSAGE
    if (data.channelId && data.messageId) {
      const channel = await client.channels.fetch(data.channelId);
      const msg = await channel.messages.fetch(data.messageId);

      await msg.edit({ embeds: [createEmbed(data)] });
    }

    message.channel.send(`✅ Updated **${name}**`);
  }

  // ===============================
  // DELETE
  // ===============================
  if ((cmd === "!embed" || cmd === "!roles") && sub === "delete") {
    if (!embeds[name]) return message.reply("❌ Not found");

    delete embeds[name];
    saveEmbeds();

    message.channel.send(`🗑 Deleted **${name}**`);
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
