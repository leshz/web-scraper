import ora from 'ora'
import csv from 'csvjson'
import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const spinner = ora('Loading scrapper').start()

const readAndLoadFile = async ({ fileName = 'accounts.csv', encoding = 'utf8', delimiter = '' }) => {
  const styleDeLimiter = delimiter === 'google' ? ',' : ';'
  try {
    const accountsFile = await fs.readFileSync(path.resolve(fileName), { encoding })
    const accounts = csv.toSchemaObject(accountsFile, { delimiter: styleDeLimiter })
    const isValidUser = accounts.every(item => item?.user)
    const isValidPass = accounts.every(item => item?.pass)
    if (accounts.length === 0 || !isValidUser || !isValidPass) {
      throw new Error('Bad data formated')
    }
    return accounts
  } catch (error) {
    throw new Error(`Error reading accounts file: ${error.message}`)
  }
}
const writeFile = async ({ fileName = 'results.csv', output = [], delimiter = '' }) => {
  const styleDeLimiter = delimiter === 'google' ? ',' : ';'
  const file = csv.toCSV(output, { headers: false, delimiter: styleDeLimiter }).replaceAll('[]', '').replace(/\n/, '')
  fs.writeFileSync(fileName, file)
}

const scrapper = async ({ browser = null, url = '', account = {}, timeout }) => {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    spinner.text = `Working with ${account?.user} account`
    await page.locator('input[name="UserName"]').fill(account?.user)
    await page.locator('input[name="Password"]').fill(account?.pass)
    await page.locator('button.rz-button').click()
    await page.locator('.container.dashboard').waitFor({ timeout })
    await page.screenshot({ path: `./screenshots/${account?.user}.png` })
    const innetCredentials = await page.locator('.credentials .values').textContent()
    const credentialsArray = innetCredentials.split(/\n{1,}/)
    const credential = credentialsArray.map(credential => credential.replace(/(Login:|Password:|Server Address)|\s{1,}/gm, ''))
    await page.close()
    spinner.succeed()
    return credential
  } catch (error) {
    await page.close()
    spinner.fail()
    return [`${account?.user}`, 'error', `${error.message}`]
  } finally {
    spinner.start('Loading scrapper')
  }
}
  ; (async () => {
  const debug = false
  const timeout = 6000
  const delimiter = 'numbers'
  const url = ''
  const accounts = await readAndLoadFile({ delimiter })
  const browser = await chromium.launch({ headless: !debug, timeout })
  const output = [['user', 'pass', 'server']]
  for (const account of accounts) {
    const result = await scrapper({ browser, url, account, timeout })
    output.push(result)
  }
  await writeFile({ output, delimiter })
  await browser.close()
  spinner.stop()
})()
