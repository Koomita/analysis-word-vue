export const formatTableString = (tableData) => {
  let table = '<table><tbody>'
  let text = ''
  let i = 0
  do {
    const el = tableData[i]
    table += '<tr>'
    text += `（${i + 1}）`
    let j = 0
    do {
      const item = el.options[j]
      table += `<td>（${j === 0 ? i + 1 : ''}）${item.option}．${item.value}</td>`
      text += `${item.option}．${item.value} `
      if (j === el.options.length - 1) {
        table += '</tr>'
      }
      j += 1
    } while (j < el.options.length)
    i += 1
  } while (i < tableData.length)
  table += '</tbody></table>'
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
    const reg = new RegExp(/[A-Z]．(\S+)/)
    do {
      const value = temp.match(reg)[1]
      const opt = temp.match(reg)[0].replace(`．${value}`, '')
      opts.push({
        option: opt,
        value,
      })
      temp = temp.trim().replace(`${opt}．${value}`, '')
    } while (temp.match(reg))
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
