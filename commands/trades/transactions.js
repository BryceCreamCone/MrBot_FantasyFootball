import fetch from 'cross-fetch'
import sleeper from '../../secrets/sleeper.js'
import * as H from '../../src/helpers.js'

const API = 'https://api.sleeper.app/v1'

const getPlayersJSON = () => (
  fetch(`${API}/players/nfl`)
    .then((resp) => resp.json())
    .catch((error) => console.log(error))
)

const getTransactionsJSON = (year, week) => (
  fetch(`${API}/league/${sleeper.leagueId[year]}/transactions/${week}`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

// large amounts of (mostly) static data, so call this once on file creation
const allPlayers = await getPlayersJSON()

const getAddsforOwner = (transaction, rosterId) => {
  const { adds, draft_picks: picks } = transaction
  const itemsReceived = {}
  const players = Object.keys(adds).filter((playerId) => adds[playerId] === rosterId)
  itemsReceived.players = players
  const draftPicks = picks.filter((pick) => pick.owner_id === rosterId)
  itemsReceived.draftPicks = draftPicks
  return itemsReceived
}

const getDropsforOwner = (transaction, rosterId) => {
  const { drops, draft_picks: picks } = transaction
  const itemsGiven = {}
  const players = Object.keys(drops).filter((playerId) => drops[playerId] === rosterId)
  itemsGiven.players = players
  const draftPicks = picks.filter((pick) => pick.previous_owner_id === rosterId)
  itemsGiven.draftPicks = draftPicks
  return itemsGiven
}

const filterTransactionsJSON = async (type, year, week) => {
  const transactions = await getTransactionsJSON(year, week)
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
  const transactionsArray = []
  let week = type === 'trade' ? 11 : 14
  while (week > 0) {
    transactionsArray.push(filterTransactionsJSON(type, year, week))
    week -= 1
  }
  const promiseArr = await Promise.all(transactionsArray)
  const returnArr = promiseArr.filter((arr) => arr.length > 0)
  return returnArr.flat()
}

const playerString = (player) => {
  if (!player) return `    fudge`
  const playerName = player.full_name || `${player.first_name} ${player.last_name}`
  return `    ${player.position} - ${playerName}\n`
}

const playersToPlayerStrings = (playersArr) => {
  let returnString = ``
  playersArr.forEach((player) => {
    returnString += playerString(player)
  })
  return returnString
}

const pickToString = (pick) => `    ${pick.season} - Round ${pick.round}\n`

const picksToString = (picksArr) => {
  let returnString = ``
  picksArr.forEach((pick) => {
    returnString += pickToString(pick)
  })
  return returnString
}

/* eslint-disable */
const getPlayers = (playerIds) => playerIds.map((playerId) => allPlayers[playerId])
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

export const getTransactionsArgs = (argsArray) => {
  const defaults = {
    type: 'all',
    year: '2021',
  }

  const inputArgs = H.getArgs(argsArray)
  const returnObj = H.replaceNullsWithDefaults(inputArgs, defaults)
  return returnObj
}
