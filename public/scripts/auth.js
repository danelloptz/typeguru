let sign_btn = document.querySelector('.signin_submit');
let signup_btn = document.querySelector('.signup_submit');
let name_input = document.getElementById('name');
let email_input = document.getElementById('email');
let pass_input = document.getElementById('pass');
let pass_confirm_input = document.getElementById('pass_confirm');


export function ValidateEmail(str) {
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(str);
}
export function ValidatePass(str) {
    const regex = /['"\/\\=<>]/;
    return !regex.test(str);
}

localStorage.clear();
console.log(localStorage);

export function login(email_input, pass_input, e = 'test') {
    if (e!= 'test') e.preventDefault();
    if (ValidateEmail(email_input) && ValidatePass(pass_input)) {
        let sign_data = {
            email: email_input,
            pass: pass_input
        };
    
        return fetch('/api/signin', {
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
                if (e != 'test') document.location.href = "http://127.0.0.1:3000/public/game/lobby.html";
            } 
            else alert(data.message);
            return data.exists;
        })
       .catch(error => {
            console.error('Ошибка:', error);
            return false;
        });
    } else {
        alert('Неправильный формат ввода данных');
        return false;
    }
}

export function registr(email_input, pass_input, name_input, pass_confirm_input, e = 'test') {
    if (e != 'test') e.preventDefault();
    if (ValidateEmail(email_input) && ValidatePass(pass_input) && ValidatePass(name_input) && pass_input == pass_confirm_input) {
        let signup_data = {
            name: name_input,
            email: email_input,
            pass: pass_input
        };
    
        return fetch('/api/signup', {
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
        .catch(error => console.error('Ошибка:', error))
        .finally(() => 'ЖОПА');
    }
}

if (sign_btn) sign_btn.addEventListener('click', (e) => login(email_input.value, pass_input.value, e) );
if (signup_btn) signup_btn.addEventListener('click', (e) => registr(email_input.value, pass_input.value, name_input.value, pass_confirm_input.value, e));