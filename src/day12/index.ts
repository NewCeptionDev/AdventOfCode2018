import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Rule {
  from: string;
  to: string;
}

const parseRule = (ruleString: string): Rule => {
  const split = ruleString.split(" ")

  return {
    from: split[0],
    to: split[2]
  }
}

const calculateNextState = (rules: Rule[], state: Map<number, boolean>): Map<number, boolean> => {
  const newState: Map<number, boolean> = new Map<number, boolean>()

  const keys = Object.keys(state).map(key => parseInt(key)).sort((a, b) => a - b)
  const lowestKey = keys[0]
  const highestKey = keys[keys.length - 1]

  for(let i = lowestKey - 2; i <= highestKey + 2; i++) {
    let surrounding = state[i - 2] ? "#" : "."
    surrounding += state[i - 1] ? "#" : "."
    surrounding += state[i] ? "#" : "."
    surrounding += state[i + 1] ? "#" : "."
    surrounding += state[i + 2] ? "#" : "."

    const applyingRule = rules.find(rule => rule.from === surrounding)

    if(applyingRule && applyingRule.to === "#") {
      newState[i] = true;
    }
  }

  return newState
}

const goA = (input) => {
  const lines = splitToLines(input)
  const initialState = lines[0].split(" ")[2];

  const rules = lines.slice(2).map(line => parseRule(line))

  let stateMap: Map<number, boolean> = new Map<number, boolean>()

  for(let i = 0; i < initialState.length; i++) {
    stateMap[i] = initialState.charAt(i) === "#"
  }

  for(let i = 0; i < 20; i++) {
    stateMap = calculateNextState(rules, stateMap)
  }

  return Object.keys(stateMap).map(key => parseInt(key)).reduce((previousValue, currentValue) => previousValue + currentValue)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const initialState = lines[0].split(" ")[2];

  const rules = lines.slice(2).map(line => parseRule(line))

  let stateMap: Map<number, boolean> = new Map<number, boolean>()

  for(let i = 0; i < initialState.length; i++) {
    stateMap[i] = initialState.charAt(i) === "#"
  }
  // Watched Difference between Sums for 0 to 150 to see that after 97 there is always a difference of 62
  //
  // let last = 0;
  // for(let i = 0; i < 150; i++) {
  //   stateMap = calculateNextState(rules, stateMap)
  //   const newSum = Object.keys(stateMap).map(key => parseInt(key)).reduce((previousValue, currentValue) => previousValue + currentValue)
  //   console.log("i:", i, newSum - last)
  //   last = newSum
  // }

  for(let i = 0; i < 98; i++) {
    stateMap = calculateNextState(rules, stateMap)
    console.log(Object.keys(stateMap).map(key => parseInt(key)).reduce((previousValue, currentValue) => previousValue + currentValue))
  }

  return Object.keys(stateMap).map(key => parseInt(key)).reduce((previousValue, currentValue) => previousValue + currentValue) + (50000000000 - 98) * 62
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
