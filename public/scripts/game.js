let sandbox_words = document.querySelector('.sandbox_words');
let text;
let sandbox_input = document.querySelector('.sandbox_input'), pointer_letter = 0, pointer_word = 0;
let sandbox_letter = document.getElementsByClassName('sandbox_letter');
let user_data = JSON.parse(localStorage.getItem('user'));
console.log(JSON.parse(localStorage.getItem('user')));

// ассинхронная функция, т.к ответ приходит не сразу
async function fetchText() {
    try {
        // настройки желаемого текста менять в ссылке (можно добавить пользовательские настройки)
        const response = await fetch('https://fish-text.ru/get?&type=sentence&number=3', {
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

let incorrectLetters = {}, startTime;

function inputText(e) {
    if (sandbox_input.value.length < 2) startTime = new Date;
    let curr_letter = sandbox_input.value.slice(-1);
    if (pointer_letter <= text.length) {
        if (curr_letter == ' ' && text[pointer_letter] != ' ') { // если введён пробел, где его не должно быть, то просто убираем его (надо считать это ошибкой, переписать здесь логику)
            sandbox_input.value = sandbox_input.value.replace(' ', '');
            e.preventDefault();
        } else {
            if (text[pointer_letter] == curr_letter) { // корректно введён символ
                if (curr_letter != ' ') sandbox_letter[pointer_letter].classList.add('correct')
                else sandbox_letter[pointer_letter].classList.add('correct_space')
            }
            else {
                if (curr_letter != ' ') { // некорректный ввод символа
                    sandbox_letter[pointer_letter].classList.add('incorrect');
                    incorrectLetters[text[pointer_letter]] = (incorrectLetters[text[pointer_letter]] || 0) + 1;
                }
                else sandbox_letter[pointer_letter].classList.add('incorrect_space'); // ожидается пробел
            } 
            pointer_letter++;
        }
    } else {
        let endTime = new Date(), sumWrong = 0;
        let timeTaken = endTime - startTime;
        let modalResultTime = document.getElementById('endGame_time'), modalResultSpeed = document.getElementById('endGame_speed'), modalResultAccuracy = document.getElementById('endGame_accuracy');

        for (let letter in incorrectLetters) sumWrong += incorrectLetters[letter];

        console.log(user_data);

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
            if (data.exists) {
                alert('Изменения сохранены');
            } 
            else alert(data.message);
        })
        .catch(error => console.error('Ошибка:', error));

        localStorage.setItem('user', JSON.stringify(result_data)); // обновляем хранилище
        console.log(JSON.parse(localStorage.getItem('user')).data);
        $('#end-link').modal(); // показываем модальное окно с результатами
    }       
}

sandbox_input.addEventListener('input', inputText);