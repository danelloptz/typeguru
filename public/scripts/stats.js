let user_data = JSON.parse(localStorage.getItem('user')).data; // данные о пользователе
let attempts, dates = [];
let userName = document.getElementById('userName'), summary_time = document.getElementById('summary_time'), summary_speed = document.getElementById('summary_speed'), summary_accuracy = document.getElementById('summary_accuracy'), best_points = document.getElementById('best_points');

userName.innerHTML = user_data.name; // имя пользователя под аватаркой

function stats7Days() {
    let send_data = {
        'exists': true,
        'data': {
            'id': user_data.id
        }
    }
    fetch('/api/sevendays', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(send_data.data)
    })
  .then(response => response.json())
  .then(data => {
        if (!data.exists) alert('ГОВНИЩЕ')
        else attempts = data.data;
        const timesSeries = parseDate(); // все попытки за последние 7 дней
        const timesLabels = getLast7Dates();
        const averageStats = getAverage(); // общее время, средняя скорость и точность
        drawBarDiagram(timesSeries, timesLabels);
        setValues(averageStats);
    })
  .catch(error => console.error('Ошибка:', error));
}

stats7Days();

// получает все попытки в виде словаря, возвращает массив из 7 элементов - общее время на каждый из 7 последних дней
function parseDate() {
    let curr_date = new Date().getTime(), result = Array.from({ length: 7 }, () => 0);
    attempts.forEach(row => {
        let index = Math.trunc((curr_date - row.date) / (1000 * 60 * 60 * 24));
        // просто прекрасная проверка, что даже если разница между метками меньше 24 часов и они в разные дни, то будет добавляться в нужную сумму
        if (index == 0) index = (new Date().getHours() < new Date(+row.date).getHours()) ? 1 : 0;
        if (index <= 7) result[index] += +row.time;
    });
    return result.reverse();
}

function getAverage() {
  let sumTime = 0, sumSpeed = 0, sumAccuracy = 0, maxPoints = 0;
  attempts.forEach(row => {
    sumTime += +row.time;
    sumSpeed += +row.speed;
    sumAccuracy += +row.accuracy;
    maxPoints = Math.max(maxPoints, row.points);
  });
  return [Math.trunc(sumTime / 60), +(sumSpeed / attempts.length).toFixed(1), +(sumAccuracy / attempts.length).toFixed(1), maxPoints];
}

// возвращает строку в формате 'мм/дд'
function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому +1
    return dd + '/' + mm;
}

// возвращает массив последних 7 дат в формате 'мм/дд'
function getLast7Dates() {
    const today = new Date();
    let dates = [];
    for (var i = 6; i >= 0; i--) {
        let date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
}

function drawBarDiagram(timesSeries, timesLabels) {
    var data = {
        labels: timesLabels,
        series: [ timesSeries ]
      };
      
      var options = {
        seriesBarDistance: 10,
        axisY: {
            labelInterpolationFnc: function(value, index) {
              return index % 4 === 0 ? value : null; // показывать значения через 4 (чтобы меньше было)
            }
          }
      };
      
      var responsiveOptions = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      
      let chart = new Chartist.Bar('.ct-chart', data, options, responsiveOptions);
      chart.on('draw', function(data) {
        if(data.type == 'bar') {
            data.element.animate({
                y2: {
                    dur: '0.5s',
                    from: data.y1,
                    to: data.y2
                }
            });
        }
    });
}

// запись средних значений в лэйблы в разделе статистики
function setValues(averageStats) {
  summary_time.innerHTML = averageStats[0] + ' ' + summary_time.innerHTML;
  summary_speed.innerHTML = averageStats[1] + ' ' + summary_speed.innerHTML;
  summary_accuracy.innerHTML = averageStats[2] + ' ' + summary_accuracy.innerHTML;
  best_points.innerHTML = averageStats[3];
}