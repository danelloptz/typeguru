/**
 * @jest-environment jsdom
 */


const { checkLetter } = require('../scripts/game_modules'); 

describe('Проверка введённого символа', () => {
    test('Правильно введённый символ', async () => {
      const status = checkLetter('а', 'а', 4, 3);
      expect(status).toBe(1); 
    });
    test('Неправильно введённый символ', async () => {
        const status = checkLetter('а', 'б', 4, 3);
        expect(status).toBe(0); 
    });
    test('Неправильно введённый пробельный символ', async () => {
        const status = checkLetter('а', ' ', 4, 3);
        expect(status).toBe(-1); 
    });
    test('Правильно введённый пробельный символ', async () => {
        const status = checkLetter(' ', ' ', 4, 3);
        expect(status).toBe(2); 
    });
    test('Нажат backspace', async () => {
        const status = checkLetter('а', 'б', 3, 4);
        expect(status).toBe(3); 
    });
});