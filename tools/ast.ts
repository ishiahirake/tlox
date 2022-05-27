import * as fs from "fs/promises"
import os from "os"

type Writeln = (data: string) => Promise<void>

export function generateAst() {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.log("Usage: generate-ast <output directory>")
    process.exit(64)
  }

  const outputDir = args[0]
  defineAst(outputDir, "Expr", [
    "Binary   : Expr left, Token operator, Expr right",
    "Grouping : Expr expression",
    "Literal  : Object value",
    "Unary    : Token operator, Expr right",
  ])
}

async function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = `${outputDir}/${baseName}.ts`

  const file = await fs.open(path, "w")

  const writeln = async (data: string) => {
    await file.write(data + os.EOL)
  }

  await writeln(`interface ${baseName} {}`)

  for (const type of types) {
    const [className, fields] = type.split(":").map((v) => v.trim())
    await defineType(writeln, baseName, className, fields)
  }

  await file.close()
}

async function defineType(
  writeln: Writeln,
  baseName: string,
  className: string,
  fields: string
) {
  await writeln("")
  await writeln(`class ${className} implements ${baseName} {`)

  // Constructor with public readonly fields.
  await writeln("  constructor(")
  fields
    .split(",")
    .map((v) => v.trim())
    .forEach((field) => {
      const [type, name] = field.split(" ")
      writeln(`    public readonly ${name}: ${type},`)
    })
  await writeln("  ) {}")

  await writeln("}")
}

generateAst()
