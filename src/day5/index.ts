import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const calculatePolymerReaction = (polymer: string): string => {
  let newPolymer = "";
  let reactionHappened = false;

  for(let i = 1; i < polymer.length && !reactionHappened; i++) {
    if(Math.abs(polymer.charCodeAt(i - 1) - polymer.charCodeAt(i)) !== 32) {
      newPolymer += polymer.charAt(i - 1)
    } else {
      reactionHappened = true
      newPolymer += polymer.substring(i + 1)
    }
  }

  if(!reactionHappened) {
    newPolymer += polymer.charAt(polymer.length - 1)
  }

  return newPolymer;
}

const goA = (input) => {
  let polymer = input.trim()

  let newPolymer = polymer;
  do {
    polymer = newPolymer
    newPolymer = calculatePolymerReaction(polymer)
  } while (newPolymer !== polymer)

  return newPolymer.length
}

const goB = (input) => {
  const polymer = input.trim()

  let shortest = Number.MAX_SAFE_INTEGER

  const checkedChars: number[] = []

  for(let i = 0; i < polymer.length; i++) {
    const charCode = polymer.charCodeAt(i);
    let smallerChar = charCode;

    if(charCode < "a".charCodeAt(0)) {
      smallerChar = charCode + 32;
    }

    if(!checkedChars.includes(smallerChar)){
      checkedChars.push(smallerChar)
      let newString = polymer.replaceAll(String.fromCharCode(smallerChar), "")
      newString = newString.replaceAll(String.fromCharCode(smallerChar - 32), "")

      const polymerLengthAfterReaction = goA(newString)

      if(polymerLengthAfterReaction < shortest) {
        shortest = polymerLengthAfterReaction
      }
    }
  }

  return shortest
}

/* Tests */

test(calculatePolymerReaction("dabAcCaCBAcCcaDA"), "dabAaCBAcCcaDA")
test(goA("dabAcCaCBAcCcaDA"), 10)
test(goB("dabAcCaCBAcCcaDA"), 4)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
