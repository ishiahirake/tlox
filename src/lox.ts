import { parse } from "./Parser"
import { shared } from "./globals"
import { readFile } from "fs/promises"
import * as readline from "readline"
import { scan } from "./Scanner"
import { interpret } from "./Interpreter"

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
  if (shared.hadRuntimeError) {
    process.exit(70)
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
    rl.question(message, resolve)
  })
}

async function run(source: string) {
  const tokens = scan(source)
  const expression = parse(tokens)

  if (shared.hadError || !expression) {
    return
  }

  interpret(expression)
}

// run main

main()
