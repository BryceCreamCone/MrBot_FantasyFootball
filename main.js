import Discord from 'discord.js'
import auth from './token.js'
import rules from './rules.js'
import * as Draft from './commands/draft.js'
import * as Picks from './commands/trades/picks.js'
import * as Trades from './commands/trades/transactions.js'

const CURRENT_SEASON = 2020
const LAST_SEASON = CURRENT_SEASON - 1

const reply = async (message) => {
  try {
    if (message.content[0] === "!") {
      const [cmd, ...args] = message.content.slice(1).split(' ')
      switch (cmd) {
        case 'draft': {
          const { owner, rounds, year } = Draft.getDraftArgs(args)
          const [fromRound, toRound] = rounds
          const draftObject = await Draft.filterDraftJSON(year || LAST_SEASON)
          const roundStrings = Draft.draftRoundsToString(draftObject, fromRound, toRound)
          for (let i=0; i<roundStrings.length; i++) {
            message.channel.send(roundStrings[i])
          }
          return
        }
      case 'rules':
        message.channel.send({ embed: rules })
        return
      case 'trades':
        switch(args[0]) {
          case 'all': {
            const tradesObj = await Trades.getAllTranscations('trade', LAST_SEASON)
            console.log(tradesObj)
            const tradesString = Trades.tradesObjToString(tradesObj)
            message.channel.send(tradesString)
            return
          }
          case 'picks': {
            const picksObject = await Picks.filterTradedPicksJSON(args[1] || CURRENT_SEASON)
            const tradedPicksString = Picks.tradedPicksToString(picksObject)
            message.channel.send(tradedPicksString)
            return
          }
        default:
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


const bot = new Discord.Client()
bot.on('message', (message) => reply(message));
bot.login(auth.token)