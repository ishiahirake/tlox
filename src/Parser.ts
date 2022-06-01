import { Token, TokenType } from "./Token"
import * as Expr from "./Expr"
import { error } from "./utils"

class ParseError extends Error {}

export class Parser {
  private current = 0

  constructor(private tokens: Token[]) {}

  parse(): Expr.Expr | null {
    try {
      return this.expression()
    } catch (e) {
      return null
    }
  }

  expression(): Expr.Expr {
    return this.equality()
  }

  equality(): Expr.Expr {
    let expr = this.comparison()

    while (this.match("BANG_EQUAL", "EQUAL_EQUAL")) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()
    }

    throw this.error(this.peek(), message)
  }

  check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false
    }

    return this.peek().type === type
  }

  advance(): Token {
    if (!this.isAtEnd()) {
      this.current++
    }
    return this.previous()
  }

  isAtEnd(): boolean {
    return this.peek().type === "EOF"
  }

  peek(): Token {
    return this.tokens[this.current]
  }

  previous(): Token {
    return this.tokens[this.current - 1]
  }

  error(token: Token, message: string): ParseError {
    error(token, message)
    return new ParseError()
  }

  synchronize(): void {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === "SEMICOLON") {
        return
      }

      switch (this.peek().type) {
        case "CLASS":
        case "FUN":
        case "VAR":
        case "FOR":
        case "IF":
        case "WHILE":
        case "PRINT":
        case "RETURN":
          return
      }

      this.advance()
    }
  }

  /**
   * Rule:
   *
   * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
   *
   * @returns
   */
  comparison(): Expr.Expr {
    let expr = this.term()

    while (this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = this.previous()
      const right = this.term()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  term(): Expr.Expr {
    let expr = this.factor()

    while (this.match("MINUS", "PLUS")) {
      const operator = this.previous()
      const right = this.factor()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  factor(): Expr.Expr {
    let expr = this.unary()

    while (this.match("SLASH", "STAR")) {
      const operator = this.previous()
      const right = this.unary()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  /**
   * Rule:
   *
   * unary          → ( "!" | "-" ) unary
   *                | primary ;
   */
  unary(): Expr.Expr {
    if (this.match("BANG", "MINUS")) {
      const operator = this.previous()
      const right = this.unary()
      return new Expr.Unary(operator, right)
    }

    return this.primary()
  }

  /**
   * primary        → NUMBER | STRING | "true" | "false" | "nil"
   *                | "(" expression ")" ;
   */
  primary(): Expr.Expr {
    if (this.match("FALSE")) {
      return new Expr.Literal(false)
    }
    if (this.match("TRUE")) {
      return new Expr.Literal(true)
    }
    if (this.match("NIL")) {
      return new Expr.Literal(null)
    }

    if (this.match("NUMBER", "STRING")) {
      return new Expr.Literal(this.previous().literal)
    }

    if (this.match("LEFT_PAREN")) {
      const expr = this.expression()
      this.consume("RIGHT_BRACE", "Expect ')' after expression.")
      return new Expr.Grouping(expr)
    }

    throw this.error(this.peek(), "Expect expression.")
  }
}
