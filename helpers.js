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
  for (const property in obj) {
    if (!obj[property]) obj[property] = defaults[property]
  }
  return obj
}