import { test, readInput } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

interface Position {
  x: number,
  y: number
}


interface Cart {
  direction: Direction,
  intersectionCounter: number,
  position: Position,
  crashed: boolean
}

const haveCartsCrashed = (carts: Cart[]): Position => {
  for(let i = 0; i < carts.length; i++) {
    if(carts.find((cart, index) => index !== i && cart.position.x === carts[i].position.x && cart.position.y === carts[i].position.y)) {
      return carts[i].position
    }
  }

  return undefined
}

const turnLeft = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.LEFT:
      return Direction.DOWN;
    case Direction.RIGHT:
      return Direction.UP;
    case Direction.UP:
      return Direction.LEFT;
    case Direction.DOWN:
      return Direction.RIGHT;
  }
}

const turnRight = (direction: Direction): Direction => {
  switch (direction) {
    case Direction.LEFT:
      return Direction.UP;
    case Direction.RIGHT:
      return Direction.DOWN;
    case Direction.UP:
      return Direction.RIGHT;
    case Direction.DOWN:
      return Direction.LEFT;
  }
}

const getNewCart = (cart: Cart, map: string[][]): Cart => {
  let positionToCheck;
  let newCart = cart;

  switch (cart.direction) {
    case Direction.UP:
      positionToCheck = {
        x: cart.position.x,
        y: cart.position.y - 1
      }
      break;
    case Direction.DOWN:
      positionToCheck = {
        x: cart.position.x,
        y: cart.position.y + 1
      }
      break;
    case Direction.LEFT:
      positionToCheck = {
        x: cart.position.x - 1,
        y: cart.position.y
      }
      break;
    case Direction.RIGHT:
      positionToCheck = {
        x: cart.position.x + 1,
        y: cart.position.y
      }
      break;
  }

  if(map[positionToCheck.y][positionToCheck.x] === "+") {
    if(cart.intersectionCounter === 0) {
      newCart.direction = turnLeft(cart.direction)
      newCart.intersectionCounter = 1;
    } else if(cart.intersectionCounter === 2) {
      newCart.direction = turnRight(cart.direction)
      newCart.intersectionCounter = 0;
    } else {
      newCart.intersectionCounter = 2;
    }
  } else if(map[positionToCheck.y][positionToCheck.x] === "/") {
    if(cart.direction === Direction.UP) {
      newCart.direction = Direction.RIGHT;
    } else if(cart.direction === Direction.LEFT) {
      newCart.direction = Direction.DOWN
    } else if(cart.direction === Direction.DOWN) {
      newCart.direction = Direction.LEFT
    } else {
      newCart.direction = Direction.UP
    }
  } else if(map[positionToCheck.y][positionToCheck.x] === "\\") {
    if(cart.direction === Direction.UP) {
      newCart.direction = Direction.LEFT;
    } else if(cart.direction === Direction.RIGHT){
      newCart.direction = Direction.DOWN
    } else if(cart.direction === Direction.DOWN) {
      newCart.direction = Direction.RIGHT
    } else {
      newCart.direction = Direction.UP
    }
  }

  newCart.position = positionToCheck;

  return newCart;
}

const goA = (input) => {
  const lines = splitToLines(input)
  const map: string[][] = lines.map(line => line.split(""));
  let carts: Cart[] = []

  for(let y = 0; y < map.length; y++) {
    for(let x = 0; x < map[y].length; x++) {
      const mapElement = map[y][x];

      if(mapElement === "<" || mapElement === ">" || mapElement === "^" || mapElement === "v") {
        carts.push({
          position: {
            x: x,
            y: y
          },
          intersectionCounter: 0,
          direction: mapElement === "<" ? Direction.LEFT : mapElement === ">" ? Direction.RIGHT : mapElement === "^" ? Direction.UP : Direction.DOWN,
          crashed: false
        })
        if(mapElement === "<" || mapElement === ">") {
          map[y][x] = "-"
        } else {
          map[y][x] = "|"
        }
      }
    }
  }

  while(true) {
    const cartsSortedByY = carts.sort((a, b) => a.position.y - b.position.y);
    const movedCarts: Cart[] = [];

    for(let i = 0; i < cartsSortedByY.length; i++) {
      movedCarts.push(getNewCart(cartsSortedByY[i], map))


      const crashPosition = haveCartsCrashed([...cartsSortedByY.slice(i + 1), ...movedCarts]);
      if(crashPosition) {
        return crashPosition.x + "," + crashPosition.y
      }
    }
    carts = movedCarts
  }
}

const goB = (input) => {
  const lines = splitToLines(input)
  const map: string[][] = lines.map(line => line.split(""));
  let carts: Cart[] = []

  for(let y = 0; y < map.length; y++) {
    for(let x = 0; x < map[y].length; x++) {
      const mapElement = map[y][x];

      if(mapElement === "<" || mapElement === ">" || mapElement === "^" || mapElement === "v") {
        carts.push({
          position: {
            x: x,
            y: y
          },
          intersectionCounter: 0,
          direction: mapElement === "<" ? Direction.LEFT : mapElement === ">" ? Direction.RIGHT : mapElement === "^" ? Direction.UP : Direction.DOWN,
          crashed: false
        })
        if(mapElement === "<" || mapElement === ">") {
          map[y][x] = "-"
        } else {
          map[y][x] = "|"
        }
      }
    }
  }

  while(carts.filter(cart => !cart.crashed).length > 1) {
    // Sorting not only by Y-Axis but also afterwards by X-Axis so Top to Bottom, Left to Right is used
    const cartsSortedByY = carts.sort((a, b) => (a.position.y * 100000 + a.position.x) - (b.position.y * 100000 + b.position.x));
    const movedCarts: Cart[] = [];

    for(let i = 0; i < cartsSortedByY.length; i++) {
      if(!carts[i].crashed) {
        movedCarts.push(getNewCart(cartsSortedByY[i], map))

        const crashPosition = haveCartsCrashed([...cartsSortedByY.slice(i + 1).filter(cart => !cart.crashed), ...movedCarts.filter(cart => !cart.crashed)]);
        if (crashPosition) {
          cartsSortedByY.filter(cart => cart.position.x === crashPosition.x && cart.position.y === crashPosition.y).forEach(cart => cart.crashed = true)
          movedCarts.filter(cart => cart.position.x === crashPosition.x && cart.position.y === crashPosition.y).forEach(cart => cart.crashed = true)
        }
      }
    }
    carts = movedCarts
  }

  return carts.filter(cart => !cart.crashed)[0].position.x + "," + carts.filter(cart => !cart.crashed)[0].position.y
}

/* Tests */

test(goA(readTestFile()), "7,3")
test(goB(readInputFromSpecialFile("testInput2.txt")), "6,4")

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
