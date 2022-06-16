import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const goA = (input) => {
  const scores = [3, 7];
  const requiredRuns: number = parseInt(input.trim())

  let elf1Index = 0;
  let elf2Index = 1;

  while(scores.length < requiredRuns + 10) {
    const newSum: number[] = (scores[elf1Index] + scores[elf2Index]).toString().split("").map(number => parseInt(number))
    scores.push(...newSum);
    elf1Index = (elf1Index + scores[elf1Index] + 1) % scores.length
    elf2Index = (elf2Index + scores[elf2Index] + 1) % scores.length
  }

  return scores.slice(scores.length - 10).join("")
}

const goB = (input) => {
  const scores = [3, 7];
  const requiredSequence: string = input.trim()

  let elf1Index = 0;
  let elf2Index = 1;

  while (true) {
    const newSum: number[] = (scores[elf1Index] + scores[elf2Index]).toString().split("").map(number => parseInt(number))
    scores.push(...newSum);
    elf1Index = (elf1Index + scores[elf1Index] + 1) % scores.length
    elf2Index = (elf2Index + scores[elf2Index] + 1) % scores.length

    if(scores.slice(scores.length - requiredSequence.length).join("") === requiredSequence) {
      return scores.length - requiredSequence.length
    } else if(scores.slice(scores.length - requiredSequence.length - 1, scores.length - 1).join("") === requiredSequence) {
      return scores.length - requiredSequence.length - 1
    }
  }
}

/* Tests */

test(goA("9"), "5158916779")
test(goA("18"), "9251071085")
test(goA("2018"), "5941429882")
test(goB("59414"), 2018)
test(goB("92510"), 18)
test(goB("01245"), 5)
test(goB("51589"), 9)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
