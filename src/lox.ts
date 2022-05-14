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
function runFile(arg0: string) {
  throw new Error("Function not implemented.")
}

function runPrompt() {
  throw new Error("Function not implemented.")
}

// run main

main()
