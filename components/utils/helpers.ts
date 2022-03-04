export const sleep = async (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

export const copy = (source: unknown, destination: unknown, ignore: unknown[]): unknown => {
  Object.keys(source).forEach(key => {
    if (!ignore || !ignore.includes(key)) destination[key] = source[key]
  })
  return destination
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
