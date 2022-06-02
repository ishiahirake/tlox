import { Token } from "./Token"
import * as Expr from "./Expr"
import { RuntimeError } from "./RuntimeError"
import { isBoolean, isNumber, isString, runtimeError } from "./utils"

class Interpreter implements Expr.Visitor<any> {
  interpret(expression: Expr.Expr) {
    try {
      const value = this.evaluate(expression)
      console.log(this.stringify(value))
    } catch (e) {
      runtimeError(e as RuntimeError)
    }
  }

  visitBinaryExpr(expr: Expr.Binary): any {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case "GREATER":
        this.checkNumberOperands(expr.operator, left, right)
        return left > right
      case "GREATER_EQUAL":
        this.checkNumberOperands(expr.operator, left, right)
        return left >= right
      case "LESS":
        this.checkNumberOperands(expr.operator, left, right)
        return left < right
      case "LESS_EQUAL":
        this.checkNumberOperands(expr.operator, left, right)
        return left <= right

      case "BANG_EQUAL":
        return !this.isEqual(left, right)
      case "EQUAL_EQUAL":
        return this.isEqual(left, right)

      //
      case "MINUS":
        this.checkNumberOperands(expr.operator, left, right)
        return left - right
      case "SLASH":
        this.checkNumberOperands(expr.operator, left, right)
        return left / right
      case "STAR":
        this.checkNumberOperands(expr.operator, left, right)
        return left * right

      //
      case "PLUS":
        if (isNumber(left) && isNumber(right)) {
          return left + right
        }

        if (isString(left) && isString(right)) {
          return left + right
        }

        throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.")
    }

    // Unreachable.
    return null
  }

  visitGroupingExpr(expr: Expr.Grouping): any {
    return this.evaluate(expr.expression)
  }

  visitLiteralExpr(expr: Expr.Literal): any {
    return expr.value
  }

  visitUnaryExpr(expr: Expr.Unary): any {
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case "BANG":
        return !this.isTruthy(right)
      case "MINUS":
        this.checkNumberOperand(expr.operator, right)
        return -right
    }

    // Unreachable.
    return null
  }

  //

  private checkNumberOperand(operator: Token, operand: any) {
    if (isNumber(operand)) {
      return
    }

    throw new RuntimeError(operator, "Operand must be a number")
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    if (isNumber(left) && isNumber(right)) {
      return
    }

    throw new RuntimeError(operator, "Operands must be numbers.")
  }

  private isTruthy(object: any): boolean {
    if (object == null) {
      return false
    }
    if (isBoolean(object)) {
      return object
    }
    return true
  }

  private isEqual(a: any, b: any): boolean {
    if (a == null && b == null) {
      return true
    }
    if (a == null) {
      return false
    }

    return a === b
  }

  private evaluate(expr: Expr.Expr): any {
    return expr.accept(this)
  }

  private stringify(object: any): string {
    return object?.toString() ?? "nil"
  }
}

const interpreter = new Interpreter()

export function interpret(expression: Expr.Expr) {
  return interpreter.interpret(expression)
}
