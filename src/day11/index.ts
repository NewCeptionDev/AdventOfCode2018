import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

const getHundredsDigit = (full: number): number => {
  if(full >= 100) {
    return Math.floor((full % 1000) / 100)
  } else {
    return 0;
  }
}

const calculatePower = (x: number, y: number, serial: number): number => {
  const rackId = x + 10;
  const temporaryPowerLevel = (rackId * y + serial) * rackId

  return getHundredsDigit(temporaryPowerLevel) - 5
}

const calculateGridPower = (x: number, y: number, gridSize: number, serial: number): number => {
  let totalPower = 0;

  for(let yRepeats = 0; yRepeats < gridSize; yRepeats++) {
    for(let xRepeats = 0; xRepeats < gridSize; xRepeats++) {
      totalPower += calculatePower(x + xRepeats, y + yRepeats, serial)
    }
  }

  return totalPower;
}

const goA = (input) => {
  const gridSerial = parseInt(input.trim())

  let largestPower: number = Number.MIN_SAFE_INTEGER
  let coordinatesOfLargest: string = "";

  for(let y = 1; y + 2 <= 300; y++) {
    for(let x = 1; x + 2 <= 300; x++) {
      const totalPower = calculateGridPower(x, y, 3, gridSerial)

      if(totalPower > largestPower) {
        largestPower = totalPower;
        coordinatesOfLargest = x + "," + y
      }
    }
  }

  return coordinatesOfLargest
}

const goB = (input) => {
  const gridSerial = parseInt(input.trim())

  let largestPower: number = Number.MIN_SAFE_INTEGER
  let coordinatesOfLargest: string = "";

  const grid: Map<number, Map<number, number>> = new Map<number, Map<number, number>>();

  for(let y = 1; y <= 300; y++) {
    if(grid[y] === undefined) {
      grid[y] = new Map<number, number>();
    }
    for(let x = 1; x <= 300; x++) {
     grid[y][x] = calculatePower(x, y, gridSerial)
    }
  }

  for(let y = 1; y <= 300; y++) {
    for(let x = 1; x <= 300; x++) {
      const yLargerOne = y > 1 ? grid[y - 1][x] : 0;
      const xLargerOne = x > 1 ? grid[y][x - 1] : 0;
      const bothLargerOne = y > 1 && x > 1 ? grid[y - 1][x - 1] : 0
      grid[y][x] = grid[y][x] + xLargerOne + yLargerOne - bothLargerOne
    }
  }

  for(let gridSize = 1; gridSize <= 300; gridSize++) {
    for(let y = 1; y <= 300 - gridSize; y++) {
      for(let x = 1; x <= 300 - gridSize; x++) {
        const totalPower = grid[y + gridSize][x + gridSize] - grid[y + gridSize][x] - grid[y][x + gridSize] + grid[y][x]

        if (totalPower > largestPower) {
          largestPower = totalPower;
          coordinatesOfLargest = (x + 1) + "," + (y + 1) + "," + gridSize
        }
      }
    }
  }

  return coordinatesOfLargest
}

/* Tests */

test(getHundredsDigit(5555), 5)
test(getHundredsDigit(2999), 9)
test(getHundredsDigit(4000), 0)
test(getHundredsDigit(300), 3)
test(getHundredsDigit(30), 0)
test(calculatePower(3, 5, 8), 4)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
