export const getArgs = (argString) => {
  const argsArray = argString.split('--').sort()
  return [...argsArray.splice(0,1)]
}