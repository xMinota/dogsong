import Command from '../../structs/command'
import { MessageEmbed } from 'discord.js'
import utils from '../../utils/utils'
import ecoUtils from '../../utils/economy'
import db from 'quick.db'

const eco = new db.table('economy')

class FarmCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'farm',
      description: 'Farm for coins!',
      category: 'Economy',
      aliases: ['till'],
      usage: 'farm',
      cooldown: 10
    })
  }

  async run (bot, msg, args) {
    if (!eco.get(`${msg.author.id}.started`)) {
      return this.client.emit('customError', 'You don\'t have a bank account!', msg)
    }
    const items = eco.get(`${msg.author.id}.items`) || []
    if (
      !items.includes('flimsy_hoe') && 
      !items.includes('decent_hoe') && 
      !items.includes('great_hoe')
    ) {
      return this.client.emit('customError', `You need a hoe to farm, purchase one on the store using \`${utils.getPrefix(msg.guild.id)}buy flimsy_hoe\`.`, msg)
    }
    const harvestInSeason = utils.getRandomInt(1, 4)
    let correctChoice
    let bonus 
    const filter = m => {
      if (m.author.id === msg.author.id) {
        if (m.content.toLowerCase() === 'carrots' || m.content.toLowerCase() === 'corn' || m.content.toLowerCase() === 'tomato') {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
    const chooserEmbed = new MessageEmbed()
      .setColor(msg.member.roles.highest.color)
      .setTitle(':seedling: Farming')
      .setFooter('You have 8 seconds to pick harvest.')
    if (harvestInSeason === 1) {
      chooserEmbed.addField('Vegetable in Season: Carrots :carrot:', 'Choose the most profitable harvest to farm: `Carrots`, `Corn`, `Tomato`. Send your choice in chat, picking the correct harvest will allow you to receive more bonus harvest!')
      correctChoice = 'carrots'
    } else if (harvestInSeason === 2) {
      chooserEmbed.addField('Vegetable in Season: Corn :corn:', 'Choose the most profitable harvest to farm: `Carrots`, `Corn`, `Tomato`. Send your choice in chat, picking the correct harvest will allow you to receive more bonus harvest!')
      correctChoice = 'corn'
    } else if (harvestInSeason === 3) {
      chooserEmbed.addField('Vegetable in Season: Tomato :tomato:', 'Choose the most profitable harvest to farm: `Carrots`, `Corn`, `Tomato`. Send your choice in chat, picking the correct harvest will allow you to receive more bonus harvest!')
      correctChoice = 'tomato'
    }
    const message = await msg.reply(chooserEmbed)
    await msg.channel.awaitMessages(filter, { max: 1, time: 8000, errors: ['time'] })
      .then(collected => {
        const choice = collected.first()
        if (choice.content.toLowerCase() === correctChoice) {
          bonus = utils.getRandomInt(2, 10)
          const quizResult = new MessageEmbed()
            .setColor(msg.member.roles.highest.color) 
            .addField(':seedling: Farming', `**Correct choice!** You will get **+${bonus}** bonus harvest!`)
          collected.first().reply(quizResult)
        } else {
          bonus = 0
          const quizResult = new MessageEmbed()
            .setColor(msg.member.roles.highest.color) 
            .addField(':seedling: Farming', `**Incorrect choice!** You will get no bonus harvest!`)
          collected.first().reply(quizResult)
        }
        let goldChance = 0
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          goldChance = 2.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          goldChance = 7.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          goldChance = 12
        }
        const odds = utils.getRandomInt(0, 100)
        let gold = false
        if (odds < goldChance) {
          gold = true
        } else {
          gold = false
        }

        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          bonus = bonus + 0
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          bonus = bonus + utils.getRandomInt(5, 10)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          bonus = bonus + utils.getRandomInt(12, 18)
        }

        let fertilizerBonus
        if (eco.get(`${msg.author.id}.items`).includes('fertilizer')) {
          let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fertilizer')
          eco.set(`${msg.author.id}.items`, i)
          bonus = bonus + utils.getRandomInt(3, 10)
          fertilizerBonus = true
        }
        const goldBonus = utils.getRandomInt(100, 400)
        let harvestHarvested
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          harvestHarvested = utils.getRandomInt(7, 15)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          harvestHarvested = utils.getRandomInt(10, 35)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          harvestHarvested = utils.getRandomInt(35, 45)
        }
        let profit = 0
        for (let int = 0; int < harvestHarvested + bonus; int++) {
          let amount = utils.getRandomInt(25, 50)
          eco.add(`${msg.author.id}.balance`, amount)
          profit = profit + amount
        }

        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
        if (!fertilizerBonus) {
          embed.addField(':seedling: Farming', `You farmed for **${utils.getRandomInt(1, 320)} hours** and got :seedling: ${harvestHarvested} **(+${bonus})**, you made :coin: **${profit}**!`)
        } else {
          embed.addField(':seedling: Farming', `You farmed for **${utils.getRandomInt(1, 320)} hours** and got :seedling: ${harvestHarvested} ***(+${bonus})***, you made :coin: **${profit}**!`)
        }
        
        if (gold) {
          ecoUtils.addMoney(msg.author.id, goldBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldBonus}** as a bonus.`)
        }
        msg.reply(embed)
      })
      .catch(() => {
        const quizResult = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
          .addField(':seedling: Farming', '**Ran out of time!** You dropped your hoe and you won\'t get a bonus for now!')
        msg.reply(quizResult)
        let bonus = 0 
        let goldChance = 0
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          goldChance = 2.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          goldChance = 7.5
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          goldChance = 12
        }
        const odds = utils.getRandomInt(0, 100)
        let gold = false
        if (odds < goldChance) {
          gold = true
        } else {
          gold = false
        }

        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          bonus = bonus + 0
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          bonus = bonus + utils.getRandomInt(5, 10)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          bonus = bonus + utils.getRandomInt(12, 18)
        }

        let fertilizerBonus
        if (eco.get(`${msg.author.id}.items`).includes('fertilizer')) {
          let i = utils.removeA(eco.get(`${msg.author.id}.items`), 'fertilizer')
          eco.set(`${msg.author.id}.items`, i)
          bonus = bonus + utils.getRandomInt(3, 10)
          fertilizerBonus = true
        }
        const goldBonus = utils.getRandomInt(100, 400)
        let harvestHarvested
        if (eco.get(`${msg.author.id}.items`).includes('flimsy_hoe')) {
          harvestHarvested = utils.getRandomInt(7, 15)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('decent_hoe')) {
          harvestHarvested = utils.getRandomInt(10, 35)
        } 
        if (eco.get(`${msg.author.id}.items`).includes('great_hoe')) {
          harvestHarvested = utils.getRandomInt(35, 45)
        }
        let profit = 0
        for (let int = 0; int < harvestHarvested + bonus; int++) {
          let amount = utils.getRandomInt(25, 50)
          eco.add(`${msg.author.id}.balance`, amount)
          profit = profit + amount
        }

        const embed = new MessageEmbed()
          .setColor(msg.member.roles.highest.color)
        if (!fertilizerBonus) {
          embed.addField(':seedling: Farming', `You farmed for **${utils.getRandomInt(1, 320)} hours** and got :seedling: ${harvestHarvested} **(+${bonus})**, you made :coin: **${profit}**!`)
        } else {
          embed.addField(':seedling: Farming', `You farmed for **${utils.getRandomInt(1, 320)} hours** and got :seedling: ${harvestHarvested} ***(+${bonus})***, you made :coin: **${profit}**!`)
        }
        
        if (gold) {
          ecoUtils.addMoney(msg.author.id, goldBonus)
          embed.addField(':sparkles: Lucky!', `You also found gold! You get :coin: **${goldBonus}** as a bonus.`)
        }
        msg.reply(embed)
      })
  }
}

module.exports = FarmCommand