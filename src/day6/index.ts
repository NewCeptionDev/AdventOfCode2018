import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Point {
  index: number,
  position: Position
}

interface Position {
  x: number,
  y: number
}

const parsePoint = (line: string, index: number): Point => {
  const split = line.split(", ")

  return {
    index: index,
    position: {
      x: parseInt(split[0].trim()),
      y: parseInt(split[1].trim()),
    },
  }
}

const findClosestPoint = (toCheck: Position, points: Point[]): number => {
  const sortedByDistance = points.map(point => {
    return {
      distance: Math.abs(point.position.x - toCheck.x) + Math.abs(point.position.y - toCheck.y),
      index: point.index,
    }
  }).sort((a, b) => a.distance - b.distance)

  return sortedByDistance.filter(closest => closest.distance === sortedByDistance[0].distance).length === 1 ? sortedByDistance[0].index : undefined
}

const getNeighbourPositions = (position: Position): Position[] => {
  const neighbours: Position[] = []

  neighbours.push({
    x: position.x - 1,
    y: position.y - 1
  })
  neighbours.push({
    x: position.x - 1,
    y: position.y
  })
  neighbours.push({
    x: position.x - 1,
    y: position.y + 1
  })
  neighbours.push({
    x: position.x,
    y: position.y - 1
  })
  neighbours.push({
    x: position.x,
    y: position.y + 1
  })
  neighbours.push({
    x: position.x + 1,
    y: position.y - 1
  })
  neighbours.push({
    x: position.x + 1,
    y: position.y
  })
  neighbours.push({
    x: position.x + 1,
    y: position.y + 1
  })


  return neighbours
}

const findAreaSize = (pointIndex: number, points: Point[], currentPosition: Position, checkedPositions: Position[]): number => {
  let closestPointIndex = findClosestPoint(currentPosition, points);
  let size = 0;

  if(closestPointIndex && closestPointIndex === pointIndex) {
    const neighbours = getNeighbourPositions(currentPosition)

    size += 1

    for(let position of neighbours) {
      if(!checkedPositions.find(checked => checked.x === position.x && checked.y === position.y)) {
        checkedPositions.push(position)
        size += findAreaSize(pointIndex, points, position, checkedPositions)
      }
    }
  }

  return size
}

const calculateCombinedDistanceToAllPoints = (position: Position, points: Point[]): number => {
  return points.map(point => Math.abs(point.position.x - position.x) + Math.abs(point.position.y - position.y)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goA = (input) => {
  const lines = splitToLines(input)
  const points = lines.map((line, index) => parsePoint(line, index))

  let lowestX = Number.MAX_SAFE_INTEGER
  let lowestY = Number.MAX_SAFE_INTEGER
  let highestX = Number.MIN_SAFE_INTEGER
  let highestY = Number.MIN_SAFE_INTEGER

  for (let point of points) {
    const position = point.position
    if (position.y < lowestY) {
      lowestY = position.y
    }

    if (position.y > highestY) {
      highestY = position.y
    }

    if (position.x < lowestX) {
      lowestX = position.x
    }

    if (position.x > highestX) {
      highestX = position.x
    }
  }

  const infiniteAreaPoints: number[] = []

  for (let y = lowestY - 1; y < highestY + 2; y++) {
    for (let x = lowestX - 1; x < highestX + 2; x++) {
      const index = findClosestPoint({ x: x, y: y }, points)

      if (index !== undefined && !infiniteAreaPoints.includes(index)) {
        infiniteAreaPoints.push(index)
      }

      if (y !== lowestY - 1 && y !== highestY + 1 && x < highestX) {
        x = highestX
      }
    }
  }

  const pointsWithFiniteArea = points.filter((point, index) => !infiniteAreaPoints.includes(index))

  return pointsWithFiniteArea.map(point => findAreaSize(point.index, points, point.position, [])).sort((a, b) => a - b).pop() - 1
}

const goB = (input) => {
  const lines = splitToLines(input)
  const points = lines.map((line, index) => parsePoint(line, index))

  let lowestX = Number.MAX_SAFE_INTEGER
  let lowestY = Number.MAX_SAFE_INTEGER
  let highestX = Number.MIN_SAFE_INTEGER
  let highestY = Number.MIN_SAFE_INTEGER

  for (let point of points) {
    const position = point.position
    if (position.y < lowestY) {
      lowestY = position.y
    }

    if (position.y > highestY) {
      highestY = position.y
    }

    if (position.x < lowestX) {
      lowestX = position.x
    }

    if (position.x > highestX) {
      highestX = position.x
    }
  }

  let regionSize = 0;

  for(let y = lowestY; y < highestY + 1; y++) {
    for(let x = lowestX; x < highestX + 1; x++) {
      if(calculateCombinedDistanceToAllPoints({x: x, y: y}, points) < 10000) {
        regionSize++
      }
    }
  }

  return regionSize
}

/* Tests */

test(goA(readTestFile()), 17)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
