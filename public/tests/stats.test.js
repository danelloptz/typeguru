/**
 * @jest-environment jsdom
 */


const { parseDate, formatDate, getAverage } = require('../scripts/stats_modules'); 

let correct_attempts = [
    {
        'id' : 1,
        'accuracy' : 85,
        'date': String(new Date().getTime()),
        'name': "Гошан",
        'points': 4175,
        'speed': 5,
        'time': 25,
        'user_id': 2
    },
    {
        'id' : 2,
        'accuracy' : 95,
        'date': String(new Date().getTime() - 1000 * 3600 * 24),
        'name': "Гошан",
        'points': 5235,
        'speed': 6,
        'time': 30,
        'user_id': 2
    },
    {
        'id' : 3,
        'accuracy' : 92,
        'date': String(new Date().getTime()),
        'name': "Гошан",
        'points': 4567,
        'speed': 5.8,
        'time': 25,
        'user_id': 2
    },
    {
        'id' : 4,
        'accuracy' : 97,
        'date': String(new Date().getTime() - 1000 * 3600 * 24),
        'name': "Гошан",
        'points': 5967,
        'speed': 6.2,
        'time': 20,
        'user_id': 2
    }
  ];

let incorrect_attempts = [
    {
        'id' : 1,
        'accuracy' : 95,
        'date': String(new Date().getTime() - 1000 * 3600 * 24 * 10),
        'name': "Гошан",
        'points': 5235,
        'speed': 6,
        'time': 30,
        'user_id': 2
    },
    {
        'id' : 2,
        'accuracy' : 97,
        'date': String(new Date().getTime() - 1000 * 3600 * 24 * 10),
        'name': "Гошан",
        'points': 5967,
        'speed': 6.2,
        'time': 20,
        'user_id': 2
    }
  ]

let zero_attempts = [];

describe('Подсчёт статистики за каждый из последних 7 дней', () => {
    test('Тест с имеющимися попытками за последние 7 дней', async () => {
      let [timesSeries, speedSeries, accuracySeries, pointsSeries] = await parseDate(correct_attempts);
      expect(speedSeries).toStrictEqual([0, 0, 0, 0, 0, 6.1, 5.4]); // toStrictEqual т.к здесь числа с плавающей точкой, а toBe это === и он по своему обрабатывает такие числа
      expect(timesSeries).toStrictEqual([0, 0, 0, 0, 0, 50, 50]);
      expect(accuracySeries).toStrictEqual([0, 0, 0, 0, 0, 96, 88.5]);
      expect(pointsSeries).toStrictEqual([0, 0, 0, 0, 0, 5601, 4371]);
    });
    test('Тест без попыток за последние 7 дней', async () => {
        let [timesSeries, speedSeries, accuracySeries, pointsSeries] = await parseDate(incorrect_attempts);
        expect(speedSeries).toStrictEqual([0,0,0,0,0,0,0]); // toStrictEqual т.к здесь числа с плавающей точкой, а toBe это === и он по своему обрабатывает такие числа
        expect(timesSeries).toStrictEqual([0,0,0,0,0,0,0]);
        expect(accuracySeries).toStrictEqual([0,0,0,0,0,0,0]);
        expect(pointsSeries).toStrictEqual([0,0,0,0,0,0,0]);
    });
});

describe('Вывод даты в формате дд/мм', () => {
    test('Обычный тест 1', async () => {
        const date = new Date(1716731529240);
        const time = await formatDate(date);
        expect(time).toBe('26/05');
    });
    test('Обычный тест 2', async () => {
        const date = new Date(1716126930374);
        const time = await formatDate(date);
        expect(time).toBe('19/05');
    });
});

describe('Подсчёт средних значений статистики за всё время', () => {
    test('Обычный тест', async () => {
        let [summaryTime, summarySpeed, summaryAccuracy, pointsBest] = await getAverage(correct_attempts);
        expect(summaryTime).toBe(1);
        expect(summarySpeed).toBe(5.8);
        expect(summaryAccuracy).toBe(92.3);
        expect(pointsBest).toBe(5967);
    });
    test('Без попыток - в аргумент функции передаётся пустой массив', async () => {
        let [summaryTime, summarySpeed, summaryAccuracy, pointsBest] = await getAverage(zero_attempts);
        expect(summaryTime).toBe(0);
        expect(summarySpeed).toBe(0);
        expect(summaryAccuracy).toBe(0);
        expect(pointsBest).toBe(0);
    });
});