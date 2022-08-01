"use strict"
async function main(inputFormat, inputYear, inputMonth, inputDay) {
  let today = new Date() //Дата сегодня 
  inputYear = (inputYear) ? inputYear : today.getFullYear()
  inputMonth = (inputMonth >= 0 ) ? inputMonth : today.getMonth()
  inputDay = (inputDay) ? inputDay : 1

  let inputDate = new Date(inputYear, inputMonth, inputDay) //Дата входящая
  let months = getMonths() //Массив месяцев "Январь"
  let monthy = getMonthy() //Массив месяцев "Января"
  let weekDays = getWeekDays() //Массив дней недели "Пн"
  let weekDaysFull = getWeekDaysFull() //Массив дней недели "Понедельник"
  let hours = getHours() //Массив времени с периодом 1/2 часа (30мин)
  let inputNote = getInputNote()

  let aSide = new HTML('aside').findOne() 
  let main = new HTML('main').findOne()
  let dateBook = new HTML('.datebook').findOne()
  let dateBookNavigation, dateBookHeadBlock, dateBookBodyBlock, dateBookHeadTable, dateBookBodyTable

  dateBookHeadBlock = new HTML('.datebook__head-block').findOne()
  if (dateBookHeadBlock) dateBookHeadBlock.innerHTML = ''
  dateBookBodyBlock = new HTML('.datebook__body-block').findOne()
  if (dateBookBodyBlock) dateBookBodyBlock.innerHTML = ''
  switch (inputFormat) {
    case 'new':
      let form = renderForm(inputNote)
      aSide.append(form)
      dateBookNavigation = renderNavigationDateBook()
      dateBook.append(dateBookNavigation)
      dateBookHeadBlock = new HTML("datebook__head-block").create()
      dateBook.append(dateBookHeadBlock)
      dateBookBodyBlock = new HTML("datebook__body-block").create()
      dateBook.append(dateBookBodyBlock)
    
    case 'month':
      setattrNavigationDateBookMonth(today, inputDate, months, monthy, weekDaysFull)
      dateBookHeadTable = renderHeadMonth(weekDays)
      dateBookHeadBlock.append(dateBookHeadTable)
      dateBookBodyTable = renderBodyMonth(today, inputDate)
      dateBookBodyBlock.append(dateBookBodyTable)
      let notesM = await loadNotes('month', inputDate)
      let noteListM = renderNoteList(notesM)
      dateBookBodyBlock.append(noteListM)
      insertNotesMonth(notesM, inputDate, dateBookBodyTable)
      placementNotesMonth(dateBookBodyTable)
      break

    case 'week':
      setattrNavigationDateBookWeek(today, inputDate, months, monthy, weekDaysFull)
      dateBookHeadTable = renderHeadWeek(today, inputDate, weekDays)
      dateBookHeadBlock.append(dateBookHeadTable)
      dateBookBodyTable = renderBodyWeek(hours)
      dateBookBodyBlock.append(dateBookBodyTable)
      let notesW = await loadNotes('week', inputDate)
      let noteListW = renderNoteList(notesW)
      dateBookBodyBlock.append(noteListW)
      insertNotesWeek(hours, notesW, inputDate, dateBookBodyTable)
      placementNotesWeek(dateBookBodyTable)
      break
  }
}
function renderForm(inputNote) {
  let form = new HTML('datebook__form', 'div', 'Новая заметка').create()
  inputNote.forEach(value => {
    let label = new HTML('', 'label', value.label).create()
    form.append(label)
    let input = new HTML(value.classN, 'input').create()
    input.type = value.type
    input.placeholder = value.placeholder
    input.name = value.name
    label.append(input)
  })
  let button = new HTML('button', 'div', 'Сохранить').create()
  button.setAttribute('onclick', 'saveNote()')
  form.append(button)
  return(form)
}
async function saveNote() {
  let url = 'note-add.php'
  let formData = new FormData
  let allInput = new HTML('input').findAll()
  
  allInput.forEach(item => {
    let key = item.getAttribute('name')
    let value = item.value
    formData.append(key, value)
    item.value = ''
  })
  
  let response = await fetch(url, {
    method: 'POST',
    body: formData
  })
  if (response.ok) { 
    response = await response.json()
    alert(`${response.success}`)
  } else {
    alert(`Ошибка HTTP: ${response.status}...`)
  }
  main('month')
}
function renderNoteList(inputNotes) {
  let wrapper = new HTML('note-list', 'div', 'Список задач:').create()
  inputNotes.forEach(value => {
    let startDate = new Date(value.start_date)
    let endDate = new Date(value.end_date)
    let start = `${startDate.getHours()}:${startDate.getMinutes()} ${startDate.getDate()}.${startDate.getMonth() + 1}.${startDate.getFullYear()}`
    let end = `${endDate.getHours()}:${endDate.getMinutes()} ${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}`
    let note = new HTML('note', 'div', `Задача: ${value.title} Заказчик: ${value.customer}. Исполнитель: ${value.performer}. Начало: ${start}. Дедлайн: ${end}.`).create()
    note.style.background = value.color
    let button = new HTML('button', 'div', 'Удалить').create()
    button.setAttribute('onclick', `deleteNote('${value.id}')`)
    note.append(button)
    wrapper.append(note)
  })
  return(wrapper)
}
async function deleteNote(id) {
  
  let formData = new FormData
  formData.append('id', id)
  
  let url = 'note-delete.php'
  let response = await fetch(url, {
    method: 'POST',
    body: formData
  })
  if (response.ok) { 
    response = await response.json()
    alert(`Заметка удалена!`)
  } else {
    alert(`Ошибка HTTP: ${response.status}...`)
  }
  
  /*notes.forEach((value, index) => {
    if (value.id == id) notes.splice(index, 1)
  })*/
  main('month')
}
function renderNavigationDateBook() { //Создаем блок навигации по календарю
  let dateBookNavigation = new HTML("datebook__navigation").create()
  let dateBookToDay = new HTML("datebook-to-day").create()
  dateBookNavigation.append(dateBookToDay)
  let dateBookNavigationLeft = new HTML("datebook__navigation-left").create()
  dateBookNavigation.append(dateBookNavigationLeft)
  let dateBookNavigationSelect = new HTML("datebook__navigation-select").create()
  dateBookNavigation.append(dateBookNavigationSelect)
  let dateBookNavigationRight = new HTML("datebook__navigation-right").create()
  dateBookNavigation.append(dateBookNavigationRight)
  return(dateBookNavigation)
}
function setattrNavigationDateBookMonth(today, inputDate, months, monthy, weekDaysFull) {
  let datePrevMonth = new Date ( inputDate.getFullYear(), inputDate.getMonth() - 1)
  let prevYear = datePrevMonth.getFullYear()
  let prevMonth = datePrevMonth.getMonth()
  let dateNextMonth = new Date ( inputDate.getFullYear(), inputDate.getMonth() + 1)
  let nextYear = dateNextMonth.getFullYear()
  let nextMonth = dateNextMonth.getMonth()

  let dateBookToDay = new HTML('.datebook-to-day').findOne()
  dateBookToDay.innerHTML = `Сегодня: ${weekDaysFull[(today.getDay() == 0) ? 6 : today.getDay() - 1]} ${today.getDate()} ${monthy[today.getMonth()]} ${today.getFullYear()}.`
  dateBookToDay.setAttribute('onclick', `main('month')`)

  let dateBookNavigationLeft = new HTML('.datebook__navigation-left').findOne()
  dateBookNavigationLeft.setAttribute('onclick', `main('month', ${prevYear}, ${prevMonth})`)
  let dateBookNavigationSelect = new HTML('.datebook__navigation-select').findOne()
  dateBookNavigationSelect.setAttribute('onclick', `main('month')`)
  dateBookNavigationSelect.innerHTML = `${months[inputDate.getMonth()]} ${inputDate.getFullYear()}`
  let dateBookNavigationRight = new HTML('.datebook__navigation-right').findOne()
  dateBookNavigationRight.setAttribute('onclick', `main('month', ${nextYear}, ${nextMonth})`)
}
function setattrNavigationDateBookWeek(today, inputDate, months, monthy, weekDaysFull) {
  let datePrevDay = new Date ( inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() - 1 )
  let prevYear = datePrevDay.getFullYear()
  let prevMonth = datePrevDay.getMonth()
  let prevDay = datePrevDay.getDate()
  let dateNextDay = new Date ( inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() + 1 )
  let nextYear = dateNextDay.getFullYear()
  let nextMonth = dateNextDay.getMonth()
  let nextDay = dateNextDay.getDate()
  let weekDayIndex = (today.getDay() == 0) ? 6 : today.getDay() - 1

  let dateBookToDay = new HTML('.datebook-to-day').findOne()
  dateBookToDay.innerHTML = `Сегодня: ${weekDaysFull[weekDayIndex]} ${today.getDate()} ${monthy[today.getMonth()]} ${today.getFullYear()}.`
  dateBookToDay.setAttribute('onclick', `main('week')`)

  let dateBookNavigationLeft = new HTML('.datebook__navigation-left').findOne()
  dateBookNavigationLeft.setAttribute('onclick', `main('week', ${prevYear}, ${prevMonth}, ${prevDay})`)
  let dateBookNavigationSelect = new HTML('.datebook__navigation-select').findOne()
  dateBookNavigationSelect.setAttribute('onclick', `main('month')`)
  dateBookNavigationSelect.innerHTML = `${weekDaysFull[(inputDate.getDay() == 0) ? 6 : inputDate.getDay() - 1]} ${inputDate.getDate()} ${monthy[inputDate.getMonth()]} ${inputDate.getFullYear()}`
  let dateBookNavigationRight = new HTML('.datebook__navigation-right').findOne()
  dateBookNavigationRight.setAttribute('onclick', `main('week', ${nextYear}, ${nextMonth}, ${nextDay})`)
}
function renderHeadMonth(weekDays) {
  let dateBookHeadTable = new HTML('', 'table').create()
  let dateBookHeadRow = new HTML('', 'tr').create()
  dateBookHeadTable.append(dateBookHeadRow)
  weekDays.forEach(value => {
    let dateBookHead = new HTML("month-th", 'th', value).create()
    dateBookHeadRow.append(dateBookHead) 
  })
  return(dateBookHeadTable)
}
function renderBodyMonth(today, inputDate) {
  let dayInMonth = new Date( inputDate.getFullYear(), inputDate.getMonth() + 1, 0 ).getDate() //Количество дней в месяце
  let preLastDay = new Date( inputDate.getFullYear(), inputDate.getMonth(), 0 ).getDate() //Количество дней в предидущем месяце
  let firstDayIndex = ((inputDate.getDay() - 1) == -1) ? 6 : inputDate.getDay() - 1 //День недели первого числа месяца
  let lastDayIndex = new Date( inputDate.getFullYear(), inputDate.getMonth() + 1, 0 ).getDay() //День недели последнего числа месяца
  let nextDays = (lastDayIndex != 0) ? 7 - lastDayIndex : 0 //Количество дней недели не вошедших в месяц

  let daysInMonth = [] //Дня для вывода в календарь
  for (let x = firstDayIndex; x > 0; x--) daysInMonth.push(preLastDay - x + 1) //Дни до месяца
  for (let i = 1; i <= dayInMonth; i++) daysInMonth.push(i)  //Дни месяца
  for (let j = 1; j <= nextDays; j++) daysInMonth.push(j) //Дни после месяца

  let dateBookBodyTable = new HTML('', 'table').create()
  let dateBookRow
  daysInMonth.forEach( (value, index) => {
    if ((index % 7) == 0) {
      dateBookRow = new HTML("month-tr" ,'tr').create()
      let dateBookRowNotes = new HTML("month-notes").create()
      dateBookRow.append(dateBookRowNotes)
      dateBookBodyTable.append(dateBookRow)
    }
    let isToDay = (value === today.getDate() && inputDate.getMonth() === today.getMonth() && inputDate.getFullYear() === today.getFullYear())
    let isPreMonth = (index < firstDayIndex)
    let isNextMonth = (index >= (dayInMonth + firstDayIndex))
    let classN = (isToDay) ? "month-today" : (isPreMonth) ? "month-prev-day" : (isNextMonth) ? "month-next-day" : "month-day"
    let dateBookData = new HTML(classN, 'td', value).create()
    dateBookData.setAttribute('onclick', `main('week', ${inputDate.getFullYear()}, ${inputDate.getMonth()}, ${value})`)
    dateBookRow.append(dateBookData)
  })
  return(dateBookBodyTable)
}
function renderHeadWeek(today, inputDate, weekDays) {
  let dateBookHeadTable = new HTML('', 'table').create()
  let dateBookRowDays = new HTML('', 'tr').create()
  dateBookHeadTable.append(dateBookRowDays)
  let dateBookRowDates = new HTML('', 'tr').create()
  dateBookHeadTable.append(dateBookRowDates)

  for (let i = - 4; i <= 3; i++) {
    let date = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() + i)
    let dateW = (i == -4) ? '' : (weekDays[(date.getDay() == 0) ? 6 : date.getDay() - 1])
    let dateD = (i == -4) ? 'Время' : date.getDate() 
    let classN = (i == -4) ? "day-th-time" : (i == 0) ? "day-th-select" : "day-th"
    let dateBookHeadW = new HTML(classN, 'th', dateW).create()
    dateBookRowDays.append(dateBookHeadW)
    let dateBookHeadD = new HTML(classN, 'th', dateD).create()
    dateBookRowDates.append(dateBookHeadD)
  }
  return(dateBookHeadTable)
}
function renderBodyWeek(hours) {
  let scrollTableWrapper = new HTML('scroll-table-wrapper').create()
  let dateBookBodyTable = new HTML('', 'table').create()
  scrollTableWrapper.append(dateBookBodyTable)

  hours.forEach(value => {
    let dateBookRow = new HTML("day-tr", 'tr').create()
    for (let index = 0; index <= 7; index++) {
      let classN = (index == 0) ? "day-td-time" : (index == 4) ? "day-td-select" : "day-td"
      let data = (index == 0) ? value : ''
      let dateBookData = new HTML(classN, 'td', data).create()
      dateBookRow.append(dateBookData)
    }
    dateBookBodyTable.append(dateBookRow)
  })
  for (var i = 0; i < 7; i++) {
    let dateBookColNotes = new HTML("day-notes").create()
    dateBookBodyTable.append(dateBookColNotes)
  }
  return(scrollTableWrapper)
}
async function loadNotes(format, inputDate) { //Тут должен быть fetch который получит нужные задачи
  let startPeriodDate
  let endPeriodDate
  switch (format) {
    case 'month':
      startPeriodDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1)
      endPeriodDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 1)
      break
    case 'week':
      startPeriodDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() - 3)
      endPeriodDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() + 4)
      break
  }
  /*
  let formData = new FormData
  formData.append('startDate', `${startPeriodDate.getFullYear()}-${startPeriodDate.getMonth() + 1}-${startPeriodDate.getDate()}`)
  formData.append('endDate', `${endPeriodDate.getFullYear()}-${endPeriodDate.getMonth() + 1}-${endPeriodDate.getDate()}`)
  
  let url = 'note-load.php'
  let response = await fetch(url, {
    method: 'POST',
    body: formData
  })
  if (response.ok) { 
    response = await response.json();
  } else {
    alert(`Ошибка HTTP: ${response.error}...`);
  }*/

  
  //УДАЛИТЬ ОТ СЮДА
  let allNotes = getNotes() //пример без БД
  let selectNotes = []

  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      allNotes.forEach( (value) => { 
        let startNoteDate = new Date(value['start_date'])
        let endNoteDate = new Date(value['end_date'])

        let ok = (endNoteDate.getTime() > startPeriodDate.getTime() && startNoteDate.getTime() < endPeriodDate.getTime())
        if (ok) selectNotes.push(value) //Добавляем в массив соответствующие ноты(исключаем невидимые)
      })
      resolve(selectNotes)
    }, 2000)
  }) 
  let response = await promise
  return(response)
  // И ДО СЮДА
  //return(response.data)
}
function insertNotesMonth(selectNotes, inputDate, table) {
  let startDateMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1)
  let endDateMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 1)
  let firstDayWeekIndex = (inputDate.getDay() == 0) ? 6 : inputDate.getDay() - 1
  let lastDateMonth = new Date( inputDate.getFullYear(), inputDate.getMonth() + 1, 0 )
  let lastDayWeekIndex = (lastDateMonth.getDay() == 0) ? 6 : lastDateMonth.getDay() - 1

  let widthCalendar = table.clientWidth
  let widthDay = widthCalendar / 7

  let allMonthNotes = new HTML('.month-notes').findAll()

  Object.values(selectNotes).forEach( value => {
    let monthNotePrevEl = new HTML("month-note-prev").create() //Маркер, начало ДО месяца
    let monthNoteStartEl = new HTML("month-note-start").create() //Маркер, начало В месяце
    let monthNoteEndEl = new HTML("month-note-end").create() //Маркер, конец В месяца
    let monthNoteNextEl = new HTML("month-note-next").create() //Маркер, конец ПОСЛЕ месяца

    let startFullDate = new Date(value['start_date'])
    let endFullDate = new Date(value['end_date'])

    let startNotesInMonth = (startDateMonth.getTime() <= startFullDate.getTime() && startFullDate.getTime() < endDateMonth.getTime()) //Начало в текущем месяце
    let startNotesBeforeMonth = (startDateMonth.getTime() > startFullDate.getTime()) //Начало до текущего месяца
    let endNotesInMonth = (startDateMonth.getTime() <= endFullDate.getTime() && endFullDate.getTime() < endDateMonth.getTime()) //Конец в текущем месяце
    let endNotesAfterMonth = (endDateMonth <= endFullDate.getTime()) //Конец псле текущего месяца

    let startDate = startFullDate.getDate()
    let startDayWeekIndex = (startFullDate.getDay()== 0) ? 6 : startFullDate.getDay() - 1
    let startWeekIndex = (startNotesBeforeMonth) ? 0 : Math.ceil( ((7 - ((6 - startDayWeekIndex + startDate) % 7)) + startDate) / 7 ) - 1

    let endDate = endFullDate.getDate()
    let endDayWeekIndex = (endFullDate.getDay() == 0) ? 6 : endFullDate.getDay() - 1
    let endWeekIndex = Math.ceil( ((7 - ((7 - endDayWeekIndex + endDate) % 7)) + endDate) / 7 ) - 1

    let amountStringNotes
    if(startNotesInMonth && endNotesInMonth) amountStringNotes = endWeekIndex - startWeekIndex + 1 //Старт В, конец В
    else if(startNotesBeforeMonth && endNotesInMonth) amountStringNotes = endWeekIndex + 1 //Старт ДО, конец В 
    else if(startNotesInMonth && endNotesAfterMonth) amountStringNotes = allMonthNotes.length - startWeekIndex//Старт В, конец ПОСЛЕ
    else if(startNotesBeforeMonth && endNotesAfterMonth) amountStringNotes = allMonthNotes.length//Старт ДО, конец ПОСЛЕ

    for (let index = 0; index < amountStringNotes; index++) {
      let noteString = new HTML("month-note", 'div', value.title).create()
      noteString.style.background = value['color']
      let leftSpace = 0
      let widthNote = widthCalendar
      if (index == 0) { //Если первая строка
        let startMarker = (startNotesBeforeMonth) ? monthNotePrevEl : monthNoteStartEl
        noteString.prepend(startMarker)
        leftSpace = (startNotesBeforeMonth) ? (widthDay * firstDayWeekIndex + 1) : (widthDay * startDayWeekIndex)
        if (amountStringNotes > 1) widthNote = widthCalendar - leftSpace
      }
      if (index == amountStringNotes - 1){ //Если строка последняя
        let endMarker = (endNotesAfterMonth) ? monthNoteNextEl : monthNoteEndEl
        noteString.append(endMarker)
        if (amountStringNotes == 1 && endNotesInMonth) widthNote = widthDay * (endDayWeekIndex + 1) - leftSpace
        else if (amountStringNotes > 1 && endNotesInMonth) widthNote = widthDay * (endDayWeekIndex + 1)  //
        else if (amountStringNotes >= 1 && endNotesAfterMonth) widthNote = widthDay * (lastDayWeekIndex + 1) - leftSpace
        else widthNote
      }
      noteString.style.left = leftSpace + 'px'
      noteString.style.width = widthNote + 'px'
      allMonthNotes[startWeekIndex + index].append(noteString)
    }
  })
}
function insertNotesWeek(hours, selectNotes, inputDate, table){
  let startDateWeek = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() -3)
  let endDateWeek = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() +4)
  let firstDate = startDateWeek.getDate()
  let lastDate = endDateWeek.getDate()

  let heightCalendar = table.scrollHeight
  let unitTime = heightCalendar / (hours.length)

  let allWeekNotes = new HTML('.day-notes').findAll()

  Object.values(selectNotes).forEach(value => {
    let weekNotePrevEl = new HTML("day-note-prev").create() //Маркер, начало ДО периода
    let weekNoteStartEl = new HTML("day-note-start").create() //Маркер, начало В периоде
    let weekNoteEndEl = new HTML("day-note-end").create() //Маркер, конец В периоде
    let weekNoteNextEl = new HTML("day-note-next").create() //Маркер, конец ПОСЛЕ Периода

    let startFullDate = new Date(value['start_date'])
    let endFullDate = new Date(value['end_date'])

    let startNotesInWeek = (startDateWeek.getTime() <= startFullDate.getTime() && startFullDate.getTime() < endDateWeek.getTime()) //Начало в текущем месяце
    let startNotesBeforeWeek = (startDateWeek.getTime() > startFullDate.getTime()) //Начало до текущего месяца
    let endNotesInWeek = (startDateWeek.getTime() <= endFullDate.getTime() && endFullDate.getTime() < endDateWeek.getTime()) //Конец в текущем месяце
    let endNotesAfterWeek = (endDateWeek.getTime() <= endFullDate.getTime()) //Конец псле текущего месяца

    let startMinutes = startFullDate.getMinutes()
    let startHours = startFullDate.getHours()
    let startDate = startFullDate.getDate()
    let startIndexCol = (startNotesBeforeWeek) ? 0 : (startDate <= lastDate) ? (7 - (lastDate - startDate)) : (startDate - firstDate)

    let endMinutes = endFullDate.getMinutes()
    let endHours = endFullDate.getHours()
    let endDate = endFullDate.getDate()
    let endIndexCol = (endDate <= lastDate) ? (7 - (lastDate - endDate)) : (endDate - firstDate)

    let amountColNotes
    if(startNotesInWeek && endNotesInWeek) amountColNotes = endIndexCol - startIndexCol + 1 //Старт В, конец В
    else if(startNotesBeforeWeek && endNotesInWeek) amountColNotes = endIndexCol + 1 //Старт ДО, конец В 
    else if(startNotesInWeek && endNotesAfterWeek) amountColNotes = 7 - startIndexCol//Старт В, конец ПОСЛЕ
    else if(startNotesBeforeWeek && endNotesAfterWeek) amountColNotes = 7//Старт ДО, конец ПОСЛЕ

    for (let index = 0; index < amountColNotes; index++) {
      let noteColumn = new HTML("day-note", 'div', value.title).create()
      noteColumn.style.background = value['color']
      let topSpace = 0
      let heightNote = heightCalendar
      if (index == 0) { //Если первая строка
        let startMarker = (startNotesBeforeWeek) ? weekNotePrevEl : weekNoteStartEl
        noteColumn.prepend(startMarker)
        topSpace = (startNotesBeforeWeek) ? (0 + 1) : (unitTime * (startHours * 2 + Math.floor(startMinutes/30)))
        if (amountColNotes > 1) heightNote = heightCalendar - topSpace
      }
      if (index == amountColNotes - 1){ //Если строка последняя
        let endMarker = (endNotesAfterWeek) ? weekNoteNextEl : weekNoteEndEl
        noteColumn.append(endMarker)
        if (amountColNotes == 1 && endNotesInWeek) heightNote = unitTime * ( endHours * 2 + Math.floor(endMinutes / 30) ) - topSpace
        else if (amountColNotes > 1 && endNotesInWeek) heightNote = unitTime * ( endHours * 2 + Math.floor(endMinutes / 30) )  //
        else if (amountColNotes >= 1 && endNotesAfterWeek) heightNote = heightCalendar - topSpace        
        else heightNote
      }
      noteColumn.style.top = topSpace + 'px'
      noteColumn.style.height = heightNote + 'px'
      allWeekNotes[startIndexCol + index].append(noteColumn)
    }
  })
}
function placementNotesMonth(table) {
  let allMonthNotesBlock = new HTML('.month-notes').findAll() //Все блоки заметок
  let allMonthRow = new HTML('.month-tr').findAll() //Все строки таблицы
  let widthCalendar =  table.clientWidth //Ширина календаря
  let widthDay = widthCalendar / 7

  Object.values(allMonthNotesBlock).forEach((value, index) => { //Перебираем все div's с заметками
  	let allNotesInWeek = value.querySelectorAll('.month-note') //В блоке заметок находим все заметки
    let matrixNotesInWeek = [] //Для того что бы не пересекающиеся по времени задачи находились на одной строке
    let topSpace

    Object.values(allNotesInWeek).forEach( val => { //Перебираем заметки в блоке
      let newStringMatrixLeft = Math.round((val.offsetLeft) / widthDay) //Определяем отступ с лева, и считаем сколько это дней
      let newStringMatrixWidth = Math.round((val.offsetWidth) / widthDay) //Определяем длинну заметки в днях
      let newStringMatrixRight = 7 - newStringMatrixLeft - newStringMatrixWidth //Определяем отсуп с права
      let newStringMatrix = [] //Создаем строку для матрицы
      for (let l = 1; l <= newStringMatrixLeft; l++) newStringMatrix.push(0)
      for (let w = 1; w <= newStringMatrixWidth; w++) newStringMatrix.push(1)
      for (let r = 1; r <= newStringMatrixRight; r++) newStringMatrix.push(0) //Заполняем строку

      if (matrixNotesInWeek.length == 0) { //Если длинна матрицы = 0 строк, добавляем строку в матрицу
        matrixNotesInWeek.push(newStringMatrix)
        topSpace = 0
      }else{
        for (let index = 0; index < matrixNotesInWeek.length; index++) { //Перебираем строки матрицы
          let stringMatrixSum = []

          for (let ind = 0; ind < newStringMatrix.length; ind++) { //Перебераем элементы строки матрицы
            let itemElMatrixSum = matrixNotesInWeek[index][ind] + newStringMatrix[ind]
            if (itemElMatrixSum === 2) break
            else stringMatrixSum.push(itemElMatrixSum)
          }
          if (stringMatrixSum.length != newStringMatrix.length && index == matrixNotesInWeek.length - 1) {
            matrixNotesInWeek.push(newStringMatrix)
            topSpace = (matrixNotesInWeek.length - 1) * 13
            break
          }else if (stringMatrixSum.length == newStringMatrix.length){
            matrixNotesInWeek[index] = stringMatrixSum
            topSpace = (index) * 13
            break
          }
        }
      }
      val.style.top = topSpace + 'px'
    })
    allMonthNotesBlock[index].style.height = matrixNotesInWeek.length * 13 + 'px'
    allMonthRow[index].style.height = 20 + matrixNotesInWeek.length * 13 + 'px'
  })
}
function placementNotesWeek(table) {
  let allDayNotes = new HTML('.day-notes').findAll()
  let heightCalendar = table.scrollHeight
  let unitTime = heightCalendar / 49

  Object.values(allDayNotes).forEach(value => { //разбор нот листов
    let allNotesInDay = value.querySelectorAll('.day-note')
    let matrixNotesInDay = []
    let idNotesInColumn =[]

    Object.values(allNotesInDay).forEach((val, ind) => { //разбор нот в листе
      let newColumnMatrixTop = Math.round(val.offsetTop / unitTime)
      let newColumnMatrixHeight = Math.round(val.offsetHeight / unitTime)
      let newColumnMatrixBottom = 49 - newColumnMatrixTop - newColumnMatrixHeight
      let newStringMatrix = [];

      for (let t = 0; t < newColumnMatrixTop; t++) newStringMatrix.push(0)
      for (let h = 0; h < newColumnMatrixHeight; h++) newStringMatrix.push(1)
      for (let b = 0; b < newColumnMatrixBottom; b++) newStringMatrix.push(0)

      if (matrixNotesInDay.length == 0) {
        matrixNotesInDay.push(newStringMatrix)
        idNotesInColumn.push([0])
      }else{
        for (let index = 0; index < matrixNotesInDay.length; index++) { //Перебираем строки матрицы
          let stringMatrixSum = []

          for (let ind = 0; ind < newStringMatrix.length; ind++) { //Перебераем элементы строки матрицы
            let itemElMatrixSum = matrixNotesInDay[index][ind] + newStringMatrix[ind]
            if (itemElMatrixSum === 2) break
            else stringMatrixSum.push(itemElMatrixSum)
          }
          if (stringMatrixSum.length != newStringMatrix.length && index == matrixNotesInDay.length - 1) {
            matrixNotesInDay.push(newStringMatrix)
            idNotesInColumn.push([ind])
            break
          }else if (stringMatrixSum.length == newStringMatrix.length){
            matrixNotesInDay[index] = stringMatrixSum
            idNotesInColumn[index + 1].push(ind)
            break
          }
        }
      }
    })
    let widthDay = 120
    idNotesInColumn.forEach((va, inx) => {
      va.forEach( v => {
        allNotesInDay[v].style.width = (widthDay / idNotesInColumn.length) + 'px'
        allNotesInDay[v].style.left = inx * (widthDay / matrixNotesInDay.length) + 'px'
      })
    })
  })
}
function getNotes() {
  let notes = [
    {id: '1', title: 'Один!', customer: 'PiterGriffin', performer: 'El_Barto', start_date: '2022-07-08 08:00:00', end_date: '2022-07-10 08:30:00', color: '#00FA9A',},
    {id: '2', title: 'Два!', customer: ' Bender_Rodriguez', performer: 'El_Barto', start_date: '2022-07-04 11:00:00', end_date: '2022-07-06 15:30:00', color: 'yellow',},
    {id: '3', title: 'Три!', customer: 'Homer_Simpson', performer: 'El_Barto', start_date: '2022-07-26 4:20:00', end_date: '2022-08-02 7:15:00', color: 'green',},
    {id: '4', title: 'Четыре!', customer: 'RickSanchez', performer: 'El_Barto', start_date: '2022-06-02 7:15:00', end_date: '2022-07-02 11:00:00', color: 'gray',},
    {id: '5', title: 'Пять!', customer: 'BrainGriffin', performer: 'El_Barto', start_date: '2022-06-01 7:15:00', end_date: '2022-08-03 11:35:00', color: 'pink',},
    {id: '6', title: 'Шесть!', customer: 'Eric_Theodore_Cartman', performer: 'El_Barto', start_date: '2022-07-01 11:35:00', end_date: '2022-07-31 11:50:00', color: '#66CDAA',},
    {id: '7', title: 'Семь!', customer: 'Lisa Simpson', performer: 'El_Barto', start_date: '2022-07-11 11:00:00', end_date: '2022-07-17 15:30:00', color: '#FFA07A',},
    {id: '8', title: 'Восемь!', customer: 'Glenn Quagmire', performer: 'El_Barto', start_date: '2022-05-19 11:00:00', end_date: '2022-06-23 15:30:00', color: '#F08080',},
    {id: '9', title: 'Девять!', customer: 'El_Barto', performer: 'Morty Smith', start_date: '2022-07-22 11:00:00', end_date: '2022-07-22 15:30:00', color: 'blue',},
  ]
  return(notes)
}
function getMonths() {
  const months = [ 
    "Январь", 
    "Февраль", 
    "Март", 
    "Апрель", 
    "Май", 
    "Июнь",
    "Июль", 
    "Август", 
    "Сентябрь", 
    "Октябрь", 
    "Ноябрь", 
    "Декабрь", 
  ]
  return(months)
}
function getMonthy() {
  const monthy = [ 
    "Января", 
    "Февраля", 
    "Марта", 
    "Апреля", 
    "Мая", 
    "Июня",
    "Июля", 
    "Августа", 
    "Сентября", 
    "Октября", 
    "Ноября", 
    "Декабря", 
  ]
  return(monthy)
}
function getWeekDays() {
  const weekDays = [ 
    "Пн", 
    "Вт", 
    "Ср", 
    "Чт", 
    "Пт", 
    "Сб", 
    "Вс", 
  ]
  return(weekDays)
}
function getWeekDaysFull() {
  const weekDaysFull = [ 
    "Понедельник", 
    "Вторник", 
    "Среда", 
    "Четверг", 
    "Пятница", 
    "Суббота", 
    "Воскресенье", 
  ]
  return(weekDaysFull)
}
function getHours() {
  const hours = [ "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "23:59", 
    ]
  return(hours)
}
function getInputNote() {
  let elements = [
    {label: 'Назовите задачу:', type: 'text', classN: 'input-title', name: 'title', placeholder: 'Введите название задачи...',},
    {label: 'Заказчик:', type: 'text', classN: 'input-customer', name: 'customer', placeholder: 'Введите имя заказчика...',},
    {label: 'Исполнитель:', type: 'text', classN: 'input-performer', name: 'performer', placeholder: 'Введите имя исполнителя...',},
    {label: 'Начать:', type: 'date', classN: 'input-start', name: 'start_date', placeholder: 'Выберите дату начала задачи...',},
    {label: 'Дедлайн:', type: 'date', classN: 'input-end', name: 'end_date', placeholder: 'Выберите дату конца задачи...',},
    {label: 'Цвет:', type: 'color', classN: 'input-color', name: 'color', placeholder: 'Выберите цвет...',},
  ]
  return(elements)
}
class HTML {
  constructor(classN, tag, input) { 
    this.tag = tag
    this.classN = classN
    this.input = input
  }
  create() { 
    this.tag = (this.tag) ? this.tag : 'div'
    let html = document.createElement(this.tag)
    if (this.classN) html.className = this.classN
    if (this.input) html.innerHTML = this.input
    return(html) 
  }
  findOne() {
    let html = document.querySelector(this.classN)
    return(html) 
  }
  findAll() {
    let html = document.querySelectorAll(this.classN)
    return(html) 
  }
}
document.addEventListener("DOMContentLoaded", main('new'))
