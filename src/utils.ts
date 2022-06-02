import { RuntimeError } from "./RuntimeError"
import { Token } from "./Token"
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
    if (token.type === "EOF") {
      report(token.line, " at end", message)
    } else {
      report(token.line, ` at '${token.lexeme}'`, message)
    }
  }
}

export function runtimeError(error: RuntimeError) {
  console.log(`${error.message}\n[line ${error.token.line}]`)
  shared.hadRuntimeError = true
}

export function report(line: number, where: string, message: string) {
  console.log(`[line ${line}] Error ${where}: ${message}`)

  // TODO: throw Error
  shared.hadError = true
}

//

export function isString(val: string): val is string {
  return typeof val === "string"
}

export function isNumber(val: any): val is number {
  return typeof val === "number"
}

export function isBoolean(val: any): val is boolean {
  return typeof val === "boolean"
}
