let sign_btn = document.querySelector('.signin_submit');
let signup_btn = document.querySelector('.signup_submit');
let name_input = document.getElementById('name');
let email_input = document.getElementById('email');
let pass_input = document.getElementById('pass');
let pass_confirm_input = document.getElementById('pass_confirm');


function ValidateEmail(str) {
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(str);
}
function ValidatePass(str) {
    const regex = /['"\/\\=<>]/;
    return !regex.test(str);
}

localStorage.clear();

function login(e) {
    e.preventDefault();
    if (ValidateEmail(email_input.value) && ValidatePass(pass_input.value)) {
        let sign_data = {
            email: email_input.value,
            pass: pass_input.value
        };
    
        fetch('/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(sign_data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                localStorage.setItem('user', JSON.stringify(data));
                document.location.href = "http://127.0.0.1:3000/public/game/lobby.html";
            } 
            else alert(data.message);
        })
        .catch(error => console.error('Ошибка:', error));
    } else {
        alert('Неправильный формат ввода данных');
    }
}
function registr(e) {
    e.preventDefault();
    if (ValidateEmail(email_input.value) && ValidatePass(pass_input.value) && ValidatePass(name_input.value) && pass_input.value == pass_confirm_input.value) {
        let signup_data = {
            name: name_input.value,
            email: email_input.value,
            pass: pass_input.value
        };
    
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(signup_data)
        })
        .then((response) => {
            
            return response.json();
        })
        .then(data => {
            if (data.exists) {
                localStorage.setItem('user', JSON.stringify(data));
                document.location.href = "http://127.0.0.1:3000/public/game/lobby.html";
            }
            else alert(data.message);
        })
        .catch(error => console.error('Ошибка:', error));
        
    }
}

if (sign_btn) sign_btn.addEventListener('click', login);
if (signup_btn) signup_btn.addEventListener('click', registr);