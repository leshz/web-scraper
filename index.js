import ora from 'ora'
import { readAndLoadFile, writeFile } from './src/fileManager.js'
import { launch, searchBalanceAmount } from './src/scrapper.js'
import conf from './conf.json';

(async () => {
  const spinner = ora('Loading scrapper').start()
  const { url, timeout, debug, delimiter } = conf

  const accounts = await readAndLoadFile({ delimiter })
  const { page, browser } = await launch({ debug, timeout, spinner })
  const output = [['user', 'pass', 'server']]
  for (const account of accounts) {
    const result = await searchBalanceAmount({ url, account, timeout, page, spinner })
    output.push(result)
  }
  await writeFile({ output, delimiter })
  await browser.close()
  spinner.stop()
})()
