import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Position {
  x: number,
  y: number
}

interface Room {
  doorUp: boolean,
  doorLeft: boolean,
  doorRight: boolean,
  doorDown: boolean
}

const getPossibleMovements = (position: Position, room: Room): Position[] => {
  const possibleMovements: Position[] = []

  if(room.doorLeft) {
    possibleMovements.push({
      x: position.x - 1,
      y: position.y
    })
  }

  if(room.doorRight) {
    possibleMovements.push({
      x: position.x + 1,
      y: position.y
    })
  }

  if(room.doorUp) {
    possibleMovements.push({
      x: position.x,
      y: position.y - 1
    })
  }

  if(room.doorDown) {
    possibleMovements.push({
      x: position.x,
      y: position.y + 1
    })
  }

  return possibleMovements
}

const findShortestRouteToAllRooms = (position: Position, steps: number, visited: Position[], map: Map<number, Map<number, Room>>): {position: Position, steps: number}[] => {
  const reachedPositions: {position: Position, steps: number}[] = [];

  const possibleMovements = getPossibleMovements(position, map[position.y][position.x]).filter(neighbour => map[neighbour.y] && map[neighbour.y][neighbour.x]).filter(neighbour => !visited.find(visitedPosition => visitedPosition.x === neighbour.x && visitedPosition.y === neighbour.y))
  visited.push(...possibleMovements)

  for(let possibleMovement of possibleMovements) {
    reachedPositions.push({position: possibleMovement, steps: steps + 1})
    reachedPositions.push(...findShortestRouteToAllRooms(possibleMovement, steps + 1, visited, map))
  }

  return reachedPositions
}

const parseMap = (route: string): Map<number, Map<number, Room>> => {
  const map: Map<number, Map<number, Room>> = new Map<number, Map<number, Room>>()

  let currentPosition = {x: 0, y: 0};
  let savedPositions: Position[] = []

  const routeSigns = route.split("")

  for(let i = 0; i < routeSigns.length; i++) {
    if (!map[currentPosition.y]) {
      map[currentPosition.y] = new Map<number, Room>()
    }

    let currentRoom = map[currentPosition.y][currentPosition.x]
    let nextRoom;

    if(!currentRoom) {
      currentRoom = {
        doorUp: false,
        doorLeft: false,
        doorRight: false,
        doorDown: false
      }
    }

    switch (routeSigns[i]) {
      case "N":
        currentRoom.doorUp = true;
        map[currentPosition.y][currentPosition.x] = currentRoom;
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y - 1
        }
        if (!map[currentPosition.y]) {
          map[currentPosition.y] = new Map<number, Room>()
        }

        nextRoom = map[currentPosition.y][currentPosition.x]

        if(!nextRoom) {
          nextRoom = {
            doorUp: false,
            doorLeft: false,
            doorRight: false,
            doorDown: true
          }
          map[currentPosition.y][currentPosition.x] = nextRoom;
        }
        break;
      case "W":
        currentRoom.doorLeft = true;
        map[currentPosition.y][currentPosition.x] = currentRoom;
        currentPosition = {
          x: currentPosition.x - 1,
          y: currentPosition.y
        }
        nextRoom = map[currentPosition.y][currentPosition.x]

        if(!nextRoom) {
          nextRoom = {
            doorUp: false,
            doorLeft: false,
            doorRight: true,
            doorDown: false
          }
          map[currentPosition.y][currentPosition.x] = nextRoom;
        }
        break;
      case "E":
        currentRoom.doorRight = true;
        map[currentPosition.y][currentPosition.x] = currentRoom;
        currentPosition = {
          x: currentPosition.x + 1,
          y: currentPosition.y
        }
        nextRoom = map[currentPosition.y][currentPosition.x]

        if(!nextRoom) {
          nextRoom = {
            doorUp: false,
            doorLeft: true,
            doorRight: false,
            doorDown: false
          }
          map[currentPosition.y][currentPosition.x] = nextRoom;
        }
        break;
      case "S":
        currentRoom.doorDown = true;
        map[currentPosition.y][currentPosition.x] = currentRoom;
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y + 1
        }
        if (!map[currentPosition.y]) {
          map[currentPosition.y] = new Map<number, Room>()
        }

        nextRoom = map[currentPosition.y][currentPosition.x]

        if(!nextRoom) {
          nextRoom = {
            doorUp: true,
            doorLeft: false,
            doorRight: false,
            doorDown: false
          }
          map[currentPosition.y][currentPosition.x] = nextRoom;
        }
        break;
      case "(":
        savedPositions.push(currentPosition)
        break;
      case "|":
        currentPosition = savedPositions[savedPositions.length - 1]
        break;
      case ")":
        savedPositions.pop()
        break;
    }
  }

  return map
}

const goA = (input) => {
  const route = input.slice(1, input.length - 1)
  const map: Map<number, Map<number, Room>> = parseMap(route)

  return findShortestRouteToAllRooms({x: 0, y: 0}, 0, [], map).sort((a, b) => a.steps - b.steps).pop().steps
}

const goB = (input) => {
  const route = input.slice(1, input.length - 1)
  const map: Map<number, Map<number, Room>> = parseMap(route)

  return findShortestRouteToAllRooms({x: 0, y: 0}, 0, [], map).filter(route => route.steps >= 1000).length
}

/* Tests */

test(goA("^WNE$"), 3)
test(goA("^ENWWW(NEEE|SSE(EE|N))$"), 10)
test(goA("^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$"), 18)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
