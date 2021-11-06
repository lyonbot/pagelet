const fs = require('fs-extra')
const path = require('path')
const { program } = require('commander');
const chalk = require('chalk');

/**
 * @param {string} filePath 
 * @param {(content: string) => string | Promise<string>} modifier 
 */
const modifyTextFile = async (filePath, modifier) => fs.writeFile(filePath, await modifier(await fs.readFile(filePath, 'utf8')))

program
  .version('0.0.1')
  .argument('<name>', 'the name without @pagelet/ prefix')
  .action(async function (name) {
    const TEMPLATE = path.resolve(__dirname, 'package-template')
    const DEST = path.resolve(__dirname, '../packages/', name)

    if (await fs.pathExists(DEST)) {
      console.error(chalk.red('Directory exists: ' + DEST))
      process.exit(1)
    }

    await fs.copy(TEMPLATE, DEST, { recursive: true })

    await modifyTextFile(path.resolve(DEST, 'package.json'), s => s.replace(/__NAME__/g, name))
    console.log(chalk.green('Package initialized at ' + DEST))
  })
  .parse(process.argv)