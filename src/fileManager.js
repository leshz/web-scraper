import csv from 'csvjson'
import fs from 'fs'
import { start, success, fail } from './helpers.js'

import path from 'path'

const readAndLoadFile = async ({
  fileName = 'accounts.csv',
  encoding = 'utf8',
  delimiter = ''
}) => {
  const styleDeLimiter = delimiter === 'google' ? ',' : ';'
  start('Loading accounts file')
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
      fail('error with accounts file')
      throw new Error('Bad data formated')
    }
    success()
    return accounts
  } catch (error) {
    fail('error with accounts file')
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
