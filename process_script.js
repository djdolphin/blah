'use strict'

var s = require('./scratch_prims')

module.exports = function processScript (inputScript) {
  var commandId = 0
  var interpreterVariableId = 0

  var setVarCommands = []
  var listDeleteCommands = []
  var listInsertCommands = []
  var nextCommands = []

  var setVarExpression = false
  var setVarArg1Expression = null
  var setVarArg2Expression = null

  var listDeleteExpression = false
  var listDeleteArg1Expression = null
  var listDeleteArg2Expression = null

  var listInsertExpression = false
  var listInsertArg1Expression = null
  var listInsertArg2Expression = null
  var listInsertArg3Expression = null

  var nextCommandExpression = -1

  readScript(inputScript, -1)

  for (let i = nextCommands.length - 1; i >= 1; i--) {
    function bleh () {
      return s.equals(s.getVar('INTERPRETER COMMAND ID'), i)
    }

    if (setVarCommands[i]) {
      setVarExpression = s.or(
        bleh(),
        setVarExpression
      )
      setVarArg1Expression = s.or(
        s.and(
          bleh(),
          s.join(setVarCommands[i][0], '')
        ),
        setVarArg1Expression
      )
      setVarArg2Expression = s.or(
        s.and(
          bleh(),
          s.join(setVarCommands[i][1], '')
        ),
        setVarArg2Expression
      )
    }
    if (listDeleteCommands[i]) {
      listDeleteExpression = s.or(
        bleh(),
        listDeleteExpression
      )
      listDeleteArg1Expression = s.or(
        s.and(
          bleh(),
          s.join(listDeleteCommands[i][0], '')
        ),
        listDeleteArg1Expression
      )
      listDeleteArg2Expression = s.or(
        s.and(
          bleh(),
          s.join(listDeleteCommands[i][1], '')
        ),
        listDeleteArg2Expression
      )
    }
    if (listInsertCommands[i]) {
      listInsertExpression = s.or(
        bleh(),
        listInsertExpression
      )
      listInsertArg1Expression = s.or(
        s.and(
          bleh(),
          s.join(listInsertCommands[i][0], '')
        ),
        listInsertArg1Expression
      )
      listInsertArg2Expression = s.or(
        s.and(
          bleh(),
          s.join(listInsertCommands[i][1], '')
        ),
        listInsertArg2Expression
      )
      listInsertArg3Expression = s.or(
        s.and(
          bleh(),
          s.join(listInsertCommands[i][2], '')
        ),
        listInsertArg3Expression
      )
    }
    nextCommandExpression = s.or(
      s.and(
        bleh(),
        nextCommands[i]
      ),
      nextCommandExpression
    )
  }

  var outputScript = [
    ['whenGreenFlag'],
    s.setVar('INTERPRETER COMMAND ID', 1),
    s.until(
      s.equals(s.getVar('INTERPRETER COMMAND ID'), -1),
      [
        s.setVar(
          'INTERPRETER COMMAND ID',
          s.and(
            s.join(
              s.and(
                setVarExpression,
                s.setVar(
                  setVarArg1Expression,
                  setVarArg2Expression
                )
              ),
              s.join(
                s.and(
                  listDeleteExpression,
                  s.listDelete(
                    listDeleteArg1Expression,
                    listDeleteArg2Expression
                  )
                ),
                s.and(
                  listInsertExpression,
                  s.listInsert(
                    listInsertArg1Expression,
                    listInsertArg2Expression,
                    listInsertArg3Expression
                  )
                )
              )
            ),
            nextCommandExpression
          )
        )
      ]
    )
  ]
  return outputScript

  function newCommand () {
    commandId += 1;
  }

  function nextCommand () {
    return commandId + 1
  }

  function newVariable () {
    interpreterVariableId += 1;
    return 'INTERPRETER ' + interpreterVariableId
  }

  function setSetVarCommand (args) {
    setVarCommands[commandId] = args
  }

  function setListDeleteCommand (args) {
    listDeleteCommands[commandId] = args
  }

  function setListInsertCommand (args) {
    listInsertCommands[commandId] = args
  }

  function setNextCommand (args) {
    nextCommands[commandId] = args
  }

  function readScript (script, nextCommand) {
    for (let i = 0; i < script.length; i++) {
      readBlock(script[i])
    }
    if (nextCommand) {
      newCommand()
      gotoCommand(nextCommand)
    }
  }

  function readBlock (block) {
    var op = block[0]
    switch (op) {
      case 'setVar:to:': return setVarCommand(block)
      case 'changeVar:by:': return changeVarCommand(block)
      case 'append:toList:': return listPushCommand(block)
      case 'deleteLine:ofList:': return listDeleteCommand(block)
      case 'insert:at:ofList:': return listInsertCommand(block)
      case 'setLine:ofList:to:': return listReplaceCommand(block)

      case 'doRepeat': return repeatCommand(block)
      case 'doForever': return foreverCommand(block)
      case 'doIf': return ifCommand(block)
      case 'doIfElse': return ifElseCommand(block)
      case 'doWaitUntil': return waitUntilCommand(block)
      case 'doUntil': return repeatUntilCommand(block)
      case 'stopScripts': return stopCommand(block)
    }
  }

  function gotoCommand (id) {
    setNextCommand(id)
  }

  function continueCommand () {
    setNextCommand(commandId + 1)
  }

  function setVarCommand (block) {
    newCommand()
    setSetVarCommand([block[1], block[2]])
    continueCommand()
  }

  function changeVarCommand (block) {
    var variable = block[1]
    newCommand()
    setSetVarCommand([
      variable,
      s.add(s.getVar(variable), block[2])
    ])
    continueCommand()
  }

  function listPushCommand (block) {
    var thing = block[1]
    var list = block[2]

    newCommand()
    setListInsertCommand([thing, 'last', list])
    continueCommand()
  }

  function listDeleteCommand (block) {
    newCommand()
    setListDeleteCommand([block[1], block[2]])
    continueCommand()
  }

  function listInsertCommand (block) {
    newCommand()
    setListInsertCommand([block[1], block[2], block[3]])
    continueCommand()
  }

  function listReplaceCommand (block) {
    var index = block[1]
    var list = block[2]
    var thing = block[3]

    newCommand()
    setListDeleteCommand([index, list])
    setListInsertCommand([thing, index, list])
    continueCommand()
  }

  function repeatCommand (block) {
    var variable = newVariable()

    // init
    newCommand()
    setSetVarCommand([variable, -1])
    continueCommand()

    // loop
    newCommand()
    var loopId = commandId
    setSetVarCommand([variable, s.add(s.getVar(variable), 1)])

    // loop inside
    var substackId = nextCommand()
    readScript(block[2], loopId)

    // loop (again)
    nextCommands[loopId] = s.or(
      s.and(s.lessThan(s.getVar(variable), block[1]), substackId),
      nextCommand()
    )
  }

  function foreverCommand (block) {
    newCommand()
    var loopId = commandId
    continueCommand()

    readScript(block[1], loopId)
  }

  function ifCommand (block) {
    newCommand()
    var ifId = commandId
    var substackId = nextCommand()

    readScript(block[2])

    nextCommands[ifId] = s.or(
      s.and(block[1], substackId),
      nextCommand()
    )
  }

  function ifElseCommand (block) {
    newCommand()
    var ifId = commandId
    var substack1Id = nextCommand()

    readScript(block[2])
    newCommand()

    var substack1EndId = commandId
    var substack2Id = nextCommand()

    readScript(block[3])

    nextCommands[ifId] = s.or(
      s.and(block[1], substack1Id),
      substack2Id
    )

    nextCommands[substack1EndId] = nextCommand()
  }

  function waitUntilCommand (block) {
    newCommand()
    setNextCommand(s.or(
      s.and(block[1], nextCommand()),
      commandId
    ))
  }

  function repeatUntilCommand (block) {
    newCommand()
    var loopId = commandId
    var substackId = nextCommand()

    readScript(block[2], loopId)

    nextCommands[loopId] = s.or(
      s.and(s.not(block[1]), substackId),
      nextCommand()
    )
  }

  function stopCommand (block) {
    if (block[1] === 'all' || block[1] === 'this script') {
      newCommand()
      setNextCommand(-1)
    }
  }
}
