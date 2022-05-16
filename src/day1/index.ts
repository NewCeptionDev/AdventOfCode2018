import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const goA = (input) => {
  return splitToLines(input).map(line => parseInt(line.trim())).reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input) => {
  const instructions = splitToLines(input).map(line => parseInt(line.trim()))

  const calculatedFrequencies: Map<number, boolean> = new Map<number, boolean>();
  let currentFrequency = 0;

  for(let i = 0; i < instructions.length; i++) {
    currentFrequency += instructions[i];

    if(calculatedFrequencies[currentFrequency]) {
      return currentFrequency;
    }
    calculatedFrequencies[currentFrequency] = true;

    if(i +  1 === instructions.length) {
      i = -1;
    }
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
