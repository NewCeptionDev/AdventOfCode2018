import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Instruction {
  instruction: string,
  value1: number,
  value2: number,
  output: number
}

const registerEqual = (register1: number[], register2: number[]): boolean => {
  if(register1.length !== register2.length) {
    return false;
  }

  for(let i = 0; i < register1.length; i++) {
    if(register1[i] !== register2[i]) {
      return false
    }
  }

  return true
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
  const possibleInstructions = ["addr", "addi", "mulr", "muli", "banr", "bani", "borr", "bori", "setr", "seti", "gtir", "gtri", "gtrr", "eqir", "eqri", "eqrr"]

  let samplesWithThreeOrMorePossibleInstructions = 0;

  for(let i = 0; i + 2 < lines.length; i += 3) {
    if(lines[i].startsWith("Before")) {
      const beforeSplit = lines[i].split("[")[1]
      const instructionSplit = lines[i + 1].split(" ").map(int => parseInt(int))
      const afterSplit = lines[i + 2].split("[")[1]

      const beforeRegister = beforeSplit.substr(0, beforeSplit.length - 1).split(", ").map(int => parseInt(int));
      const instruction: Instruction = {
        instruction: "unkown",
        value1: instructionSplit[1],
        value2: instructionSplit[2],
        output: instructionSplit[3]
      }
      const afterRegister = afterSplit.substr(0, afterSplit.length - 1).split(", ").map(int => parseInt(int));

      const numberOfPossibleInstructions = possibleInstructions.map(possibleInstruction => registerEqual(applyInstruction({instruction: possibleInstruction, value1: instruction.value1, value2: instruction.value2, output: instruction.output}, [...beforeRegister]), afterRegister) ? 1 : 0).reduce((previousValue, currentValue) => previousValue + currentValue, 0)

      if(numberOfPossibleInstructions >= 3) {
        samplesWithThreeOrMorePossibleInstructions++;
      }
    }
  }


  return samplesWithThreeOrMorePossibleInstructions
}

const goB = (input) => {
  const lines = splitToLines(input)
  const possibleInstructions = ["addr", "addi", "mulr", "muli", "banr", "bani", "borr", "bori", "setr", "seti", "gtir", "gtri", "gtrr", "eqir", "eqri", "eqrr"]

  const possibleInstructionsForInstructionNumber: Map<number, string[]> = new Map<number, string[]>();

  let sampleEnd = 0;

  for(let i = 0; i + 2 < lines.length; i += 3) {
    if(lines[i].startsWith("Before")) {
      const beforeSplit = lines[i].split("[")[1]
      const instructionSplit = lines[i + 1].split(" ").map(int => parseInt(int))
      const afterSplit = lines[i + 2].split("[")[1]

      const beforeRegister = beforeSplit.substr(0, beforeSplit.length - 1).split(", ").map(int => parseInt(int));
      const instruction: Instruction = {
        instruction: "unkown",
        value1: instructionSplit[1],
        value2: instructionSplit[2],
        output: instructionSplit[3]
      }
      const afterRegister = afterSplit.substr(0, afterSplit.length - 1).split(", ").map(int => parseInt(int));

      const possibleInstructionsForInstruction = possibleInstructions.filter(possibleInstruction => registerEqual(applyInstruction({instruction: possibleInstruction, value1: instruction.value1, value2: instruction.value2, output: instruction.output}, [...beforeRegister]), afterRegister))

      if(!possibleInstructionsForInstructionNumber[instructionSplit[0]]) {
        possibleInstructionsForInstructionNumber[instructionSplit[0]] = []
      }

      possibleInstructionsForInstructionNumber[instructionSplit[0]].push(...possibleInstructionsForInstruction.filter(possible => !possibleInstructionsForInstructionNumber[instructionSplit[0]].includes(possible)))
    } else if(sampleEnd === 0) {
      sampleEnd = i;
    }
  }

  const instructionNumberOperationMap: Map<number, string> = new Map<number, string>()

  while (Object.values(possibleInstructionsForInstructionNumber).map(value => value.length).reduce((previousValue, currentValue) => previousValue + currentValue) > 0) {
    const keys = Object.keys(possibleInstructionsForInstructionNumber)

    for(let key of keys) {
      if(possibleInstructionsForInstructionNumber[key].length === 1) {
        instructionNumberOperationMap[key] = possibleInstructionsForInstructionNumber[key][0]

        const toRemove = possibleInstructionsForInstructionNumber[key][0]

        for(let removeKey of keys) {
          possibleInstructionsForInstructionNumber[removeKey] = possibleInstructionsForInstructionNumber[removeKey].filter(possible => possible !== toRemove)
        }
      }
    }
  }

  let register = [0,0,0,0]

  const exampleInstructions = lines.slice(sampleEnd).filter(line => line.length > 0).map(line => {
    const split = line.split(" ").map(int => parseInt(int.trim()))

    return {
      instruction: instructionNumberOperationMap[split[0]],
      value1: split[1],
      value2: split[2],
      output: split[3]
    }
  });

  for(let instruction of exampleInstructions) {
    register = applyInstruction(instruction, register)
  }

  return register[0]
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
