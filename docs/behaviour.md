@startuml

state Start {
  [*] --> SendingRequest: Отправка запроса
}

state SendingRequest {
  [*] --> ReceivingResponse: Получение ответа
}

state ReceivingResponse {
  [*] --> ErrorHandling: Обработка ошибки
  [*] --> ProcessingData: Обработка данных
}

state ErrorHandling {
  [*] --> ShowErrorMessage: Показ сообщения об ошибке
}

state ShowErrorMessage {
  [*] --> End: Конец
}

state ProcessingData {
  [*] --> ParsingDate: Парсинг даты
  [*] --> GettingAverage: Вычисление средней статистики
  [*] --> DrawingChart: Рисование диаграммы
  [*] --> SettingValues: Установка значений
  [*] --> BestUsersAttempts: Вызов функции bestUsersAttempts
}

state ParsingDate {
  [*] --> TimesSeries: Получение временных рядов
}

state GettingAverage {
  [*] --> AverageStats: Получение средних статистических данных
}

state DrawingChart {
  [*] --> ChartDrawn: Завершение рисования диаграммы
}

state SettingValues {
  [*] --> ValuesSet: Значения установлены
}

state BestUsersAttempts {
  [*] --> TopAttempts: Получение топовых попыток
}

state TopAttempts {
  [*] --> AttemptsSet: Топовые попытки установлены
}

state AttemptsSet {
  [*] --> End: Конец
}

TimesSeries --> AverageStats
AverageStats --> ChartDrawn
ChartDrawn --> ValuesSet
ValuesSet --> BestUsersAttempts
BestUsersAttempts --> TopAttempts
TopAttempts --> AttemptsSet

@enduml
