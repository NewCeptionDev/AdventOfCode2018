import { test, readInput } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

enum Type {
  GOBLIN,
  ELF
}

interface Position {
  x: number,
  y: number
}

interface Unit {
  type: Type,
  hp: number,
  x: number,
  y: number
}

/*
 * Gave up on finding an own Solution after 10 hours of debugging with every Example working
 * Ended up using https://www.reddit.com/r/adventofcode/comments/a6chwa/comment/ebxb5y2/?utm_source=share&utm_medium=web2x&context=3 as the Solution and modifying it a little
 */

const goA = (input, elfPower: number, noElfShouldDie: boolean): {elvesWon: boolean, rounds: number, hpSum: number, result: number} => {
  let map = splitToLines(input)
  const [n, m] = [map.length, map[0].length]
  const nm = n * m
  let units: Unit[] = []

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "E") {
        units.push({
          type: Type.ELF,
          hp: 200,
          x: x,
          y: y,
        })
      } else if (map[y][x] === "G") {
        units.push({
          type: Type.GOBLIN,
          hp: 200,
          x: x,
          y: y,
        })
      }
    }
  }

  const unitByCords = new Array<Unit[]>(n).fill(null)
  unitByCords.forEach((_, i) => unitByCords[i] = new Array(m).fill(null))
  units.forEach((unit) => {
    const { x, y } = unit
    unitByCords[y][x] = unit
  })

  // adjacent squares in reading order
  const dx = [0, -1, 1, 0], dy = [-1, 0, 0, 1]
  const updateMap = (x: number, y: number, unit: Unit) => {
    const row = map[y]
    let c = "."
    if (unit && unit.type === Type.GOBLIN) {
      c = "G"
    }
    if (unit && unit.type === Type.ELF) {
      c = "E"
    }
    unitByCords[y][x] = unit
    map[y] = row.substr(0, x) + c + row.substr(x + 1)
  }

  const attack = (unit: Unit) => {
    const { x, y, type } = unit
    let enemy: Unit = null
    dx.forEach((_, i) => {
      const x1 = x + dx[i], y1 = y + dy[i]
      const candidate = unitByCords[y1][x1]
      if (
        candidate && candidate.type !== type &&
        (!enemy || candidate.hp < enemy.hp)
      ) {
        enemy = candidate
      }
    })

    if (enemy) {
      enemy.hp -= type === Type.GOBLIN ? 3 : elfPower // Elf Power;
      if (enemy.hp <= 0) {
        enemy.hp = 0
        const { x: x1, y: y1 } = enemy
        updateMap(x1, y1, null)
      }
      return true
    }
    return false
  }

  const findNextStep = (unit: Unit) => {
    // BFS
    const { x, y, type } = unit
    let dist = new Array<number[]>(n).fill(null)
    dist.forEach((_, i) => {
      dist[i] = new Array(m).fill(-1)
    })
    dist[y][x] = 0
    const queue = new Array<{
      x: number;
      y: number;
      distance: number;
      origin?: number;
    }>(nm + 10)
    let from = 0, to = 1, enemy, bestEnemy, bestOrigin, nearest = nm
    queue[from] = { x, y, distance: 0 }
    while (from < to) {
      const { x, y, distance, origin } = queue[from++]
      if (distance > nearest) break
      dx.forEach((_, i) => {
        const [x1, y1] = [x + dx[i], y + dy[i]]
        if (map[y1][x1] === "." && dist[y1][x1] === -1) {
          dist[y1][x1] = distance + 1
          queue[to++] = { x: x1, y: y1, distance: distance + 1, origin: distance === 0 ? i : origin }
        } else if ((enemy = unitByCords[y1][x1]) && enemy.type !== type) {
          if (!bestEnemy || enemy.y < bestEnemy.y || (enemy.y === bestEnemy.y && enemy.x < bestEnemy.x)) {
            bestEnemy = enemy
            bestOrigin = origin
            nearest = distance
          }
        }
      })
    }
    if (bestEnemy) {
      return [x + dx[bestOrigin], y + dy[bestOrigin]]
    } else {
      return [x, y]
    }
  }

  let rounds = 0
  let combatEnded = false
  while (!combatEnded) {
    // round
    units.forEach((unit) => {
      const { x, y, hp, type } = unit
      if (hp === 0) {
        return
      }

      combatEnded = combatEnded || !units.find(enemy => enemy.type !== type && enemy.hp > 0)
      if (combatEnded) {
        return
      }

      if (attack(unit)) {
        return
      }
      const [x1, y1] = findNextStep(unit)
      updateMap(x, y, null)
      updateMap(x1, y1, unit)
      unit.x = x1
      unit.y = y1
      attack(unit)
    })

    if (!combatEnded) {
      rounds++
    }
    if (
      noElfShouldDie && //No Elf should die
      units.find(({ hp, type }) => hp === 0 && type === Type.ELF)
    ) {
      return {elvesWon: false, rounds: -1, hpSum: -1, result: -1}
    }

    units = units
      .filter(({ hp }) => hp > 0)
      .sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y)
  }

  const elvesWon: boolean = !units.find(({ hp, type }) => type === Type.GOBLIN && hp > 0)
  const hpSum = units.reduce((summ, { hp }) => summ + hp, 0)
  return {elvesWon: elvesWon, rounds: rounds, hpSum: hpSum, result: rounds * hpSum}
}

const goB = (input) => {
  let notEnough = 3, enough = notEnough
  let result;
  let win_rounds, win_hpsumm, win_outcome
  while (!result || !result.elvesWon) {
    enough *= 2;
    result = goA(input, enough, true)
    if (result.elvesWon) {
      [win_rounds, win_hpsumm, win_outcome] = [result.rounds, result.hpSum, result.result]
    }
  }
  while (notEnough + 1 < enough) {
    let middle = Math.floor((enough + notEnough) / 2);
    const result = goA(input, middle, true)
    if (result.elvesWon) {
      enough = middle;
      [win_rounds, win_hpsumm, win_outcome] = [result.result, result.hpSum, result.result]
    } else {
      notEnough = middle
    }
  }
  return [enough, win_rounds, win_hpsumm, win_outcome]
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input, 3, false).result
const resultB = goB(input)[3]
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
