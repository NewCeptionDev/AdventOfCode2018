import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Range {
  staticAxis: string,
  staticNumber: number,
  rangeFrom: number,
  rangeTo: number
}

interface Position {
  x: number,
  y: number
}

const parseRange = (line: string): Range => {
  const staticRangeSplit = line.split(", ")

  const staticSplit = staticRangeSplit[0].split("=")
  const rangeSplit = staticRangeSplit[1].split("..")

  return {
    staticAxis: staticSplit[0],
    staticNumber: parseInt(staticSplit[1]),
    rangeFrom: parseInt(rangeSplit[0].slice(2)),
    rangeTo: parseInt(rangeSplit[1])
  }
}

const findNextFlowPositionOrPoolEnd = (map: Map<number, Map<number, string>>, toLeft: boolean, position: Position): {isPool: boolean, endPosition: Position} => {
  if(!map[position.y + 1] || (map[position.y + 1][position.x] !== "#" && map[position.y + 1][position.x] !=="~")) {
    return {
      isPool: false,
      endPosition: position
    };
  }

  if((toLeft && map[position.y] && map[position.y][position.x - 1] === "#") || (!toLeft && map[position.y] && map[position.y][position.x + 1] === "#")) {
    return {
      isPool: true,
      endPosition: position
    }
  }

  return findNextFlowPositionOrPoolEnd(map, toLeft, {
    y: position.y,
    x: toLeft ? position.x - 1 : position.x + 1
  })
}

const goA = (input, includeFlowingWater: boolean) => {
  const lines = splitToLines(input)
  const ranges = lines.map(line => parseRange(line))

  const map: Map<number, Map<number, string>> = new Map<number, Map<number, string>>();

  for(let range of ranges) {
    if(range.staticAxis === "y") {
      if(!map[range.staticNumber]) {
        map[range.staticNumber] = new Map<number, string>()
      }

      for(let x = range.rangeFrom; x <= range.rangeTo; x++) {
        map[range.staticNumber][x] = "#"
      }
    } else {
      for(let y = range.rangeFrom; y <= range.rangeTo; y++) {
        if(!map[y]) {
          map[y] = new Map<number, string>()
        }

        map[y][range.staticNumber] = "#"
      }
    }
  }

  const currentKeys = Object.keys(map).map(key => parseInt(key)).sort((a, b) => a - b)
  const smallestKey = currentKeys[0]
  const largestKey = currentKeys.pop()

  if(!map[0]) {
    map[0] = new Map<number, string>()
  }

  map[0][500] = "+"

  let positionsToCalculate = [{
    x: 500,
    y: 0
  }]

  while(positionsToCalculate.length > 0) {
    const currentPosition = positionsToCalculate.shift()

    if(!map[currentPosition.y + 1]) {
      map[currentPosition.y + 1] = new Map<number, string>()
    }

    if(!map[currentPosition.y + 1][currentPosition.x]) {
      if(currentPosition.y + 1 <= largestKey) {
        map[currentPosition.y + 1][currentPosition.x] = "|"
        positionsToCalculate.push({
          y: currentPosition.y + 1,
          x: currentPosition.x
        })
      } else {
        console.log("Ignored because out of Range")
      }
    } else if(map[currentPosition.y + 1][currentPosition.x] === "#" || map[currentPosition.y + 1][currentPosition.x] === "~") {
      const flowLeft = findNextFlowPositionOrPoolEnd(map, true, currentPosition);
      const flowRight = findNextFlowPositionOrPoolEnd(map, false, currentPosition);

      if(flowLeft.isPool && flowRight.isPool) {
        for(let x = flowLeft.endPosition.x; x <= flowRight.endPosition.x; x++) {
          map[currentPosition.y][x] = "~"
        }
        positionsToCalculate.push({
          y: currentPosition.y - 1,
          x: currentPosition.x
        })
      } else {
        for(let x = flowLeft.endPosition.x; x <= flowRight.endPosition.x; x++) {
          map[currentPosition.y][x] = "|"
        }

        if(!flowLeft.isPool) {
          positionsToCalculate.push(flowLeft.endPosition)
        }
        if(!flowRight.isPool) {
          positionsToCalculate.push(flowRight.endPosition)
        }
      }
    }
    positionsToCalculate = positionsToCalculate.filter(position => position.y <= largestKey)
  }

  return Object.keys(map).map(key => parseInt(key)).filter(key => key >= smallestKey && key <= largestKey).map(key => map[key]).map(xMap => Object.values(xMap).filter(sign => {
    if(includeFlowingWater) {
      return sign === "~" || sign === "|"
    }
    return sign === "~"
  }).length).reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input) => {
  return goA(input, false)
}

/* Tests */

test(goA(readTestFile(), true), 57)

/* Results */

console.time("Time")
const resultA = goA(input, true)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
