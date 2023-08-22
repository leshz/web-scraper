import { readAndLoadFile, writeFile } from './src/fileManager.js'
import { launch, searchBalanceAmount } from './src/scrapper.js'
import { start, success, spinner } from './src/helpers.js'
import config from './conf.js'

(async () => {
  start('Init scripting')
  const { url, timeout, debug, delimiter } = config
  success()

  const accounts = await readAndLoadFile({ delimiter })
  const { page, browser } = await launch({ debug, timeout })
  const output = [['user', 'pass', 'server']]
  for (const account of accounts) {
    const result = await searchBalanceAmount({ url, account, timeout, page })
    output.push(result)
  }
  // await writeFile({ output, delimiter })
  await browser.close()
  spinner.succeed('End scripting')
})()
