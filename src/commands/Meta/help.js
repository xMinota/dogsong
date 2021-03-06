import { MessageEmbed } from 'discord.js-light'
import Command from '../../structs/command'
import key from '../../resources/key.json'
import utils from '../../utils/utils'
import db from 'quick.db'

const cfg = new db.table('config')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'Grabs a list of one or all commands.',
      aliases: ['h'],
      category: 'Meta',
      usage: 'help [command]',
      cooldown: 2.5
    })
  }

  async run (bot, msg, args) {
    const color = cfg.get(`${msg.author.id}.color`) || msg.member.roles.highest.color
    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(color)
        .setAuthor(`${this.client.user.username}'s Commands`, this.client.user.avatarURL())
      const commandsList = this.client.commands
      const categories = []
      const commandsInCategory = []
      commandsList.forEach(command => {
        const category = command.conf.category
        if (!categories.includes(category)) {
          const disabledModules = cfg.get(`${msg.guild.id}.disabledModules`) || []
          let check
          if (category === 'Admin' && msg.author.id !== '488786712206770196') check = false
          else check = true
          if (!disabledModules.includes(category) && check) categories.push(category)
        }
      })
      commandsList.forEach(command => {
        if (commandsInCategory[command.conf.category] === undefined) {
          commandsInCategory[command.conf.category] = []
        }
        const disabledCommands = cfg.get(`${msg.guild.id}.disabledCommands`) || []
        if (command.conf.enabled === true && !disabledCommands.includes(command.conf.name)) {
          if (command.conf.subcommands) {
            command.conf.subcommands.forEach(subcommand => {
              commandsInCategory[command.conf.category].push(`${command.conf.name} ${subcommand}`)
            })
          }
          commandsInCategory[command.conf.category].push(command.conf.name)
        }
      })
      categories.forEach(category => {
        embed.addField(`${key[category]} ${category} (${commandsInCategory[category].length})`, `\`${utils.getPrefix(msg.guild.id)}${commandsInCategory[category].join(`\`, \`${utils.getPrefix(msg.guild.id)}`)}\``)
      })
      embed.addField(' ᅟᅟᅟᅟᅟᅟᅟᅟ', 'Need help with [wushi](https://www.youtube.com/watch?v=HjlrejIg4Vg)? Join our [support server](https://discord.gg/zjqeYbNU5F)!')
      msg.reply(embed)
      return true
    } else {
      const embed = new MessageEmbed()
      let command = args[0]
      if (this.client.commands.has(command) || this.client.aliases.has(command)) {
        command = this.client.commands.get(command)
        if (!command) {
          let c = this.client.aliases.get(args[0])
          command = this.client.commands.get(c)
        }
        let aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        if (!aliases) aliases = 'None'
        else aliases = command.conf.aliases.toString().replace(/[|]/gi, ' ').replace(/,/gi, ', ')
        embed
          .setColor(color)
          .addField('Command', `\`${command.conf.name}\``)
          .addField('Description', command.conf.description)
          .addField('Usage', `\`${utils.getPrefix(msg.guild.id)}${command.conf.usage}\``)
          .addField('Category', `${key[command.conf.category]} **${command.conf.category}**`)
          .addField('Aliases', aliases)
        if (command.conf.cooldown !== false) embed.addField('Cooldown', `**${command.conf.cooldown}s** (**${command.conf.cooldown / 2}s** for Premium users)`)
        msg.reply(embed)
        return true
      } else {
        this.client.emit('customError', 'The provided command must be valid command/alias.', msg)
        return false
      }
    }
  }
}

module.exports = HelpCommand