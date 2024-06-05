let modalClick = document.getElementById("modalClick");
let modalWrapper = document.querySelector(".modal_wrapper");
let modalClose = document.querySelector(".modal_close");
let user_name = document.querySelector('.lobby_profile_name');
let modal_name = document.querySelector('.modal_name');
let modal_email = document.querySelector('.modal_email');
let modal_btns_save = document.querySelector('.modal_btns_save');
let modal_btns_cancel = document.querySelector('.modal_btns_cancel');
let lobby_profile_img = document.querySelector('.lobby_profile_img');
let big_avatar = document.getElementById('big_avatar');
let inputAvatar = document.getElementById('changeAvatar'); 

let uniqueId = new Date().getTime(); // стартовая метка времени (нужно для обновления аватарки пользователя без перезагрузки страницы)

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

function updateAvatar() {
    lobby_profile_img.src = '../../' + user_data.data.avatar;
    big_avatar.src = '../../' + user_data.data.avatar;
    uniqueId = new Date().getTime(); // обновляем метку времени (браузер понимает, что нужно перерисовать картинку)
}

modalClick.addEventListener('click',openModal);
modalClose.addEventListener('click', CloseModal);

// Ставим данные пользователя в меню
let user_data = JSON.parse(localStorage.getItem('user'));
console.log(user_data);
modal_name.value = user_data.data.name;
modal_email.value = user_data.data.email;
user_name.innerHTML = user_data.data.name;
updateAvatar();


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
                CloseModal();
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

function showError(message) {
    document.getElementById('error-message').textContent = message;
}
function cleanError() {
    document.getElementById('error-message').textContent = '';
}

// ========== МОЖНО ПОПРОБОВАТЬ ПРОВЕРЯТЬ РАЗМЕР И РАСШИРЕНИЕ ФАЙЛА ==========
function changeAvatar(e) {
    let file = e.target.files[0];
    if (!file) return;

    let sizeLimit = 5 * 1024 * 1024; // максимально допустимый размер
    let allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png']; // допустимые расширения

    if (!allowedExtensions.includes(file.type)) {
        showError('Разрешены только форматы JPEG, JPG и PNG.');
        return;
    }
    
    if (file.size > sizeLimit) {
        showError('Размер файла не должен превышать 5 МБ.');
        return;
    }
    cleanError(); // если были до этого ошибки, то очищаем поле, т.к. данные прошли валидацию

    let formData = new FormData();
    formData.append('file', file); 
    formData.append('user_id', user_data.data.id); // id пользователя для имени фото

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    }).then(response => response.json())
     .then(data => {
        user_data.data.avatar = data.filePath;
        localStorage.setItem('user', JSON.stringify(user_data));
        updateAvatar();
      })
     .catch(error => {
        console.error('Ошибка загрузки:', error);
      });
}

document.getElementById('big_avatar').addEventListener('click', () => {
    inputAvatar.click();
    inputAvatar.addEventListener('change', (e) => changeAvatar(e));
});

