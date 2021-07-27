const child_process = require('child_process')
const command = 'git log -1 --format=%h'
const commitHash = child_process.execSync(command).toString().trim()
module.exports = { commitHash }