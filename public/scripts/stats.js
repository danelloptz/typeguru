let user_data = JSON.parse(localStorage.getItem('user')).data; // данные о пользователе
let attempts, dates = [];
let userName = document.getElementById('userName'), summary_time = document.getElementById('summary_time'), summary_speed = document.getElementById('summary_speed'), summary_accuracy = document.getElementById('summary_accuracy'), best_points = document.getElementById('best_points'), stats_top = document.querySelector('.stats_top'), speed_diag = document.getElementById('speed_diag'), accur_diag = document.getElementById('accur_diag'), points_diag = document.getElementById('points_diag'), svg_average = document.querySelectorAll('.svg_average'), stats_all = document.querySelector('.stats_all_rows'), stats_showAll = document.querySelector('.stats_showAll');

userName.innerHTML = user_data.name; // имя пользователя под аватаркой
let timesLabels, timesSeries, speedSeries, accuracySeries, pointsSeries;

async function stats7Days() {
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
        if (data.exists) {
          attempts = data.data;
          [timesSeries, speedSeries, accuracySeries, pointsSeries] = parseDate(); //  средние попытки за последние 7 дней (среднее за каждый день)
          timesLabels = getLast7Dates();
          const averageStats = getAverage(); // общее время, средняя скорость и точность
          drawBarDiagram(timesSeries, timesLabels);
          drawSpeedDiagram(speedSeries, timesLabels);
          setValues(averageStats);
          bestUsersAttempts();
          userAttempts(attempts.reverse(), 0);
        } 
    })
  .catch(error => console.error('Ошибка:', error));
}

// топ 5 попыток пользователей (по кол-ву очков)
async function bestUsersAttempts() {
  try {
    const response = await fetch('/api/topfive', {
      method: 'GET',
    });
    const data = await response.json();
    
    if (!data.exists) {
      alert('ГОВНИЩЕ');
    } else {
      setTopAttempts(data); // топ результатов
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

// создаём строки с лучшими результатами, не более 5 строк
function setTopAttempts(list) {
  list.data.forEach((row, index) => {
    let date = new Date(+row.date), name;
    list.dataUsers.forEach((row_users) => name = row_users.id == row.user_id ? row_users.name : name ); // актуальное имя пользователя
    stats_top.innerHTML += 
    `
    <div class="stats_top_row ${user_data.id == row.user_id ? 'stats_top_row_active' : ''}">
      <div>
          <img src="../img/profile_image.png">
          <span>${name}</span>
      </div>
      <span>${formatDate(date) + '/' + date.getFullYear()}</span>
      <span>${row.points}</span>
      <span>${Number(row.speed).toFixed(1)}</span>
      <span>${Number(row.accuracy).toFixed(1)}</span>
    </div>
    `
  });
  // в Attempts хранится имя, а оно может переименовываться, так что нужно брать имя из Users по user_id
}

stats7Days();

// получает все попытки в виде словаря, возвращает массив из 7 элементов - общее время на каждый из 7 последних дней
function parseDate() {
    let curr_date = new Date().getTime(), result = Array.from({ length: 7 }, () => 0), speed_average = Array.from({ length: 7 }, () => 0), accuracy_average = Array.from({ length: 7 }, () => 0), points_average = Array.from({ length: 7 }, () => 0);
    attempts.forEach(row => {
      // debugger;
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

// возвращает 4 поля данных для лэйблов в статистике
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

// рисуем столбчатую диграмму
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

// отрисовка диаграммы средней скорости
function drawSpeedDiagram(speedSeries, timesLabels) {
    new Chartist.Line('#chart2', {
      labels: timesLabels,
      series: [speedSeries]
    }, {
        axisY: {
            labelInterpolationFnc: function(value, index) {
              return index % 3 === 0 ? value : null; // показывать значения через 4 (чтобы меньше было)
            }
          },
        showArea: true, // закрашивать область
        low: Math.min(speedSeries)          // минимальное значение
    });
}

function averageSwitch(el) {
  const func_name = el.getAttribute('data-name');
  document.querySelector('.svg_active').classList.toggle('svg_active');
  el.classList.add('svg_active');
  switch (func_name) {
    case 'speed':
      drawSpeedDiagram(speedSeries, timesLabels);
      break;

    case 'accuracy':
      drawSpeedDiagram(accuracySeries, timesLabels);
      break;

    case 'points':
      drawSpeedDiagram(pointsSeries, timesLabels);
      break;
  }
}

function userAttempts(attempts, flag, from = 0, range = 5) {
  if (flag) stats_all.innerHTML = `<div class="stats_all_row"><h3>Дата</h3><h3>Очки</h3><h3>Скорость</h3><h3>Точность</h3></div>`
  for (let index = from; index < range; index++) {
    let row = attempts[index];
    let date = new Date(+row.date);   
    stats_all.innerHTML += 
    `
    <div class="stats_all_row">
      <span>${formatDate(date) + '/' + date.getFullYear()}</span>
      <span>${row.points}</span>
      <span>${Number(row.speed).toFixed(1)}</span>
      <span>${Number(row.accuracy).toFixed(1)}</span>
    </div>
    `
  }
}


svg_average.forEach(el => el.addEventListener('click', () => averageSwitch(el)));
stats_showAll.addEventListener('click', el => {
  if (stats_showAll.getAttribute('data-flag') == 0) {
    userAttempts(attempts, 0, 5, attempts.length);
    stats_showAll.setAttribute('data-flag', '1');
  } 
  else {
    userAttempts(attempts, 1);
    stats_showAll.setAttribute('data-flag', '0');
  } 
})