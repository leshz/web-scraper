import { firefox } from 'playwright'
import { readCookie } from './cookies.js'

const searchBalanceAmount = async ({
  url = '',
  account = {},
  timeout,
  page = null,
  spinner
}) => {
  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    spinner.text = `Working with ${account?.user} account`
    await page.locator('input[type="text"]').fill(account?.user)
    setTimeout(() => { }, 2000)
    await page.locator('input[type="Password"]').fill(account?.pass)
    setTimeout(() => { }, 2000)
    await page.locator('button[type="submit"]').click()
    setTimeout(() => { }, 2000)
    await page.locator('div[title="Reports menu"]').click()
    await page.locator('div[title="Managed Trading Wallet"] a').click()
    setTimeout(() => { }, 2000)
    await page.locator('.e-ellipsistooltip').waitFor({ timeout })
    await page.screenshot({ path: `./screenshots/${account?.user}.png` })

    const amount = await page.locator('.flex-column.m-4.report .text-center span').nth(0).textContent()
    console.log(amount)

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
    console.log(error)
    await page.close()
    spinner.fail()
    return [`${account?.user}`, 'error', `${error.message}`]
  } finally {
    spinner.start('Loading scrapper')
  }
}

const createPage = async ({ browser }) => {
  const context = await browser.newContext()
  const cookie = await readCookie()
  await context.addCookies(cookie)
  const page = await context.newPage()
  return page
}
const launch = async ({ debug, timeout, spinner }) => {
  const browser = await firefox.launch({ headless: !debug, timeout, slowmo: 300 })
  const page = await createPage({ browser })
  return { page, browser }
}

export { searchBalanceAmount, createPage, launch }
