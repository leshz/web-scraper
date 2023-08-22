import csv from 'csvjson'
import fs from 'fs'
import path from 'path'

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

export { readAndLoadFile, writeFile }
