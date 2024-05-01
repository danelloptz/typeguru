let sandbox_words = document.querySelector('.sandbox_words');
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

// function gameTicks() {
//     while (pointer_letter <= text.length) {
//         let curr_time = new Date;
//         if (curr_time - last_time > 1000) {
//             console.log('tick');
//             last_time = curr_time;
//         }
//     }
// }

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
    
    if ((curr_time - start_time) / 1000 >= Math.ceil((last_time - start_time) / 1000) && String((curr_time - start_time) / 1000)[0] != String((last_time - start_time) / 1000)[0]) {
        // Расчет средней скорости за прошедшую секунду
        let curr_speed = (pointer_letter + 1) / ((curr_time - start_time) / 1000);
        let sub_arr = new Array(Math.floor((curr_time - last_time) / 1000)).fill(curr_speed);
        // speedList.push([(curr_time - start_time) / 1000 ,curr_speed]);
        // speedList.push((curr_time - start_time) / 1000); тут красота
        speedList.push(...sub_arr); // тут говно
        last_time = curr_time; // Обновление last_time
    } 
    let curr_letter = sandbox_input.value.slice(-1);
    if (pointer_letter + 1 <= text.length) {
        if (curr_letter == ' ' && text[pointer_letter]!= ' ') {
            sandbox_input.value = sandbox_input.value.replace(' ', '');
            e.preventDefault();
        } else {
            if (sandbox_input.value.length < last_input_value.length) {
                pointer_letter--;
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
                pointer_letter++;
            }
        }
    } else {
        console.log(speedList);
        let endTime = new Date(), sumWrong = 0;
        let timeTaken = endTime - start_time;
        let modalResultTime = document.getElementById('endGame_time'), modalResultSpeed = document.getElementById('endGame_speed'), modalResultAccuracy = document.getElementById('endGame_accuracy');

        for (let letter in incorrectLetters) sumWrong += incorrectLetters[letter];

        let result_data = {
            'exists': true,
            'data': {
                'name': user_data.name,
                'time': timeTaken / 1000, 
                'speed': text.length / (timeTaken / 1000),
                'accuracy': 100 - (sumWrong / text.length * 100 ),
                'email': user_data.email,
                'wins': user_data.wins + 1
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

        localStorage.setItem('user', JSON.stringify(result_data));

        modalResultTime.innerHTML = result_data.data.time.toFixed(2) + ' s';
        modalResultSpeed.innerHTML = result_data.data.speed.toFixed(2) + ' s/m';
        modalResultAccuracy.innerHTML = result_data.data.accuracy.toFixed(2) + '%';
        
        $('#end-link').modal();
        sandbox_input.blur();
    }       
    last_input_value = sandbox_input.value;
}

sandbox_input.addEventListener('input', inputText);


// Initialize a Line chart in the container with the ID chart1
// new Chartist.Line('#chart1', {
//     labels: [1, 2, 2, 4, 5, 6, 6, 6, 7],
//     series: [[5.6, 2.1, 3.1, 4.3, 5.5, 6.7, 6.4, 3.2, 7.1]]
// });