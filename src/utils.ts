import { Token, TokenType } from "./Token"
import { shared } from "./globals"

// Error handling

export function error(line: number, message: string): void
export function error(token: Token, message: string): void

export function error(data: number | Token, message: string) {
  if (typeof data === "number") {
    report(data, "", message)
  }
  // data is Token
  else {
    const token = data
    if (token.type === TokenType.EOF) {
      report(token.line, " at end", message)
    } else {
      report(token.line, ` at '${token.lexeme}'`, message)
    }
  }
}

export function report(line: number, where: string, message: string) {
  console.log(`[line ${line}] Error ${where}: ${message}`)

  // TODO: throw Error
  shared.hadError = true
}
