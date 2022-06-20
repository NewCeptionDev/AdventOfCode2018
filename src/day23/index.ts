import { test, readInput } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number,
  y: number,
  z: number
}

interface NanoBot {
  position: Position,
  radius: number
}

interface PossiblePosition {
  position: Position,
  count: number,
  distanceToZeroPosition: number
}

const parseNanoBot = (line: string): NanoBot => {
  const split = line.split(", ")
  const posSplit = split[0].split(",")

  return {
    position: {
      x: parseInt(posSplit[0].slice(5)),
      y: parseInt(posSplit[1]),
      z: parseInt(posSplit[2].slice(0, posSplit[2].length - 1))
    },
    radius: parseInt(split[1].slice(2))
  }
}

const distanceBetweenPositions = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z)
}

const find = (bots: NanoBot[], xValues: number[], yValues: number[], zValues: number[], radius: number, offsetX: number, offsetY: number, offsetZ: number, countToBeat: number) => {
  const atTarget: PossiblePosition[] = []

  for(let x = xValues[0]; x <= xValues[xValues.length - 1]; x += radius) {
    for(let y = yValues[0]; y <= yValues[yValues.length - 1]; y += radius) {
      for(let z = zValues[0]; z <= zValues[zValues.length - 1]; z += radius) {
        let count = 0;
        for(let bot of bots) {
          if(radius === 1) {
            if(distanceBetweenPositions({x: x, y: y, z: z}, bot.position) <= bot.radius) {
              count++
            }
          } else {
            const distanceWithOffset = distanceBetweenPositions({x: x + offsetX, y: y + offsetY, z: z + offsetZ}, {x: bot.position.x + offsetX, y: bot.position.y + offsetY, z: bot.position.z + offsetZ})

            if(Math.floor(distanceWithOffset / radius) - 3 <= Math.floor(bot.radius / radius)) {
              count++
            }
          }
        }

        if(count >= countToBeat) {
          atTarget.push({
            position: {
              x: x,
              y: y,
              z: z
            },
            count: count,
            distanceToZeroPosition: Math.abs(x) + Math.abs(y) + Math.abs(z)
          })
        }
      }
    }
  }

  while (atTarget.length > 0) {
    let best: PossiblePosition = atTarget.sort((a, b) => a.distanceToZeroPosition - b.distanceToZeroPosition).shift()

    if(radius === 1) {
      return {
        count: best.count,
        coordinateAbsSum: best.distanceToZeroPosition
      }
    } else {
      const newXValues = [best.position.x, best.position.x + Math.floor(radius / 2)]
      const newYValues = [best.position.y, best.position.y + Math.floor(radius / 2)]
      const newZValues = [best.position.z, best.position.z + Math.floor(radius / 2)]

      const result = find(bots, newXValues, newYValues, newZValues, Math.floor(radius / 2), offsetX, offsetY, offsetZ, countToBeat)

      if(result.coordinateAbsSum !== undefined) {
        return result
      }
    }
  }

  return {
    count: undefined,
    coordinateAbsSum: undefined
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const bots: NanoBot[] = lines.map(line => parseNanoBot(line))

  const largestRadius = bots.sort((a, b) => b.radius - a.radius)[0]

  let botsInRange = 0
  for(let bot of bots) {
    if(distanceBetweenPositions(bot.position, largestRadius.position) <= largestRadius.radius) {
      botsInRange++
    }
  }

  return botsInRange
}

const goB = (input) => {
  const lines = splitToLines(input)
  const bots: NanoBot[] = lines.map(line => parseNanoBot(line))

  const xValues: number[] = [0, ...bots.map(bot => bot.position.x)].sort((a, b) => a - b)
  const yValues: number[] = [0, ...bots.map(bot => bot.position.y)].sort((a, b) => a - b)
  const zValues: number[] = [0, ...bots.map(bot => bot.position.z)].sort((a, b) => a - b)

  let radius = 1;
  while(radius < xValues[xValues.length - 1] - xValues[0] || radius < yValues[yValues.length - 1] - yValues[0] || radius < zValues[zValues.length - 1] - zValues[0]) {
    radius *= 2
  }

  const offsetX = xValues[0] !== 0 ? xValues[0] * -1 : 0
  const offsetY = yValues[0] !== 0 ? yValues[0] * -1 : 0
  const offsetZ = zValues[0] !== 0 ? zValues[0] * -1 : 0

  let span = 1
  while(span < bots.length) {
    span *= 2
  }

  let toCheck = 1
  const tried: Map<number, number> = new Map<number, number>()
  let bestValue: number = undefined
  let bestCount: number = undefined

  while(true) {
    if(tried[toCheck] === undefined) {
      tried[toCheck] = find(bots, xValues, yValues, zValues, radius, offsetX, offsetY, offsetZ, toCheck)
    }
    const result = tried[toCheck]

    if(result.coordinateAbsSum === undefined) {
      if(span > 1) {
        span = Math.floor(span / 2)
      }
      toCheck = Math.max(1, toCheck - span)
    } else {
      if(bestCount === undefined || result.count > bestCount) {
        bestCount = result.count;
        bestValue = result.coordinateAbsSum
      }
      if(span === 1) {
        //Done with loop
        break
      }
      toCheck += span
    }
  }

  return bestValue
}

/* Tests */

test(goA(readTestFile()), 7)
test(goB(readInputFromSpecialFile("testInput2.txt")), 36)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
