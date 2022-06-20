import { test, readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Group {
  units: number,
  unitHP: number,
  attackDamage: number,
  attackType: string,
  initiative: number,
  weaknesses?: string[],
  immunities?: string[],
  alive: boolean,
  group: number
}

interface Pair<E> {
  first: E,
  second: E
}

const parseGroup = (line: string, group: number): Group => {
  const split = line.split(" ");

  let units: number;
  let unitHP: number;
  let attackDamage: number;
  let attackType: string;
  let initiative: number;
  const weaknesses: string[] = []
  const immunities: string[] = []

  let parsingWeaknesses = false;
  let parsingImmunities = false;
  let parsingInitiative = false;
  let parsingAttackDamageAndType = false;

  for(let i = 0; i < split.length; i++) {
    if(i === 0) {
      units = parseInt(split[0])
    } else if(i === 4) {
      unitHP = parseInt(split[4])
    } else {
      if(parsingWeaknesses) {
        weaknesses.push(split[i].slice(0, split[i].length - 1))
        if(split[i].charAt(split[i].length - 1) !== ",") {
          parsingWeaknesses = false
        }
      }else if(parsingImmunities) {
        immunities.push(split[i].slice(0, split[i].length - 1))
        if(split[i].charAt(split[i].length - 1) !== ",") {
          parsingImmunities = false
        }
      } else if(parsingInitiative) {
        initiative = parseInt(split[i])
        parsingInitiative = false
      } else if(parsingAttackDamageAndType) {
        attackDamage = parseInt(split[i])
        attackType = split[i + 1]
        parsingAttackDamageAndType = false
        i++
      } else if(split[i].slice(1) === "weak" || split[i] === "weak") {
        parsingWeaknesses = true
        i++
      } else if(split[i].slice(1) === "immune" || split[i] === "immune") {
        parsingImmunities = true
        i++
      } else if(split[i] === "initiative") {
        parsingInitiative = true
      } else if(split[i] === "does") {
        parsingAttackDamageAndType = true;
      }
    }
  }

  return {
    units: units,
    unitHP: unitHP,
    initiative: initiative,
    attackDamage: attackDamage,
    attackType: attackType,
    weaknesses: weaknesses.length > 0 ? weaknesses : undefined,
    immunities: immunities.length > 0 ? immunities : undefined,
    alive: true,
    group: group
  }
}

const calculatePossibleDamageToGroup = (attackingGroup: Group, defendingGroup: Group): number => {
  const damage = attackingGroup.units * attackingGroup.attackDamage

  if((defendingGroup.immunities && defendingGroup.immunities.includes(attackingGroup.attackType))) {
    return 0
  } else if(defendingGroup.weaknesses && defendingGroup.weaknesses.includes(attackingGroup.attackType)) {
    return damage * 2
  } else {
    return damage
  }
}

const fightGroups = (immuneSystemGroups: Group[], infectionGroups: Group[], immuneSystemNeedsToWin: boolean): number => {
  while(immuneSystemGroups.filter(group => group.alive).length > 0 && infectionGroups.filter(group => group.alive).length > 0) {
    const targetingOrder = [...immuneSystemGroups.filter(group => group.alive), ...infectionGroups.filter(group => group.alive)].sort((a, b) => ((b.units * b.attackDamage) * 100000 + b.initiative) - ((a.units * a.attackDamage) * 100000 + a.initiative))

    const targeting: Pair<Group>[] = []

    for(let group of targetingOrder) {
      let possibleTargets;
      if(group.group === 0){
        possibleTargets = infectionGroups.filter(group => group.alive && !targeting.find(pair => pair.second === group))
      } else {
        possibleTargets = immuneSystemGroups.filter(group => group.alive && !targeting.find(pair => pair.second === group))
      }
      const target = possibleTargets.sort((a, b) => (calculatePossibleDamageToGroup(group, a) * 100000000 + ((a.units * a.attackDamage) * 100000) + a.initiative) - (calculatePossibleDamageToGroup(group, b) * 100000000 + ((b.units * b.attackDamage) * 100000) + b.initiative)).pop()
      if(target && calculatePossibleDamageToGroup(group, target) > 0) {
        targeting.push({
          first: group,
          second: target
        })
      }
    }

    // If no Group can target another one end the battle with a result of 0
    if(targeting.length === 0){
      return 0
    }

    const attackingOrder = [...immuneSystemGroups.filter(group => group.alive), ...infectionGroups.filter(group => group.alive)].sort((a, b) => b.initiative - a.initiative)

    for(let group of attackingOrder) {
      const targetPlan = targeting.find(target => target.first === group)
      if(targetPlan && group.alive) {
        const damage = calculatePossibleDamageToGroup(group, targetPlan.second)
        targetPlan.second.units -= Math.floor(damage / targetPlan.second.unitHP)

        if(targetPlan.second.units <= 0) {
          targetPlan.second.alive = false
        }
      }
    }
  }

  if(immuneSystemNeedsToWin) {
    return immuneSystemGroups.filter(group => group.alive).map(group => group.units).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  }
  return immuneSystemGroups.filter(group => group.alive).map(group => group.units).reduce((previousValue, currentValue) => previousValue + currentValue, 0) + infectionGroups.filter(group => group.alive).map(group => group.units).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goA = (input) => {
  const lines = splitToLines(input)
  const splittingLine = lines.findIndex(line => line === "Infection:")

  const immuneSystemGroups = lines.slice(1, splittingLine).map(line => parseGroup(line, 0))
  const infectionGroups = lines.slice(splittingLine + 1).map(line => parseGroup(line, 1))

  return fightGroups(immuneSystemGroups, infectionGroups, false)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const splittingLine = lines.findIndex(line => line === "Infection:")

  let step: number = 100;

  let boost = 0;
  while(true) {
    const immuneSystemGroups = lines.slice(1, splittingLine).map(line => parseGroup(line, 0))
    const infectionGroups = lines.slice(splittingLine + 1).map(line => parseGroup(line, 1))

    immuneSystemGroups.forEach(group => group.attackDamage += boost);

    const result = fightGroups(immuneSystemGroups, infectionGroups, true)

    if(result > 0) {
      if(step === 1) {
        return result
      } {
        boost -= step
      }
    } else {
      if(step > 1) {
        step = Math.floor(step / 2);
      }
      boost += step
    }
  }
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
