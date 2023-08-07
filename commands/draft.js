import fetch from 'cross-fetch'
import sleeper from '../secrets/sleeper.js'
import * as H from '../src/helpers.js'
import CommonTags from 'common-tags'
const { stripIndents } = CommonTags

const API = 'https://api.sleeper.app/v1'


const draftOrderJSON = (year) => (
  fetch(`${API}/draft/${sleeper.drafts[year]}/picks`)
    .then((res) => res.json())
    .catch((error) => console.log(error))
)

export const filterDraftJSON = async (year) => {
  const draftJSON = await draftOrderJSON(year)
  return draftJSON.map((pick) => ({
    round: pick.round,
    pickNumber: pick.pick_no,
    position: pick.metadata.position,
    name: `${pick.metadata.first_name} ${pick.metadata.last_name}`,
    pickedBy: pick.picked_by,
  }))
}

const draftRoundToString = (draftObj, round, owner) => {
  let returnString = ``
  draftObj
    .filter((pick) => pick.pickNumber <= round * 12 && pick.pickNumber > (round - 1) * 12)
    .forEach((pick) => {
      const ownerName = sleeper.owners[pick.pickedBy].name
      if (owner.toLowerCase() === ownerName.toLowerCase() || owner === 'all') {
        returnString += stripIndents`
          [${ownerName}]
          ${pick.round} : ${pick.pickNumber % 12 || 12} (${pick.pickNumber})
          + ${pick.position} - ${pick.name}
        `
        returnString += '\n'
      }
    })
  return returnString.length ? `\`\`\`diff\n${returnString}\`\`\`` : ''
}

export const draftRoundsToString = (draftObj, rounds, owner) => {
  let [fromRound, upToRound] = rounds
  if (!fromRound && !upToRound) {
    fromRound = 1
    upToRound = 16
  }
  if (fromRound && !upToRound) upToRound = fromRound

  const draftRoundsStrings = []
  while (upToRound >= fromRound) {
    const draftRoundString = draftRoundToString(draftObj, upToRound, owner)
    draftRoundsStrings.unshift(draftRoundString)
    upToRound -= 1
  }
  return draftRoundsStrings
}

export const getDraftArgs = (argsArray) => {
  const defaults = {
    owner: 'all',
    rounds: '1-16',
    year: '2022',
  }

  const inputArgs = H.getArgs(argsArray)
  const returnObj = H.replaceNullsWithDefaults(inputArgs, defaults)
  returnObj.rounds = returnObj.rounds.split('-').map((num) => Number(num))
  return returnObj
}