# Решение проблемы с загрузкой товара

## Проблема
При переходе на страницу товара выводится Toast: `"❌ Ошибка загрузки: ..."`

---

## Диагностика в консоли браузера

Откройте браузер (F12 → Console) и смотрите что писано в консоли:

```
Product page error: ...
```

### Типичные ошибки и решения:

#### 1️⃣ `Document not found`
**Причина:** ID товара неверный или товар удален

**Решение:**
```javascript
// Проверить что товар существует в Firestore
db.collection('products').doc('ТОВАР_ID').get().then(snap => {
  console.log('Товар существует:', snap.exists());
  console.log('Данные:', snap.data());
});
```

Если документ не найден — добавьте товар через админ панель.

---

#### 2️⃣ `permission-denied` или `PERMISSION_DENIED`
**Причина:** Firestore правила не позволяют читать товары

**Решение:**
```bash
# Обновите правила
firebase deploy --only firestore:rules
```

---

#### 3️⃣ Успешно загружается в консоли, но в приложении ошибка
**Причина:** Проблема в mapping данных

**Решение:**
1. F12 → Console
2. Выполните:
```javascript
db.collection('products').doc('ТОВАР_ID').get().then(snap => {
  const data = snap.data();
  console.log('Структура товара:', data);
  
  // Проверить обязательные поля
  console.log('name:', data?.name);
  console.log('price:', data?.price);
  console.log('images:', data?.images);
});
```

Если какие-то поля отсутствуют или имеют неправильный тип — пересохраните товар в админ панели.

---

## Как проверить конкретный ID товара

1. Откройте админ панель (/admin)
2. Вкладка "Товары"
3. Наведитесь на товар
4. В URL видите ID (или скопируйте из таблицы)
5. Попробуйте перейти: `/product/ID`

Если ID неверный в URL — проверьте что товар содержится в каталоге (/shop).

---

## Быстрая проверка всех товаров

```javascript
// F12 → Console
db.collection('products').get().then(snap => {
  console.log(`Всего товаров: ${snap.docs.length}`);
  snap.docs.forEach(doc => {
    console.log(`${doc.id}: ${doc.data().name}`);
  });
});
```

---

## Если товар видно в админ панели, но ошибка при переходе

1. **Очистите браузер:**
   - F12 → Application → Clear Site Data
   - Нажмите F5

2. **Проверьте правила Firestore:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Попробуйте добавить новый товар** и сразу перейти на его карточку

---

## Для администратора: как добавить тестовый товар

Запустите в консоли браузера (F12 → Console):

```javascript
db.collection('products').add({
  name: 'Тестовый iPhone 15',
  description: 'Отличный смартфон',
  category: 'smartphones',
  price: 450000,
  stock: 5,
  images: ['https://via.placeholder.com/400x400?text=iPhone'],
  sku: 'TEST-001',
  tags: ['тест', 'смартфон'],
  featured: false,
  specifications: {
    'Экран': '6.1 дюйма',
    'Процессор': 'A17 Pro'
  },
  rating: 4.5,
  reviews: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}).then(ref => {
  console.log('✅ Товар добавлен с ID:', ref.id);
  window.location.href = `/product/${ref.id}`;
});
```

---

## Проверка Firestore правил

Убедитесь что в firestore.rules есть:

```javascript
match /products/{productId} {
  allow read: if true;  // ✅ важно!
  allow create, update, delete: if isAuthenticated() && isAdmin();
}
```

Если видите `allow read: if false;` — измените на `if true;` и разверните.

---

## Дополнительная отладка

Если всё ещё не работает, добавьте в ProductPage.vue временный вывод:

```typescript
onMounted(async () => {
  const id = route.params.id as string;
  console.log('🔍 Loading product:', id);
  
  try {
    console.log('📡 Fetching from Firestore...');
    const prod = await getProductById(id);
    console.log('✅ Loaded:', prod);
    
    if (!prod) {
      console.error('❌ Product is null/undefined');
      return;
    }
    
    product.value = prod;
  } catch (error) {
    console.error('❌ Error:', error);
  }
});
```

Скопируйте весь логгинг из консоли и проанализируйте.
