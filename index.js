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
      .setDescription('               # ˗ˏˋ ꒰  order<:bowbydelaDNS:1471856216308449386><:bowbydelaDNS:1471856231713865816> ꒱ ˎˊ˗
꒰ <:bow2bydelaDNS:1471856534278508556><:bow2bydelaDNS:1471856516771614832> ꒱ ˖. tickets
 <:emojicdelaDNS:1471853478262472918> ˖.  **__read <#info> & <#prices> before opening ticket__** 

꒰ <:bow2bydelaDNS:1471856534278508556><:bow2bydelaDNS:1471856516771614832> ꒱ ˖. payment
 <:emojicdelaDNS:1471853478262472918> ˖.  **__must have payment ready __**

꒰ <:bow2bydelaDNS:1471856534278508556><:bow2bydelaDNS:1471856516771614832> ꒱ ˖. order
 <:emojicdelaDNS:1471853478262472918> ˖.  **__provide all details of what you are ordering __**')
      .setColor(fee1f2);

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);

});

client.login(process.env.TOKEN);

