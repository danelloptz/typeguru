/**
 * @jest-environment jsdom
 */


const { login, registr, ValidateEmail, ValidatePass } = require('../scripts/auth_modules'); 

describe('Аунтефикация пользователя в системе', () => {
  beforeEach(() => {
    // Заменяем alert на мок-функцию, т.к в тестируемой функции вызывается alert
    window.alert = jest.fn();
  });

  test('Пользователь, существующий в системе', async () => {
    // Имитация ответ сервера об успешности
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ exists: true }),
    });

    const status = await login('ass@mail.ru', '123');
    expect(status).toBe(true); 
  });


  test('Ввод неверных данных', async () => {
    const status = await login('/er?@grgr.ru', '123');
    expect(status).toBe(false); 
  });

  test('Не существующий пользователь', async () => {
    // Имитация ответа сервера с ошибкой
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ exists: false, message: 'Неверные данные для входа' }),
    });

    const status = await login('skibidy@mail.com', '123');
    expect(status).toBe(false); 
  });
});


describe('Регистрация пользователя в системе', () => {
  beforeEach(() => {
    // Заменяем alert на мок-функцию, т.к в тестируемой функции вызывается alert
    window.alert = jest.fn();
  });

  test('Правильно введённые данные', async () => {
    // Подготовка: имитируем ответ сервера
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ exists: true }),
    });

    const status = await registr('skibidy@mail.ru', '123', 'SkibidyToilet', '123');
    expect(status).toBe(true); 
  });


  test('Ввод неверных данных', async () => {
    // Вызываем функцию login
    const status = await registr('gigga/g2?<>@mail.ru', 'gjhjr2', 'Crush', 'eererfef');

    // Проверяем, что отобразилось сообщение об ошибке
    expect(status).toBe(false); 
  });

});

describe('Проверка почты на шаблон', () => {
  test('Правильно введённые данные', async () => {
    const status = ValidateEmail('ass@mail.ru')
    expect(status).toBe(true); 
  });

  test('Нет значка @', async () => {
    const status = ValidateEmail('ass.ru')
    expect(status).toBe(false); 
  });

  test('Использование запрещенных символов', async () => {
    const status = ValidateEmail('as<s123?@mai/l.ru')
    expect(status).toBe(false); 
  });

});

describe('Проверка пароля на запрещенные символы', () => {
  test('Разрешенные символы', async () => {
    const status = ValidatePass('123$_-dfgw1')
    expect(status).toBe(true); 
  });

  test('Запрещенные символы', async () => {
    const status = ValidatePass('123/<fergrg>')
    expect(status).toBe(false); 
  });

});
