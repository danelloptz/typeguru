# Структурные модели

@startuml

' Классы:
'-------------

class User {
 - email: String
 - password: String
 - name: String
 + register()
 + login()
 + ValidateEmail()
 + ValidatePass()
}

class Game {
 + fetchText()
 + inputText()
}

class Statistics {
 + fetchLastStats()
 + filterByDateRange()
 + fetchAllStats()
}

class Profile {
 + ValidateEmail()
 + ValidatePass()
 + saveButton()
 + cancelButton()
 + musicToogle()
}

class Lobby {
 + OpenModal()
 + CloseModal()
}
class LocaleStorage {
 - name: String
 - email: String
 - wins: Number
 - speed: Number
 - accuracy: Number
 - time: Number
}
class Server {
 +app: express.Application
 +connection: mysql.Connection
 +PORT: number
 + isAuthenticated()

}

class Database {
 + connection: mysql.Connection
 - id: Number
 - name: String
 - email: String
 - games: Number
 - pass: hash
 - time: Number
 - speed: Number
 - accuracy: Number
}

class Session {
 +isAuthenticated: boolean
}

class UserController {
 + connection: mysql.Connection
 + /api/data
 + /api/signin
 + /api/signup
 + /api/signout
 + /api/modalChange
 + /api/endgame
 + /public/game
 + /public
}

' Ассоциации:
'-------------

User -- Lobby : вход в систему >
Lobby -- Game : клик по кнопке >
Lobby -- Statistics : клик по кнопке >
Lobby -- Profile : клик по иконке >
User -- LocaleStorage : данные с авторизации >
Profile -- LocaleStorage : изменения в данных >
Game -- LocaleStorage : завершение игры >
Lobby -- LocaleStorage : завершение игры >
Statistics -- LocaleStorage : завершение игры >

Server -- Database : uses >
Server --  UserController : uses >
UserController -- Database : uses >



@startuml

' Классы:
'-------------

class User {
 - email: String
 - password: String
 - name: String
 + register()
 + login()
 + ValidateEmail()
 + ValidatePass()
}

class Game {
 + fetchText()
 + inputText()
}

class Statistics {
 + fetchLastStats()
 + filterByDateRange()
 + fetchAllStats()
}

class Profile {
 + ValidateEmail()
 + ValidatePass()
 + saveButton()
 + cancelButton()
 + musicToogle()
}

class Lobby {
 + OpenModal()
 + CloseModal()
}
class LocaleStorage {
 - name: String
 - email: String
 - wins: Number
 - speed: Number
 - accuracy: Number
 - time: Number
}
class Server {
 +app: express.Application
 +connection: mysql.Connection
 +PORT: number
 + isAuthenticated()

}

class Database {
 + connection: mysql.Connection
 - id: Number
 - name: String
 - email: String
 - games: Number
 - pass: hash
 - time: Number
 - speed: Number
 - accuracy: Number
}

class Session {
 +isAuthenticated: boolean
}

class UserController {
 + connection: mysql.Connection
 + /api/data
 + /api/signin
 + /api/signup
 + /api/signout
 + /api/modalChange
 + /api/endgame
 + /public/game
 + /public
}

' Ассоциации:
'-------------

User --> Lobby : ассоциация
Lobby --> Game : ассоциация 
Lobby --> Statistics : ассоциация
Lobby --> Profile : ассоциация
User --|> LocaleStorage : наследование
Profile <|-- LocaleStorage : наследование
Game <|-- LocaleStorage : наследование
Lobby <|-- LocaleStorage : наследование
Statistics <|-- LocaleStorage : наследование 

Server --> Database : ассоциация
Server --|>  UserController : Наследование
UserController --> Database : ассоциация