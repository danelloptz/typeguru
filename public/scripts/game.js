let sandbox_words = document.querySelector('.sandbox_words'), sandboxField = document.querySelector('.sandbox'), resultField = document.querySelector('.results');
let text;
let sandbox_input = document.querySelector('.sandbox_input'), pointer_letter = 0, pointer_word = 0;
let sandbox_letter = document.getElementsByClassName('sandbox_letter');
let user_data = JSON.parse(localStorage.getItem('user')).data;

// ассинхронная функция, т.к ответ приходит не сразу
async function fetchText() {
    try {
        // настройки желаемого текста менять в ссылке (можно добавить пользовательские настройки)
        const response = await fetch('https://fish-text.ru/get?&type=sentence&number=1', {
            method: 'GET'
        });
        const data = await response.json();
        text = data.text;

        let lines_add = [];

        text.split(' ').forEach(word => {
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


fetchText();

let incorrectLetters = {}, start_time, last_input_value = 0, speedCheckpoints = [], last_time = 0, speedList = [];

/*
Как реализовать график:
    - записывать в словарь, где ключ - секунда, значение - скорость
    - итоговый список значений (list), последняя секунда (last)
    - перебираем словарь по ключам:
        - создаём список, где будут хранится текущие значения ключей (arr)
        - если ключ != last, то добавляем в list среднее значение arr (если arr не пустой)
        - если ключ == last, то добавляем значение этого ключа в arr
*/

function inputText(e) {
    if (sandbox_input.value.length < 2) {
        start_time = new Date();
        last_time = new Date();
    }
    
    let curr_time = new Date();
    
    // тут крутая проверка 
    if ((curr_time - start_time) / 1000 >= Math.ceil((last_time - start_time) / 1000) && String((curr_time - start_time) / 1000).split('.')[0] != String((last_time - start_time) / 1000).split('.')[0]) {
        // Расчет средней скорости за прошедшую секунду
        let curr_speed = ((pointer_letter + 1) / ((curr_time - start_time) / 1000)).toFixed(2);
        speedList.push([Math.floor((curr_time - start_time) / 1000), +curr_speed]); // массив вида [текущая_секунда, скорость]
        last_time = curr_time; // Обновление last_time
    } 
    let curr_letter = sandbox_input.value.slice(-1);
    if (pointer_letter + 1 <= text.length) {
        if (curr_letter == ' ' && text[pointer_letter]!= ' ') {
            sandbox_input.value = sandbox_input.value.replace(' ', '');
            e.preventDefault();
        } else {
            if (sandbox_input.value.length < last_input_value.length) { // был нажат backspace
                pointer_letter--;
                try {
                    sandbox_letter[pointer_letter - 1].classList.add('activeLetter');
                    sandbox_letter[pointer_letter].classList.remove('activeLetter');
                } catch(e) {}
                ['incorrect', 'correct', 'incorrect_space', 'correct_space'].forEach(className => sandbox_letter[pointer_letter].classList.remove(className));
            } else {
                if (text[pointer_letter] == curr_letter) {
                    if (curr_letter!= ' ') sandbox_letter[pointer_letter].classList.add('correct');
                    else sandbox_letter[pointer_letter].classList.add('correct_space');
                }
                else {
                    if (curr_letter!= ' ') {
                        sandbox_letter[pointer_letter].classList.add('incorrect');
                        incorrectLetters[text[pointer_letter]] = (incorrectLetters[text[pointer_letter]] || 0) + 1;
                    }
                    else sandbox_letter[pointer_letter].classList.add('incorrect_space');
                }

                // тут надо бы написать по нормальному, но мне лень
                try {
                    sandbox_letter[pointer_letter - 1].classList.remove('activeLetter');
                    sandbox_letter[pointer_letter].classList.add('activeLetter');
                } catch(e) {}
                
                pointer_letter++;
            }
        }
    } else {
        let endTime = new Date(), sumWrong = 0;
        let timeTaken = endTime - start_time;
        let resultTime = document.getElementById('results_time'), resultSpeed = document.getElementById('results_speed'), modalResultAccuracy = document.getElementById('results_accuracy'), speed_changes = document.getElementById('speed_changes'), arrow_speed_changes = document.getElementById('arrow_speed_changes'),arrow_speed_stroke = document.getElementById('arrow_speed_stroke'), accuracy_changes = document.getElementById('accuracy_changes'), arrow_accuracy_changes = document.getElementById('arrow_accuracy_changes'),arrow_accuracy_stroke = document.getElementById('arrow_accuracy_stroke');

        for (let letter in incorrectLetters) sumWrong += incorrectLetters[letter];

        // очки за попытку
        const gameKef = (text.length / (timeTaken / 1000)) * (100 - (sumWrong / text.length * 100 )) * 10;

        let result_data = {
            'exists': true,
            'data': {
                'id': user_data.id,
                'name': user_data.name,
                'time': timeTaken / 1000, 
                'speed': text.length / (timeTaken / 1000),
                'accuracy': 100 - (sumWrong / text.length * 100 ),
                'email': user_data.email,
                'wins': user_data.wins + 1,
                'points': gameKef
            }
        }
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

        localStorage.setItem('user', JSON.stringify(result_data));

        resultTime.innerHTML = result_data.data.time.toFixed(2) + '<span style="color: white;opacity: .4; font-size: 30px;">s</span>';
        resultSpeed.innerHTML = result_data.data.speed.toFixed(2) + '<span style="color: white;opacity: .4;font-size: 30px;">s/m</span>';
        modalResultAccuracy.innerHTML = result_data.data.accuracy.toFixed(2) + '<span style="color: white;opacity: .4;font-size: 30px;">%</span>';

        // формирование массивов данных для графика скорости
        let labelsModal = [], seriesModal = [];
        for (let i = 0; i < speedList.length - 1; i++) {
            // этот костыль, чтобы если была пауза и в какие-то секунды не было данных, просто записать данные из последней записанной секунды
            let modal_repeat_index = speedList[i+1][0] - speedList[i][0] == 1 ? 1 : speedList[i+1][0] - speedList[i][0];
            for (let j = 0; j < modal_repeat_index; j++) {
                labelsModal.push(speedList[i][0]+j);
                seriesModal.push(speedList[i][1]);
            }
        }

        // Диаграмма скорости
        new Chartist.Line('#chart1', {
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
        
        sandbox_input.blur();
        sandboxField.style.display = 'none';
        resultField.style.display = 'grid';
    }       
    last_input_value = sandbox_input.value;
}

sandbox_input.addEventListener('input', inputText);


