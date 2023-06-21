import ora from 'ora'
import csv from 'csvjson'
import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const spinner = ora('Loading scrapper').start()
const readAndLoadFile = async ({
  fileName = 'accounts.csv',
  encoding = 'utf8',
  delimiter = ''
}) => {
  const styleDeLimiter = delimiter === 'google' ? ',' : ';'
  try {
    const accountsFile = await fs.readFileSync(path.resolve(fileName), {
      encoding
    })
    const accounts = csv.toSchemaObject(accountsFile, {
      delimiter: styleDeLimiter
    })
    const isValidUser = accounts.every((item) => item?.user)
    const isValidPass = accounts.every((item) => item?.pass)
    if (accounts.length === 0 || !isValidUser || !isValidPass) {
      throw new Error('Bad data formated')
    }
    return accounts
  } catch (error) {
    throw new Error(`Error reading accounts file: ${error.message}`)
  }
}
const writeFile = async ({
  fileName = 'results.csv',
  output = [],
  delimiter = ''
}) => {
  const styleDeLimiter = delimiter === 'google' ? ',' : ';'
  const file = csv
    .toCSV(output, { headers: false, delimiter: styleDeLimiter })
    .replaceAll('[]', '')
    .replace(/\n/, '')
  fs.writeFileSync(fileName, file)
}

const scrapper = async ({
  browser = null,
  url = '',
  account = {},
  timeout,
  page = null
}) => {
  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    spinner.text = `Working with ${account?.user} account`
    await page.locator('input[name="UserName"]').fill(account?.user)
    await page.locator('input[name="Password"]').fill(account?.pass)
    await page.locator('button.rz-button').click()
    await page.locator('.canFollowContainer').waitFor({ timeout })
    await page.screenshot({ path: `./screenshots/${account?.user}.png` })
    // await page.locator('.container.dashboard').waitFor({ timeout })
    // await page.screenshot({ path: `./screenshots/${account?.user}.png` })
    // const innetCredentials = await page.locator('.credentials .values').textContent()
    // const credentialsArray = innetCredentials.split(/\n{1,}/)
    // const credential = credentialsArray.map(credential => credential.replace(/(Login:|Password:|Server Address)|\s{1,}/gm, ''))
    await page.close()
    spinner.succeed()
    // return credential
    return {}
  } catch (error) {
    await page.close()
    spinner.fail()
    return [`${account?.user}`, 'error', `${error.message}`]
  } finally {
    spinner.start('Loading scrapper')
  }
}

const createPage = async ({ cookies, browser }) => {
  const context = browser.newContext()
  context.addCookies(cookies)
  await context.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15' })
  const page = context.newPage()
  return page
}
(async () => {
  const debug = true
  const timeout = 6000
  const delimiter = 'numbers'
  const url = ''
  const cookies = [{
    name: 'cf_clearance',
    value: '8HEiduwuwmEulfz4S4H47YiVa0Fz_7HLOla5rgEN74Y-1687134456-0-160',
    domain: '.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_2',
    value: '1cb6801d4a4cf8a',
    domain: 'portal.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_prog',
    value: 'x19',
    domain: '.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_seq_19',
    value: '4',
    domain: '.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_jschl_tk',
    value: 'a5c3d7a4f8c3f4d8a1c2f1d7d6f8e4d7f5e8f3c8-160',
    domain: '.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_enc',
    value: 'b4c5f4d8b7f2d1f4d8b6f5d7c1f6e8d4f3c7b0-160',
    domain: '.broker-group.com',
    path: '/'
  },
  {
    name: 'cf_chl_rc',
    value: 'a5c3d7a4f8c3f4d8a1c2f1d7d6f8e4d7f5e8f3c8-160',
    domain: '.broker-group.com',
    path: '/'
  }]
  const accounts = await readAndLoadFile({ delimiter })
  const browser = await chromium.launch({ headless: !debug, timeout })
  const page = createPage({ cookies, browser })

  const output = [['user', 'pass', 'server']]
  for (const account of accounts) {
    const result = await scrapper({ browser, url, account, timeout, page })
    output.push(result)
  }
  await writeFile({ output, delimiter })
  await browser.close()
  spinner.stop()
})()
