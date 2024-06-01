export function ValidateEmail(str) {
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(str);
}
export function ValidatePass(str) {
    const regex = /['"/\\=<>]/;
    return !regex.test(str);
}
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
                document.location.href = "http://127.0.0.1:3000/public/game/lobby.html";
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
    if (e!= 'test') e.preventDefault();
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
        .then((response) => response.json())
        .then(data => {
            if (data.exists) {
                localStorage.setItem('user', JSON.stringify(data));
                document.location.href = "http://127.0.0.1:3000/public/game/lobby.html";
                return data.exists;
            }
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