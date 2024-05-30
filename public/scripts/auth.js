import { login, registr, ValidateEmail, ValidatePass } from "./auth_modules.js";

let sign_btn = document.querySelector('.signin_submit');
let signup_btn = document.querySelector('.signup_submit');
let name_input = document.getElementById('name');
let email_input = document.getElementById('email');
let pass_input = document.getElementById('pass');
let pass_confirm_input = document.getElementById('pass_confirm');



localStorage.clear();


if (sign_btn) sign_btn.addEventListener('click', (e) => login(email_input.value, pass_input.value, e) );
if (signup_btn) signup_btn.addEventListener('click', (e) => registr(email_input.value, pass_input.value, name_input.value, pass_confirm_input.value, e));