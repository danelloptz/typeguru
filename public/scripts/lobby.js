let modalClick = document.getElementById("modalClick");
let modalWrapper = document.querySelector(".modal_wrapper");
let modalClose = document.querySelector(".modal_close");
let user_name = document.querySelector('.lobby_profile_name');
let modal_name = document.querySelector('.modal_name');
let modal_email = document.querySelector('.modal_email');
let modal_btns_save = document.querySelector('.modal_btns_save');
let modal_btns_cancel = document.querySelector('.modal_btns_cancel');

// ========== ТЕСТИРУЕТСЯ В ДРУГОМ МОДУЛЕ==========
// валидация email (ещё есть на серваке), на случай sql-инъекций
function ValidateEmail(str) {
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(str);
}

// ========== ТЕСТИРУЕТСЯ В ДРУГОМ МОДУЛЕ==========
function ValidatePass(str) {
    const regex = /['"/\\=<>]/;
    return !regex.test(str);
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function openModal() {
    modalWrapper.style.visibility = 'visible';
    modalWrapper.style.pointerEvents = 'all';
    modalClick.dataset.check = 1;
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function CloseModal() {
    modalWrapper.style.visibility = 'hidden';
    modalWrapper.style.pointerEvents = 'none';
    modalClick.dataset.check = 0;
}

modalClick.addEventListener('click',openModal);
modalClose.addEventListener('click', CloseModal);

// Ставим данные пользователя в меню
let user_data = JSON.parse(localStorage.getItem('user'));
modal_name.value = user_data.data.name;
modal_email.value = user_data.data.email;
user_name.innerHTML = user_data.data.name;

// ========== НЕ ТЕСТИРУЕТСЯ ==========
// Кнопки сохранения и отмены в меню
function saveButton() {
    if (ValidateEmail(modal_email.value) && ValidatePass(modal_name.value)) {
        let modal_data = { // данные до/после и данные о текущем пользователе
            previous: user_data.data.email,
            email: modal_email.value,
            name: modal_name.value
        };
        
        // post-запрос на сервер
        fetch('/api/modalChange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(modal_data)
        })
        .then(response => response.json())
        .then(data => {
            // если успешный статус, то парсим данные в хранилище и обновляем их в ЛК 
            if (data.exists) {
                user_data.data.email = modal_email.value;
                user_data.data.name = modal_name.value;
                localStorage.setItem('user', JSON.stringify(user_data));
                user_name.innerHTML = user_data.data.name;
                alert('Изменения сохранены');
            } 
            else alert(data.message);
        })
        .catch(error => console.error('Ошибка:', error));
    }
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function cancelButton() {
    modal_email.value = user_data.data.email;
    modal_name.value = user_data.data.name;
    CloseModal();
}
modal_btns_save.addEventListener('click', saveButton);
modal_btns_cancel.addEventListener('click', cancelButton);


let toogle = document.querySelector('.toggle'); // переключатель
let audio = document.getElementById('audio'); // аудио-файл

// ========== НЕ ТЕСТИРУЕТСЯ ==========
function musicToogle(e) {
    if (toogle.dataset.check == 0) {
        audio.play();
        toogle.dataset.check = 1;
    } 
    else {
        audio.pause();
        toogle.dataset.check = 0;
    } 

    e.preventDefault();
    toogle.classList.toggle('toggle-on');
}

toogle.onclick = musicToogle;

// ========== МОЖНО ПОПРОБОВАТЬ ПРОВЕРЯТЬ РАЗМЕР И РАСШИРЕНИЕ ФАЙЛА ==========
function changeAvatar(e) {
    let file = e.target.files[0];
    if (!file) return;
  
    let formData = new FormData();

    formData.append('file', file);
    formData.append('id', user_data.data.id);
  
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    }).then(response => response.json())
     .then(data => {
        if (data.exists) console.log('Успех')
      })
     .catch(error => {
        console.error('Ошибка загрузки:', error);
      });
}

document.getElementById('changeAvatar').addEventListener('change', (e) => changeAvatar(e));
