export const formatTableString = (tableData) => {
  let table = '<table> <tbody> '
  let text = ''
  let i = 0
  do {
    const el = tableData[i]
    table += '<tr> '
    let j = 0
    do {
      const item = el.options[j]
      table += ` <td> <span> ${j === 0 ? `（${i + 1}）` : ''}${item.option}．${item.value} </span> </td> \r`
      text += `${item.option}．${item.value} `
      if (j === el.options.length - 1) {
        table += ' </tr>'
      }
      j += 1
    } while (j < el.options.length)
    i += 1
  } while (i < tableData.length)
  table += ' </tbody> </table>'
  return { table, text }
}

export const formatTableOptions = (text) => {
  if (!text) return []
  const options = []
  let val = 'temp'
  // 匹配tr标签
  do {
    const trReg = new RegExp(/<tr[^>]*>[\s\S]*?<\/tr>/)
    const res = trReg.exec(text)
    val = res ? res[0] : ''
    val && options.push(val)
    text = text.replace(val, '').trim()
  } while (val)
  const option = options.map((el) => {
    // 去掉html标签
    let temp = el.replace(/<[^>]*>/g, '').trim()
    const noReg = new RegExp(/[(|（]\d+[）|)]/)
    const answerNo = noReg.exec(temp) ? noReg.exec(temp)[0] : ''
    temp = temp.replace(answerNo, '').trim()
    const opts = []
    const reg = new RegExp(/[A-Z]．(.+)/)
    do {
      // console.log((/^[A-Z]{1}[.、．:：]+/).exec(temp))
      const res = temp.match(reg) || []
      const value = res[1] || ''
      const opt = (res[0] || '').replace(`．${value}`, '')
      opts.push({
        option: opt,
        value: value.trim(),
      })
      temp = temp.replace(`${opt}．${value}`, '').trim()
    } while (temp.match(reg))
    return {
      answerNo,
      options: opts,
    }
  })
  return option
}

export const adjustOrder = (direction, arr, index) => {
  const num = {
    up: -1,
    down: 1,
  }
  const current = arr[index]
  const target = arr[index + num[direction]]
  if (num[direction]) {
    arr.splice(index, 1, { option: current.option, value: target.value })
    arr.splice(index + num[direction], 1, { option: target.option, value: current.value })
  } else {
    arr.splice(index, 1)
  }
  return arr
}
