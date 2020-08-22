import fetch from 'cross-fetch'
import sleeper from '../sleeper.js'
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

export const draftRoundsToString = (draftObj, fromRound = 1, upToRound = 16) => {
  let draftRoundsStrings = []
  while (upToRound >= fromRound) {
    const draftRoundString = draftRoundToString(draftObj, upToRound)
    draftRoundsStrings.unshift(draftRoundString)
    upToRound -= 1
  }
  return draftRoundsStrings
}
