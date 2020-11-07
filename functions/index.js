const functions = require('firebase-functions')
const admin = require('firebase-admin')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { parse } = require('papaparse')

admin.initializeApp()

function removeStrSpaces (str) {
  return str.replace(/ /g, '')
}

exports.newSolution = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket
  const filePath = object.name
  const contentType = object.contentType

  if (!(contentType === 'text/csv')) {
    return console.log('This is not a CSV file.');
  }

  const fileName = path.basename(filePath)
  const bucket = admin.storage().bucket(fileBucket)
  const tempFilePath = path.join(os.tmpdir(), fileName)
  await bucket.file(filePath).download({destination: tempFilePath})
  console.log('File downloaded locally to', tempFilePath)

  var fileStr = fs.readFileSync(tempFilePath, 'utf-8')
  fileStr = fileStr.substring(0, fileStr.length - 1)
  var fileParsed = parse(fileStr, { header: true })

  var collection = {}
  var tempReport = {}
  var report = []
  var range = []
  var weights = []
  var flops = []
  var setRange = new Set()
  
  var heroInPosition = fileParsed.meta.fields.includes('IP Equity')
  var columns = []
  
  var heroActions = []
  var setHeroActions = new Set()

  for (let item of fileParsed.meta.fields) {
    if (!['Hand', 'Weight IP', 'Weight OOP', 'IP EQR', 'OOP EQR', 'FOLD EV'].includes(item)) {
      columns.push({
        name: item,
        label: item,
        field: item,
        align: 'left',
        sortable: true
      })
      var temp = item.indexOf(' Freq')
      if (temp > -1 && !setHeroActions.has(item)) {
        setHeroActions.add(item)
        var act = item.substring(0, temp)
        var spacePosition = act.indexOf(' ')
        heroActions.push(spacePosition === -1 ? {
          action: act
        } : {
          action: act.substring(0, spacePosition),
          value: parseInt(act.substring(spacePosition + 1))
        })
      }
    }
  }

  for (let line of fileParsed.data) {
    
    const flop = removeStrSpaces(line['Flop'])
    const hand = line['Hand']
    const weight = parseFloat(line['Weight ' + (heroInPosition ? 'IP' : 'OOP')])

    if (!setRange.has(hand)) {
      setRange.add(hand)
      range.push(hand)
      weights.push(weight)
    }

    delete line['Flop']
    delete line['Hand']
    delete line['Weight ' + (heroInPosition ? 'IP' : 'OOP')]
    delete line[(heroInPosition ? 'IP' : 'OOP') + ' EQR']
    delete line['FOLD EV']

    for (let key in line) {
      line[key] = parseFloat(line[key])
    }

    if (!(flop in collection)) {
      collection[flop] = {}
      tempReport[flop] = {
        ...line,
        count: weight
      }
    } else {
      for (let key in line) {
        tempReport[flop][key] += (line[key] * weight)
      }
      tempReport[flop].count += weight
    }

    collection[flop][hand] = line
  }

  var promisses = []
  var id = fileName.substring(0, fileName.indexOf('.'))

  for (let flop in collection) {
    flops.push(flop)
    promisses.push(admin.firestore().collection('solutions').doc(id).collection('flops').doc(flop).set(collection[flop]))
  }

  for (let flop in tempReport) {
    for (var key in tempReport[flop]) {
      tempReport[flop][key] /= tempReport[flop].count
      tempReport[flop][key] = Math.round(tempReport[flop][key] * 100) / 100
    }
    delete tempReport[flop].count
    tempReport[flop].Flop = flop
    report.push(tempReport[flop])
  }

  await Promise.all(promisses)
  await admin.firestore().collection('solutions').doc(id).update({
    range,
    weights,
    flops,
    heroActions,
    report: {
      data: report,
      columns
    }
  })

  return fs.unlinkSync(tempFilePath)
})
