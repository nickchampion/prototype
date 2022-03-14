export const utc = (): Date => {
  const now = new Date()
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000)
}
