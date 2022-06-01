import { AstPrinter } from "../src/AstPrinter"
import * as Expr from "../src/Expr"
import { Token } from "../src/Token"

describe("print", () => {
  it("case 1", () => {
    const expression: Expr.Expr = new Expr.Binary(
      new Expr.Unary(new Token("MINUS", "-", null, 1), new Expr.Literal(123)),
      new Token("STAR", "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67))
    )

    expect(new AstPrinter().print(expression)).toEqual("(* (- 123) (group 45.67))")
  })
})
