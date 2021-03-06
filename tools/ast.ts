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
    "Literal  : any value",
    "Unary    : Token operator, Expr right",
  ])
}

async function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path = `${outputDir}/${baseName}.ts`

  const file = await fs.open(path, "w")

  const writeln = async (data: string) => {
    await file.write(data + os.EOL)
  }

  await writeln('import { Token } from "./Token"')
  await writeln("")

  await writeln(`export interface ${baseName} {`)
  await writeln("  accept<R>(visitor: Visitor<R>): R")
  await writeln("}")

  for (const type of types) {
    const [className, fields] = type.split(":").map((v) => v.trim())
    await defineType(writeln, baseName, className, fields)
  }

  await defineVisitor(writeln, baseName, types)

  await file.close()
}

async function defineType(writeln: Writeln, baseName: string, className: string, fields: string) {
  await writeln("")
  await writeln(`export class ${className} implements ${baseName} {`)

  // Constructor with public readonly fields.
  await writeln("  constructor(")
  for (const field of fields.split(",").map((v) => v.trim())) {
    const [type, name] = field.split(" ")
    await writeln(`    public readonly ${name}: ${type},`)
  }
  await writeln("  ) {}")

  await writeln("")
  await writeln("  accept<R>(visitor: Visitor<R>): R {")
  await writeln(`    return visitor.visit${className}${baseName}(this)`)
  await writeln("  }")

  await writeln("}")
}

async function defineVisitor(writeln: Writeln, baseName: string, types: string[]) {
  await writeln("")
  await writeln("export interface Visitor<R> {")

  for (const type of types) {
    const [typeName] = type.split(":").map((v) => v.trim())
    await writeln(`  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R`)
  }

  await writeln("}")
}

generateAst()
