import { MessageEmbed } from 'discord.js'
import Command from '../../structs/command'
import utils from '../../utils/utils'
import db from 'quick.db'
const cfg = new db.table('config')

class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      description: 'Sets the prefix for the bot in your server.',
      aliases: ['p', 'pre'], 
      cooldown: 4.5,
      category: 'Configuration',
      usage: 'prefix <text>'
    })
  }

  async run (bot, msg, args) {
    //TODO: Create admin permissions setup via wushi.
    if (!args[0]) {
      this.client.emit('customError', 'You need to assign a new prefix!', msg)
    } else {
      cfg.set(`${msg.guild.id}.prefix`, args[0])
      const embed = new MessageEmbed()
        .addField('<:check:820704989282172960> Success!', `The prefix for the server has successfully been changed to \`${args[0]}\`.`)
        .setColor(msg.member.roles.highest.color)
      msg.reply(embed)
    }
  }
}

module.exports = PrefixCommand