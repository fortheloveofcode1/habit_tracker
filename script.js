document.addEventListener('DOMContentLoaded', () => {
    const monthDisplay = document.getElementById('monthname');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const resetButton = document.getElementById('reset-button'); // Assuming you have a reset button with this ID
    const weekdaysContainer = document.querySelector('.weekdays');
    const daysContainer = document.querySelector('.days-container');
    const addButton = document.getElementById('add-button');
    const container = document.getElementById('habits-container');
    const achievedContainer = document.getElementById('achieved-container');

    let selectedTextbox = null;
    let textBoxCount = 0;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function loadFromLocalStorage() {
        const calendarData = JSON.parse(localStorage.getItem('calendarData'));
        const habitsData = JSON.parse(localStorage.getItem('habitsData'));

        if (calendarData) {
            updateCalendar(calendarData.year, calendarData.month, calendarData.days);
        } else {
            updateCalendar(currentYear, currentMonth);
        }

        if (habitsData) {
            habitsData.forEach(habit => addTextbox(habit.value, habit.count, habit.color));
        }
    }

    function saveToLocalStorage() {
        const calendarData = {
            year: currentYear,
            month: currentMonth,
            days: []
        };

        document.querySelectorAll('.day').forEach(dayDiv => {
            if (dayDiv.textContent.includes('(')) {
                calendarData.days.push(dayDiv.textContent);
            } else {
                calendarData.days.push(null);
            }
        });

        localStorage.setItem('calendarData', JSON.stringify(calendarData));

        const habitsData = [];
        document.querySelectorAll('#habits-container .textbox-wrapper').forEach(wrapper => {
            const input = wrapper.querySelector('input[type="text"]');
            habitsData.push({
                value: input.value,
                count: input.dataset.count || 0,
                color: input.style.backgroundColor || ''
            });
        });

        localStorage.setItem('habitsData', JSON.stringify(habitsData));
    }

    function renderWeekdays() {
        weekdaysContainer.innerHTML = '';
        weekdayNames.forEach(day => {
            const weekday = document.createElement('div');
            weekday.textContent = day;
            weekday.classList.add('weekday');
            weekdaysContainer.appendChild(weekday);
        });
    }

    function renderDays(year, month, savedDays = []) {
        daysContainer.innerHTML = '';
        const totalDays = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('day');
            daysContainer.appendChild(emptyDiv);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            dayDiv.classList.add('day', 'current-month');

            if (savedDays.length && savedDays[firstDayIndex + i - 1]) {
                dayDiv.textContent = savedDays[firstDayIndex + i - 1];
            }

            dayDiv.addEventListener('click', function (e) {
                if (selectedTextbox) {
                    const mappedText = selectedTextbox.value || 'Empty';
                    const count = parseInt(selectedTextbox.dataset.count || 0) + 1;
                    selectedTextbox.dataset.count = count;
                    if (count > 15) {
                        achievedContainer.textContent = "Congratulations you have successfully created a habit";
                        selectedTextbox.classList.add('achieved');
                        selectedTextbox.style.backgroundColor = 'lightgreen'; // Set background color for achieved
                    } else {
                        achievedContainer.textContent = "";
                        selectedTextbox.classList.remove('achieved');
                        selectedTextbox.style.backgroundColor = ''; // Reset background color
                    }
                    e.target.textContent += ` (${mappedText})`;
                    saveToLocalStorage();
                }
            });
            daysContainer.appendChild(dayDiv);
        }
    }

    function updateCalendar(year, month, savedDays = []) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
        renderWeekdays();
        renderDays(year, month, savedDays);
    }

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    updateCalendar(currentYear, currentMonth);

    prevButton.addEventListener('click', () => {
        saveToLocalStorage();
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        const calendarData = JSON.parse(localStorage.getItem('calendarData'));
        const savedDays = calendarData && calendarData.year === currentYear && calendarData.month === currentMonth ? calendarData.days : [];
        updateCalendar(currentYear, currentMonth, savedDays);
    });

    nextButton.addEventListener('click', () => {
        saveToLocalStorage();
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        const calendarData = JSON.parse(localStorage.getItem('calendarData'));
        const savedDays = calendarData && calendarData.year === currentYear && calendarData.month === currentMonth ? calendarData.days : [];
        updateCalendar(currentYear, currentMonth, savedDays);
    });

    resetButton.addEventListener('click', () => {
        const calendarData = JSON.parse(localStorage.getItem('calendarData'));
        if (calendarData && calendarData.year === currentYear && calendarData.month === currentMonth) {
            calendarData.days = [];
            localStorage.setItem('calendarData', JSON.stringify(calendarData));
            updateCalendar(currentYear, currentMonth, []);
            achievedContainer.textContent = "";
        }
    });

    function addTextbox(value = '', count = 0, color = '') {
        textBoxCount++;
        const wrapper = document.createElement('div');
        wrapper.classList.add('textbox-wrapper');

        const newTextbox = document.createElement('input');
        newTextbox.type = 'text';
        newTextbox.placeholder = 'Enter text here';
        newTextbox.value = value;
        newTextbox.dataset.count = count;
        newTextbox.style.backgroundColor = color; // Restore color
        newTextbox.onclick = function () {
            if (selectedTextbox) {
                selectedTextbox.classList.remove('selected');
            }
            newTextbox.classList.add('selected');
            selectedTextbox = newTextbox;
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = function () {
            wrapper.remove();
            achievedContainer.textContent = "";
            saveToLocalStorage();
        };

        wrapper.appendChild(newTextbox);
        wrapper.appendChild(deleteButton);
        container.appendChild(wrapper);
    }

    addButton.addEventListener('click', function () {
        addTextbox();
        saveToLocalStorage();
    });

    loadFromLocalStorage();
});
