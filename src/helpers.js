export const getArgs = (argsArray, sep = '=') => {
  const argsObj = {}
  const argGroups = argsArray.length
  for (let i = 0; i < argGroups; i += 1) {
    const [arg, value] = argsArray[i].split(sep)
    argsObj[arg] = value
  }
  return argsObj
}

export const replaceNullsWithDefaults = (obj, defaults) => {
  if (Object.keys(obj).length === 0) return defaults
  for (const property in defaults) {
    if (!obj[property]) obj[property] = defaults[property]
  }
  return obj
}

export const inactiveOwnerIds = new Set(
  // Tyson
  "474037339111288832",
  // Jesse
  "474038500170133504",
  // Austin
  "474328458051186688",
)