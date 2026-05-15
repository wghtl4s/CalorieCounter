# Calorie Tracker PRO

Веб-застосунок для відстеження харчування, підрахунку калорій та водного балансу. Написаний на чистому JavaScript (ES Modules) з серверним збереженням даних у JSON-файлі через Node.js + Express.

## Можливості

- Щоденник харчування — додавання продуктів з вагою та макронутрієнтами
- Підрахунок калорій відносно персональної денної норми
- Прогрес-бари для білків, жирів і вуглеводів
- Тижневий графік калорій
- Статистика дня — кількість прийомів їжі, загальна вага, найкалорійніший продукт
- Трекер водного балансу з швидким додаванням і журналом
- Профіль користувача з розрахунком BMR, ІМТ та ідеальної ваги
- Видалення окремих записів їжі

## Запуск локально

```bash
# 1. Клонувати репозиторій
git clone https://github.com/YOUR_USERNAME/calorie-tracker.git
cd calorie-tracker

# 2. Встановити залежності
npm install

# 3. Запустити сервер
npm start

# 4. Відкрити у браузері
http://localhost:5000
```

> Проєкт використовує ES Modules, тому потрібен HTTP-сервер. Відкриття `index.html` через `file://` не працює.

## Структура проєкту
```
calorie-tracker/
├── data.json                        # База даних (їжа, вода, профіль)
├── package.json
├── public/
│   ├── index.html                   # Точка входу
│   └── css/style.css                # Стилі
├── server/
│   └── server.js                    # Express REST API
└── src/
├── app.js                       # Ініціалізація, оркестрація
├── models/                      # Бізнес-сутності
│   ├── Product.js
│   ├── MealEntry.js
│   ├── User.js
│   └── WaterLog.js
├── patterns/                    # Патерни проєктування
│   ├── Observer.js
│   ├── Strategy.js
│   └── Factory.js
├── repositories/                # Робота з API і збереження даних
│   ├── MealRepository.js
│   ├── UserRepository.js
│   └── WaterRepository.js
├── ui/                          # Компоненти інтерфейсу
│   ├── DashboardUI.js
│   ├── FormUI.js
│   ├── WaterUI.js
│   ├── UserProfileUI.js
│   └── NavigationUI.js
└── validators/                  # Валідація вхідних даних
├── ProductValidator.js
├── UserValidator.js
└── WaterValidator.js
```

## Design Patterns

### Observer — [`src/patterns/Observer.js`](src/patterns/Observer.js)

Реалізує патерн «Спостерігач» для слабозв'язаної комунікації між компонентами.
Коли користувач додає страву, `app.js` сповіщає підписників через подію `mealAdded` — дашборд оновлюється автоматично, не знаючи нічого про форму.

```js
appObserver.subscribe('mealAdded', () => refreshDashboard());
appObserver.notify('mealAdded', mealEntry);
```

Метод `unsubscribe` використовується при переключенні вкладок — коли користувач іде з вкладки «Вода», оновлення водного журналу призупиняються.

### Strategy — [`src/patterns/Strategy.js`](src/patterns/Strategy.js)

Дозволяє підмінювати алгоритм підрахунку денних калорій залежно від цілі користувача, не змінюючи клас `User`.

```js
// Схуднення: -500 ккал від норми
// Підтримка: без змін
// Набір маси: +500 ккал від норми
this._goalContext = new GoalContext(new WeightLossStrategy());
this._goalContext.executeStrategy(maintenanceCalories);
```

Метод `setStrategy` використовується при зміні цілі через `user.updateGoal(newGoal)` без перестворення об'єкта.

### Factory Method — [`src/patterns/Factory.js`](src/patterns/Factory.js)

Централізує логіку створення складених об'єктів (`Product` + `MealEntry`) з сирих даних форми або JSON.
`app.js` і `MealRepository` більше не знають про деталі конструкторів моделей.

```js
// Замість ручного new Product(...) + new MealEntry(...)
const mealEntry = MealFactory.createMealEntry(formData);

// При завантаженні з сервера
const mealEntry = MealFactory.createMealEntryFromRaw(rawData);
```

## Programming Principles

### SRP — Single Responsibility Principle
Кожен клас має одну зону відповідальності:
- [`MealRepository`](src/repositories/MealRepository.js) — тільки CRUD-операції з API для записів їжі
- [`ProductValidator`](src/validators/ProductValidator.js) — тільки перевірка даних продукту
- [`DashboardUI`](src/ui/DashboardUI.js) — тільки рендеринг головного екрана

### OCP — Open/Closed Principle
[`Strategy.js`](src/patterns/Strategy.js) демонструє відкритість для розширення: нову стратегію підрахунку калорій (`KetoStrategy`, `SportStrategy`) можна додати окремим класом, не змінюючи `User` або `GoalContext`.

### DRY — Don't Repeat Yourself
- Логіка серіалізації об'єктів винесена в метод `toJSON()` кожної моделі
- [`MealFactory`](src/patterns/Factory.js) усуває дублювання коду створення `MealEntry` між `app.js` і `MealRepository`
- Validators централізують всі перевірки замість їх дублювання в конструкторах

### Fail Fast
Валідація відбувається якомога раніше — у конструкторах моделей ([`Product`](src/models/Product.js), [`User`](src/models/User.js), [`WaterLog`](src/models/WaterLog.js)) через делегування до Validator-класів. Некоректний об'єкт ніколи не потрапляє в репозиторій.

### Separation of Concerns
Код розділений на чіткі шари:
- **Models** — бізнес-логіка і стан
- **Repositories** — персистентність даних
- **UI** — відображення і взаємодія
- **Validators** — правила перевірки
- **Patterns** — інфраструктура (події, стратегії, фабрика)

Жоден шар не знає про внутрішню реалізацію сусіднього.

### Law of Demeter
UI-класи звертаються тільки до методів безпосередньо переданих об'єктів. Наприклад, [`DashboardUI`](src/ui/DashboardUI.js) отримує готові дані (`meals`, `weeklyData`) — він не звертається до `mealRepo` напряму.

## 🔧 Refactoring Techniques

### Extract Class
`DataManager` з початкової версії був одним класом що робив все — завантажував, зберігав, тримав стан для всіх типів даних. Розбито на три окремі класи:
[`MealRepository`](src/repositories/MealRepository.js), [`UserRepository`](src/repositories/UserRepository.js), [`WaterRepository`](src/repositories/WaterRepository.js).

### Extract Method
Великий метод рендерингу розбито на дрібні з чіткими назвами в [`DashboardUI`](src/ui/DashboardUI.js):
`updateDashboard()` делегує роботу до `renderCalorieProgress()`, `renderMacroProgress()`, `renderWeeklyChart()`, `renderDailySummary()`, `renderMealList()`.

### Replace Constructor with Factory
Замість ручного `new Product(...) + new MealEntry(...)` у двох місцях коду — централізована [`MealFactory`](src/patterns/Factory.js) з методами `createMealEntry(formData)` і `createMealEntryFromRaw(rawData)`.

### Move Validation to Separate Class
Валідація перенесена з конструкторів моделей у окремі класи:
[`ProductValidator`](src/validators/ProductValidator.js), [`UserValidator`](src/validators/UserValidator.js), [`WaterValidator`](src/validators/WaterValidator.js). Моделі тепер лише делегують перевірку.

### Replace Magic Number with Named Constant
Хардкодоване значення `2000` (денна норма калорій) замінено на динамічний розрахунок через `user.calculateDailyCalories()`, що використовує формулу Міффліна-Сент-Жеора з урахуванням параметрів профілю.

### Introduce Parameter Object
Дані форми передаються як один об'єкт `formData` замість окремих параметрів:
```js
// Було: createMealEntry(name, calories, weight, proteins, fats, carbs)
// Стало:
MealFactory.createMealEntry(formData);
```

### Remove Dead Code
Видалено невикористовуваний параметр `onEditCallback` з [`UserProfileUI.init()`](src/ui/UserProfileUI.js). Всі методи репозиторіїв (`getMostCaloricMeal`, `searchByName`) підключені до реального функціоналу дашборду.
