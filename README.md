# ТехноМаркет — Интернет-магазин электроники

Дипломный проект: полнофункциональный интернет-магазин на Vue 3 + Firebase.

---

## Стек технологий

| Слой | Технология |
|---|---|
| Frontend | Vue 3, Composition API, TypeScript |
| Стили | Tailwind CSS |
| State | Pinia |
| Backend | Firebase (Auth, Firestore, Storage) |
| Роутинг | Vue Router 4 |

---

## Функциональность

- Каталог товаров с фильтрами, сортировкой, поиском
- Корзина (localStorage для гостей)
- **Внутренний кошелёк** — пополнение через заявку, оплата заказов с баланса
- Профиль, адреса, история транзакций
- Заказы с трекингом статусов и возвратом средств
- Отзывы с рейтингом
- Регистрация / Вход / Сброс пароля
- Панель администратора: управление товарами, заказами, одобрение пополнений

---

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
git clone <your-repo>
cd electronics-store
npm install
```

### 2. Создать Firebase проект

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com)
2. Нажмите **"Создать проект"**
3. Назовите проект, например `technomarket-diploma`
4. Отключите Google Analytics (не обязательно для диплома)
5. Нажмите **"Создать проект"**

### 3. Настроить конфигурацию Firebase в проекте

1. В консоли Firebase → **"Обзор проекта"** → иконка **`</>`** (Веб)
2. Зарегистрируйте приложение (название: `technomarket-web`)
3. Скопируйте объект конфигурации `firebaseConfig`.
4. Откройте файл `src/services/firebase.ts` и замените значения по умолчанию в объекте `firebaseConfig` на ваши скопированные данные:

```typescript
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_AUTH_DOMAIN",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_STORAGE_BUCKET",
  messagingSenderId: "ВАШ_MESSAGING_SENDER_ID",
  appId: "ВАШ_APP_ID"
};
```

### 5. Включить Firebase сервисы

**Authentication:**
1. Firebase Console → **Authentication** → **Начать**
2. Вкладка **Sign-in method** → включить **Email/Password**

**Firestore:**
1. Firebase Console → **Firestore Database** → **Создать базу данных**
2. Выберите режим **"Тестовый"** (для разработки) или **"Рабочий"**
3. Выберите регион (europe-west3 для СНГ)

**Storage:**
1. Firebase Console → **Storage** → **Начать**
2. Примите правила по умолчанию

### 6. Развернуть правила безопасности Firestore

**ВАЖНО!** Без этого шага заявки на пополнение и другие операции не будут работать.

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Когда спросит файл правил — укажите: firestore.rules
firebase deploy --only firestore:rules
```

### 7. Запустить проект

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Создание первого администратора

1. Зарегистрируйтесь через интерфейс сайта
2. В Firebase Console → **Firestore** → коллекция `users`
3. Найдите свой документ (по UID из Authentication)
4. Измените поле `role` с `"customer"` на `"admin"`

---

## Добавление тестовых товаров

В Firebase Console → Firestore → создайте коллекцию `products` и добавьте документ:

```json
{
  "name": "iPhone 15 Pro",
  "description": "Флагманский смартфон Apple",
  "category": "smartphones",
  "price": 450000,
  "discountPrice": 420000,
  "stock": 10,
  "rating": 4.8,
  "reviews": 24,
  "images": ["https://picsum.photos/seed/iphone/400/400"],
  "specifications": {
    "Процессор": "A17 Pro",
    "Память": "256 ГБ",
    "Экран": "6.1 дюйма"
  },
  "sku": "APL-IP15P-256",
  "tags": ["apple", "смартфон", "флагман"],
  "featured": true,
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

Либо используйте **Панель администратора** на сайте (вкладка "Товары").

---

## Сборка для продакшн

```bash
npm run build
```

### Деплой на Firebase Hosting

```bash
firebase init hosting
# Public directory: dist
# Single-page app: Yes
npm run build
firebase deploy
```

---

## Структура проекта

```
src/
├── assets/          # Глобальные стили (Tailwind)
├── components/
│   ├── common/      # Header, Footer, LoadingSpinner, StarRating, OrderStatusBadge
│   ├── products/    # ProductCard, ProductList
│   └── cart/        # CartItem
├── views/
│   ├── auth/        # Login, Register
│   ├── Home.vue
│   ├── Shop.vue
│   ├── ProductPage.vue
│   ├── CartPage.vue
│   ├── CheckoutPage.vue
│   ├── Profile.vue      # Профиль + Адреса + Кошелёк
│   ├── OrdersPage.vue
│   ├── OrderDetail.vue
│   ├── Admin.vue
│   └── NotFound.vue
├── stores/          # Pinia: auth, cart, products, user
├── services/        # Firebase: auth, products, orders, users, reviews
├── composables/     # useAuth
├── types/           # TypeScript интерфейсы
├── utils/           # Форматтеры, константы
└── router/          # Vue Router + guards
```

---

## Описание кошелька (для диплома)

Система внутреннего кошелька заменяет реальный платёжный шлюз:

1. **Пользователь** создаёт заявку на пополнение с нужной суммой
2. **Администратор** видит заявку в панели → одобряет или отклоняет
3. При одобрении: баланс зачисляется атомарной Firestore-транзакцией
4. При оформлении заказа: средства списываются атомарно, исключая двойное списание
5. При отмене заказа: средства автоматически возвращаются

Все операции записываются в коллекцию `walletTransactions` и видны в истории.
