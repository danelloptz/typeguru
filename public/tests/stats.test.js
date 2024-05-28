/**
 * @jest-environment jsdom
 */


const { parseDate } = require('../scripts/stats_modules'); 

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

