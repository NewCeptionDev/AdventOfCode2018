import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Claim {
  id: number,
  fromLeft: number,
  fromTop: number,
  width: number,
  height: number,
}

const parseClaim = (line: string): Claim => {
 const split = line.split(" ");
 const fromSplit = split[2].substring(0, split[2].length - 1).split(",")
  const rangeSplit = split[3].split("x")

 return {
   id: parseInt(split[0].substr(1)),
   fromLeft: parseInt(fromSplit[0]),
   fromTop: parseInt(fromSplit[1]),
   width: parseInt(rangeSplit[0]),
   height: parseInt(rangeSplit[1])
 }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const claims = lines.map(line => parseClaim(line))

  const claimedPositions: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()

  for(let claim of claims) {
    for(let y = claim.fromTop; y < claim.fromTop + claim.height; y++) {
      if(!claimedPositions[y]) {
        claimedPositions[y] = new Map<number, number>()
      }

      for(let x = claim.fromLeft; x < claim.fromLeft + claim.width; x++) {
        if(!claimedPositions[y][x]) {
          claimedPositions[y][x] = 0;
        }

        claimedPositions[y][x] += 1
      }
    }
  }

  let positionsWithMultipleClaims = 0;

  for(let key of Object.keys(claimedPositions)) {
    positionsWithMultipleClaims += Object.values(claimedPositions[key]).filter(value => value > 1).length
  }

  return positionsWithMultipleClaims
}

const goB = (input) => {
  const lines = splitToLines(input)
  const claims = lines.map(line => parseClaim(line))

  const claimedPositions: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()

  for(let claim of claims) {
    for(let y = claim.fromTop; y < claim.fromTop + claim.height; y++) {
      if(!claimedPositions[y]) {
        claimedPositions[y] = new Map<number, number>()
      }

      for(let x = claim.fromLeft; x < claim.fromLeft + claim.width; x++) {
        if(!claimedPositions[y][x]) {
          claimedPositions[y][x] = 0;
        }

        claimedPositions[y][x] += 1
      }
    }
  }

  for(let claim of claims) {
    let noOverlaps = true;
    for(let y = claim.fromTop; y < claim.fromTop + claim.height; y++) {
      for(let x = claim.fromLeft; x < claim.fromLeft + claim.width; x++) {
        if (claimedPositions[y][x] !== 1) {
          noOverlaps = false;
        }
      }
    }

    if(noOverlaps) {
      return claim.id
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
