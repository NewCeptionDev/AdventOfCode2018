import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Instruction {
  instruction: string,
  value1: number,
  value2: number,
  output: number
}

const parseInstruction = (line: string): Instruction => {
  const instructionSplit = line.split(" ")

  return {
    instruction: instructionSplit[0],
    value1: parseInt(instructionSplit[1]),
    value2: parseInt(instructionSplit[2]),
    output: parseInt(instructionSplit[3]),
  }
}

const applyInstruction = (instruction: Instruction, register: number[]): number[] => {
  const registerCopy = [...register]
  switch (instruction.instruction) {
    case "addr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] + registerCopy[instruction.value2]
      return registerCopy
    case "addi":
      registerCopy[instruction.output] = registerCopy[instruction.value1] + instruction.value2
      return registerCopy
    case "mulr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] * registerCopy[instruction.value2]
      return registerCopy
    case "muli":
      registerCopy[instruction.output] = registerCopy[instruction.value1] * instruction.value2
      return registerCopy
    case "banr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] & registerCopy[instruction.value2]
      return registerCopy
    case "bani":
      registerCopy[instruction.output] = registerCopy[instruction.value1] & instruction.value2
      return registerCopy
    case "borr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] | registerCopy[instruction.value2]
      return registerCopy
    case "bori":
      registerCopy[instruction.output] = registerCopy[instruction.value1] | instruction.value2
      return registerCopy
    case "setr":
      registerCopy[instruction.output] = registerCopy[instruction.value1]
      return registerCopy
    case "seti":
      registerCopy[instruction.output] = instruction.value1
      return registerCopy
    case "gtir":
      registerCopy[instruction.output] = instruction.value1 > registerCopy[instruction.value2] ? 1 : 0
      return registerCopy
    case "gtri":
      registerCopy[instruction.output] = registerCopy[instruction.value1] > instruction.value2 ? 1 : 0
      return registerCopy
    case "gtrr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] > registerCopy[instruction.value2] ? 1 : 0
      return registerCopy
    case "eqir":
      registerCopy[instruction.output] = instruction.value1 === registerCopy[instruction.value2] ? 1 : 0
      return registerCopy
    case "eqri":
      registerCopy[instruction.output] = registerCopy[instruction.value1] === instruction.value2 ? 1 : 0
      return registerCopy
    case "eqrr":
      registerCopy[instruction.output] = registerCopy[instruction.value1] === registerCopy[instruction.value2] ? 1 : 0
      return registerCopy
  }
}

const goA = (input) => {
  const lines = splitToLines(input)

  const indexRegister = parseInt(lines[0].split(" ")[1])
  const instructions = lines.slice(1).map(line => parseInstruction(line))

  let register = [0, 0, 0, 0, 0, 0]

  for (let i = 0; i < instructions.length; i++) {
    //Figured out that there is exactly one Place where Reg0 is used (in an eqrr) - So waiting for the correct Instruction to be hit and reading the other value used for eqrr
    if (i === 28) {
      return register[4]
    }
    register[indexRegister] = i
    register = applyInstruction(instructions[i], register)
    i = register[indexRegister]
  }
}

// This one takes up to 3 min to solve
const goB = (input) => {
  const lines = splitToLines(input)

  const indexRegister = parseInt(lines[0].split(" ")[1])
  const instructions = lines.slice(1).map(line => parseInstruction(line))

  const valuesSeenAlready: number[] = []
  let lastValue

  let register = [0, 0, 0, 0, 0, 0]

  for (let i = 0; i >= 0 && i < instructions.length; i++) {
    if (i === 28) {
      if (valuesSeenAlready.includes(register[4])) {
        return lastValue
      } else {
        valuesSeenAlready.push(register[4])
        lastValue = register[4]
      }
    }
    register[indexRegister] = i
    register = applyInstruction(instructions[i], register)
    i = register[indexRegister]
  }

}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
