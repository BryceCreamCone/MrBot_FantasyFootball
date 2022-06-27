import * as H from '../helpers.js'

export const mkArray = (name, percentage) => {
  const returnArray = []
  for (let i=0; i<percentage; i+=1) {
    returnArray.push(name)
  }
  return returnArray
}

const getNextPick = (order, pool) => {
  const draftNumber = Math.floor(Math.random() * pool.length)
  const pickOwner = pool[draftNumber]
  const newOrder = [...order, pickOwner]
  const newPool = pool.filter((owner) => !newOrder.includes(owner))
  return [newOrder, newPool]
}

const getPicks = (draftOrder, draftPool) => {
  let order = draftOrder
  let pool = draftPool
  for (let i=0; i<3; i+=1) {
    [order, pool] = getNextPick(order, pool)
  }
  const poolSet = new Set(pool)
  const rest = [...poolSet].reverse()
  return [...order, ...rest]
}

export const createDraftOrder = (statics, weights) => {
  const draftOrder = []
  const draftPool = []
  for (const [owner, weight] of Object.entries(weights)) {
    draftPool.unshift(...mkArray(owner, weight))
  }
  const firstSix = getPicks(draftOrder, draftPool)
  return [...firstSix, ...statics]
}

// Helpers
const cleanUpIntervals = (intervals) => {
  intervals.forEach((interval) => clearInterval(interval))
}
const printPickPrefix = (i) => (i >= 0 ? `Pick Number ${i+1} goes to` : '')
const sendAsMarkup = (channel, message) => {
  if (message.length) channel.send(`\`\`\`diff\n${message}\`\`\``)
}

// THE DRAFT
const generators = {
  *draftGenerator (finalDraftOrder) {
    let i = 11
    while (i >= 0) {
      yield finalDraftOrder[i]
      i -= 1
    }
  }
}

export const announceDraftOrder = (channel, finalDraftOrder) => {
  const announcer = generators.draftGenerator(finalDraftOrder)
  let i = 11
  sendAsMarkup(channel, printPickPrefix(i))
  const ellipses = setInterval(() => channel.send('.'), 1250)
  const owner = setInterval(() => sendAsMarkup(channel, `+ ${announcer.next().value}`), 3000)
  const pick = setInterval(() => {
    i -= 1
    sendAsMarkup(channel, printPickPrefix(i))
  }, 3000)
  const intervals = [ellipses, owner, pick]
  setTimeout(() => {
    cleanUpIntervals(intervals)
  }, 36050)
}

export const getLotteryArgs = (argsArray) => {
  const defaults = {
    weights: [],
    statics: [],
  }

  const inputArgs = H.getArgs(argsArray)
  const returnObj = H.replaceNullsWithDefaults(inputArgs, defaults)
  returnObj.weights = returnObj.weights
    .split(',').map((ownerAndWeight) => ownerAndWeight.split(':'))
    .reduce((newObj, [owner, wieght]) => ({ ...newObj, [owner]: Number(wieght)}), {})
  returnObj.statics = returnObj.statics.split(',')
  return returnObj
}