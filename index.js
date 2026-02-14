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

  // only add if provided
  if (image) embed.setImage(image);
  if (thumb) embed.setThumbnail(thumb);

  message.channel.send({ embeds: [embed] });
});

