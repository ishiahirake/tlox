import * as Expr from "./Expr"

export class AstPrinter implements Expr.Visitor<string> {
  print(expr: Expr.Expr): string {
    return expr.accept(this)
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize("group", expr.expression)
  }

  visitLiteralExpr(expr: Expr.Literal): string {
    return expr.value == null ? "nil" : expr.value.toString()
  }

  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }

  parenthesize(name: string, ...exprs: Expr.Expr[]): string {
    let result = "(" + name
    for (const expr of exprs) {
      result += " "
      result += expr.accept(this)
    }
    result += ")"

    return result
  }
}
