const fs = require('fs')
const str = fs.readFileSync('./package.json', 'utf-8')
const PACKAGE = JSON.parse(str)
const semver = require('semver')

module.exports = Object.fromEntries(
    Object.entries(PACKAGE.dependencies)
        .filter(([packageName, version]) => version.match(/[\d|.]{2,}/g))
        .map(
            ([packageName, version]) => [packageName, semver.minVersion(version).version]))