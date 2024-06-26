const { readFileSync } = require('fs')
const json = readFileSync('./package.json', 'utf-8')
const PACKAGE = JSON.parse(json)
const semver = require('semver')

const PICK = ['@fancyapps/fancybox', 'prismjs', 'lightgallery', 'mathjax', 'baguettebox.js']
module.exports = Object.fromEntries(
    PICK.map(p => [p, PACKAGE.dependencies[p]])
       /*  .filter(([packageName, version]) => version.match(/[\d|.]{2,}/g)) */
        .map(
            ([packageName, version]) => [packageName, semver.minVersion(version).version]))