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
    output: parseInt(instructionSplit[3])
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

const getDivisors = (toCheck: number): number[] => {
  if(toCheck === 1) {
    return [1]
  }

  let max = toCheck;
  let num = 2;
  const result = [1, toCheck];

  while(num < max) {
    if(toCheck % num === 0) {
      if(num !== toCheck / num) {
        result.push(num, Math.floor(toCheck / num))
      } else {
        result.push(num)
      }
      max = Math.floor(toCheck / num)
    }
    num += 1
  }
  return result.sort((a, b) => a - b)
}

const goA = (input) => {
  const lines = splitToLines(input)

  const indexRegister = parseInt(lines[0].split(" ")[1])
  const instructions = lines.slice(1).map(line => parseInstruction(line))

  let register = [0,0,0,0,0,0]

  for(let i = 0; i < instructions.length; i++) {
    register[indexRegister] = i;
    register = applyInstruction(instructions[i], register)
    i = register[indexRegister]
  }

  return register[0]
}

const goB = (input) => {
  const lines = splitToLines(input)

  const indexRegister = parseInt(lines[0].split(" ")[1])
  const instructions = lines.slice(1).map(line => parseInstruction(line))

  let register = [1,0,0,0,0,0]

  for(let i = 0; i < instructions.length && register[indexRegister] !== 3; i++) {
    register[indexRegister] = i;
    register = applyInstruction(instructions[i], register)
    i = register[indexRegister]
  }

  // Register Number is dependent on the Input - Log the Input after the For-Loop and see which register holds the largest value
  return getDivisors(register[2]).reduce((previousValue, currentValue) => previousValue + currentValue)
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
