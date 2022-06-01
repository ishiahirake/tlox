import { AstPrinter } from "./AstPrinter"
import { Expr } from "./Expr"
import { Parser } from "./Parser"
import { shared } from "./globals"
import { readFile } from "fs/promises"
import * as readline from "readline"
import { Scanner } from "./Scanner"

function main() {
  const args = process.argv.slice(2)
  if (args.length > 1) {
    console.log("Usage: tlox [script]")
    process.exit(64)
  } else if (args.length === 1) {
    runFile(args[0])
  } else {
    runPrompt()
  }
}

async function runFile(path: string) {
  const source = await readFile(path, { encoding: "utf8" })
  run(source)

  if (shared.hadError) {
    process.exit(65)
  }
}

async function runPrompt() {
  console.log("Use ctrl-c or ctrl-d to exit.\n")
  while (true) {
    const input = await prompt("> ")
    run(input)

    shared.hadError = false
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt(message: string) {
  return new Promise<string>((resolve) => {
    rl.question(message, (input) => {
      resolve(input)
    })
  })
}

async function run(source: string) {
  const scanner = new Scanner(source)
  const tokens = scanner.scanTokens()

  const parser = new Parser(tokens)
  const expression = parser.parse()

  if (shared.hadError || !expression) {
    return
  }

  console.log(new AstPrinter().print(expression))
}

// run main

main()
