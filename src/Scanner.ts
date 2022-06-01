import { error } from "./utils"
import { Token, TokenType, keywords } from "./Token"

export class Scanner {
  private tokens: Token[] = []

  private start = 0
  private current = 0
  private line = 1

  constructor(public readonly source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current
      this.scanToken()
    }

    this.addRawToken("EOF", "")

    return this.tokens
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  scanToken() {
    const c = this.advance()
    switch (c) {
      case "(":
        this.addToken("LEFT_PAREN")
        break
      case ")":
        this.addToken("RIGHT_PAREN")
        break
      case "{":
        this.addToken("LEFT_BRACE")
        break
      case "}":
        this.addToken("RIGHT_BRACE")
        break
      case ",":
        this.addToken("COMMA")
        break
      case ".":
        this.addToken("DOT")
        break
      case "-":
        this.addToken("MINUS")
        break
      case "+":
        this.addToken("PLUS")
        break
      case ";":
        this.addToken("SEMICOLON")
        break
      case "*":
        this.addToken("STAR")
        break
      case "!":
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG")
        break
      case "=":
        this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL")
        break
      case "<":
        this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS")
        break
      case ">":
        this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER")
        break
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance()
          }
        } else {
          this.addToken("SLASH")
        }
        break

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break

      case "\n":
        this.line++
        break

      case '"':
        this.string()
        break
      default:
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
          error(this.line, "Unexpected character.")
        }
        break
    }
  }

  advance() {
    return this.source[this.current++]
  }

  match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false
    }
    if (this.peek() != expected) {
      return false
    }

    this.current++

    return true
  }

  peek(): string {
    return this.__peek(0)
  }

  peekNext(): string {
    return this.__peek(1)
  }

  __peek(offset: number): string {
    if (this.current + offset >= this.source.length) {
      return "\0"
    }

    return this.source[this.current + offset]
  }

  isDigit(c: string): boolean {
    return "0" <= c && c <= "9"
  }

  isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_"
  }

  isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c)
  }

  string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        this.line++
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      error(this.line, "Unterminated string.")
      return
    }

    // The closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1)
    this.addToken("STRING", value)
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance()
    }

    // Look for a fractional part.
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance()

      while (this.isDigit(this.peek())) {
        this.advance()
      }
    }

    this.addToken("NUMBER", parseFloat(this.source.substring(this.start, this.current)))
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance()
    }

    const text = this.source.substring(this.start, this.current)
    const type = keywords[text] ?? "IDENTIFIER"

    this.addToken(type)
  }

  addToken(type: TokenType, literal: any = null) {
    const text = this.source.substring(this.start, this.current)
    this.addRawToken(type, text, literal)
  }

  addRawToken(type: TokenType, lexeme: string, literal: any = null, line = this.line) {
    this.tokens.push(new Token(type, lexeme, literal, line))
  }
}
