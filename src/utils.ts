import { shared } from "./globals"

// Error handling

export function error(line: number, message: string) {
  report(line, "", message)
}

export function report(line: number, where: string, message: string) {
  console.log(`[line ${line}] Error ${where}: ${message}`)

  // TODO: throw Error
  shared.hadError = true
}
