import fetch from 'cross-fetch'
import sleeper from '../../secrets/sleeper.js'
import * as H from '../../src/helpers.js'

const API = 'https://api.sleeper.app/v1'
const { owners } = sleeper

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

// Large amounts of (mostly) static data, so call this once on file creation
const allPlayers = await getPlayersJSON()

const getAddsforOwner = (transaction, userId) => {
  console.log(userId)
  const { adds, draft_picks: picks } = transaction
  console.log(adds)
  const itemsReceived = {}
  const players = Object.keys(adds).filter((playerId) => adds[playerId] === owners[userId].rosterId)
  itemsReceived.players = players
  const draftPicks = picks.filter((pick) => pick.owner_id === owners[userId].rosterId)
  itemsReceived.draftPicks = draftPicks
  return itemsReceived
}

const getDropsforOwner = (transaction, userId) => {
  const { drops, draft_picks: picks } = transaction
  const itemsGiven = {}
  const players = Object.keys(drops).filter((playerId) => drops[playerId] === owners[userId].rosterId)
  itemsGiven.players = players
  const draftPicks = picks.filter((pick) => pick.previous_owner_id === owners[userId].rosterId)
  itemsGiven.draftPicks = draftPicks
  return itemsGiven
}

const getOwnerIdsFromTransaction = (relaventOwners, transaction) => ([
  Object.entries(relaventOwners).filter(([, { rosterId }]) => transaction.roster_ids[0] === rosterId)[0][0],
  Object.entries(relaventOwners).filter(([, { rosterId }]) => transaction.roster_ids[1] === rosterId)[0][0]
])
const getOwnersForYear = (year) => (
  Object.entries(owners)
  .filter(([, { yearsActive }]) => yearsActive.includes(year))
  .reduce((prev, [userId, userInfo]) => ({ ...prev, [userId]: userInfo }), {})
)
const filterTransactionsJSON = async (type, year, week) => {
  const relaventOwners = getOwnersForYear(year)
  const transactions = await getTransactionsJSON(year, week)
  return transactions
    .filter((transaction) => transaction.type === type)
    .map((transaction) => ({ ...transaction, ownerIds: getOwnerIdsFromTransaction(relaventOwners, transaction) }))
    .map((transaction) => ({
      week,
      ownerOneId: transaction.ownerIds[0],
      ownerTwoId: transaction.ownerIds[1],
      adds: {
        ownerOne: getAddsforOwner(transaction, transaction.ownerIds[0]),
        ownerTwo: getAddsforOwner(transaction, transaction.ownerIds[1]),
      },
      drops: {
        ownerOne: getDropsforOwner(transaction, transaction.ownerIds[0]),
        ownerTwo: getDropsforOwner(transaction, transaction.ownerIds[1]),
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
  const promiseArr = await Promise.all(transactionsArray).catch((err) => console.log(err))
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
// TODO: Differentiate active owners by year
const getPlayers = (playerIds) => playerIds.map((playerId) => allPlayers[playerId])
export const tradesObjToString = (tradesObj) => {
  let returnString = ``
  tradesObj.forEach((trade) => {
    const { adds, ownerOneId, ownerTwoId, week } = trade
    const ownerOnePlayersAdded = getPlayers(adds.ownerOne.players)
    const ownerTwoPlayersAdded = getPlayers(adds.ownerTwo.players)
    const ownerOnePicksAdded = adds.ownerOne.draftPicks
    const ownerTwoPicksAdded = adds.ownerTwo.draftPicks

    returnString += `
+ Week ${week}
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
    year: '2022',
  }

  const inputArgs = H.getArgs(argsArray)
  const returnObj = H.replaceNullsWithDefaults(inputArgs, defaults)
  return returnObj
}