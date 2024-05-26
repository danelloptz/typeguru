// возможные случаи ввода символа
export function checkLetter(curr_letter, text_letter, curr_len, last_len) {
    if (curr_len < last_len) return 3;
    if (text_letter == curr_letter && curr_letter!= ' ') return 1;
    if (text_letter == curr_letter && curr_letter == ' ') return 2;
    if (curr_letter != ' ' && text_letter == ' ') return -1
    else return 0;
}