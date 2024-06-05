import { parseDate, formatDate, getAverage } from "./stats_modules.js";

let user_data = JSON.parse(localStorage.getItem('user')).data; // данные о пользователе
let attempts, dates = [];
let userName = document.getElementById('userName'), summary_time = document.getElementById('summary_time'), summary_speed = document.getElementById('summary_speed'), summary_accuracy = document.getElementById('summary_accuracy'), best_points = document.getElementById('best_points'), stats_top = document.querySelector('.stats_top'), speed_diag = document.getElementById('speed_diag'), accur_diag = document.getElementById('accur_diag'), points_diag = document.getElementById('points_diag'), svg_average = document.querySelectorAll('.svg_average'), stats_all = document.querySelector('.stats_all_rows'), stats_showAll = document.querySelector('.stats_showAll'), user_image = document.getElementById('avatar');

userName.innerHTML = user_data.name; // имя пользователя под аватаркой
user_image.src = '../../' + user_data.avatar; // аватарка пользователя
let timesLabels, timesSeries, speedSeries, accuracySeries, pointsSeries;


// ========== НЕ ТЕСТИРУЕТСЯ ==========
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
          [timesSeries, speedSeries, accuracySeries, pointsSeries] = parseDate(attempts); //  средние попытки за последние 7 дней (среднее за каждый день)
          timesLabels = getLast7Dates();
          const averageStats = getAverage(attempts); // общее время, средняя скорость и точность
          drawBarDiagram(timesSeries, timesLabels);
          drawSpeedDiagram(speedSeries, timesLabels);
          setValues(averageStats);
          bestUsersAttempts();
          userAttempts(attempts.reverse(), 0);
        } 
    })
  .catch(error => console.error('Ошибка:', error));
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
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

// ========== НЕ ТЕСТИРУЕТСЯ ==========
// создаём строки с лучшими результатами, не более 5 строк
function setTopAttempts(list) {
  list.data.forEach((row, index) => {
    let date = new Date(+row.date), name, path;
    list.dataUsers.forEach((row_users) => name = row_users.id == row.user_id ? row_users.name : name ); // актуальное имя пользователя
    list.dataUsers.forEach((row_users) => path = row_users.id == row.user_id ? row_users.avatar : path ); // актуальная аватарка пользователя
    stats_top.innerHTML += 
    `
    <div class="stats_top_row ${user_data.id == row.user_id ? 'stats_top_row_active' : ''}">
      <div>
          <img src="../../${path}">
          <span>${name}</span>
      </div>
      <span>${formatDate(date) + '/' + date.getFullYear()}</span>
      <span>${row.points}</span>
      <span>${Number(row.speed).toFixed(1)}</span>
      <span>${Number(row.accuracy).toFixed(1)}</span>
    </div>
    `
  });
}

stats7Days();

// ========== МОЖНО ПОПРОБОВАТЬ ==========
// возвращает массив последних 7 дат в формате 'мм/дд'
function getLast7Dates() {
    const today = new Date();
    let dates = [];
    for (let i = 6; i >= 0; i--) {
        let date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
// рисуем столбчатую диграмму
function drawBarDiagram(timesSeries, timesLabels) {
    let data = {
        labels: timesLabels,
        series: [ timesSeries ]
      };
      
      let options = {
        seriesBarDistance: 10,
        axisY: {
            labelInterpolationFnc: function(value, index) {
              return index % 4 === 0 ? value : null; // показывать значения через 4 (чтобы меньше было)
            }
          }
      };
      
      let responsiveOptions = [
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

// ========== НЕ ТЕСТИРУЕТСЯ ==========
// запись средних значений в лэйблы в разделе статистики
function setValues(averageStats) {
  summary_time.innerHTML = averageStats[0] + ' ' + summary_time.innerHTML;
  summary_speed.innerHTML = averageStats[1] + ' ' + summary_speed.innerHTML;
  summary_accuracy.innerHTML = averageStats[2] + ' ' + summary_accuracy.innerHTML;
  best_points.innerHTML = averageStats[3];
}

// ========== НЕ ТЕСТИРУЕТСЯ ==========
// отрисовка диаграммы средней скорости
function drawSpeedDiagram(speedSeries, timesLabels) {
    return new Chartist.Line('#chart2', {
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

// ========== НЕ ТЕСТИРУЕТСЯ ==========
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

// ========== НЕ ТЕСТИРУЕТСЯ ==========
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
    stats_showAll.innerHTML = 'Скрыть все';
  } 
  else {
    userAttempts(attempts, 1);
    stats_showAll.setAttribute('data-flag', '0');
    stats_showAll.innerHTML = 'Показать все';
  } 
})