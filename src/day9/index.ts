import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Marble {
  number: number,
  prev: Marble,
  next: Marble
}

const printRing = (marble: Marble) => {
  let startNumber = marble.number;

  let ring = marble.number + "-";

  let curr = marble.next;
  while(curr.number !== startNumber) {
    ring += curr.number + "-";
    curr = curr.next
  }

  return ring;
}

const goA = (input) => {
  const splits = input.trim().split(" ")

  const playerCount = parseInt(splits[0])
  const highestMarble = parseInt(splits[6])

  const scores: number[] = Array(playerCount).fill(0)
  let currentMarble: Marble = {
    number: 1,
    prev: undefined,
    next: undefined
  }
  let beforeMarble: Marble = {
    number: 0,
    prev: currentMarble,
    next: currentMarble
  }
  currentMarble.prev = beforeMarble;
  currentMarble.next = beforeMarble;
  let currentPlayer = 2;

  for(let i = 2; i <= highestMarble; i++) {
    if(currentPlayer >= playerCount) {
      currentPlayer = 0;
    }

    if(i % 23 === 0) {
      scores[currentPlayer] += i;
      currentMarble = currentMarble.prev.prev.prev.prev.prev.prev.prev;
      scores[currentPlayer] += currentMarble.number;
      const saved = currentMarble.prev;
      currentMarble = currentMarble.next
      currentMarble.prev = saved;
      saved.next = currentMarble
    } else {
      currentMarble = currentMarble.next;
      const saved = currentMarble.next;
      currentMarble.next = {
        number: i,
        prev: currentMarble,
        next: saved
      }
      saved.prev = currentMarble.next

      currentMarble = currentMarble.next
    }
    currentPlayer++;
  }

  return scores.sort((a, b) => a - b).pop()
}

const goB = (input) => {
  const split = input.trim().split(" ")
  split[6] = parseInt(split[6]) * 100
  return goA(split.join(" "))
}

/* Tests */

test(goA("9 players; last marble is worth 25 points"), 32)
test(goA("10 players; last marble is worth 1618 points"), 8317)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
