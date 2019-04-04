'use strict'
const fs = require('fs')
const path = require('path')

const jsonDir = process.argv[2]
if (!jsonDir) {
    throw Error('Missing jsonDir argument')
}
combineJsonAndWriteToFile(jsonDir, process.argv[3])

/**
 * @param {string} jsonDir
 * @param {string} typename     Typename to add to all top-level objects in the given directory
 *                              (will be set as the __typename property, if one doesn't already exist)
 */
function combineJsonAndWriteToFile(jsonDir, typename = null) {
    const allData = {}
    fs.readdirSync(jsonDir)
        .filter(filename => filename.match(/\.json$/))
        .forEach(filename => {
            const baseFilename = path.basename(filename, '.json')
            allData[baseFilename] = JSON.parse(
                fs.readFileSync(path.join(jsonDir, filename), 'utf8')
            )
        })

    if (typename) {
        // Add __typename
        for (const data of Object.values(allData)) {
            for (const item of Array.isArray(data) ? data : [data]) {
                if (!item.__typename) {
                    item.__typename = typename
                }
            }
        }
    }

    const dataArr = Object.values(allData).some(data => Array.isArray(data))
        ? // If it's an array of arrays (or a mix of objects and arrays), export as one big object.
          [allData]
        : Object.values(allData)

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'index.json')
    fs.writeFileSync(outputPath, JSON.stringify(dataArr))

    console.log('Done')
}
