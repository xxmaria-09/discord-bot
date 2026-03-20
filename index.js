const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials
} = require("discord.js");

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

// ================= DATABASE =================
function loadData() {
  return JSON.parse(fs.readFileSync("./data.json", "utf8"));
}
function saveData(data) {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ================= COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");

  // =====================================================
  // CREATE EMBED
  // !embed create name
  // =====================================================
  if (args[0] === "!embed" && args[1] === "create") {
    const name = args[2];
    if (!name) return message.reply("Give a name");

    const data = loadData();
    data.embeds[name] = {
      title: "Title",
      description: "Description",
      image: "",
      thumb: "",
      messageId: null,
      channelId: null
    };
    saveData(data);

    message.reply(`✅ Embed **${name}** created`);
  }

  // =====================================================
  // EDIT EMBED
  // !embed edit name Title | Desc | Image | Thumb
  // =====================================================
  if (args[0] === "!embed" && args[1] === "edit") {
    const name = args[2];
    const content = message.content.split(name)[1];

    if (!content) return;

    const split = content.split("|");

    const data = loadData();
    if (!data.embeds[name]) return message.reply("Embed not found");

    data.embeds[name].title = split[0]?.trim();
    data.embeds[name].description = split[1]?.trim();
    data.embeds[name].image = split[2]?.trim();
    data.embeds[name].thumb = split[3]?.trim();

    saveData(data);

    // AUTO UPDATE MESSAGE
    if (data.embeds[name].messageId) {
      try {
        const channel = await client.channels.fetch(data.embeds[name].channelId);
        const msg = await channel.messages.fetch(data.embeds[name].messageId);

        const embed = new EmbedBuilder()
          .setTitle(data.embeds[name].title)
          .setDescription(data.embeds[name].description)
          .setColor("#fee1f2");

        if (data.embeds[name].image) embed.setImage(data.embeds[name].image);
        if (data.embeds[name].thumb) embed.setThumbnail(data.embeds[name].thumb);

        msg.edit({ embeds: [embed] });
      } catch (e) {}
    }

    message.reply(`✏️ Edited ${name}`);
  }

  // =====================================================
  // SEND EMBED
  // !embed send name
  // =====================================================
  if (args[0] === "!embed" && args[1] === "send") {
    const name = args[2];
    const data = loadData();

    if (!data.embeds[name]) return message.reply("Not found");

    const embed = new EmbedBuilder()
      .setTitle(data.embeds[name].title)
      .setDescription(data.embeds[name].description)
      .setColor("#fee1f2");

    if (data.embeds[name].image) embed.setImage(data.embeds[name].image);
    if (data.embeds[name].thumb) embed.setThumbnail(data.embeds[name].thumb);

    const msg = await message.channel.send({ embeds: [embed] });

    data.embeds[name].messageId = msg.id;
    data.embeds[name].channelId = msg.channel.id;
    saveData(data);
  }

  // =====================================================
  // ROLE PANEL CREATE
  // !roles create name
  // =====================================================
  if (args[0] === "!roles" && args[1] === "create") {
    const name = args[2];

    const data = loadData();
    data.roles[name] = {
      title: "Pick roles",
      description: "React below",
      messageId: null,
      channelId: null
    };
    saveData(data);

    message.reply(`✅ Roles panel ${name} created`);
  }

  // =====================================================
  // ROLE PANEL SEND
  // =====================================================
  if (args[0] === "!roles" && args[1] === "send") {
    const name = args[2];
    const data = loadData();

    if (!data.roles[name]) return;

    const embed = new EmbedBuilder()
      .setTitle(data.roles[name].title)
      .setDescription(data.roles[name].description)
      .setColor("#fee1f2");

    const msg = await message.channel.send({ embeds: [embed] });

    await msg.react("<:bowbydelaDNS:1472242557881815050>");
    await msg.react("<:cherrybydelaDNS:1472242466609434789>");
    await msg.react("<:wing1bydelaDNS:1472241395975585844>");
    await msg.react("<:wing2bydelaDNS:1472242032700559598>");
    await msg.react("<:heartbydelaDNS:1471859515266830449>");

    data.roles[name].messageId = msg.id;
    data.roles[name].channelId = msg.channel.id;
    saveData(data);
  }
});

// ================= ROLES =================
const reactionRoles = {
  bowbydelaDNS: "1449123125202518016",
  cherrybydelaDNS: "1449123286914175039",
  wing1bydelaDNS: "1449122330423853106",
  wing2bydelaDNS: "1449123442183110920",
  heartbydelaDNS: "1460633553883631814"
};

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(roleId);
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const roleId = reactionRoles[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.remove(roleId);
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
});

// ===============================
client.login(process.env.TOKEN);
