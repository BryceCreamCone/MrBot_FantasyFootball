import Discord from 'discord.js'
import fetch from 'cross-fetch'
import CommonTags from 'common-tags'
const { stripIndents } = CommonTags
import allPlayers from './players.js'
import auth from './token.js'
import rules from './rules.js'
import sleeper from './sleeper.js'

const API = 'https://api.sleeper.app/v1'
const CURRENT_SEASON = 2020
const LAST_SEASON = CURRENT_SEASON - 1


const getPlayer = (playerId) => allPlayers[playerId]

const getPlayers = (playerIds) => (
  playerIds.map((playerId) => allPlayers[playerId])
)

const draftOrderJSON = (year) => (
  fetch(`${API}/draft/${sleeper.drafts[year]}/picks`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

const filterDraftJSON = async (year) => {
  const draftJSON = await draftOrderJSON(year)
  return draftJSON.map((pick) => ({
    round: pick.round,
    pickNumber: pick.pick_no,
    position: pick.metadata.position,
    name: `${pick.metadata.first_name} ${pick.metadata.last_name}`,
    pickedBy: pick.picked_by,
  }))
}

const draftRoundToString = (draftObj, round) => {
  let returnString = `\n`
  draftObj
    .filter((pick) => pick.pickNumber <= round * 12 && pick.pickNumber > (round - 1) * 12)
    .forEach((pick) => {
      returnString += stripIndents`
        [${sleeper.owners[pick.pickedBy].name}]
        ${pick.round} : ${pick.pickNumber % 12 || 12} (${pick.pickNumber})
        + ${pick.position} - ${pick.name}
      `
      returnString += '\n'
    })
  return `\`\`\`diff${returnString}\`\`\``
}

const draftRoundsToString = (draftObj, fromRound = 1, upToRound = 16) => {
  let draftRoundsStrings = []
  while (upToRound >= fromRound) {
    const draftRoundString = draftRoundToString(draftObj, upToRound)
    draftRoundsStrings.unshift(draftRoundString)
    upToRound -= 1
  }
  return draftRoundsStrings
}

const tradedPicksJSON = (year) => (
  fetch(`${API}/league/${sleeper.leagueId[year]}/traded_picks`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

const filterTradedPicksJSON = async (year) => {
  const tradedPicks = await tradedPicksJSON(year)
  if (!validObject(tradedPicksJSON)) return []
  return tradedPicks.map((pick) => ({
    round: pick.round,
    season: Number(pick.season),
    from: pick.previous_owner_id,
    to: pick.owner_id,
  })).sort((pick1, pick2) => {
    if (pick1.season > pick2.season) return 1
    if (pick1.season < pick2.season) return -1
    if (pick1.round > pick2.round) return 1
    if (pick1.round < pick2.round) return -1
    return 0
  })
}

const tradedPicksToString = (picksObj) => {
  const { owners } = sleeper
  let returnString = `\n`
  picksObj.forEach((pick) => {
    const [senderId] = Object.keys(owners).filter((userId) => owners[userId].rosterId === pick.from)
    const [recipientId] = Object.keys(owners).filter((userId) => owners[userId].rosterId === pick.to)

    returnString += `
+ ===> TO:   ${owners[recipientId].name}
- <=== FROM: ${owners[senderId].name}
       PICK: ${pick.season} Round ${pick.round}\n`
  })
  return `\`\`\`diff${returnString}\`\`\``
}

const transactionsJSON = (year, week) => (
  fetch(`${API}/league/${sleeper.leagueId[year]}/transactions/${week}`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

const getAddsforOwner = (transaction, rosterId) => {
  const { adds, draft_picks: picks } = transaction
  let itemsReceived = {}
  const players = Object.keys(adds).filter((playerId) => adds[playerId] === rosterId)
  itemsReceived.players = players
  const draftPicks = picks.filter((pick) => pick.owner_id === rosterId)
  itemsReceived.draftPicks = draftPicks
  return itemsReceived
}

const getDropsforOwner = (transaction, rosterId) => {
  const { drops, draft_picks: picks } = transaction
  let itemsGiven = {}
  const players = Object.keys(drops).filter((playerId) => drops[playerId] === rosterId)
  itemsGiven.players = players
  const draftPicks = picks.filter((pick) => pick.previous_owner_id === rosterId)
  itemsGiven.draftPicks = draftPicks
  return itemsGiven
}

const filterTransactionsJSON = async (type, year, week) => {
  const transactions = await transactionsJSON(year, week)
  if (!validObject(transactionsJSON)) return []
  return transactions
    .filter((transaction) => transaction.type === type)
    .map((transaction) => ({
      week,
      ownerOne: transaction.roster_ids[0],
      ownerTwo: transaction.roster_ids[1],
      adds: {
        ownerOne: getAddsforOwner(transaction, transaction.roster_ids[0]),
        ownerTwo: getAddsforOwner(transaction, transaction.roster_ids[1]),
      },
      drops: {
        ownerOne: getDropsforOwner(transaction, transaction.roster_ids[0]),
        ownerTwo: getDropsforOwner(transaction, transaction.roster_ids[1]),
      },
    }))
}

const getAllTranscations = async (type, year) => {
  let transactionsArray = []
  let week = type === 'trade' ? 11 : 14
  while (week > 0) {
    const weeklyTransactions = await filterTransactionsJSON(type, year, week)
    transactionsArray.push(...weeklyTransactions)
    week -= 1
  }
  return transactionsArray
}

const playerString = (player) => (
`    ${player.position} - ${player.team} ${player.full_name || player.first_name + ' ' + player.last_name}\n`)

const playersToPlayerStrings = (playersArr) => {
  let returnString = ``
  playersArr.forEach((player) => {
    returnString += playerString(player)
  })
  return returnString
}

const pickToString = (pick) => (
`    ${pick.season} - Round ${pick.round}\n`
)

const picksToString = (picksArr) => {
  let returnString = ``
  picksArr.forEach((pick) => {
    returnString += pickToString(pick)
  })
  return returnString
}

const tradesObjToString = (tradesObj) => {
  const { owners } = sleeper
  let returnString = ``
  tradesObj.forEach((trade) => {
    const [ownerOneId] = Object.keys(owners).filter((userId) => owners[userId].rosterId === trade.ownerOne)
    const [ownerTwoId] = Object.keys(owners).filter((userId) => owners[userId].rosterId === trade.ownerTwo)
    const ownerOnePlayersAdded = getPlayers(trade.adds.ownerOne.players)
    const ownerTwoPlayersAdded = getPlayers(trade.adds.ownerTwo.players)
    const ownerOnePicksAdded = trade.adds.ownerOne.draftPicks
    const ownerTwoPicksAdded = trade.adds.ownerTwo.draftPicks

    returnString += `
+ Week ${trade.week}
◯ ${owners[ownerOneId].name} ➡ ${owners[ownerTwoId].name}`

    if (ownerTwoPlayersAdded.length > 0) {
      returnString += `
  Players:
${playersToPlayerStrings(ownerTwoPlayersAdded)}`
    }

    if (ownerTwoPicksAdded.length > 0) {
      returnString += `
  Draft Picks:
${picksToString(ownerTwoPicksAdded)}`
    }

    returnString += `
◯ ${owners[ownerTwoId].name} ➡ ${owners[ownerOneId].name}`

    if (ownerOnePlayersAdded.length > 0) {
      returnString += `
  Players:
${playersToPlayerStrings(ownerOnePlayersAdded)}`
    }

    if (ownerOnePicksAdded.length > 0) {
      returnString += `
  Draft Picks:
${picksToString(ownerOnePicksAdded)}`
    }
  })
  return `\`\`\`diff${returnString}\`\`\``
}

const reply = async (message) => {
  try {
    if (message.content[0] === "!") {
      const [cmd, ...args] = message.content.slice(1).split(' ')
      switch (cmd) {
        case 'hello':
          message.channel.send('Hello, World!')
          return
        case 'draft':
          const [year, fromRound, toRound] = args
          const draftObject = await filterDraftJSON(year || LAST_SEASON)
          if (draftObject) {
            message.channel.send('No draft results are available for that year')
            return
          }
          else {
            const roundStrings = draftRoundsToString(draftObject, fromRound, toRound)
            for (const roundString of roundStrings) {
              message.channel.send(roundString)
            }
          }
          return
        case 'trades':
          switch(args[0]) {
            case 'picks':
              const picksObject = await filterTradedPicksJSON(args[1] || CURRENT_SEASON)
              const tradedPicksString = tradedPicksToString(picksObject)
              message.channel.send(tradedPicksString)
              return
            case 'all':
              const tradesObj = await getAllTranscations('trade', LAST_YEAR)
              const tradesString = tradesObjToString(tradesObj)
              message.channel.send(tradesString)
              return
            default:
              return
          }
        case 'rules':
          message.channel.send({ embed: rules })
          return
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