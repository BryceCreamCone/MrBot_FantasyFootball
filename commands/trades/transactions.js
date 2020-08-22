import fetch from 'cross-fetch'
import allPlayers from '../../players.js'
import sleeper from '../../sleeper.js'

const API = 'https://api.sleeper.app/v1'


const getPlayers = (playerIds) => (
  playerIds.map((playerId) => allPlayers[playerId])
)

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

export const getAllTranscations = async (type, year) => {
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

export const tradesObjToString = (tradesObj) => {
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