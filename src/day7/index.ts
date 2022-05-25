import { test, readInput } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Step {
  id: string,
  finishedBefore: string[]
}

interface Worker {
  workingOn: string,
  finishedAt: number
}

const parseSteps = (lines: string[]): Map<string, Step> => {
  const steps: Map<string, Step> = new Map<string, Step>()

  for(let line of lines){
    const split = line.split(" ")
    const id = split[7]

    let step;

    if(steps[id] !== undefined) {
      step = steps[id]
    } else {
      step = {
        id: id,
        finishedBefore: []
      }
    }
    step.finishedBefore.push(split[1])
    steps[id] = step

    if(steps[split[1]] === undefined) {
      steps[split[1]] = {
        id: split[1],
        finishedBefore: []
      }
    }
  }

  return steps
}

const goA = (input) => {
  const lines = splitToLines(input)
  const steps = parseSteps(lines)

  const doneSteps: string[] = []
  const toDo: string[] = Object.keys(steps).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))

  while(toDo.length > 0) {
    let correctStep;

    for(let i = 0; i < toDo.length && correctStep === undefined; i++) {
      if(steps[toDo[i]].finishedBefore.filter(step => !doneSteps.includes(step)).length === 0) {
        correctStep = toDo[i]
      }
    }

    if(correctStep !== undefined) {
      doneSteps.push(correctStep)
      toDo.splice(toDo.indexOf(correctStep), 1)
    } else {
      console.log("Something went wrong")
      break;
    }
  }

  return doneSteps.join("")
}

const goB = (input, countOfWorkers: number, stepDurationExtra: number) => {
  const lines = splitToLines(input)
  const steps = parseSteps(lines)

  const doneSteps: string[] = []
  const toDo: string[] = Object.keys(steps).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
  let workers: Worker[] = []

  let time = 0;

  while(toDo.length > 0 || workers.length > 0) {
    const removableWorkers: number[] = []
    for(let i = 0; i < workers.length; i++) {
      if(time === workers[i].finishedAt) {
        doneSteps.push(workers[i].workingOn)
        removableWorkers.push(i)
      }
    }

    workers = workers.filter((worker, index) => !removableWorkers.includes(index))

    const startedSteps: string[] = []
    for(let i = 0; i < toDo.length && workers.length < countOfWorkers; i++) {
      if(steps[toDo[i]].finishedBefore.filter(step => !doneSteps.includes(step)).length === 0) {
        workers.push({
          workingOn: toDo[i],
          finishedAt: time + (toDo[i].charCodeAt(0) - "A".charCodeAt(0) + 1) + stepDurationExtra
        })
        startedSteps.push(toDo[i])
      }
    }

    for(let started of startedSteps) {
      toDo.splice(toDo.indexOf(started), 1)
    }
    time++;
  }

  return time - 1
}

/* Tests */

test(goA(readTestFile()), "CABDFE")
test(goB(readTestFile(), 2, 0), 15)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input, 5, 60)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
