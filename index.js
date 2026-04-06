import discord
from discord.ext import commands
from discord import app_commands
import json
import os

intents = discord.Intents.default()
intents.members = True
intents.reactions = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

EMBED_FILE = "embeds.json"
ROLES_FILE = "reaction_roles.json"

# =========================
# LOAD / SAVE
# =========================
def load_json(file):
    if not os.path.exists(file):
        return {}
    with open(file, "r") as f:
        return json.load(f)

def save_json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

embeds = load_json(EMBED_FILE)
roles_data = load_json(ROLES_FILE)

# =========================
# READY
# =========================
@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"Logged in as {bot.user}")

# =========================
# EMBED CREATE
# =========================
@bot.tree.command(name="embed_create")
async def embed_create(
    interaction: discord.Interaction,
    name: str,
    title: str,
    description: str,
    image: str = None,
    thumbnail: str = None
):
    embeds[name] = {
        "title": title,
        "description": description,
        "image": image,
        "thumbnail": thumbnail
    }

    save_json(EMBED_FILE, embeds)
    await interaction.response.send_message(f"✅ Created `{name}`", ephemeral=True)

# =========================
# EMBED SEND
# =========================
@bot.tree.command(name="embed_send")
async def embed_send(
    interaction: discord.Interaction,
    name: str,
    channel: discord.TextChannel
):
    if name not in embeds:
        await interaction.response.send_message("❌ Not found", ephemeral=True)
        return

    data = embeds[name]

    embed = discord.Embed(
        title=data["title"],
        description=data["description"],
        color=0xFFFFFF
    )

    if data.get("image"):
        embed.set_image(url=data["image"])
    if data.get("thumbnail"):
        embed.set_thumbnail(url=data["thumbnail"])

    msg = await channel.send(embed=embed)

    embeds[name]["message_id"] = msg.id
    embeds[name]["channel_id"] = channel.id
    save_json(EMBED_FILE, embeds)

    await interaction.response.send_message("✅ Sent!", ephemeral=True)

# =========================
# EMBED EDIT
# =========================
@bot.tree.command(name="embed_edit")
async def embed_edit(
    interaction: discord.Interaction,
    name: str,
    title: str = None,
    description: str = None,
    image: str = None,
    thumbnail: str = None
):
    if name not in embeds:
        await interaction.response.send_message("❌ Not found", ephemeral=True)
        return

    data = embeds[name]

    if title:
        data["title"] = title
    if description:
        data["description"] = description
    if image is not None:
        data["image"] = image
    if thumbnail is not None:
        data["thumbnail"] = thumbnail

    save_json(EMBED_FILE, embeds)

    # AUTO UPDATE MESSAGE
    if "message_id" in data:
        try:
            channel = bot.get_channel(data["channel_id"])
            msg = await channel.fetch_message(data["message_id"])

            embed = discord.Embed(
                title=data["title"],
                description=data["description"],
                color=0xFFFFFF
            )

            if data.get("image"):
                embed.set_image(url=data["image"])
            if data.get("thumbnail"):
                embed.set_thumbnail(url=data["thumbnail"])

            await msg.edit(embed=embed)
        except:
            pass

    await interaction.response.send_message("✅ Updated!", ephemeral=True)

# =========================
# EMBED DELETE
# =========================
@bot.tree.command(name="embed_delete")
async def embed_delete(interaction: discord.Interaction, name: str):
    if name not in embeds:
        await interaction.response.send_message("❌ Not found", ephemeral=True)
        return

    if "message_id" in embeds[name]:
        try:
            channel = bot.get_channel(embeds[name]["channel_id"])
            msg = await channel.fetch_message(embeds[name]["message_id"])
            await msg.delete()
        except:
            pass

    del embeds[name]
    save_json(EMBED_FILE, embeds)

    await interaction.response.send_message("🗑️ Deleted!", ephemeral=True)

# =========================
# EMBED LIST
# =========================
@bot.tree.command(name="embed_list")
async def embed_list(interaction: discord.Interaction):
    if not embeds:
        await interaction.response.send_message("No embeds saved.", ephemeral=True)
        return

    msg = "**Your Embeds:**\n"
    for name in embeds:
        msg += f"\n• {name}"

    await interaction.response.send_message(msg, ephemeral=True)

# =========================
# =========================
# 🔥 YOUR REACTION ROLE SYSTEM (UNCHANGED)
# =========================
# =========================

@bot.tree.command(name="reactionroles_create")
async def create_rr(
    interaction: discord.Interaction,
    name: str,
    title: str,
    description: str,
    emoji1: str,
    role1: discord.Role,
    emoji2: str = None,
    role2: discord.Role = None,
    emoji3: str = None,
    role3: discord.Role = None,
    emoji4: str = None,
    role4: discord.Role = None,
    emoji5: str = None,
    role5: discord.Role = None,
    image: str = None,
    thumbnail: str = None
):
    roles = {}
    pairs = [(emoji1, role1), (emoji2, role2), (emoji3, role3), (emoji4, role4), (emoji5, role5)]

    for emoji, role in pairs:
        if emoji and role:
            roles[emoji] = role.id

    roles_data[name] = {
        "title": title,
        "description": description,
        "roles": roles,
        "image": image,
        "thumbnail": thumbnail
    }

    save_json(ROLES_FILE, roles_data)
    await interaction.response.send_message(f"✅ Created `{name}`", ephemeral=True)

# (SEND / EDIT / DELETE / LIST + REACTION EVENTS SAME AS YOUR SCRIPT — unchanged)

# =========================
# REACTION HANDLING
# =========================
@bot.event
async def on_raw_reaction_add(payload):
    for cfg in roles_data.values():
        if cfg.get("message_id") == payload.message_id:
            guild = bot.get_guild(payload.guild_id)
            member = guild.get_member(payload.user_id)

            if member.bot:
                return

            role_id = cfg["roles"].get(str(payload.emoji))
            if role_id:
                await member.add_roles(guild.get_role(role_id))

@bot.event
async def on_raw_reaction_remove(payload):
    for cfg in roles_data.values():
        if cfg.get("message_id") == payload.message_id:
            guild = bot.get_guild(payload.guild_id)
            member = guild.get_member(payload.user_id)

            role_id = cfg["roles"].get(str(payload.emoji))
            if role_id:
                await member.remove_roles(guild.get_role(role_id))

# =========================
bot.run("YOUR_BOT_TOKEN")
