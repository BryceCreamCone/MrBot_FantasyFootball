import fetch from 'cross-fetch'
import sleeper from '../../secrets/sleeper.js'

const API = 'https://api.sleeper.app/v1'


const tradedPicksJSON = (year) => (
  fetch(`${API}/league/${sleeper.leagueId[year || 2020]}/traded_picks`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

export const filterTradedPicksJSON = async (year) => {
  const tradedPicks = await tradedPicksJSON(year)
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

export const tradedPicksToString = (picksObj) => {
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