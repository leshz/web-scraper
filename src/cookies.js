import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { start, success, fail } from './helpers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cookiesFile = path.resolve(__dirname, '../', 'cookies.json')

const readCookie = async () => {
  try {
    if (await fs.existsSync(cookiesFile)) {
      await setTimeout(() => { }, 500)
      start('Loading Cookies')
      const cookies = await fs.readFileSync(cookiesFile, { encoding: 'utf8' })
      const { cookies: parsed } = JSON.parse(cookies)
      success()
      return parsed
    } else {
      return []
    }
  } catch (error) {
    fail()
    return []
  }
}

const saveCookie = async ({ page = null }) => {
  if (!page) {
    throw new Error('Page is required')
  }
  const cookiesFromPage = await page.context().cookies()
  await fs.writeFileSync(cookiesFile, JSON.stringify({ cookies: cookiesFromPage }, null, 2))
}

export { readCookie, saveCookie, cookiesFile }
