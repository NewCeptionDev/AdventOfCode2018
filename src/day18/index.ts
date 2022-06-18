import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum Content {
  OPEN_GROUND,
  TREE,
  LUMBERYARD
}

interface Position {
  x: number,
  y: number
}

const parseContent = (sign: string): Content => {
  switch (sign) {
    case ".":
      return Content.OPEN_GROUND
    case "|":
      return Content.TREE
    case "#":
      return Content.LUMBERYARD
  }
}

const getNeighbourPositions = (position: Position, max: number) => {
  const neighbourPositions: Position[] = []

  neighbourPositions.push({
    x: position.x + 1,
    y: position.y + 1
  }, {
    x: position.x - 1,
    y: position.y + 1
  }, {
    x: position.x,
    y: position.y + 1
  }, {
    x: position.x + 1,
    y: position.y
  }, {
    x: position.x - 1,
    y: position.y
  }, {
    x: position.x + 1,
    y: position.y - 1
  }, {
    x: position.x - 1,
    y: position.y - 1
  }, {
    x: position.x,
    y: position.y - 1
  })

  return neighbourPositions.filter(position => position.x >= 0 && position.y >= 0 && position.x < max && position.y < max)
}

const contentInRange = (map: Content[][], positions: Position[], content: Content): number => {
  let contentInRange = 0;

  for(let position of positions) {
    if(map[position.y][position.x] === content) {
      contentInRange++;
    }
  }

  return contentInRange
}

const generateNextAreaTick = (area: Content[][]): Content[][] => {
  const newArea: Content[][] = []

  for(let y = 0; y < area.length; y++) {
    const yAxis: Content[] = []
    for(let x = 0; x < area[y].length; x++) {
      const neighbourPositions = getNeighbourPositions({x: x, y: y}, area.length)

      if(area[y][x] === Content.OPEN_GROUND) {
        yAxis.push(contentInRange(area, neighbourPositions, Content.TREE) >= 3 ? Content.TREE : Content.OPEN_GROUND)
      } else if(area[y][x] === Content.TREE) {
        yAxis.push(contentInRange(area, neighbourPositions, Content.LUMBERYARD) >= 3 ? Content.LUMBERYARD : Content.TREE)
      } else if(area[y][x] === Content.LUMBERYARD) {
        const adjacentLumberyards = contentInRange(area, neighbourPositions, Content.LUMBERYARD)
        const adjacentTrees = contentInRange(area, neighbourPositions, Content.TREE)

        yAxis.push(adjacentLumberyards >= 1 && adjacentTrees >= 1 ? Content.LUMBERYARD : Content.OPEN_GROUND)
      }
    }
    newArea.push(yAxis)
  }

  return newArea
}

const mapToString = (area: Content[][]): string => {
  return area.map(yAxis => yAxis.map(content => {
    switch (content) {
      case Content.OPEN_GROUND:
        return "."
      case Content.TREE:
        return "|"
      case Content.LUMBERYARD:
        return "#"
    }
  }).join("")).join("&")
}

const goA = (input) => {
  const lines = splitToLines(input)
  let area: Content[][] = lines.map(line => line.split("").map(sign => parseContent(sign)))

  for(let i = 0; i < 10; i++) {
    area = generateNextAreaTick(area)
  }

  const treeAcres = area.map(yAxis => yAxis.filter(acre => acre === Content.TREE).length).reduce((previousValue, currentValue) => previousValue + currentValue)
  const lumberyardAcres = area.map(yAxis => yAxis.filter(acre => acre === Content.LUMBERYARD).length).reduce((previousValue, currentValue) => previousValue + currentValue)

  return treeAcres * lumberyardAcres
}

const goB = (input, ticks: number) => {
  const lines = splitToLines(input)
  let area: Content[][] = lines.map(line => line.split("").map(sign => parseContent(sign)))

  const generatedAreas: string[] = [];
  generatedAreas.push(mapToString(area))

  let index = 1;
  let foundDuplicate = false
  let from;

  while (!foundDuplicate) {
    area = generateNextAreaTick(area)
    if(generatedAreas.includes(mapToString(area))) {
      foundDuplicate = true
      from = generatedAreas.indexOf(mapToString(area))
    } else {
      generatedAreas.push(mapToString(area))
      index++;
    }
  }

  const range = index - from
  const leftOver = ticks - index;
  const finalArea = generatedAreas[from + (leftOver % range)]

  const treeAcres = finalArea.split("").filter(acre => acre === "|").length
  const lumberyardAcres = finalArea.split("").filter(acre => acre === "#").length

  return treeAcres * lumberyardAcres
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input, 1000000000)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
