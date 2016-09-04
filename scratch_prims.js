// Scratch primitives and some custom utilities

var s = {
  wait: (secs) => ['wait:elapsed:from:', secs],
  repeat: (n, blocks) => ['doRepeat', n, blocks],
  forever: (blocks) => ['doForever', blocks],
  if: (condition, blocks) => ['doIf', condition, blocks],
  ifElse: (condition, a, b) => ['doIf', condition, a, b],
  waitUntil: (condition) => ['doWaitUntil', condition],
  while: (condition, script) => ['doWhile', condition, script],
  until: (condition, script) => ['doUntil', condition, script],
  return: () => ['stopScripts', 'this script'],
  stopAll: () => ['stopScripts', 'all'],
  stopOthers: () => ['stopScripts', 'other scripts in sprite'],

  add: (a, b) => ['+', a, b],
  subtract: (a, b) => ['-', a, b],
  multiply: (a, b) => ['*', a, b],
  divide: (a, b) => ['/', a, b],
  random: (a, b) => ['randomFrom:to:', a, b],
  lessThan: (a, b) => ['<', a, b],
  equals: (a, b) => ['=', a, b],
  greaterThan: (a, b) => ['>', a, b],
  and: (a, b) => ['&', a, b],
  or: (a, b) => ['|', a, b],
  not: (condition) => ['not', condition],
  join: (a, b) => ['concatenate:with:', a, b],
  stringLetter: (string, n) => ['letter:of:', n, string],
  mod: (a, b) => ['%', a, b],
  round: (n) => ['rounded', n],
  mathOp: (op, n) => ['computeFunction:of:', op, n],

  getVar: (variable) => ['readVariable', variable],
  setVar: (variable, val) => ['setVar:to:', variable, val],
  changeVar: (variable, n) => ['changeVar:by:', variable, n],

  listPush: (val, list) => ['append:toList:', val, list],
  listDelete: (line, list) => ['deleteLine:ofList:', line, list],
  listInsert: (val, line, list) => ['insert:at:ofList:', val, line, list],
  listReplace: (line, list, val) => ['setLine:ofList:to:', line, list, val],
  listItem: (line, list) => ['getLine:ofList:', line, list],
  listLength: (list) => ['lineCountOfList:', list],
  listContains: (list, val) => ['list:contains:', list, val],
  listToString: (list) => ['contentsOfList:', list],

  listUnshift: (list) => join(
    s.listItem(list, 1),
    s.stringLetter(listDelete(list, 1), -1)
  ),
  listPop: (list) => join(
    s.listItem(list, 'last'),
    s.stringLetter(listDelete(list, 1), -1)
  ),

  incrementVar: (variable) => or(
    s.not(changeVar(variable, 1)),
    s.getVar(variable)
  ),
  varIncrement: (variable) => join(
    s.getVar(variable),
    s.stringLetter(changeVar(variable, 1), -1)
  )
}

module.exports = s
