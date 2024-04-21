let modalClick = document.getElementById("modalClick");
let modalWrapper = document.querySelector(".modal_wrapper");
let modalClose = document.querySelector(".modal_close");
let user_name = document.querySelector('.lobby_profile_name');
let modal_name = document.querySelector('.modal_name');
let modal_email = document.querySelector('.modal_email');
let modal_btns_save = document.querySelector('.modal_btns_save');
let modal_btns_cancel = document.querySelector('.modal_btns_cancel');

function ValidateEmail(str) {
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(str);
}
function ValidatePass(str) {
    const regex = /['"\/\\=<>]/;
    return !regex.test(str);
}

modalClick.addEventListener('click', () => {
    modalWrapper.style.visibility = 'visible';
    modalWrapper.style.pointerEvents = 'all';
    modalClick.dataset.check = 1;
});

function CloseModal() {
    modalWrapper.style.visibility = 'hidden';
    modalWrapper.style.pointerEvents = 'none';
    modalClick.dataset.check = 0;
}

modalClose.addEventListener('click', CloseModal);

// Ставим данные пользователя в меню
let user_data = JSON.parse(localStorage.getItem('user')).data;
console.log(user_data);
modal_name.value = user_data.name;
modal_email.value = user_data.email;
user_name.innerHTML = user_data.name;

// Кнопки сохранения и отмены в меню
modal_btns_save.addEventListener('click', () => {
    if (ValidateEmail(modal_email.value) && ValidatePass(modal_name.value)) {
        console.log('валидэйт прошёл');
        let modal_data = {
            previous: user_data.email,
            email: modal_email.value,
            name: modal_name.value
        };
    
        fetch('/api/modalChange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(modal_data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                user_data.email = modal_email.value;
                user_data.name = modal_name.value;
                localStorage.setItem('user', user_data);
                user_name.innerHTML = user_data.name;
                alert('Изменения сохранены');
                // localStorage.setItem('user', JSON.stringify(data));
            } 
            else alert(data.message);
        })
        .catch(error => console.error('Ошибка:', error));
    }
});

modal_btns_cancel.addEventListener('click', () => {
    modal_email.value = user_data.email;
    modal_name.value = user_data.name;
    CloseModal();
});

let toogle = document.querySelector('.toggle');
let audio = document.getElementById('audio');
toogle.onclick = (e) => { 
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

};