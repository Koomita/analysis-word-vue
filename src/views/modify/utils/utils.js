export const formatTableString = (tableData) => {
  let table = '<table>'
  let text = ''
  let i = tableData.length - 1
  do {
    const el = tableData[i]
    table += `<tr>（${i}）`
    text += `（${i}）`
    let j = el.options.length - 1
    do {
      const item = el.options[j]
      table += `<td>${item.option}．${item.value}</td>`
      text += `${item.option}．${item.value}`
      if (j === 0) {
        table += '</tr>'
      }
      j -= 1
    } while (j > -1)
    i -= 1
  } while (i > -1)
  table += '</table>'
  return { table, text }
}

export const formatTableOptions = (text) => {
  if (!text) return []
  const options = []
  // 匹配题号
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

export const adjustOrder = (direction, arr, index) => {
  const prev = arr[index - 1]
  const current = arr[index]
  const next = arr[index + 1]
  if (direction === 'up') {
    arr.splice(index, 1, { option: current.option, value: prev.value })
    arr.splice(index - 1, 1, { option: prev.option, value: current.value })
  } else if (direction === 'down') {
    arr.splice(index, 1, { option: current.option, value: next.value })
    arr.splice(index + 1, 1, { option: next.option, value: current.value })
  } else {
    arr.splice(index, 1)
  }
  return arr
}
