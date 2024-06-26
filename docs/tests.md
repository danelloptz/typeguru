# Перечень тестов

## 1. Модуль авторизации (login).      

**Тест 1.1. Пользователь, существующий в системе. (позитивный)** 
- *Цель*: Проверка успешного входа пользователя с корректными данными.       
- *Входные данные*: строка с логином "ass@mail.ru", строка с паролем "123".        
- *Ожидаемый результат*: true.
- *Описание процесса*: Используется стандартный вызов функции login. Запрос на сервер имитируется как успешно выполненый.    

**Тест 1.2. Ввод неверных данных. (негативный)** 
- *Цель*: Проверка успешного входа пользователя с некорректными данными.       
- *Входные данные*: строка с логином "/er?@grgr.ru", строка с паролем "123".        
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции login. Запрос на сервер не требуется, т.к данные не проходят валидацию на стороне фронтенда.      

**Тест 1.3. Не существующий пользователь. (негативный)** 
- *Цель*: Проверка попытки входа незарегистрированого пользователя.       
- *Входные данные*: строка с логином "skibidy@mail.com", строка с паролем "123".        
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции login. Запрос на сервере имитируется как неудачно выполненый.       

## 2. Модуль регистрации (registr).       

**Тест 2.1. Правильно введённые данные. (позитивный)** 
- *Цель*: Проверка успешной регистрации нового пользователя.       
- *Входные данные*: строка с логином "skibidy@mail.ru", строка с паролем "123", строка с именем "SkibidyToilet", строка с подтверждением пароля "123".        
- *Ожидаемый результат*: true.
- *Описание процесса*: Используется стандартный вызов функции registr. Запрос на сервер имитируется как успешно выполненый.    

**Тест 2.2. Ввод неверных данных. (негативный)** 
- *Цель*: Проверка поведения при попытке регистрации с недопустимыми данными для ввода.       
- *Входные данные*: строка с логином "gigga/g2?<>@mail.ru", строка с паролем "gjhjr2", строка с именем "Crush", строка с подтверждением пароля "eererfef".        
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции registr. Запрос на сервер не требуется, т.к данные не проходят валидацию на стороне фронтенда.    

## 3. Модуль проверки почты на шаблон (ValidateEmail).      

**Тест 3.1. Правильно введённые данные. (позитивный)** 
- *Цель*: Проверка почты пользователя, удовлетворяющей шаблону.       
- *Входные данные*: строка с логином "ass@mail.ru"        
- *Ожидаемый результат*: true.
- *Описание процесса*: Используется стандартный вызов функции ValidateEmail. Данные проходят валидацию по шаблону.    

**Тест 3.2. Нет значка @. (негативный)** 
- *Цель*: Проверка почты пользователя с отсутствующим символом @.       
- *Входные данные*: строка с логином "ass.ru".       
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции ValidateEmail. Данные не проходят валидацию по шаблону.    

**Тест 3.3. Использование запрещенных символов. (негативный)** 
- *Цель*: Проверка почты пользователя с присутствующими запрещёнными символами.       
- *Входные данные*: строка с логином "as<s123?@mai/l.ru".       
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции ValidateEmail. Данные не проходят валидацию по шаблону.    

## 4. Модуль проверки пароля на шаблон (ValidatePass).      

**Тест 4.1. Использование разрешённых символов. (позитивный)** 
- *Цель*: Проверка корректного пароля пользователя на наличие запрещённых символов.       
- *Входные данные*: строка с паролем "123$_-dfgw1"        
- *Ожидаемый результат*: true.
- *Описание процесса*: Используется стандартный вызов функции ValidatePass. Данные проходят валидацию по шаблону.     

**Тест 4.2. Использование запрещённых символов. (негативный)** 
- *Цель*: Проверка некорректного пароля пользователя на наличие запрещённых символов.       
- *Входные данные*: строка с паролем "123/<fergrg>"        
- *Ожидаемый результат*: false.
- *Описание процесса*: Используется стандартный вызов функции ValidatePass. Данные не проходят валидацию по шаблону.     

## 5. Модуль проверки введённого символа (checkLetter).

**Тест 5.1. Правильно введённый символ. (позитивный)**
- *Цель*: Проверка того, что введённый пользователем символ является правильным.       
- *Входные данные*: Введённый символ - "а", ожидаемый символ - "а", длина введённого текста на данный момент - 4, длина введённого текста до последнего ввода - 3.        
- *Ожидаемый результат*: 1.
- *Описание процесса*: Используется стандартный вызов функции checkLetter. Данные проходят валидацию по шаблону. Функция вернёт статус: принадлежность к одной из категорий классификации символа: корректный символ (1), корректный пробел (2), некорректный символ (0), некорректный пробел (-1), backspace (3).        

**Тест 5.2. Неправильно введённый символ. (негативный)**
- *Цель*: Проверка того, что введённый пользователем символ является неправильным.       
- *Входные данные*: Введённый символ - "а", ожидаемый символ - "б", длина введённого текста на данный момент - 4, длина введённого текста до последнего ввода - 3.        
- *Ожидаемый результат*: 0.
- *Описание процесса*: Используется стандартный вызов функции checkLetter. Данные проходят валидацию по шаблону. Функция вернёт статус: принадлежность к одной из категорий классификации символа: корректный символ (1), корректный пробел (2), некорректный символ (0), некорректный пробел (-1), backspace (3).        

**Тест 5.3. Правильно введённый пробельный символ. (позитивный)**
- *Цель*: Проверка того, что введённый пользователем пробельный символ является правильным.       
- *Входные данные*: Введённый символ - " ", ожидаемый символ - " ", длина введённого текста на данный момент - 4, длина введённого текста до последнего ввода - 3.        
- *Ожидаемый результат*: 2.
- *Описание процесса*: Используется стандартный вызов функции checkLetter. Данные проходят валидацию по шаблону. Функция вернёт статус: принадлежность к одной из категорий классификации символа: корректный символ (1), корректный пробел (2), некорректный символ (0), некорректный пробел (-1), backspace (3).        

**Тест 5.4. Неправильно введённый пробельный символ. (негативный)**
- *Цель*: Проверка того, что введённый пользователем символ не является пробельным, хотя ожидался пробел.       
- *Входные данные*: Введённый символ - "а", ожидаемый символ - " ", длина введённого текста на данный момент - 4, длина введённого текста до последнего ввода - 3.        
- *Ожидаемый результат*: -1.
- *Описание процесса*: Используется стандартный вызов функции checkLetter. Данные проходят валидацию по шаблону. Функция вернёт статус: принадлежность к одной из категорий классификации символа: корректный символ (1), корректный пробел (2), некорректный символ (0), некорректный пробел (-1), backspace (3).        

**Тест 5.5. Нажат backspace. (позитивный)**
- *Цель*: Проверка того, что пользователем была нажата клавиша backspace.       
- *Входные данные*: Введённый символ - "а", ожидаемый символ - "б", длина введённого текста на данный момент - 3, длина введённого текста до последнего ввода - 4.        
- *Ожидаемый результат*: 3.
- *Описание процесса*: Используется стандартный вызов функции checkLetter. Данные проходят валидацию по шаблону. Функция вернёт статус: принадлежность к одной из категорий классификации символа: корректный символ (1), корректный пробел (2), некорректный символ (0), некорректный пробел (-1), backspace (3).        

## 6. Модуль подсчёта статистики за каждый из последних 7 дней (parseDate).

**Тест 6.1. Подсчёт статистики с имеющимися попытками за последние 7 дней. (позитивный)**
- *Цель*: Проверить корректность подсчета статистики для попыток, которые были сделаны за последние 7 дней.
- *Входные данные*: Массив correct_attempts, который содержит объекты с информацией о попытках пользователя.
- *Ожидаемый результат*: [ [0, 0, 0, 0, 0, 50, 50], [0, 0, 0, 0, 0, 6.1, 5.4], [0, 0, 0, 0, 0, 96, 88.5], [0, 0, 0, 0, 0, 5601, 4371] ]
- *Описание процесса*: Используется стандартный вызов функции parseDate. Функция подсчитывает средние показатели скорости, точности и очков за каждый из последних 7 дней.      

**Тест 6.2. Подсчёт статистики с отсутствующими попытками за последние 7 дней. (негативный)**
- *Цель*: Проверить корректность подсчета статистики для попыток, которые были сделаны раньше, чем за последние 7 дней.       
- *Входные данные*: Массив incorrect_attempts, который содержит объекты с информацией о попытках пользователя.        
- *Ожидаемый результат*: [ [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]        
- *Описание процесса*: Используется стандартный вызов функции parseDate. Функция подсчитывает средние показатели скорости, точности и очков за каждый из последних 7 дней.      

## 7. Модуль вывода даты в формате дд/мм (formatDate).

**Тест 7.1. Подсчёт статистики с имеющимися попытками за последние 7 дней. (позитивный)**
- *Цель*: Вывод даты в формате дд/мм.        
- *Входные данные*: объект Date(1716731529240)        
- *Ожидаемый результат*: Строка "26/05".       
- *Описание процесса*: Используется стандартный вызов функции formatDate.      

**Тест 7.2. Подсчёт статистики с имеющимися попытками за последние 7 дней. (позитивный)**
- *Цель*: Вывод даты в формате дд/мм.        
- *Входные данные*: объект Date(1716126930374)        
- *Ожидаемый результат*: Строка "19/05".       
- *Описание процесса*: Используется стандартный вызов функции formatDate.      

## 8. Модуль подсчёта метрик статистики за всё время (getAverage).

**Тест 8.1. Подсчёт статистики с имеющимися попытками за всё время. (позитивный)**
- *Цель*: Подсчёт средних значений статистики за всё время из числа попыток > 0.        
- *Входные данные*: Массив correct_attempts, который содержит объекты с информацией о попытках пользователя.        
- *Ожидаемый результат*: [1, 5.8, 92.3, 5967].       
- *Описание процесса*: Используется стандартный вызов функции getAverage.      

**Тест 8.2. Подсчёт статистики у пользователя без попыток. (негативный)**
- *Цель*: Подсчёт средних значений статистики, если у пользователя нет ни одной попытки.        
- *Входные данные*: [].        
- *Ожидаемый результат*: [0, 0, 0, 0]       
- *Описание процесса*: Используется стандартный вызов функции getAverage.      