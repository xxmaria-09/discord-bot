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
// ASK FUNCTION
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
// CREATE EMBED
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
  // BUILD
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

    data.title = await ask("📌 Title:", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    data.description = await ask("📝 Description:", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    data.image = await ask("🖼 Image URL (or skip):", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    data.thumb = await ask("🔳 Thumbnail URL (or skip):", message);
    await message.channel.send({ embeds: [createEmbed(data)] });

    embeds[name] = data;
    saveEmbeds();

    message.channel.send(`✅ Saved **${name}**`);
  }

  // ===============================
  // SEND (FIXED)
  // ===============================
  if ((cmd === "!embed" || cmd === "!roles") && sub === "send") {
    if (!embeds[name]) return message.reply("❌ Not found");

    const data = embeds[name];
    const embed = createEmbed(data);

    let msg;

    // 👉 EDIT EXISTING MESSAGE IF EXISTS
    if (data.channelId && data.messageId) {
      try {
        const channel = await client.channels.fetch(data.channelId);
        msg = await channel.messages.fetch(data.messageId);

        await msg.edit({ embeds: [embed] });

        // 🧹 REMOVE OLD REACTIONS
        await msg.reactions.removeAll();

      } catch {
        // if message deleted → send new
        msg = await message.channel.send({ embeds: [embed] });
      }
    } else {
      msg = await message.channel.send({ embeds: [embed] });
    }

    // SAVE IDS
    data.channelId = msg.channel.id;
    data.messageId = msg.id;
    saveEmbeds();

    // ADD REACTIONS
    if (data.type === "roles") {
      await msg.react('<:000bowcozi:1489354548077134039>');
      await msg.react('<:000bowstrawb:1489348301403980059>');
      await msg.react('<:000hearts:1489357624049664210>');
      await msg.react('<:000lstrawberry:1489348108662865950>');
      await msg.react('<:000rstrawberry:1489348175423737907>');
    }
  }

  // ===============================
  // EDIT
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

    // UPDATE LIVE MESSAGE
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
  '000bowcozi': '1489354548077134039',
  '000bowstrawb': '1489348301403980059',
  '000hearts': '1489357624049664210',
  '000lstrawberry': '1489348108662865950',
  '000rstrawberry': '1489348175423737907'
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
// KEEP ALIVE
// ===============================
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.login(process.env.TOKEN);
