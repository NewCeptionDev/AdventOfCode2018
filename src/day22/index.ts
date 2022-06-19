import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number,
  y: number
}

enum RegionType {
  ROCKY,
  WET,
  NARROW
}

enum EQUIPMENT {
  TORCH,
  CLIMBING_GEAR,
  NONE
}

interface State {
  currentPosition: Position,
  visited: Position[],
  time: number,
  currentGear: EQUIPMENT
}

const parsePosition = (positionLine: string): Position => {
  const split = positionLine.split(",")

  return {
    x: parseInt(split[0]),
    y: parseInt(split[1]),
  }
}

const getRegionType = (position: Position, targetPosition: Position, caveDepth: number, knownErosionLevel: Map<string, number>): RegionType => {
  const erosionLevel = calculateErosionLevelOfPosition(position, targetPosition, caveDepth, knownErosionLevel)

  if (erosionLevel % 3 === 0) {
    return RegionType.ROCKY
  } else if (erosionLevel % 3 === 1) {
    return RegionType.WET
  }
  return RegionType.NARROW
}

const calculateErosionLevelOfPosition = (position: Position, targetPosition: Position, caveDepth: number, knownErosionLevel: Map<string, number>): number => {
  let erosionLevelForPosition = knownErosionLevel[position.x + "," + position.y]

  if (!erosionLevelForPosition) {
    erosionLevelForPosition = (calculateGeologicIndexOfPosition(position, targetPosition, caveDepth, knownErosionLevel) + caveDepth) % 20183
    knownErosionLevel[position.x + "," + position.y] = erosionLevelForPosition
  }

  return erosionLevelForPosition
}

const calculateGeologicIndexOfPosition = (position: Position, targetPosition: Position, caveDepth: number, knownErosionLevel: Map<string, number>): number => {
  if (position.y === 0 && position.x === 0) {
    return 0
  }
  if (position.y === targetPosition.y && position.x === targetPosition.x) {
    return 0
  }
  if (position.y === 0) {
    return position.x * 16807
  }
  if (position.x === 0) {
    return position.y * 48271
  }

  return calculateErosionLevelOfPosition({
    x: position.x - 1,
    y: position.y,
  }, targetPosition, caveDepth, knownErosionLevel) * calculateErosionLevelOfPosition({
    x: position.x,
    y: position.y - 1,
  }, targetPosition, caveDepth, knownErosionLevel)
}

const getPossibleNextPositions = (position: Position) => {
  const possiblePositions = [{
    x: position.x + 1,
    y: position.y,
  }, {
    x: position.x - 1,
    y: position.y,
  }, {
    x: position.x,
    y: position.y + 1,
  }, {
    x: position.x,
    y: position.y - 1,
  }]

  return possiblePositions.filter(position => position.x >= 0 && position.y >= 0)
}

const isEquipmentAllowedInRegion = (equipment: EQUIPMENT, region: RegionType): boolean => {
  if (region === RegionType.ROCKY) {
    return equipment === EQUIPMENT.TORCH || equipment === EQUIPMENT.CLIMBING_GEAR
  } else if (region === RegionType.WET) {
    return equipment === EQUIPMENT.CLIMBING_GEAR || equipment === EQUIPMENT.NONE
  } else {
    return equipment === EQUIPMENT.TORCH || equipment === EQUIPMENT.NONE
  }
}

const equipmentToString = (equipment: EQUIPMENT): string => {
  switch (equipment) {
    case EQUIPMENT.CLIMBING_GEAR:
      return "C"
    case EQUIPMENT.TORCH:
      return "T"
    case EQUIPMENT.NONE:
      return "N"
  }
}

const goA = (input) => {
  const lines = splitToLines(input)
  const depth = parseInt(lines[0].split(": ")[1])
  const targetPosition = parsePosition(lines[1].split(": ")[1])

  let totalRiskLevel = 0

  const knownErosionLevel: Map<string, number> = new Map<string, number>()

  for (let y = 0; y <= targetPosition.y; y++) {
    for (let x = 0; x <= targetPosition.x; x++) {
      const regionType = getRegionType({ x: x, y: y }, targetPosition, depth, knownErosionLevel)
      switch (regionType) {
        case RegionType.WET:
          totalRiskLevel += 1
          break
        case RegionType.NARROW:
          totalRiskLevel += 2
          break
      }
    }
  }

  return totalRiskLevel
}

// Takes a loooong time, but works eventually
const goB = (input) => {
  const lines = splitToLines(input)
  const depth = parseInt(lines[0].split(": ")[1])
  const targetPosition = parsePosition(lines[1].split(": ")[1])

  const knownErosionLevel: Map<string, number> = new Map<string, number>()

  let statesToConsider: State[] = [{
    currentPosition: { x: 0, y: 0 },
    currentGear: EQUIPMENT.TORCH,
    visited: [{ x: 0, y: 0 }],
    time: 0,
  }]

  const fastetTimeToPositionWithGear: Map<string, number> = new Map<string, number>()

  while (statesToConsider.length > 0) {
    let currentState = statesToConsider.shift()

    let fastestTimeToCurrentPosition = fastetTimeToPositionWithGear[currentState.currentPosition.x + "," + currentState.currentPosition.y + "," + equipmentToString(currentState.currentGear)]

    if (currentState.currentPosition.x === targetPosition.x && currentState.currentPosition.y === targetPosition.y) {
      const finalTime = currentState.currentGear === EQUIPMENT.TORCH ? currentState.time : currentState.time + 7

      if (!fastetTimeToPositionWithGear[currentState.currentPosition.x + "," + currentState.currentPosition.y + ",T"]
        || finalTime < fastetTimeToPositionWithGear[currentState.currentPosition.x + "," + currentState.currentPosition.y + ",T"]) {
        fastetTimeToPositionWithGear[currentState.currentPosition.x + "," + currentState.currentPosition.y + ",T"] = finalTime
      }
    } else if ((!fastestTimeToCurrentPosition || fastestTimeToCurrentPosition > currentState.time) && currentState.currentPosition.x < targetPosition.x + 10 && currentState.currentPosition.y < targetPosition.y + 10) {
      fastetTimeToPositionWithGear[currentState.currentPosition.x + "," + currentState.currentPosition.y + "," + equipmentToString(currentState.currentGear)] = currentState.time
      const possibleMoves = getPossibleNextPositions(currentState.currentPosition).filter(possible => !currentState.visited.find(visited => visited.x === possible.x && visited.y === possible.y))
      const currentRegion = getRegionType(currentState.currentPosition, targetPosition, depth, knownErosionLevel)

      for (let possibleMove of possibleMoves) {
        const newRegion = getRegionType(possibleMove, targetPosition, depth, knownErosionLevel)
        if (isEquipmentAllowedInRegion(currentState.currentGear, newRegion)) {
          statesToConsider.push({
            currentPosition: possibleMove,
            currentGear: currentState.currentGear,
            visited: [...currentState.visited, possibleMove],
            time: currentState.time + 1,
          })
        } else {
          if (currentState.currentGear !== EQUIPMENT.TORCH) {
            if (isEquipmentAllowedInRegion(EQUIPMENT.TORCH, newRegion) && isEquipmentAllowedInRegion(EQUIPMENT.TORCH, currentRegion)) {
              statesToConsider.push({
                currentPosition: possibleMove,
                currentGear: EQUIPMENT.TORCH,
                visited: [...currentState.visited, possibleMove],
                time: currentState.time + 8,
              })
            }
          }
          if (currentState.currentGear !== EQUIPMENT.CLIMBING_GEAR) {
            if (isEquipmentAllowedInRegion(EQUIPMENT.CLIMBING_GEAR, newRegion) && isEquipmentAllowedInRegion(EQUIPMENT.CLIMBING_GEAR, currentRegion)) {
              statesToConsider.push({
                currentPosition: possibleMove,
                currentGear: EQUIPMENT.CLIMBING_GEAR,
                visited: [...currentState.visited, possibleMove],
                time: currentState.time + 8,
              })
            }
          }
          if (currentState.currentGear !== EQUIPMENT.NONE) {
            if (isEquipmentAllowedInRegion(EQUIPMENT.NONE, newRegion) && isEquipmentAllowedInRegion(EQUIPMENT.NONE, currentRegion)) {
              statesToConsider.push({
                currentPosition: possibleMove,
                currentGear: EQUIPMENT.NONE,
                visited: [...currentState.visited, possibleMove],
                time: currentState.time + 8,
              })
            }
          }
        }
      }
    }

    if (fastetTimeToPositionWithGear[targetPosition.x + "," + targetPosition.y + ",T"] !== undefined) {
      statesToConsider = statesToConsider.filter(route => route.time < fastetTimeToPositionWithGear[targetPosition.x + "," + targetPosition.y + ",T"])
    }
    statesToConsider = statesToConsider.filter(route => route.currentPosition.x < targetPosition.x + 10 && route.currentPosition.y < targetPosition.y + 10)
  }

  return fastetTimeToPositionWithGear[targetPosition.x + "," + targetPosition.y + ",T"]
}

/* Tests */

test(goA(readTestFile()), 114)
test(goB(readTestFile()), 45)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
