'use strict'

var fs = require('fs')
var prompt = require('prompt-promise')
var JSZip = require('jszip')

var processScript = require('./process_script')

var template = require('./template.json')
var backdrop = fs.readFileSync('backdrop.png')

prompt.multiline('JSON:').then(processProject)

function processProject (aliceJson) {
  prompt.finish()

  try {
    console.log(aliceJson)
    var aliceProject = JSON.parse(aliceJson)
    var aliceScript = aliceProject.scripts[0][2]
    var bobScript = processScript(aliceScript.slice(1))

    var bobProject = template
    bobProject.scripts = [[10, 10, bobScript]]
    bobProject.variables = aliceScript.variables
    bobProject.lists = aliceScript.lists

    var zip = new JSZip()
    zip.file('project.json', JSON.stringify(bobProject))
    zip.file('0.png', backdrop)
    zip.generateNodeStream().pipe(fs.createWriteStream('bob.sb2'))
  } catch(e) {
    console.log(e)
  }
}
