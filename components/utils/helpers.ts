export const sleep = async (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

export const copy = (source: unknown, destination: unknown, ignore: unknown[]): unknown => {
  Object.keys(source).forEach(key => {
    if (!ignore || !ignore.includes(key)) destination[key] = source[key]
  })
  return destination
}

export const base64_encode = (input: string): string => {
  const buffer = Buffer.from(input, 'utf8')
  return buffer.toString('base64')
}

export const base64_decode = (input: string): string => {
  const buffer = Buffer.from(input, 'base64')
  return buffer.toString('utf8')
}

export const try_execute_async = async (
  action: () => Promise<unknown>,
  errorAction: (e: unknown) => Promise<unknown>
): Promise<unknown> => {
  try {
    return await action()
  } catch (e) {
    return errorAction(e)
  }
}
