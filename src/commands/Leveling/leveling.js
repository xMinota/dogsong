import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js-light'
import db from 'quick.db'

const cfg = new db.table('config')

class LevelingCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'leveling',
      description: 'Toggle leveling for your server.',
      category: 'Leveling',
      aliases: [],
      usage: 'leveling [on/off]',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    const admins = cfg.get(`${msg.guild.id}.admins`) || []
    const mods = cfg.get(`${msg.guild.id}.mods`) || []
    if (!msg.member.roles.cache.some(role => admins.includes(role.id)) && !msg.member.roles.cache.some(role => mods.includes(role.id)) && !msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_SERVER')) {
      this.client.emit('customError', 'You do not have permission to execute this command.', msg)
      return false
    }
    if (!args[0]) {
      if (cfg.get(`${msg.guild.id}.leveling`)) {
        cfg.set(`${msg.guild.id}.leveling`, false)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        msg.reply(embed)
        return true
      } else if (!cfg.get(`${msg.guild.id}.leveling`)) {
        cfg.set(`${msg.guild.id}.leveling`, true)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        msg.reply(embed)
        return true
      } 
    } else {
      if (args[0] !== 'on' && args[0] !== 'off') {
        this.client.emit('customError', 'You need to provide \`on\` or \`off\` as an argument.', msg)
        return false
      }
      if (args[0] === 'on') {
        cfg.set(`${msg.guild.id}.leveling`, true)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **enabled** leveling in **${msg.guild.name}**!`)
        msg.reply(embed)
        return true
      } else if (args[0] === 'off') {
        cfg.set(`${msg.guild.id}.leveling`, false)
        const embed = new MessageEmbed()
          .setColor(color)
          .addField('<:check:820704989282172960> Success!', `Successfully **disabled** leveling in **${msg.guild.name}**!`)
        msg.reply(embed)
        return true
      }
    }
  }
}

module.exports = LevelingCommand
