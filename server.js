const express = require('express');
const multer = require('multer');
const fs = require('fs');
const validator = require('validator');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const hostname = "127.0.0.1";
const bcrypt = require('bcrypt');
const saltRounds = 10;
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
// const genAI = new GoogleGenerativeAI(API_KEY);

const session = require('express-session');

const fileFilter = (req, file, cb) => {
   if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
       cb(null, true);
   } else {
       cb(new Error('Invalid file type'), false);
   }
};

const storage = multer.diskStorage({
   destination: 'public/uploads/',
   filename: (req, file, cb) => {
      const id = req.body.user_id;
      const type = file.mimetype.split('/')[1];
      cb(null, `${id}.${type}`);
   }
});
const upload = multer({ dest: 'public/uploads/', fileFilter: fileFilter })

app.use(session({
 secret: 'your_secret_key',
 resave: false,
 saveUninitialized: true,
 cookie: { secure: false } // Установите secure: true, если используете HTTPS
}));

const isAuthenticated = (req, res, next) => {
   if (req.session && req.session.isAuthenticated) {
       return next();
   }
   res.redirect('/public/auth/signin.html');
};
  

// Подключаемся к БД
const connection = mysql.createConnection({
 host: hostname,
 user: "root",
 database: "TestBD",
 password: "1234"
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
               // по хорошему надо переписать этот код, чтобы мы кидали строку с бд, а не формировали её сами (есть дефолтные значения и из-за этого неудобно)
               return res.json({ 
                  exists: true, 
                  data: {
                     id: maxId+1,
                     name: name,
                     email: email,
                     speed: 0,
                     accuracy: 0, 
                     wins: 0, 
                     points: 0,
                     avatar: 'public/uploads/default.png'
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
           console.error('Failed to destroy session:', err);
           return res.status(500).send('Failed to sign out');
       }
       res.clearCookie('connect.sid', { path: '/' });
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

app.post('/api/endgame', async (req, res) => {
   if (!req.body) return res.sendStatus(400);

   
   const { id, name, time, speed, accuracy, email, wins, points } = req.body;
   // логика написана через ассинхрон, т.к запросы в БД ассинхронны, а в данном случае необходимо делать 
   // запросы последовательно
   try {

       // Получаем последний id
       let maxId = await getMaxId();

       // Форматируем текущее время
       const date = new Date();

       // Обновляем таблицу с пользователями
       await updateUser(email, time, speed, accuracy, wins + 1);

       // Добавляем попытку в таблицу с попытками
       await addAttempt(maxId + 1, id, name, date.getTime(), time, speed, accuracy, points);
      //  const kef = await calculateKef(speed, accuracy, )

       return res.json({ exists: true });
   } catch (error) {
       console.error(error);
       return res.status(500).json({ error: 'An error occurred while processing your request.' });
   }
});

// Функция для получения последнего id
async function getMaxId() {
   return new Promise((resolve, reject) => {
       connection.query("SELECT max(id) as 'm' FROM Attempts", function (err, res) {
           if (err) reject(err);
           resolve(res[0].m);
       });
   });
}

// Функция для обновления информации о пользователе
async function updateUser(email, time, speed, accuracy, wins) {
   return new Promise((resolve, reject) => {
       connection.query('SELECT * FROM Users WHERE email =?', [email], (err, result) => {
           if (err) reject(err);
           if (result.length > 0) {
               connection.query("UPDATE Users SET time =?, speed =?, accuracy =?, wins =? WHERE email =?", [time, speed, accuracy, wins, email], (err, result) => {
                   if (err) reject(err);
                   resolve();
               });
           } else {
               reject(new Error("User not found"));
           }
       });
   });
}

// Функция для добавления попытки
async function addAttempt(id, userId, name, date, time, speed, accuracy, points) {
   return new Promise((resolve, reject) => {
       connection.query('INSERT INTO Attempts (id, user_id, name, date, time, speed, accuracy, points) VALUES (?,?,?,?,?,?,?,?)', [id, userId, name, date, time, speed, accuracy, points], (err, result) => {
           if (err) reject(err);
           resolve();
       });
   });
}


// Все попытки пользователя
app.post('/api/sevendays', (req, res) => {
   if(!req.body) return res.sendStatus(400);
   const user_id = req.body.id;

  connection.query('SELECT * FROM Attempts WHERE user_id =?', [user_id], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
         return res.json({ exists: true, data: result });
      } else {
         res.json({ exists: false, message: "Что-то пошло не так" });
         return;
      }
   });
});

// Топ 5 попыток на сервере
app.get('/api/topfive', (req, res) => {
  connection.query('SELECT * FROM ( SELECT *, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY points DESC) AS rn FROM Attempts ) t WHERE rn = 1 ORDER BY points DESC LIMIT 5;', (err, result) => {
   if (err) throw err;
   if (result.length > 0) {
      let userIds = result.map( (row) => row.user_id ); 
      connection.query(`SELECT * FROM Users WHERE id IN (${userIds.map(id => `${id}`).join(', ')})`, (error, result_names) => {
         if (err) throw err;
         if (result.length > 0) {
            result_names.forEach(item => delete item.pass); // убрать поле pass
            return res.json({ exists: true, data: result, dataUsers: result_names });
         } else {
            res.json({ exists: false, message: "Что-то пошло не так" });
            return;
         }
      });
   } else {
      res.json({ exists: false, message: "Что-то пошло не так" });
      return;
   }
});
});
   
// // смена аватарки
app.post('/api/upload', upload.single('file'), function (req, res) {
   const id = req.body.user_id;

   // Validate user ID
   if (!validator.isAlphanumeric(id)) {
      return res.status(400).json({ exists: false, message: 'Неправильный формат id' });
   }

   // Validate file
   if (!req.file) {
      return res.status(400).json({ exists: false, message: 'Файл не был загружен' });
   }

   const fileType = req.file.mimetype.split('/')[1];
   if (!['jpg', 'jpeg', 'png'].includes(fileType)) {
      return res.status(400).json({ exists: false, message: 'Неправильный формат фотографии' });
   }

   // Secure file path creation
   const fileName = path.join('public', 'uploads', `${id}.${fileType}`);

   // Move file safely
   fs.rename(req.file.path, fileName, function (err) {
      if (err) {
         return res.status(500).json({ exists: false, message: 'Ошибка при сохранении файла' });
      }

      const sqlUpdate = 'UPDATE Users SET avatar = ? WHERE id = ?';
      connection.query(sqlUpdate, [fileName, id], (err, result) => {
         if (err) {
            return res.status(500).json({ exists: false, message: 'Ошибка при обновлении базы данных' });
         }

         res.json({
            exists: true,
            filePath: fileName
         });
      });
   });
});

// async function translate(text, from_lang, to_lang) {
//    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
//    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
 
//    const prompt = `Translate this text from ${from_lang} to ${to_lang}: ${text}`
 
//    const result = await model.generateContent(prompt);
//    const response = await result.response;
//    const answ = response.text();
//    return answ;
//  }

//  // Все попытки пользователя
// app.post('/api/translate', (req, res) => {
//    if(!req.body) return res.sendStatus(400);
//    const answ = translate(req.body.text, 'ru', 'eng');
//    return answ;
// });

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
