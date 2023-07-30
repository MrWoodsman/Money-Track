//? Przepisać na nowo rozpoznawanie czy data jest w w przedziale tygodnia 
//? i ogólnie całe to z pobieraniem tygodnia itp

//* Powiadomienie w konsoli
console.log('Podłączono main.js')

//* Zmiena na dane o zarobkach
const money = []

//* Zmienne zawierające elementy z pliku HTML
const SummaryTable = document.querySelectorAll('.LatesEarningList')[0].children[0].children[0]

const MonthSelect = document.getElementById('MonthSelect')
const WeekSelect = document.getElementById('WeekSelect')

const InputName = document.querySelectorAll('.EarningAddFormule-Name')[0].children[1]
const InputDate = document.querySelectorAll('.EarningAddFormule-Date')[0].children[1]
const InputValue = document.querySelectorAll('.EarningAddFormule-Value')[0].children[1]

const AddEarning = document.querySelectorAll('.EarningAddFormule-ButtonAdd')[0]

const AllStatistics = document.querySelectorAll('.AllStatistics')[0]
const MonthStatistics = document.querySelectorAll('.MonthStatistics')[0]
const WeekStatistics = document.querySelectorAll('.WeekStatistics')[0]

var ActualMonthToCalculate = undefined
var ActualCalculateWeekStart = undefined
var ActualCalculateWeekEnd = undefined

//* Dodawanie nasłuchiwaczy
AddEarning.addEventListener('click',(e) => {
    CreateRowTable(null, InputName.value, InputDate.value.split('-').reverse().join('.'), InputValue.value, null)
})
MonthSelect.addEventListener('input', (e) => {
    let [ year , month ] = e.target.value.split('-')
    ActualMonthToCalculate = month
    UpdateScreen()
})
WeekSelect.addEventListener('input', (e) => {
    let [ year , week ] = e.target.value.split('-')
    const { firstDayOfWeek, lastDayOfWeek } = GetWeekRange(week.slice(1), year);
    ActualCalculateWeekStart = firstDayOfWeek
    ActualCalculateWeekEnd = lastDayOfWeek
    UpdateScreen()
})

//* Funkcja zwracająca aktualny czas
function GetActualTime() {
    const t = new Date();
    return t
}

//* Tworzenie pseudo unikalnego ID pobierając czas
function GetId() {
    return Date.now()
}

//* Funkcja licząca który tydzien roku jest
function GetActualWeek() {
    // Pobranie aktualnej daty
    const today = GetActualTime()
    // Ustalenie daty pierwszego dnia tego roku
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    // Obliczenie liczby dni między pierwszym dniem roku a dzisiejszą datą
    const timeDifference = today.getTime() - firstDayOfYear.getTime();
    // Obliczenie liczby dni, które minęły od początku roku
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    // Obliczenie aktualnego tygodnia
    const currentWeek = Math.ceil((daysPassed + firstDayOfYear.getDay() + 0) / 7);
    return currentWeek;
}

function GetWeekRange(week, year) {
    const januaryFirst = new Date(year, 0, 1);
    const firstDayOfYear = januaryFirst.getDay();

    // Obliczenie liczby dni do pierwszego poniedziałku w roku
    const daysUntilFirstMonday = firstDayOfYear === 0 ? 2 : 8 - firstDayOfYear;

    // Obliczenie daty pierwszego dnia tygodnia na podstawie numeru tygodnia
    const firstDayOfWeek = new Date(year, 0, daysUntilFirstMonday + (week - 1) * 7);

    // Obliczenie daty ostatniego dnia tygodnia
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

    return {
        firstDayOfWeek,
        lastDayOfWeek,
    };
}

function TestDateIsInDataRange(dateToCheck, startDate, endDate) {
    let  hour = 2
    dateToCheck.setHours(hour);
    startDate.setHours(hour);
    endDate.setHours(hour);

    return dateToCheck >= startDate && dateToCheck <= endDate;
}

//* Podstawowa Funkcja która ustawia najprostsze ustawienia
// Ustawianie daty na dzisiejszą w oknie dodawania
function StartUpSummary() {
    // Ustawienia podstawowe daty itp
    let year, month, day, today, week
    today = GetActualTime()
    year =String( today.getFullYear()).padStart(4, '0')
    month = String(today.getMonth()+1).padStart(2, '0')
    day = String(today.getDate()).padStart(2, '0')
    week = String(GetActualWeek())
    // 2023-07-30
    InputDate.value = `${year}-${month}-${day}`
    // 2023-07
    MonthSelect.value = `${year}-${month}`
    ActualMonthToCalculate = month
    // 2023-W27
    WeekSelect.value = `${year}-W${week}`
    const { firstDayOfWeek, lastDayOfWeek } = GetWeekRange(week, year);
    ActualCalculateWeekStart = firstDayOfWeek
    ActualCalculateWeekEnd = lastDayOfWeek
    // Czytanie danych z lokalnej bazy
    let readed = ReadFromLocalStorage('money')
    readed.forEach((e) => {
        CreateRowTable(null, e.name, e.date, e.value, e.id)
    })
    // Wysyłanie wykonania innej funkcji
    UpdateScreen()
}

StartUpSummary()

//* Funkcja aktualizująca ekran głowny
function UpdateScreen() {
    let AllSum = 0, MonthSum = 0, WeekSum = 0
    money.forEach((e) => {
        // Ogólne
        AllSum += parseFloat(e.value)
        // Miesiąc
        if (parseInt(e.date.split('.')[1]) == ActualMonthToCalculate) {
            MonthSum += parseFloat(e.value)
        }
        // Tydzień
        let dateToCheck = new Date(String(e.date.split('.').reverse().join('-')))
        let startDate = new Date(`${ActualCalculateWeekStart.getFullYear()}-${ActualCalculateWeekStart.getMonth()+1}-${ActualCalculateWeekStart.getDate()}`)
        let endDate = new Date(`${ActualCalculateWeekEnd.getFullYear()}-${ActualCalculateWeekEnd.getMonth()+1}-${ActualCalculateWeekEnd.getDate()}`)

        if (TestDateIsInDataRange(dateToCheck, startDate, endDate)) {
            WeekSum += parseFloat(e.value)
        }
    })
    // Ustawianie podsumowania ogólnego
    AllStatistics.children[1].children[0].innerText = AllSum
    //  Ustawianie podsumowania miesięcznego
    MonthStatistics.children[2].children[0].innerText = MonthSum
    //  Ustawianie podsumowania tygodniowego
    WeekStatistics.children[2].children[0].innerText = WeekSum
}

//* Funkcja tworząca elemnty do tabeli z ostatnimi operacjami
//* Wywołanie funkcji zapisującej
function CreateRowTable(parentElement, name, date, value, CustomId) {
    let gate
    parentElement = parentElement === null ? SummaryTable : parentElement;
    name = name == '' || name == null ? "Brak Nazwy" : name
    date = date == null ? InputDate.value.split('-').reverse().join('.') : date
    value = value == null || value == '' ? "0" : value
    if(CustomId == null || CustomId == '') {
        gate = 1
    }
    CustomId = CustomId == null || CustomId == '' ? GetId() : CustomId
    let row = document.createElement('tr')
    row.classList.add('RowTable')
    row.setAttribute('name',name)
    row.setAttribute('date',date)
    row.setAttribute('value',parseInt(value))
    row.setAttribute('db_id',CustomId)
    row.innerHTML = `
        <td>${name}</td>
        <td>${date}</td>
        <td>${value} PLN</td>
        <td><button onclick='RemoveRowAndData(this)' class="LatesEarningList-RemoveRow"><i class="bi bi-trash-fill"></i></button></td>
    `
    parentElement.appendChild(row)

    money.push({
        id: CustomId,
        name: String(name),
        date: String(date),
        value: parseFloat(value)
    })
    if(gate == 1) {
        SaveToLocalStorage('money', money)
    }
}

//* Funkcja usuwająca wiersz wraz z danymi z bazy danych
function RemoveRowAndData(el) {
    let element = el.parentNode.parentNode
    let get_id = element.getAttribute('db_id')
    // Wyszukiwanie elemntów o pasującym ID
    let result = money.filter(x => x.id == parseInt(get_id))
    // Usuwanie znalezionych elmentów
    for (let i = money.length - 1; i >= 0; i--) {
        if (result.includes(money[i])) {
            FindUsingId(money[i].id)
            money.splice(i, 1);
        }
    }
    // Zapisywanie do bazy danych
    SaveToLocalStorage('money', money)
}

function FindUsingId(id) {
    let finded = document.querySelectorAll('.RowTable')
    finded.forEach((e) => {
        if(parseInt(e.getAttribute('db_id')) == parseInt(id)) {
            e.remove()
        }
    })
}

//* Funkcje do operacji na bazie lokalnej
function SaveToLocalStorage(name, data) {
    console.log("Zapisywanie danych do Lokalnej bazy")
    localStorage.setItem(name, JSON.stringify(data))
    UpdateScreen()
}
function ReadFromLocalStorage(name) {
    // console.log("Czytanie danych z Lokalnej bazy")
    return JSON.parse(localStorage.getItem(name))
}
function RemoveFromLocalStorage(name) {
    // console.log('Usuwanie danych z Lokalnej bazy');
    localStorage.clear(name)
    UpdateScreen()
}

