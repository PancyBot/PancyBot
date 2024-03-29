import { Event } from "../../structures/Events";
import { client } from "../..";
import { fecthDataBase, updateDataBase } from "../../utils/CacheSystem/functions";
import { fecthUsersDataBase, updateUsersDataBase } from "../../utils/CacheSystem/functions";
import { utils } from "../..";
import { Message, TextChannel } from "discord.js";
import { GuildDataFirst } from "../../database/typings/Security";
import { antiRF } from "../../database/BotDataBase";
import { botStaff } from '../../utils/variables.json'
import ms from 'ms';
import antiIpLogger from 'anti-ip-logger'
const mayus = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export let _guild: GuildDataFirst

export default new Event('messageCreate', async msg => {
    const data = await antiRF.findOne({ user: msg.author.id })
    const {guild, author} = msg

    if(!guild) return console.log('No is guild');
    if(!guild.available) return console.log('Guild unavilable');

    let _guild = await fecthDataBase(client, guild, true) as GuildDataFirst;
    if(!_guild) return console.log('No cache');

    console.log(3)
    const prefix = _guild.configuration.prefix
    console.log(prefix)
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const prefixRegex = new RegExp(
        `^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`
      );
    
    if (!prefixRegex.test(msg.content)) return console.log(0);
    console.log(1)
    if(msg.author.bot) return msg.reply('LOS BOTS NO PUEDEN USAR COMANDOS')

    
    const [, matchedPrefix] = msg.content.match(prefixRegex);

    const args = msg.content
      .slice(matchedPrefix.length)
      .trim()
      .split(/ +/g);

    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;
      
    console.log(2)
    const command = client.commandsMsg.get(cmd)
    if(command) {
      let userPermissions = command.userPermissions;
      let botPermissions = command.botPermissions;
      if(!msg.member.permissions.has(userPermissions || [])) return msg.reply(`No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof userPermissions === 'string' ? userPermissions : userPermissions.join(', ')}\``)
      if(!msg.guild.members.cache.get(client.user.id).permissions.has(botPermissions || [])) return msg.reply(`No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``)
      if(command.isDev) {
        if(msg.author.id !== botStaff.ownerBot) return msg.reply('Comando solo de desarrollador')
        command.run({
          args,
          client,
          message: msg,
          _guild: _guild
        })
      } else if(command.inVoiceChannel) {
        if(!msg.member.voice.channel) return msg.reply('Necesitas unirte a un canal de vox')
        command.run({
            args,
            client,
            message: msg,
            _guild: _guild
        })
      } else {
        command.run({
          args,
          client,
          message: msg,
          _guild: _guild
        })
      }
    } else {
      msg.reply('No existe el comando:' + cmd)
    }
  }
)