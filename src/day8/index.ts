import { test, readInput } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const input = prepareInput(readInput())

interface Node {
  childNodes: Node[],
  metadataEntries: number[]
}

const parseNode = (tree: number[], startIndex: number): {node: Node, returnIndex: number} => {
  const quantityOfChildren: number = tree[startIndex]
  const quantityOfMetadataEntries: number = tree[startIndex + 1];

  let index: number = startIndex + 2;
  const children: Node[] = [];

  for(let i = 0; i < quantityOfChildren; i++) {
    const result = parseNode(tree, index);
    index = result.returnIndex;
    children.push(result.node)
  }

  return {
    node: {
      childNodes: children,
      metadataEntries: quantityOfMetadataEntries > 0 ? tree.slice(index, index + quantityOfMetadataEntries) : []
    },
    returnIndex: index + quantityOfMetadataEntries
  }
}

const addUpMetadataEntries = (node: Node): number => {
  return node.metadataEntries.reduce((previousValue, currentValue) => previousValue + currentValue, 0) + node.childNodes.map(child => addUpMetadataEntries(child)).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const getNodeValue = (node: Node): number => {
  if(node.childNodes.length === 0) {
    return node.metadataEntries.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  }

  let value = 0;

  for(let meta of node.metadataEntries) {
    if(meta > 0 && meta - 1 < node.childNodes.length) {
      value += getNodeValue(node.childNodes[meta - 1])
    }
  }

  return value
}

const goA = (input) => {
  const tree: number[] = input.trim().split(" ").map(entry => parseInt(entry));
  const node = parseNode(tree, 0)

  return addUpMetadataEntries(node.node)
}

const goB = (input) => {
  const tree: number[] = input.trim().split(" ").map(entry => parseInt(entry));
  const node = parseNode(tree, 0)

  return getNodeValue(node.node)
}

/* Tests */

test(goA("2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2"), 138)
test(goB("2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2"), 66)

/* Results */

console.time("Time")
const resultA = goA(input)
const resultB = goB(input)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
