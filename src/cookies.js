import fs from 'fs'

const readCookie = async () => {
  const path = 'cookies.json'
  try {
    if (fs.existsSync(path)) {
      const cookies = await fs.readFileSync(path, { encoding: 'utf8' })
      const { cookies: parsed } = JSON.parse(cookies)
      return parsed
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

const saveCookie = async ({ page = null }) => {
  if (!page) {
    throw new Error('Page is required')
  }
  const cookiesFromPage = await page.context().cookies()
  await fs.writeFileSync('cookies.json', JSON.stringify({ cookies: cookiesFromPage }, null, 2))
}

export { readCookie, saveCookie }
