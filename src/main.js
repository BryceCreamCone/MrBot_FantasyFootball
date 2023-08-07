import Discord from 'discord.js'
import auth from '../secrets/token.js'
import rules from '../commands/rules.js'
import * as Draft from '../commands/draft.js'
import * as Lottery from '../commands/lottery.js'
import * as Picks from '../commands/trades/picks.js'
import * as Trades from '../commands/trades/transactions.js'

const reply = async (message) => {
  try {
    if (message.content[0] === "!") {
      const [cmd, ...args] = message.content.slice(1).split(' ')
      switch (cmd) {
      case 'draft': {
        const { owner, rounds, year } = Draft.getDraftArgs(args)
        const draftObject = await Draft.filterDraftJSON(year)
        const roundStrings = Draft.draftRoundsToString(draftObject, rounds, owner)
        for (let i=0; i<roundStrings.length; i++) {
          if (roundStrings[i].length) message.channel.send(roundStrings[i])
        }
        return
      }
      case 'lottery': {
        const { weights, statics } = Lottery.getLotteryArgs(args)
        const finalDraftOrder = Lottery.createDraftOrder(statics, weights)
        Lottery.announceDraftOrder(message.channel, finalDraftOrder)
        return
      }
      case 'rules': {
        message.channel.send({ embed: rules })
        return
      }
      case 'trades': {
        const { type, year } = Trades.getTransactionsArgs(args)
        if (type === 'all') {
          const tradesObj = await Trades.getAllTranscations('trade', year)
          const tradesString = Trades.tradesObjToString(tradesObj)
          message.channel.send(tradesString)
          return
        }
        const picksObject = await Picks.filterTradedPicksJSON(year)
        const tradedPicksString = Picks.tradedPicksToString(picksObject)
        message.channel.send(tradedPicksString)
        return
      }
      default:
        return
      }
    }
  } catch (error) {
    console.log(error)
    message.channel.send('Oops, I can\'t do that right now. Yell at Bryce')
  }
}


const bot = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
});
bot.on('message', (message) => reply(message));
bot.login(auth.token)