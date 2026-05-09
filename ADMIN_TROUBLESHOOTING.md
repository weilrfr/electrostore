# Решение проблемы "Ошибка сохранения" товаров в админ панели

## Проблема
При попытке добавить или отредактировать товар выводится Toast: `"❌ Ошибка: ..."`

---

## Причины и решения

### 1️⃣ Вы не администратор

**Проверка:**
- В профиле должно быть поле `role: "admin"`

**Решение:**
1. Откройте [Firebase Console](https://console.firebase.google.com) → **Firestore**
2. Коллекция `users` → найдите свой документ
3. В поле `role` измените `"customer"` → `"admin"`
4. Сохраните (нажмите ✓)
5. Обновите браузер (Ctrl+R)

---

### 2️⃣ Firestore правила не обновлены

**Решение:**
```bash
# 1. Установить Firebase CLI (если еще не установлен)
npm install -g firebase-tools

# 2. Авторизоваться
firebase login

# 3. Развернуть правила
firebase deploy --only firestore:rules
```

Если видите:
```
✔  Deploy complete!
```
То правила обновлены. Обновите браузер.

---

### 3️⃣ Временное решение - используйте режим Тестирования

Если разворачивать правила сложно, откройте **Firebase Console** → **Firestore Rules** и замените на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Только для разработки!** Не используйте в продакшене.

---

## Проверка консоли браузера

Откройте **F12 → Console** и проверьте что видите:

**✅ Правильно:**
```
Product save error: FirebaseError: [code]: permission-denied
```

**❌ Неправильно (пусто)** → обновите браузер и правила Firestore

---

## Если всё ещё не работает

В консоли браузера (F12 → Console) выполните:

```javascript
// Проверить авторизацию
firebase.auth().onAuthStateChanged(user => {
  console.log('👤 Email:', user?.email);
  console.log('🆔 UID:', user?.uid);
  
  // Проверить роль
  db.collection('users').doc(user?.uid).get().then(snap => {
    console.log('👑 Role:', snap.data().role);
  });
});

// Попробовать создать товар напрямую
db.collection('products').add({
  name: 'Test',
  price: 100,
  stock: 1,
  category: 'test',
  images: ['https://via.placeholder.com/400'],
  description: 'Test',
  sku: 'TEST-001',
  tags: [],
  featured: false,
  specifications: {},
  rating: 0,
  reviews: 0
}).then(() => {
  console.log('✅ Товар создан! Правила в порядке.');
}).catch(e => {
  console.log('❌ Ошибка:', e.message);
});
```

Напишите результаты в консоли.

---

## Пошаговая инструкция (гарантированно работает)

1. **Убедитесь что администратор**
   ```javascript
   // F12 → Console
   db.collection('users').doc(firebase.auth().currentUser.uid).get().then(snap => {
     console.log(snap.data().role); // должно быть "admin"
   });
   ```

2. **Обновите правила**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Очистите браузер**
   - F12 → Application → Clear Site Data
   - Нажмите F5

4. **Попробуйте снова добавить товар**

Если видите **зелёный Toast с галочкой** ✅ — готово!

---

## FAQ

**В:** Какие поля обязательны?
**О:** 
- ✅ Название
- ✅ Цена (> 0)
- ✅ URL изображения
- ❌ Остальное опционально

**В:** Могу ли я удалить товар?
**О:** Да, нажмите "Удалить" в таблице товаров.

**В:** Где видеть товары после добавления?
**О:** В каталоге (/shop) или в таблице админ панели.

**В:** Почему цена красная?
**О:** Скидка больше чем основная цена. Исправьте значения.
