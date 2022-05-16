import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const hasExactAmountOfALetter = (line: string, amount: number): boolean => {
  const charMap: Map<string, number> = new Map<string, number>();

  for(let i = 0; i < line.length; i++) {
    if(!charMap[line.charAt(i)]) {
      charMap[line.charAt(i)] = 0;
    }
    charMap[line.charAt(i)] += 1;
  }

  return Object.values(charMap).includes(amount);
}

const differentCharacters = (line1: string, line2: string): number[] => {
  const differentCharacters: number[] = []

  for(let i = 0; i < line1.length; i++) {
    if(line1.charAt(i) !== line2.charAt(i)) {
      differentCharacters.push(i)
    }
  }

  return differentCharacters;
}

const goA = (input) => {
  const lines = splitToLines(input)

  const linesWithExactlyTwoSameLetters = lines.filter(line => hasExactAmountOfALetter(line, 2)).length
  const linesWithExactlyThreeSameLetters = lines.filter(line => hasExactAmountOfALetter(line, 3)).length

  return linesWithExactlyTwoSameLetters * linesWithExactlyThreeSameLetters
}

const goB = (input) => {
  const lines = splitToLines(input)

  for(let i = 0; i < lines.length; i++) {
    for(let j = i + 1; j < lines.length; j++) {
      const different = differentCharacters(lines[i], lines[j])
      if(different.length === 1) {
        return lines[i].substring(0, different[0]) + lines[i].substring(different[0] + 1, lines[i].length)
      }
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
