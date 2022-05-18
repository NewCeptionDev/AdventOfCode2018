import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface SleepingPhase {
  start: number,
  end: number
}

interface Guard {
  id: number,
  sleepingPhases: SleepingPhase[]
}

interface Date {
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
}

const parseDate = (line: string): Date => {
  const split = line.split(" ");
  const daySplit = split[0].substr(1).split("-")
  const hourSplit = split[1].substring(0, split[1].length - 1).split(":")

  return {
    year: parseInt(daySplit[0]),
    month: parseInt(daySplit[1]),
    day: parseInt(daySplit[2]),
    hour: parseInt(hourSplit[0]),
    minute: parseInt(hourSplit[1])
  }
}

const sortByDate = (date1: Date, date2: Date): number => {
  if(date1.year < date2.year) {
    return -1
  } else if(date1.year === date2.year){
    if(date1.month < date2.month) {
      return -1;
    } else if(date1.month === date2.month) {
      if(date1.day < date2.day) {
        return -1;
      } else if(date1.day === date2.day) {
        if(date1.hour < date2.hour) {
          return -1;
        } else if(date1.hour === date2.hour) {
          return date1.minute - date2.minute
        } else {
          return 1;
        }
      } else {
        return 1
      }
    } else {
      return 1;
    }
  } else {
    return 1;
  }
}

const parseInput = (lines: string[]): Guard[] => {
  const guards: Map<number, Guard> = new Map<number, Guard>()

  let currentGuard;
  let fallsAsleep;
  for(let line of lines) {
    const split = line.split(" ")

    if(split[2] === "Guard") {
      if(currentGuard) {
        guards[currentGuard.id] = currentGuard;
      }
      const guardId = parseInt(split[3].substring(1))
      currentGuard = guards[guardId] ? guards[guardId] : {id: guardId, sleepingPhases: []}
    } else if(split[2] === "falls") {
      fallsAsleep = parseInt(split[1].slice(3, 5))
    } else {
      currentGuard.sleepingPhases.push({start: fallsAsleep, end: parseInt(split[1].slice(3, 5))})
    }
  }
  guards[currentGuard.id] = currentGuard;

  return Object.values(guards)
}

const calculateMinutesAsleep = (sleepingPhases: SleepingPhase[]): number => {
  return sleepingPhases.map(phase => phase.end - phase.start).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goA = (input) => {
  const lines = splitToLines(input).sort((a, b) => sortByDate(parseDate(a), parseDate(b)));
  const guards = parseInput(lines)

  const guardWithMostMinutesAsleep = guards.sort((a, b) => calculateMinutesAsleep(a.sleepingPhases) - calculateMinutesAsleep(b.sleepingPhases)).pop()

  const timesMinuteAsleep: Map<number, number> = new Map<number, number>()

  for(let sleepingPhase of guardWithMostMinutesAsleep.sleepingPhases) {
    for(let i = sleepingPhase.start; i < sleepingPhase.end; i++){
      if(!timesMinuteAsleep[i]) {
        timesMinuteAsleep[i] = 0;
      }
      timesMinuteAsleep[i] += 1;
    }
  }

  let minuteMostAsleep;
  let mostTimesAsleep = Number.MIN_SAFE_INTEGER

  const keys = Object.keys(timesMinuteAsleep)

  for(let minute of keys) {
    if(timesMinuteAsleep[minute] > mostTimesAsleep) {
      minuteMostAsleep = minute;
      mostTimesAsleep = timesMinuteAsleep[minute]
    }
  }

  return guardWithMostMinutesAsleep.id * minuteMostAsleep
}

const goB = (input) => {
  const lines = splitToLines(input).sort((a, b) => sortByDate(parseDate(a), parseDate(b)));
  const guards = parseInput(lines)

  return guards.map(guard => {
    const timesMinuteAsleep: Map<number, number> = new Map<number, number>()

    for(let sleepingPhase of guard.sleepingPhases) {
      for(let i = sleepingPhase.start; i < sleepingPhase.end; i++){
        if(!timesMinuteAsleep[i]) {
          timesMinuteAsleep[i] = 0;
        }
        timesMinuteAsleep[i] += 1;
      }
    }

    let minuteMostAsleep;
    let mostTimesAsleep = Number.MIN_SAFE_INTEGER

    const keys = Object.keys(timesMinuteAsleep)

    for(let minute of keys) {
      if(timesMinuteAsleep[minute] > mostTimesAsleep) {
        minuteMostAsleep = minute;
        mostTimesAsleep = timesMinuteAsleep[minute]
      }
    }

    return {
      id: guard.id,
      mostTimesAsleepAtSameMinute: mostTimesAsleep,
      minuteMostAsleep: minuteMostAsleep
    }
  }).sort((a, b) => a.mostTimesAsleepAtSameMinute - b.mostTimesAsleepAtSameMinute).map(guard => guard.id * guard.minuteMostAsleep).pop()


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
