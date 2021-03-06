import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'
import utils from '../../utils/utils'
const eco = new db.table('economy') 
const cfg = new db.table('config')

class StartCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'start',
      description: 'Registers your bank account.',
      category: 'Economy',
      aliases: [],
      usage: 'start',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (eco.get(`${msg.author.id}.started`)) {
      this.client.emit('customError', 'You already have a bank account!', msg)
      return false
    }
    eco.set(`${msg.author.id}.started`, true)
    eco.set(`${msg.author.id}.balance`, 100)
    eco.set(`${msg.author.id}.bank`, 0)
    eco.set(`${msg.author.id}.prestige`, 1)
    eco.set(`${msg.author.id}.multiplier`, 1)
    eco.set(`${msg.author.id}.items.flimsy_fishing_rod`, 1)
    const e = new MessageEmbed()
      .setColor(color)
      .addField('<:check:820704989282172960> Success!', `Successfully created your bank account. You've also received a :fishing_pole_and_fish: **Flimsy Fishing Rod**, you may fish using \`${utils.getPrefix(msg.guild.id)}fish\`. See the help page for :bank: **Economy** to learn how to make money!`)
    msg.reply(e)
    return true
  }
}

module.exports = StartCommand