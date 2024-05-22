/**
 * @jest-environment jsdom
 */


// auth.test.js
const { login } = require('../scripts/auth'); // Импортируйте функцию login

describe('login function', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    
    // Заменяем alert на мок-функцию
    window.alert = jest.fn();
  });

  test('should redirect to lobby page on successful login', async () => {
    // Подготовка: имитируем ответ сервера
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ exists: true }),
    });

    // Вызываем функцию login
    const status = await login('ass@mail.ru', '123');
    // Проверяем, что пользователь был перенаправлен на страницу лобби и ret_status равно true
    expect(status).toBe(true); 
});


  test('should show error message on failed login', async () => {
    // Подготовка: имитируем ответ сервера с ошибкой
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ exists: false, message: 'Invalid credentials' }),
    });

    // Вызываем функцию login
    const status = await login('ass@mail.ru', '123');

    // Проверяем, что отобразилось сообщение об ошибке
    expect(status).toBe(false); 
  });
});
