// 处理完形填空的选项
export const fillOption = (text) => {
  const options = []
  do {
    const value = /（\d+）[^（）]+/.exec(text)[0]
    options.push(value)
    text = text.replace(value, '')
  } while (text)
  const option = options.map((el) => {
    let temp = el
    const answerNo = /（\d+）/.exec(temp)[0]
    temp = temp.replace(answerNo, '')
    const opts = []
    do {
      const currentOpt = /[A-Z]．+[^A-Z]+/.exec(temp)
      const value = /[^A-Z^．]+/.exec(currentOpt)[0]
      const opt = /[A-Z]/.exec(temp)[0]
      opts.push({
        option: opt,
        value,
      })
      temp = temp.replace(`${opt}．${value}`, '')
    } while (temp)
    return {
      answerNo,
      options: opts,
    }
  })
  return option
}
