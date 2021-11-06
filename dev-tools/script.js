const fs = require('fs-extra')
const path = require('path')
const cp = require('child_process')
const { program } = require('commander');
const chalk = require('chalk');

const exec = cmd => cp.execSync(cmd, {
  shell: true,
  stdio: ['ignore', 'inherit', 'inherit'],
})

program
  .version('0.0.1')

program
  .command('build')
  .action(async () => {
    exec("npx tsc")
  })

program
  .command('prepareDev')
  .action(async () => {
    exec("npx tsc --incremental")
  })

program
  .command('dev')
  .action(async () => {
    exec("npx tsc --incremental --watch")
  })

program
  .parse(process.argv)