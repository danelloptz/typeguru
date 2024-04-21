const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const hostname = "127.0.0.1";
const bcrypt = require('bcrypt');
const saltRounds = 10;

const session = require('express-session');

app.use(session({
 secret: 'your_secret_key',
 resave: false,
 saveUninitialized: true,
 cookie: { secure: false } // Установите secure: true, если используете HTTPS
}));

const isAuthenticated = (req, res, next) => {
   if (req.session.isAuthenticated) {
      return next();
   }
   res.redirect('/public/auth/signin.html'); // Перенаправление на страницу входа, если пользователь не аутентифицирован
  };
  

// Подключаемся к БД
const connection = mysql.createConnection({
 host: hostname,
 user: "root",
 database: "TestBD",
 password: "Co6aegui"
});

// Проверка подключения к БД
connection.connect(function(err) {
 if (err) {
    console.error("Ошибка: " + err.message);
    return;
 }
 console.log("Подключение к серверу MySQL установлено ");
});

app.use(express.json()); // Обрабатываем принимаемые данные, как json

// Пробный маршрут. Выдаём всех пользователей с всеми данными
app.get('/api/data', (req, res) => {
   connection.query("SELECT * FROM Users", function(err, results) {
      if (err) {
          console.log("Ошибка: " + err.message);
          res.status(500).send("Ошибка при выполнении запроса к базе данных");
          return;
      }
      res.json(results);
      return;
  });
});

// Маршрут авторизации
app.post('/api/signin', (req, res) => {
   if(!req.body) return res.sendStatus(400);

   req.session.isAuthenticated = false;

   const { email, pass } = req.body;
   const query = 'SELECT * FROM Users WHERE email = ?';
   connection.query(query, [email], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
         // Сравниваем введёный пароль и хешированый из БД
         bcrypt.compare(pass, result[0].pass, function(err, isMatch) {
            if (err) throw err;
            if (isMatch) {
               delete result[0].pass;
               req.session.isAuthenticated = true;
               res.json({ exists: true, data: result[0] });
               return;
            } else {
               res.json({ exists: false, message: "Неверный пароль" });
               return;
            }
         });
      } else {
         res.json({ exists: false, message: "Нет пользователя с такими данными" });
         return;
      }
   });
});

// Маршрут регистрации
app.post('/api/signup', (req, res) => {
   if(!req.body) return res.sendStatus(400);

   const { name, email, pass } = req.body;

   connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
         return res.json({ exists: false, message: "Уже существует пользователь с таким email" });
      }

      let maxId = 0; // последний id
      connection.query("SELECT max(id) as 'm' FROM Users", function (err, res) {
         maxId = res[0].m;
      });

      // Хешируем пароль
      bcrypt.hash(pass, saltRounds, function(err, hash) {
         if (err) throw err;
         // Записываем вставляем введёные данные, как аргументы, для избежания sql-инъекций
         const query = 'INSERT INTO Users (id, name, email, pass) values (?, ?, ?, ?)';
         connection.query(query, [maxId+1, name, email, hash], (err, result) => {
            if (err) throw err;
            if (result.serverStatus == 2) {
               req.session.isAuthenticated = true;
               return res.json({ exists: true, data: {
                  name: name,
                  email: email
               } });
            } else {
               return res.json({ exists: false, message: "Регистрация неудачна"});
            }
         });
      });
   });
});


app.get('/api/signout', (req, res) => {
   req.session.destroy(err => {
      if (err) {
        return res.redirect('/public/auth/signin.html');
      }
      res.clearCookie('connect.sid');
      res.redirect('/public/auth/signin.html');
   });
  });  

app.post('/api/modalChange', (req, res) => {
   if(!req.body) return res.sendStatus(400);

   const { previous, email, name } = req.body;
   const query = 'SELECT * FROM Users WHERE email = ?';
   connection.query(query, [previous], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
         connection.query("UPDATE Users SET email = ?, name = ? WHERE email = ?", [email, name, previous], (err, result) => {
            if (err) throw err;
            return res.json({ exists: true });
         });
      } else {
         res.json({ exists: false, message: "Что-то пошло не так" });
         return;
      }
   });
});

app.post('/api/endgame', (req, res) => {
   if(!req.body) return res.sendStatus(400);

   const { time, speed, accuracy, email, wins } = req.body;
   console.log('time: ', time, 'speed: ', speed, 'accuracy: ', accuracy, 'email: ', email, 'wins: ', wins);
   const query = 'SELECT * FROM Users WHERE email = ?';
   connection.query(query, [email], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
         connection.query("UPDATE Users SET time = ?, speed = ?, accuracy = ?, wins = ? WHERE email = ?", [time, speed, accuracy, wins + 1, email], (err, result) => {
            if (err) throw err;
            return res.json({ exists: true });
         });   
      } else {
         res.json({ exists: false, message: "Что-то пошло не так" });
         return;
      }
   });
});

// Приватим папку game для неавторизованных пользователей
app.use('/public/game', isAuthenticated, express.static(path.join(__dirname, 'public/game')));

// Указываем Express использовать папку 'public' для обслуживания статических файлов
app.use('/public', express.static(path.join(__dirname, 'public')));


// Закрываем подключение к БД при завершении работы сервера
app.on('close', () => {
 connection.end(function(err) {
    if (err) return console.log("Ошибка: " + err.message);
    console.log("Подключение закрыто");
 });
});

// слушаем 3000 порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
