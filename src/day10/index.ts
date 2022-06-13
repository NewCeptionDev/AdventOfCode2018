import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number,
  y: number
}

interface Point {
  position: Position,
  velocity: Position
}

const parsePosition = (line: string): Position => {
  const split = line.trim().split("=<")
  const positionSplit = split[1].split(", ")

  return {
    x: parseInt(positionSplit[0]),
    y: parseInt(positionSplit[1].replace(">", ""))
  }
}

const parsePoint = (line: string): Point => {
  const split = line.split("> ");

  return {
    position: parsePosition(split[0]),
    velocity: parsePosition(split[1])
  }
}

const calculatePositionAtTick = (point: Point, tick: number): Position => {
  return {
    x: point.position.x + point.velocity.x * tick,
    y: point.position.y + point.velocity.y * tick
  }
}

const printPositions = (positions: Position[]) => {
  const pointMap: Map<number, Map<number, boolean>> = new Map<number, Map<number, boolean>>()

  for(let point of positions) {
    if(!pointMap[point.y]) {
      pointMap[point.y] = new Map<number, boolean>();
    }
    pointMap[point.y][point.x] = true;
  }

  let smallestY: number = Number.MAX_SAFE_INTEGER
  let largestY: number = Number.MIN_SAFE_INTEGER
  for(let y of Object.keys(pointMap).map(key => parseInt(key))) {
    if(y < smallestY) {
      smallestY = y;
    }

    if(y > largestY) {
      largestY = y;
    }
  }

  let smallestX: number = Number.MAX_SAFE_INTEGER
  let largestX: number = Number.MIN_SAFE_INTEGER
  for(let y of Object.keys(pointMap)) {
    for(let x of Object.keys(pointMap[y]).map(key => parseInt(key))) {
      if(x < smallestX) {
        smallestX = x;
      }
      if(x > largestX) {
        largestX = x;
      }
    }
  }

  for(let y = smallestY; y <= largestY; y++) {
    let line = "";
    for(let x = smallestX; x <= largestX; x++) {
      if(pointMap[y] && pointMap[y][x]) {
        line += "#"
      } else {
        line += " "
      }
    }
    console.log(line)
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const points = lines.map(line => parsePoint(line))

  let closeTogether = false;
  let wasCloseTogether = false;
  let tick = 0;

  while(!wasCloseTogether) {
    tick++;

    const positions = points.map(point => calculatePositionAtTick(point, tick));
    const yDistanceToFirst = positions.map(position => Math.abs(positions[0].y - position.y))

    if(yDistanceToFirst.every(distance => distance < 8)) {
      printPositions(positions)
      console.log("")
      closeTogether = true;
    } else {
      if(closeTogether) {
        wasCloseTogether = true
      }
    }
  }

  return
}

const goB = (input) => {
  const lines = splitToLines(input)
  const points = lines.map(line => parsePoint(line))

  let closeTogether = false;
  let wasCloseTogether = false;
  let tick = 0;

  while(!wasCloseTogether) {
    tick++;

    const positions = points.map(point => calculatePositionAtTick(point, tick));
    const yDistanceToFirst = positions.map(position => Math.abs(positions[0].y - position.y))

    if(yDistanceToFirst.every(distance => distance < 8)) {
      closeTogether = true;
    } else {
      if(closeTogether) {
        wasCloseTogether = true
      }
    }
  }

  return tick - 1
}

/* Tests */

test(calculatePositionAtTick({
  position: {
    x: 3,
    y: 9
  },
  velocity: {
    x: 1,
    y: -2
  }
}, 3), {
  x: 6,
  y: 3
})
test(goA(readTestFile()))
test(goB(readTestFile()), 3)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
