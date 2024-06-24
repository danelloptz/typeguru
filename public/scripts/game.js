import { checkLetter } from "./game_modules.js";

let sandbox_words = document.querySelector('.sandbox_words'), sandboxField = document.querySelector('.sandbox'), resultField = document.querySelector('.results');
let sandbox_input = document.querySelector('.sandbox_input'), pointer_letter = 0, pointer_word = 0;
let sandbox_letter = document.getElementsByClassName('sandbox_letter');
let resultTime = document.getElementById('results_time'), resultPoints = document.getElementById('results_points'), resultSpeed = document.getElementById('results_speed'), modalResultAccuracy = document.getElementById('results_accuracy'), speed_changes = document.getElementById('speed_changes'), arrow_speed_changes = document.getElementById('arrow_speed_changes'),arrow_speed_stroke = document.getElementById('arrow_speed_stroke'), accuracy_changes = document.getElementById('accuracy_changes'), arrow_accuracy_changes = document.getElementById('arrow_accuracy_changes'),arrow_accuracy_stroke = document.getElementById('arrow_accuracy_stroke');
let text;

let modalGame_item = document.querySelectorAll('.modalGame_item');
let modalGame_item_input = document.querySelectorAll('.modalGame_item_input');
let modalGameWrapper = document.querySelector(".modalGame_wrapper");
let modalGame_buttons = document.querySelectorAll('.button_play');
let svg_average = document.querySelectorAll('.svg_average');
let labelsModal = [], seriesModal = [], accurLabels = [], accurSeries = [];




// ========== НЕ ТЕСТИРУЕТСЯ ==========
function openGameModal() {
    modalGameWrapper.style.visibility = 'visible';
    modalGameWrapper.style.pointerEvents = 'all';
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function CloseGameModal() {
    modalGameWrapper.style.visibility = 'hidden';
    modalGameWrapper.style.pointerEvents = 'none';
}

openGameModal();

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function isNumber(str) {
    let re = /^[0-9]+$/;
    return re.test(str);
}

// 3 режима набора текста
modalGame_item.forEach((item, index) => item.addEventListener('click', () => {
    if (modalGame_buttons[index].dataset.state == 0) { // этот слушатель отрабатывает после того, что ниже, поэтому если не ставить это условие, то выбранная кнопка останется видимой
        // сбрасываем прошлую активную плашку (да, просто сбрасываем все, вместо только одной, но их всего 3, так что не страшно)
        modalGame_item.forEach(el => el.style.background = 'none');
        modalGame_buttons.forEach(el => { el.style.visibility = 'hidden'; el.style.pointerEvents = 'none'; });

        // устанавливаем состояние для текущей
        item.style.background = '#a6c0f15d';
        modalGame_buttons[index].style.visibility = 'visible';
        modalGame_buttons[index].style.pointerEvents = 'all';
    }
}));

// кнопки начала игры в режимах набора текста
modalGame_buttons.forEach((button, index) => button.addEventListener('click', () => {
    const input = modalGame_item_input[index].value.replaceAll(' ', ''); // введённое значение
    const type = button.dataset.type; // желаемый тип данных (слово, предложение, абзац)

    if (!isNumber(input)) return; // проверяем что только цифры

    button.style.visibility = 'hidden'; 
    button.style.pointerEvents = 'none';
    button.dataset.state = 1;
    
    localStorage.setItem('gameSettings', JSON.stringify(
        {
            'type' : type,
            'number' : +input
        }
    ));
    CloseGameModal();
    fetchText(sandbox_words);
}))

// ассинхронная функция, т.к ответ приходит не сразу
// ========== НЕ ТЕСТИРУЕТСЯ ==========
export async function fetchText(sandbox_words) {
    try {
        let gameSettings = JSON.parse(localStorage.getItem('gameSettings'));

        const type = gameSettings.type;
        const number = gameSettings.number;
        let help_list = [], help_text = '';

        const response = await fetch(`https://fish-text.ru/get?&type=${type != 'title' ? type : 'sentence'}&number=${number}`, {
            method: 'GET'
        });
        const data = await response.json();
        text = data.text;

        if (type == 'title') {
            text.split(' ').forEach(word => { 
                if (help_list.length < number && word.length > 1) {
                    let _ = word.replace(/[.,?!:;()]/g, '').toLowerCase();
                    help_list.push(_); 
                    help_text += _ + ' ';
                }
            });
            text = help_text.trim();
        } 

        help_list.length == 0 ? help_list = text.split(' ') : help_list;

        help_list.forEach(word => {
            let words_tag = ''; // здесь хранятся все span с буквами
            word.split('').forEach(letter => words_tag += (`<span class="sandbox_letter">${letter}</span>`));
            words_tag += `<span class="sandbox_letter">&nbsp;</span>`; // пробел
            sandbox_words.innerHTML += `<div class="sandbox_word">${words_tag}</div>`
        });
        sandbox_input.focus(); // сразу доступен для ввода

    } catch (error) {
        console.error('Ошибка:', error);
    }
}


let incorrectLetters = {}, start_time, last_input_value = 0, speedCheckpoints = [], last_time = 0, speedList = [], accuracyList = [], count_letters = 0, count_words = 0, row_width = 0;
let user_data_string = localStorage.getItem('user');
let user_data = user_data_string ? JSON.parse(user_data_string).data : null; 

// ========== ОТСЮДА ТЕСТИРУЕТСЯ ТОЛЬКО checkLetter ==========
export function inputText(curr_letter) {
    if (sandbox_input.value.length < 2) {
        start_time = new Date();
        last_time = new Date();
    }
    
    let curr_time = new Date();
    
    // это очень приятное условие для того, чтобы на каждую секунду были записаны данные
    if ((curr_time - start_time) / 1000 >= Math.ceil((last_time - start_time) / 1000) && String((curr_time - start_time) / 1000).split('.')[0]!= String((last_time - start_time) / 1000).split('.')[0]) {
        let curr_speed = ((pointer_letter + 1) / ((curr_time - start_time) / 1000)).toFixed(2), incorrect = 0;
        for (let count in incorrectLetters) incorrect += incorrectLetters[count];

        const curr_accur = 100 - (incorrect / count_letters * 100);
        
        accuracyList.push([Math.floor((curr_time - start_time) / 1000), +curr_accur]);
        speedList.push([Math.floor((curr_time - start_time) / 1000), +curr_speed]);
        last_time = curr_time;
    }

    const text_status = checkLetter(curr_letter, text[pointer_letter], sandbox_input.value.length, last_input_value.length);

    // действия в зависимости от того, какой был ввод символа
    switch (text_status) {
        case -1:
            sandbox_letter[pointer_letter].classList.add('incorrect_space')
            break;
        case 0:
            sandbox_letter[pointer_letter].classList.add('incorrect');
            incorrectLetters[text[pointer_letter]] = (incorrectLetters[text[pointer_letter]] || 0) + 1;
            break;
        case 1:
            sandbox_letter[pointer_letter].classList.add('correct');
            break;
        case 2:
            sandbox_letter[pointer_letter].classList.add('correct_space');
            break;
        case 3:
            pointer_letter--;
            ['incorrect', 'correct', 'incorrect_space', 'correct_space'].forEach(className => sandbox_letter[pointer_letter].classList.remove(className));
            break;
    }

    try { // try нужен, чтобы не портить код для обработки ввода первого символа и удаления несуществующего
        if (text_status < 3) {
            sandbox_letter[pointer_letter - 1].classList.remove('activeLetter');
            sandbox_letter[pointer_letter].classList.add('activeLetter');
            pointer_letter++;
        } else {
            sandbox_letter[pointer_letter - 1].classList.add('activeLetter');
            sandbox_letter[pointer_letter].classList.remove('activeLetter');
        }
    } catch(err) { pointer_letter = text_status < 3 ? pointer_letter + 1 : pointer_letter - 1; }

    // эта штука нужна, чтобы убирать введённую строку слов (так можно показывать большие тексты по кусочкам в небольшом контейнере)
    if (text[pointer_letter - 1] == ' ') {
        const word_width = sandbox_words.children[count_words].clientWidth; // длина последнего введённого слова
        const next_width = sandbox_words.children[count_words + 1].clientWidth; // длина следующего слова

        row_width += word_width;
        if (row_width + next_width > window.innerWidth*0.8) { // 0.8 здесь это 80vw для контейнера, где текст находится
            row_width = 0;
            for (let index = 0; index <= count_words; index++) sandbox_words.children[index].style.display = 'none'; // не удаляем элементы, а просто скрываем их, так не сбиваются счётчики проверки правильности ввода
        } 
        count_words++;
    }

    last_input_value = sandbox_input.value; // запомнить длину последнего состояния
    count_letters++;
    return pointer_letter + 1 > text.length; // статус, завершён ли ввод
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
export function endGame(isTest = false) {
    let endTime = new Date(), sumWrong = 0;
    let timeTaken = endTime - start_time;

    for (let letter in incorrectLetters) sumWrong += incorrectLetters[letter];

    const gameKef = (text.length / (timeTaken / 100) * 10) * (100 - (sumWrong / text.length * 100 )) * 10;

    let result_data = {
        'exists': true,
        'data': {
            'id': user_data.id,
            'name': user_data.name,
            'time': timeTaken / 1000, 
            'speed': count_letters / (timeTaken / 1000),
            'accuracy': 100 - (sumWrong / text.length * 100 ),
            'email': user_data.email,
            'wins': user_data.wins + 1,
            'points': gameKef
        }
    };

    // Отправка результатов на сервер
    fetch('/api/endgame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(result_data.data)
    })
  .then(response => response.json())
  .then(data => {
        if (!data.exists) alert('ГОВНИЩЕ');
    })
  .catch(error => console.error('Ошибка:', error));

    // =========== Сравнение с прошлой попыткой ===========
    let lastTake = user_data, speed_diff = (result_data.data.speed - lastTake.speed).toFixed(2), accuracy_diff = (result_data.data.accuracy - lastTake.accuracy).toFixed(2);
    
    // выносим установку ui в отдельный нетестируемую функцию
    setUi(speed_diff, accuracy_diff, result_data);

    // формирование массивов данных для графика скорости
    for (let i = 0; i < speedList.length - 1; i++) {
        // этот костыль, чтобы если была пауза и в какие-то секунды не было данных, просто записать данные из последней записанной секунды
        let modal_repeat_index = speedList[i+1][0] - speedList[i][0] == 1 ? 1 : speedList[i+1][0] - speedList[i][0];
        for (let j = 0; j < modal_repeat_index; j++) {
            labelsModal.push(speedList[i][0]+j);
            seriesModal.push(speedList[i][1]);
        }
    }
    for (let i = 0; i < accuracyList.length - 1; i++) {
        // этот костыль, чтобы если была пауза и в какие-то секунды не было данных, просто записать данные из последней записанной секунды
        let modal_repeat_index = accuracyList[i+1][0] - accuracyList[i][0] == 1 ? 1 : accuracyList[i+1][0] - accuracyList[i][0];
        for (let j = 0; j < modal_repeat_index; j++) {
            accurLabels.push(accuracyList[i][0]+j);
            accurSeries.push(accuracyList[i][1]);
        }
    }

    drawDiagram(labelsModal, seriesModal); // ui в отдельной функции
    
    sandbox_input.blur();
    sandboxField.style.display = 'none';
    resultField.style.display = 'grid';
    
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
export function setUi(speed_diff, accuracy_diff, result_data) {
    speed_changes.innerHTML = speed_diff, accuracy_changes.innerHTML = accuracy_diff;
    if (speed_diff > 0) {
        speed_changes.style.color = 'green';
        arrow_speed_stroke.style.stroke = 'green';
    } else {
        speed_changes.style.color = 'red';
        arrow_speed_stroke.style.stroke = 'red';
        arrow_speed_changes.style.transform = 'rotate(180deg)';
    } 

    if (accuracy_diff > 0) {
        accuracy_changes.style.color = 'green';
        arrow_accuracy_stroke.style.stroke = 'green';
    } else {
        accuracy_changes.style.color = 'red';
        arrow_accuracy_stroke.style.stroke = 'red';
        arrow_accuracy_changes.style.transform = 'rotate(180deg)';
    }

    user_data.speed = result_data.data.speed;
    user_data.accuracy = result_data.data.accuracy;
    localStorage.setItem('user', JSON.stringify({exists: true, data: user_data}));

    resultTime.innerHTML = result_data.data.time.toFixed(2) + '<span style="color: white;opacity: .4; font-size: 30px;">s</span>';
    resultSpeed.innerHTML = result_data.data.speed.toFixed(2) + '<span style="color: white;opacity: .4;font-size: 30px;">s/m</span>';
    modalResultAccuracy.innerHTML = result_data.data.accuracy.toFixed(2) + '<span style="color: white;opacity: .4;font-size: 30px;">%</span>';
    resultPoints.innerHTML = result_data.data.points.toFixed(0);
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
export function drawDiagram(labelsModal, seriesModal) {
    // Диаграмма скорости
    return new Chartist.Line('#chart1', {
        labels: labelsModal,
        series: [seriesModal]
    }, {
        axisY: {
            labelInterpolationFnc: function(value, index) {
                return index % 4 === 0 ? value : null; // показывать значения через 4 (чтобы меньше было)
            }
            },
            axisX: {
            labelInterpolationFnc: function(value, index) {
                return index % Math.trunc(labelsModal.length / 10) === 0 ? value : null; // показывать значения через 4 (чтобы меньше было)
            }
            },
        showArea: true, // закрашивать область
        low: 0,         // минимальное значение
    });
}

// Добавление обработчика события для поля ввода
sandbox_input.addEventListener('input', (e) => {
    let status = inputText(e.target.value[e.target.value.length - 1]);
    if (status) endGame();
});


// ========== НЕ ТЕСТИРУЕТСЯ ==========
function averageSwitch(el) {
    const func_name = el.getAttribute('data-name');
    document.querySelector('.svg_active').classList.toggle('svg_active');
    el.classList.add('svg_active');
    switch (func_name) {
      case 'speed':
        drawDiagram(labelsModal, seriesModal);
        break;
  
      case 'accuracy':
        drawDiagram(accurLabels, accurSeries);
        break;
    }
    console.log(ct_area);

  }

// кнопки переключения диаграммы в конце попытки
svg_average.forEach(el => el.addEventListener('click', () => averageSwitch(el)));



