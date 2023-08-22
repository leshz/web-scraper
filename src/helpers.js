import ora from 'ora'

const sleep = async (ms) => {
  await new Promise(resolve => setTimeout(resolve, ms))
}
const spinner = ora('init').start()

const success = (text = null) => {
  spinner.stopAndPersist({
    symbol: '✅',
    text
  })
}

const start = (text) => {
  spinner.start(text)
}

const fail = () => {
  spinner.stopAndPersist({
    symbol: '❌'
  })
}

export { success, fail, sleep, start, spinner }
