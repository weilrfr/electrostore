import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Product, Category } from '@/types';

// Данные категорий
export const CATEGORIES_DATA: Omit<Category, 'id'>[] = [
  {
    name: 'Смартфоны',
    slug: 'smartphones',
    description: 'Мобильные телефоны, смартфоны и гаджеты',
    icon: 'fa-solid fa-mobile-screen-button',
    subcategories: [
      { id: 'apple', name: 'Apple' },
      { id: 'samsung', name: 'Samsung' },
      { id: 'xiaomi', name: 'Xiaomi' },
      { id: 'google', name: 'Google' }
    ]
  },
  {
    name: 'Ноутбуки',
    slug: 'laptops',
    description: 'Портативные компьютеры для работы, учебы и игр',
    icon: 'fa-solid fa-laptop',
    subcategories: [
      { id: 'ultrabooks', name: 'Ультрабуки' },
      { id: 'gaming', name: 'Игровые ноутбуки' },
      { id: 'office', name: 'Для офиса' }
    ]
  },
  {
    name: 'Телевизоры',
    slug: 'tvs',
    description: 'Современные телевизоры и смарт-панели',
    icon: 'fa-solid fa-tv',
    subcategories: [
      { id: 'oled', name: 'OLED / QLED' },
      { id: '4k', name: '4K UHD' },
      { id: 'smart-tv', name: 'Smart TV' }
    ]
  },
  {
    name: 'Бытовая техника',
    slug: 'appliances',
    description: 'Техника для кухни и дома',
    icon: 'fa-solid fa-plug',
    subcategories: [
      { id: 'vacuum', name: 'Пылесосы' },
      { id: 'kitchen', name: 'Для кухни' },
      { id: 'climate', name: 'Климатическая техника' }
    ]
  },
  {
    name: 'Аксессуары',
    slug: 'accessories',
    description: 'Наушники, повербанки и периферия',
    icon: 'fa-solid fa-headphones',
    subcategories: [
      { id: 'headphones', name: 'Наушники' },
      { id: 'powerbanks', name: 'Повербанки' },
      { id: 'input', name: 'Устройства ввода' },
      { id: 'smartwatch', name: 'Умные часы' }
    ]
  }
];

// Данные товаров
export const PRODUCTS_DATA: { id: string; data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }[] = [
  // Линейка Apple iPhone 17
  {
    id: 'iphone_17_promax',
    data: {
      name: 'Apple iPhone 17 Pro Max 256GB',
      description: 'Новейший ультрафлагман от Apple с инновационным подэкранным Face ID, титановым корпусом четвертого поколения, чипом A19 Pro и революционной камерой 48 Мп со сверхдлинным оптическим зумом.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 890000,
      discountPrice: 849990,
      stock: 10,
      rating: 5.0,
      reviews: 5,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.9" LTPO Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A19 Pro (3-нм)',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': 'Тройная: 48 Мп + 48 Мп + 48 Мп с 10x оптическим зумом',
        'Материал корпуса': 'Титановый сплав Grade 5',
        'Разъем': 'USB-C (USB 4, до 40 Гбит/с)'
      },
      sku: 'AAPL-IP17PM-256-TI',
      tags: ['apple', 'iphone', 'iphone 17', 'флагман', 'титан'],
      featured: true
    }
  },
  {
    id: 'iphone_17_pro',
    data: {
      name: 'Apple iPhone 17 Pro 256GB',
      description: 'Профессиональный смартфон Apple в компактном корпусе. Оснащен мощным чипом A19 Pro, тройной камерой 48 Мп и ярким экраном с поддержкой ProMotion.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 790000,
      stock: 12,
      rating: 4.9,
      reviews: 8,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.3" LTPO Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A19 Pro (3-нм)',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': 'Тройная: 48 Мп + 48 Мп + 48 Мп с 5x оптическим зумом',
        'Материал корпуса': 'Титановый сплав Grade 5',
        'Разъем': 'USB-C (USB 3.2)'
      },
      sku: 'AAPL-IP17P-256-GRY',
      tags: ['apple', 'iphone', 'iphone 17', 'pro', 'смартфон'],
      featured: false
    }
  },
  {
    id: 'iphone_17',
    data: {
      name: 'Apple iPhone 17 128GB',
      description: 'Базовая модель линейки iPhone 17. Стильный дизайн, новый процессор A19, улучшенная двойная камера и увеличенное время автономной работы.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 590000,
      discountPrice: 569990,
      stock: 20,
      rating: 4.8,
      reviews: 14,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.1" Super Retina XDR OLED, 90 Гц',
        'Процессор': 'Apple A19',
        'Память': '128 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': 'Двойная: 48 Мп + 12 Мп',
        'Материал корпуса': 'Авиационный алюминий, стекло',
        'Разъем': 'USB-C'
      },
      sku: 'AAPL-IP17-128-BLU',
      tags: ['apple', 'iphone', 'iphone 17', 'базовый'],
      featured: false
    }
  },

  // Линейка Apple iPhone 16
  {
    id: 'iphone_16_promax',
    data: {
      name: 'Apple iPhone 16 Pro Max 256GB',
      description: 'Мощный флагман Apple с кнопкой Camera Control для мгновенного управления съемкой, процессором A18 Pro и увеличенным дисплеем 6.9 дюймов.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 760000,
      discountPrice: 719990,
      stock: 18,
      rating: 4.9,
      reviews: 32,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.9" LTPO Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A18 Pro',
        'Память': '256 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': '48 Мп + 48 Мп (широкоугольная) + 12 Мп с 5x зумом',
        'Физическая кнопка': 'Camera Control (сенсорная с отдачей)',
        'Материал': 'Титан'
      },
      sku: 'AAPL-IP16PM-256-DESERT',
      tags: ['apple', 'iphone', 'iphone 16', 'pro max', 'camera control'],
      featured: true
    }
  },
  {
    id: 'iphone_16_pro',
    data: {
      name: 'Apple iPhone 16 Pro 256GB',
      description: 'Премиум-класс в эргономичном формате. Дисплей 6.3 дюйма, титановый корпус, чип A18 Pro и выделенная кнопка для камеры Camera Control.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 680000,
      stock: 15,
      rating: 4.8,
      reviews: 24,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.3" LTPO Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A18 Pro',
        'Память': '256 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': '48 Мп + 48 Мп + 12 Мп с 5x зумом',
        'Управление': 'Кнопка Action Button + Camera Control',
        'Разъем': 'USB-C'
      },
      sku: 'AAPL-IP16P-256-NAT',
      tags: ['apple', 'iphone', 'iphone 16', 'pro'],
      featured: false
    }
  },
  {
    id: 'iphone_16',
    data: {
      name: 'Apple iPhone 16 128GB',
      description: 'Базовый iPhone 16 с обновленным вертикальным блоком камер для съемки пространственного видео, кнопкой Action Button и новым чипом A18.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 490000,
      discountPrice: 469990,
      stock: 25,
      rating: 4.7,
      reviews: 40,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.1" Super Retina XDR OLED',
        'Процессор': 'Apple A18',
        'Память': '128 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': 'Двойная: 48 Мп + 12 Мп с поддержкой макросъемки',
        'Особенности': 'Кнопка управления камерой, Action Button',
        'Разъем': 'USB-C'
      },
      sku: 'AAPL-IP16-128-TEAL',
      tags: ['apple', 'iphone', 'iphone 16', 'spatial video'],
      featured: false
    }
  },

  // Линейка Apple iPhone 15
  {
    id: 'iphone_15_promax',
    data: {
      name: 'Apple iPhone 15 Pro Max 256GB',
      description: 'Легендарный первый титановый iPhone с чипом A17 Pro, 5-кратным оптическим зумом и переходом на универсальный разъем USB-C.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 650000,
      discountPrice: 599990,
      stock: 15,
      rating: 4.9,
      reviews: 112,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A17 Pro',
        'Память': '256 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': '48 Мп + 12 Мп + 12 Мп с 5x зумом',
        'Материал': 'Титановый сплав',
        'Разъем': 'USB-C (USB 3.0)'
      },
      sku: 'AAPL-IP15PM-256-TI',
      tags: ['apple', 'iphone', 'iphone 15', 'pro max', 'титан'],
      featured: false
    }
  },
  {
    id: 'iphone_15_pro',
    data: {
      name: 'Apple iPhone 15 Pro 128GB',
      description: 'Титановый флагман в компактном размере. Процессор A17 Pro позволяет запускать консольные игры прямо на смартфоне.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 570000,
      stock: 22,
      rating: 4.8,
      reviews: 95,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.1" Super Retina XDR OLED, 120 Гц',
        'Процессор': 'Apple A17 Pro',
        'Память': '128 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': '48 Мп + 12 Мп + 12 Мп',
        'Особенности': 'Кнопка Action Button',
        'Разъем': 'USB-C'
      },
      sku: 'AAPL-IP15P-128-BLUE',
      tags: ['apple', 'iphone', 'iphone 15', 'pro'],
      featured: false
    }
  },
  {
    id: 'iphone_15',
    data: {
      name: 'Apple iPhone 15 128GB',
      description: 'Базовый iPhone 15 с вырезом Dynamic Island, 48 Мп камерой сверхвысокого разрешения и матовым задним стеклом.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 430000,
      discountPrice: 399990,
      stock: 30,
      rating: 4.7,
      reviews: 154,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.1" Super Retina XDR OLED',
        'Процессор': 'Apple A16 Bionic',
        'Память': '128 ГБ',
        'Оперативная память': '6 ГБ',
        'Камера': 'Двойная: 48 Мп + 12 Мп',
        'Интерфейс': 'Dynamic Island',
        'Разъем': 'USB-C'
      },
      sku: 'AAPL-IP15-128-PINK',
      tags: ['apple', 'iphone', 'iphone 15', 'dynamic island'],
      featured: false
    }
  },

  // Линейка Samsung Galaxy S26
  {
    id: 'samsung_s26_ultra',
    data: {
      name: 'Samsung Galaxy S26 Ultra 12/256GB',
      description: 'Абсолютный лидер на Android. Невероятный процессор Snapdragon 8 Gen 5, обновленный Galaxy AI с продвинутым синхронным переводом голоса и полностью новая 200 Мп камера с оптикой Leica.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 870000,
      discountPrice: 829990,
      stock: 8,
      rating: 5.0,
      reviews: 3,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.8" Dynamic AMOLED 2X 144Hz',
        'Процессор': 'Snapdragon 8 Gen 5 for Galaxy',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': 'Четыре модуля: 200 Мп + 50 Мп + 50 Мп + 12 Мп',
        'Стилус': 'S Pen в корпусе',
        'Функции ИИ': 'Galaxy AI v3.0 (автогенерация текстов, умный фотошоп)'
      },
      sku: 'SMSG-S26U-256-TITAN',
      tags: ['samsung', 'galaxy', 's26', 'ultra', 'android', 'ai'],
      featured: true
    }
  },
  {
    id: 'samsung_s26_plus',
    data: {
      name: 'Samsung Galaxy S26+ 12/256GB',
      description: 'Сбалансированный флагман с большим экраном 6.7 дюйма, мощной батареей емкостью 4900 мАч и полным набором интеллектуальных функций Galaxy AI.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 690000,
      stock: 10,
      rating: 4.9,
      reviews: 6,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Exynos 2600 / Snapdragon 8 Gen 5',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': 'Тройная: 50 Мп + 12 Мп + 10 Мп',
        'Батарея': '4900 мАч',
        'Зарядка': '45 Вт быстрая зарядка'
      },
      sku: 'SMSG-S26P-256-SILVER',
      tags: ['samsung', 'galaxy', 's26', 'plus', 'android'],
      featured: false
    }
  },
  {
    id: 'samsung_s26',
    data: {
      name: 'Samsung Galaxy S26 8/256GB',
      description: 'Компактный флагман Samsung Galaxy S26. Идеально ложится в руку, оснащен потрясающим Dynamic AMOLED экраном и новейшим процессором.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 570000,
      discountPrice: 549990,
      stock: 15,
      rating: 4.8,
      reviews: 9,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.2" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Exynos 2600 / Snapdragon 8 Gen 5',
        'Память': '256 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': 'Тройная: 50 Мп + 12 Мп + 10 Мп с 3x зумом',
        'Влагозащита': 'IP68',
        'Вес': '168 г'
      },
      sku: 'SMSG-S26-256-BLACK',
      tags: ['samsung', 'galaxy', 's26', 'компактный'],
      featured: false
    }
  },

  // Линейка Samsung Galaxy S25
  {
    id: 'samsung_s25_ultra',
    data: {
      name: 'Samsung Galaxy S25 Ultra 12/256GB',
      description: 'Флагман 2025 года с обтекаемым дизайном без острых углов, сверхтонкой титановой рамкой, топовым чипом Snapdragon 8 Gen 4 и ярким антибликовым экраном.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 740000,
      discountPrice: 699990,
      stock: 14,
      rating: 4.9,
      reviews: 45,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.8" Dynamic AMOLED 2X 120Hz Anti-reflective',
        'Процессор': 'Snapdragon 8 Gen 4 for Galaxy',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': '200 Мп + 50 Мп + 50 Мп + 10 Мп с супер-стабилизацией',
        'Стилус': 'S Pen в комплекте',
        'Особенности': 'Антибликовое стекло Corning Gorilla Armor'
      },
      sku: 'SMSG-S25U-256-GRAY',
      tags: ['samsung', 'galaxy', 's25', 'ultra', 'gorilla armor'],
      featured: true
    }
  },
  {
    id: 'samsung_s25_plus',
    data: {
      name: 'Samsung Galaxy S25+ 12/256GB',
      description: 'Стильный и производительный смартфон с увеличенным объемом оперативной памяти до 12 ГБ, ярким дисплеем и улучшенными алгоритмами ночной съемки Nightography.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 610000,
      stock: 16,
      rating: 4.8,
      reviews: 31,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Exynos 2500 / Snapdragon 8 Gen 4',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': 'Тройная: 50 Мп + 12 Мп + 10 Мп',
        'Батарея': '4900 мАч',
        'Толщина': '7.3 мм (ультратонкий)'
      },
      sku: 'SMSG-S25P-256-BLUE',
      tags: ['samsung', 'galaxy', 's25', 'plus'],
      featured: false
    }
  },
  {
    id: 'samsung_s25',
    data: {
      name: 'Samsung Galaxy S25 8/128GB',
      description: 'Сверхкомпактный флагман 2025 года. Улучшенные портретные фото, высокая производительность в играх и поддержка функций искусственного интеллекта.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 490000,
      discountPrice: 459990,
      stock: 22,
      rating: 4.7,
      reviews: 38,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.2" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Exynos 2500',
        'Память': '128 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': 'Тройная: 50 Мп + 12 Мп + 10 Мп',
        'Galaxy AI': 'Синхронный перевод, Circle to Search, генеративный редактор',
        'Вес': '162 г'
      },
      sku: 'SMSG-S25-128-GREEN',
      tags: ['samsung', 'galaxy', 's25', 'компактный'],
      featured: false
    }
  },

  // Линейка Samsung Galaxy S24
  {
    id: 'samsung_s24_ultra',
    data: {
      name: 'Samsung Galaxy S24 Ultra 12/256GB',
      description: 'Первый флагман Samsung с титановой рамкой, плоским экраном и полноценной поддержкой ИИ функций Galaxy AI. Камера 200 Мп обеспечивает невероятную детализацию.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 580000,
      discountPrice: 549990,
      stock: 20,
      rating: 4.8,
      reviews: 98,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.8" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Snapdragon 8 Gen 3 for Galaxy',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': '200 Мп + 50 Мп + 12 Мп + 10 Мп с 5x оптическим зумом',
        'Стилус': 'S Pen в комплекте',
        'Материал': 'Титан'
      },
      sku: 'SMSG-S24U-256-BLK',
      tags: ['samsung', 'galaxy', 's24', 'ultra', 'титан'],
      featured: false
    }
  },
  {
    id: 'samsung_s24_plus',
    data: {
      name: 'Samsung Galaxy S24+ 12/256GB',
      description: 'Превосходный флагман с QHD+ экраном, 12 ГБ оперативной памяти и емкой батареей 4900 мАч. Поддерживает все функции Galaxy AI.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 490000,
      discountPrice: 449990,
      stock: 18,
      rating: 4.7,
      reviews: 64,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Dynamic AMOLED 2X QHD+',
        'Процессор': 'Exynos 2400',
        'Память': '256 ГБ',
        'Оперативная память': '12 ГБ',
        'Камера': '50 Мп + 12 Мп + 10 Мп с 3x зумом',
        'Батарея': '4900 мАч'
      },
      sku: 'SMSG-S24P-256-VIOLET',
      tags: ['samsung', 'galaxy', 's24', 'plus'],
      featured: false
    }
  },
  {
    id: 'samsung_s24',
    data: {
      name: 'Samsung Galaxy S24 8/128GB',
      description: 'Базовая компактная модель линейки S24 с ярким экраном, тонкими симметричными рамками и продвинутым искусственным интеллектом.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 390000,
      discountPrice: 359990,
      stock: 25,
      rating: 4.6,
      reviews: 82,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.2" Dynamic AMOLED 2X FHD+',
        'Процессор': 'Exynos 2400',
        'Память': '128 ГБ',
        'Оперативная память': '8 ГБ',
        'Камера': 'Тройная: 50 Мп + 12 Мп + 10 Мп',
        'Galaxy AI': 'Circle to Search, переводчик звонков, фото-помощник'
      },
      sku: 'SMSG-S24-128-AMBER',
      tags: ['samsung', 'galaxy', 's24', 'компактный'],
      featured: false
    }
  }
];

// Функция для заполнения базы данных
export const seedDatabase = async (
  onProgress?: (msg: string) => void
): Promise<{ categoriesCount: number; productsCount: number }> => {
  let categoriesCount = 0;
  let productsCount = 0;

  // 1. Загружаем категории
  onProgress?.('Импорт категорий...');
  for (const cat of CATEGORIES_DATA) {
    onProgress?.(`Добавление категории: ${cat.name}...`);
    // Записываем документ категории по фиксированному ID (slug)
    await setDoc(doc(db, 'categories', cat.slug), {
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon || '',
      subcategories: cat.subcategories
    });
    categoriesCount++;
  }

  // 2. Загружаем товары с фиксированными ID (чтобы избежать дубликатов при повторном запуске)
  onProgress?.('Импорт товаров...');
  for (const prod of PRODUCTS_DATA) {
    onProgress?.(`Добавление товара: ${prod.data.name}...`);
    await setDoc(doc(db, 'products', prod.id), {
      ...prod.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    productsCount++;
  }

  onProgress?.('База данных успешно инициализирована!');
  return { categoriesCount, productsCount };
};
