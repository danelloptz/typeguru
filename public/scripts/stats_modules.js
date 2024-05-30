// получает все попытки в виде словаря, возвращает список массив из 7 элементов - общее время/точность/очки на каждый из 7 последних дней
export function parseDate(attempts) {
    let curr_date = new Date().getTime(), result = Array.from({ length: 7 }, () => 0), speed_average = Array.from({ length: 7 }, () => 0), accuracy_average = Array.from({ length: 7 }, () => 0), points_average = Array.from({ length: 7 }, () => 0);
    attempts.forEach(row => {
        let index = Math.trunc((curr_date - row.date) / (1000 * 60 * 60 * 24));
        // просто прекрасная проверка, что даже если разница между метками меньше 24 часов и они в разные дни, то будет добавляться в нужную сумму
        if (index == 0) index = (new Date().getHours() < new Date(+row.date).getHours()) ? 1 : 0;
        if (index < 7) {
          result[index] += +row.time;
          speed_average[index] = speed_average[index] != 0 ? (speed_average[index] + +row.speed) / 2 : +row.speed;
          accuracy_average[index] = accuracy_average[index] != 0 ? (accuracy_average[index] + +row.accuracy) / 2 : +row.accuracy;
          points_average[index] = points_average[index] != 0 ? (points_average[index] + +row.points) / 2 : +row.points;
        }
    });
    return [result.reverse(), speed_average.reverse(), accuracy_average.reverse(), points_average.reverse()];
}

// возвращает строку в формате 'мм/дд'
export function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому +1
  return dd + '/' + mm;
}

// возвращает 4 поля данных для лэйблов в статистике
export function getAverage(attempts) {
  let sumTime = 0, sumSpeed = 0, sumAccuracy = 0, maxPoints = 0;
  attempts.forEach(row => {
    sumTime += +row.time;
    sumSpeed += +row.speed;
    sumAccuracy += +row.accuracy;
    maxPoints = Math.max(maxPoints, row.points);
  });

  const averageSpeed = +(sumSpeed / attempts.length).toFixed(1);
  const averageAccuracy = +(sumAccuracy / attempts.length).toFixed(1);

  return [Math.trunc(sumTime / 60), isNaN(averageSpeed) ? 0 : averageSpeed, isNaN(averageAccuracy) ? 0 : averageAccuracy, maxPoints];
}