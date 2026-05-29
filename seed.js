import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYARQ6NRlIQ4TfDCHmLI3sZq8r6h3TFDI",
  authDomain: "electro-store-29284.firebaseapp.com",
  projectId: "electro-store-29284",
  storageBucket: "electro-store-29284.firebasestorage.app",
  messagingSenderId: "241854764297",
  appId: "1:241854764297:web:a2bda13fcbc8234c5cafd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Categories Data
const CATEGORIES_DATA = [
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

// Products Data
const PRODUCTS_DATA = [
  // ─── СМАРТФОНЫ ─────────────────────────────────────────────────────────────
  {
    id: 'smartphones_1',
    data: {
      name: 'Apple iPhone 15 Pro Max 256GB',
      description: 'Флагманский smartphone Apple с титановым корпусом, мощнейшим процессором A17 Pro и передовой системой камер с 5-кратным оптическим зумом.',
      category: 'smartphones',
      subcategory: 'apple',
      price: 650000,
      discountPrice: 599990,
      stock: 15,
      rating: 4.9,
      reviews: 42,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Super Retina XDR OLED',
        'Процессор': 'Apple A17 Pro',
        'Память': '256 ГБ',
        'Камера': '48 Мп + 12 Мп + 12 Мп с 5x зумом',
        'Материал': 'Титановый сплав',
        'Разъем': 'USB-C (USB 3)'
      },
      sku: 'AAPL-IP15PM-256-TI',
      tags: ['apple', 'iphone', 'смартфон', 'флагман', 'титан'],
      featured: true
    }
  },
  {
    id: 'smartphones_2',
    data: {
      name: 'Samsung Galaxy S24 Ultra 12/256GB',
      description: 'Ультимативный флагман на Android со встроенным искусственным интеллектом Galaxy AI, титановой рамкой, стилусом S Pen и невероятной камерой на 200 Мп.',
      category: 'smartphones',
      subcategory: 'samsung',
      price: 580000,
      discountPrice: 549990,
      stock: 12,
      rating: 4.8,
      reviews: 28,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.8" Dynamic AMOLED 2X 120Hz',
        'Процессор': 'Snapdragon 8 Gen 3 for Galaxy',
        'Память': '256 ГБ / 12 ГБ RAM',
        'Камера': '200 Мп + 50 Мп + 12 Мп + 10 Мп',
        'Стилус': 'S Pen в комплекте',
        'ИИ функции': 'Galaxy AI (перевод, поиск, фоторедактор)'
      },
      sku: 'SMSG-S24U-256-BLK',
      tags: ['samsung', 'galaxy', 'смартфон', 'флагман', 'android', 'ai'],
      featured: true
    }
  },
  {
    id: 'smartphones_3',
    data: {
      name: 'Xiaomi 14 Ultra 16/512GB',
      description: 'Суперфлагман с оптикой Leica нового поколения. Крупный 1-дюймовый сенсор основной камеры позволяет делать непревзойденные снимки кинематографического уровня.',
      category: 'smartphones',
      subcategory: 'xiaomi',
      price: 520000,
      stock: 8,
      rating: 4.7,
      reviews: 15,
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.73" AMOLED WQHD+ 120Hz',
        'Процессор': 'Snapdragon 8 Gen 3',
        'Память': '512 ГБ / 16 ГБ RAM',
        'Камера': 'Leica 50 Мп + 50 Мп + 50 Мп + 50 Мп',
        'Сенсор': '1-дюймовый Sony LYT-900',
        'Зарядка': '90 Вт проводная / 80 Вт беспроводная'
      },
      sku: 'XIA-14U-512-WHT',
      tags: ['xiaomi', 'смартфон', 'флагман', 'leica', 'камерафон'],
      featured: false
    }
  },
  {
    id: 'smartphones_4',
    data: {
      name: 'Google Pixel 8 Pro 12/128GB',
      description: 'Смартфон с лучшими возможностями мобильной фотографии благодаря продвинутым алгоритмам Google AI, фирменному процессору Tensor G3 и чистейшему Android 14.',
      category: 'smartphones',
      subcategory: 'google',
      price: 410000,
      discountPrice: 379990,
      stock: 7,
      rating: 4.6,
      reviews: 19,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.7" Super Actua display LTPO',
        'Процессор': 'Google Tensor G3',
        'Память': '128 ГБ / 12 ГБ RAM',
        'Камера': '50 Мп + 48 Мп + 48 Мп',
        'ОС': 'Чистый Android 14 (обновления 7 лет)',
        'Безопасность': 'Чип Titan M2'
      },
      sku: 'GOOG-P8P-128-BLU',
      tags: ['google', 'pixel', 'смартфон', 'android', 'чистый android'],
      featured: false
    }
  },
  {
    id: 'smartphones_5',
    data: {
      name: 'OnePlus 12 12/256GB',
      description: 'Новый "убийца флагманов" с невероятным временем автономной работы, сверхбыстрой зарядкой 100 Вт, ярким экраном 4500 нит и тройной камерой Hasselblad.',
      category: 'smartphones',
      subcategory: 'xiaomi',
      price: 380000,
      stock: 20,
      rating: 4.7,
      reviews: 22,
      images: ['https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '6.82" 2K 120Hz Fluid AMOLED',
        'Процессор': 'Snapdragon 8 Gen 3',
        'Память': '256 ГБ / 12 ГБ RAM',
        'Камера': '50 Мп + 64 Мп (перископ) + 48 Мп Hasselblad',
        'Батарея': '5400 мАч',
        'Зарядка': '100 Вт SuperVOOC (100% за 26 мин)'
      },
      sku: 'OP-12-256-GRN',
      tags: ['oneplus', 'смартфон', 'быстрая зарядка', 'hasselblad'],
      featured: false
    }
  },

  // ─── НОУТБУКИ ──────────────────────────────────────────────────────────────
  {
    id: 'laptops_1',
    data: {
      name: 'Apple MacBook Pro 16" M3 Max 48GB/1TB',
      description: 'Ультимативный рабочий инструмент для профессионалов. Сверхмощный чип M3 Max готов к сложнейшим задачам: 3D рендеринг, монтаж тяжелого 8K видео и разработка сложного ПО.',
      category: 'laptops',
      subcategory: 'ultrabooks',
      price: 1850000,
      discountPrice: 1750000,
      stock: 5,
      rating: 5.0,
      reviews: 11,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '16.2" Liquid Retina XDR (3456x2234)',
        'Процессор': 'Apple M3 Max (16 ядер CPU, 40 ядер GPU)',
        'Память': '48 ГБ объединенной памяти / 1 ТБ SSD',
        'ОС': 'macOS Sonoma',
        'Автономность': 'До 22 часов работы',
        'Цвет': 'Space Black (Космический черный)'
      },
      sku: 'AAPL-MBP16-M3M-48-1T',
      tags: ['apple', 'macbook', 'ноутбук', 'm3 max', 'профессиональный', 'premium'],
      featured: true
    }
  },
  {
    id: 'laptops_2',
    data: {
      name: 'ASUS ROG Zephyrus G16 (2024)',
      description: 'Тонкий и легкий игровой ноутбук премиум-класса. Оснащен шикарным ROG Nebula OLED экраном 240 Гц и мощнейшей видеокартой RTX 4080 в полностью алюминиевом корпусе.',
      category: 'laptops',
      subcategory: 'gaming',
      price: 1200000,
      stock: 6,
      rating: 4.8,
      reviews: 14,
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '16" ROG Nebula OLED 2.5K 240Hz',
        'Процессор': 'Intel Core Ultra 9 185H',
        'Видеокарта': 'NVIDIA GeForce RTX 4080 12GB',
        'Память': '32 ГБ LPDDR5X / 1 ТБ SSD NVMe',
        'Корпус': 'Алюминиевый сплав (CNC)',
        'Вес': '1.85 кг'
      },
      sku: 'ASUS-ROG-G16-RTX4080',
      tags: ['asus', 'rog', 'игровой', 'ноутбук', 'oled', 'rtx4080'],
      featured: true
    }
  },
  {
    id: 'laptops_3',
    data: {
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      description: 'Легендарный бизнес-ультрабук в прочнейшем корпусе из углеволокна. Эталонная клавиатура, высочайшая надежность по военному стандарту и длительное время автономной работы.',
      category: 'laptops',
      subcategory: 'ultrabooks',
      price: 950000,
      discountPrice: 899990,
      stock: 10,
      rating: 4.7,
      reviews: 8,
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '14" WUXGA IPS матовый, 100% sRGB',
        'Процессор': 'Intel Core i7-1360P (до 5.0 ГГц)',
        'Память': '32 ГБ LPDDR5 / 1 ТБ PCIe Gen4 SSD',
        'Материал': 'Углеволокно и магниевый сплав',
        'Безопасность': 'Сканер отпечатков, шторка камеры ThinkShutter',
        'Вес': '1.12 кг (ультралегкий)'
      },
      sku: 'LEN-TP-X1C11-I7-32',
      tags: ['lenovo', 'thinkpad', 'ультрабук', 'бизнес', 'надежный'],
      featured: false
    }
  },
  {
    id: 'laptops_4',
    data: {
      name: 'Dell XPS 15 9530 Touch',
      description: 'Премиальный мультимедийный ноутбук. Сочетание изысканного дизайна из авиационного алюминия и углеволокна с великолепным сенсорным OLED-экраном идеален для работы с графикой.',
      category: 'laptops',
      subcategory: 'ultrabooks',
      price: 1100000,
      stock: 4,
      rating: 4.6,
      reviews: 12,
      images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '15.6" 3.5K (3456x2160) OLED Touch',
        'Процессор': 'Intel Core i9-13900H',
        'Видеокарта': 'NVIDIA GeForce RTX 4060 8GB',
        'Память': '32 ГБ DDR5 / 1 ТБ SSD',
        'Корпус': 'Алюминий + карбон',
        'Звук': '4 стереодинамика Waves MaxxAudio Pro'
      },
      sku: 'DELL-XPS15-9530-I9',
      tags: ['dell', 'xps', 'ноутбук', 'экран', 'дизайн'],
      featured: false
    }
  },
  {
    id: 'laptops_5',
    data: {
      name: 'HP Spectre x360 14-inch 2-in-1',
      description: 'Премиальный ноутбук-трансформер. Конструкция позволяет раскрывать экран на 360 градусов для использования устройства в качестве планшета с активным стилусом.',
      category: 'laptops',
      subcategory: 'ultrabooks',
      price: 750000,
      discountPrice: 699990,
      stock: 8,
      rating: 4.8,
      reviews: 17,
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '14" OLED 2.8K (2880x1800) Сенсорный 120Hz',
        'Процессор': 'Intel Core Ultra 7 155H',
        'Память': '16 ГБ LPDDR5X / 1 ТБ SSD',
        'Конструкция': 'Трансформер (поворот на 360 градусов)',
        'Комплектация': 'Стилус HP Rechargeable MPP 2.0 Tilt Pen',
        'Вес': '1.44 кг'
      },
      sku: 'HP-SPEC-X360-14-U7',
      tags: ['hp', 'spectre', 'трансформер', '2-в-1', 'сенсорный'],
      featured: false
    }
  },

  // ─── ТЕЛЕВИЗОРЫ ─────────────────────────────────────────────────────────────
  {
    id: 'tvs_1',
    data: {
      name: 'LG OLED C3 65" 4K Smart TV',
      description: 'Один из лучших OLED телевизоров на рынке. Обладает бесконечной контрастностью, идеальной цветопередачей и великолепными игровыми функциями благодаря HDMI 2.1.',
      category: 'tvs',
      subcategory: 'oled',
      price: 950000,
      discountPrice: 870000,
      stock: 6,
      rating: 4.9,
      reviews: 34,
      images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Диагональ': '65" (165 см)',
        'Разрешение': '4K Ultra HD (3840x2160)',
        'Технология': 'OLED (самосветящиеся пиксели)',
        'Частота обновления': '120 Гц',
        'Процессор': 'α9 AI Processor 4K Gen6',
        'ОС': 'webOS 23 Smart TV',
        'Игровые функции': 'NVIDIA G-Sync, AMD FreeSync Premium, VRR'
      },
      sku: 'LG-OLED65C3-4K',
      tags: ['lg', 'oled', 'телевизор', '4k', '120hz', 'gaming'],
      featured: true
    }
  },
  {
    id: 'tvs_2',
    data: {
      name: 'Samsung Neo QLED QN90C 75" 4K',
      description: 'Гигантский 75-дюймовый телевизор с подсветкой Mini LED. Обеспечивает колоссальную яркость изображения и детальность в темных сценах даже в хорошо освещенном помещении.',
      category: 'tvs',
      subcategory: 'oled',
      price: 1350000,
      discountPrice: 1250000,
      stock: 4,
      rating: 4.8,
      reviews: 16,
      images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Диагональ': '75" (190 см)',
        'Технология': 'Neo QLED (Mini LED подсветка)',
        'Разрешение': '4K Ultra HD',
        'Процессор': 'Neural Quantum Processor 4K',
        'Яркость': 'Пиковая до 2000 нит',
        'Акустика': '60 Вт 4.2.2-канальная с OTS+'
      },
      sku: 'SMSG-75QN90C-MINI',
      tags: ['samsung', 'neo qled', 'mini led', '75 дюймов', 'кинотеатр'],
      featured: true
    }
  },
  {
    id: 'tvs_3',
    data: {
      name: 'Sony BRAVIA XR A95K 55" QD-OLED',
      description: 'Телевизор премиум-класса на технологии QD-OLED (квантовые точки + OLED). Выдает максимально насыщенные и сочные цвета, чистый звук прямо из экрана.',
      category: 'tvs',
      subcategory: 'oled',
      price: 1150000,
      stock: 3,
      rating: 4.9,
      reviews: 9,
      images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Диагональ': '55" (140 см)',
        'Технология': 'QD-OLED',
        'Процессор': 'Cognitive Processor XR',
        'Звук': 'Acoustic Surface Audio+ (звучит сам экран)',
        'ОС': 'Google TV',
        'Материал ножки': 'Металл (дизайн двойной позиции)'
      },
      sku: 'SONY-XR55A95K-QDOLED',
      tags: ['sony', 'bravia', 'qd-oled', 'premium', 'google tv'],
      featured: false
    }
  },
  {
    id: 'tvs_4',
    data: {
      name: 'Philips Ambilight 55OLED808',
      description: 'Телевизор с уникальной запатентованной подсветкой Ambilight, которая проецирует световое шоу в цветах экрана на стену сзади, создавая полный эффект погружения.',
      category: 'tvs',
      subcategory: 'oled',
      price: 680000,
      discountPrice: 629990,
      stock: 7,
      rating: 4.7,
      reviews: 21,
      images: ['https://images.unsplash.com/photo-1552975084-6e027cd345c2?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Диагональ': '55" (140 см)',
        'Подсветка': 'Ambilight 4-сторонняя фоновая',
        'Технология': 'OLED EX',
        'Частота': '120 Гц',
        'Процессор': 'P5 AI Perfect Picture Gen7',
        'ОС': 'Google TV'
      },
      sku: 'PHIL-55OLED808-AMB',
      tags: ['philips', 'ambilight', 'oled', 'google tv', 'атмосфера'],
      featured: false
    }
  },
  {
    id: 'tvs_5',
    data: {
      name: 'Xiaomi TV A2 43" 4K Smart TV',
      description: 'Доступный 4K телевизор в элегантном металлическом корпусе с тонкими безрамочными краями. Работает на быстрой системе Android TV.',
      category: 'tvs',
      subcategory: '4k',
      price: 145000,
      stock: 15,
      rating: 4.5,
      reviews: 54,
      images: ['https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Диагональ': '43" (109 см)',
        'Разрешение': '4K UHD (3840x2160)',
        'Корпус': 'Безрамочный металлический корпус',
        'ОС': 'Android TV 11',
        'Звук': '2 x 12 Вт, Dolby Audio + DTS-HD',
        'Управление': 'Пульт с Bluetooth 360° и микрофоном'
      },
      sku: 'XIA-TVA2-43-4K',
      tags: ['xiaomi', 'бюджетный', '4k', 'android tv', 'безрамочный'],
      featured: false
    }
  },

  // ─── БЫТОВАЯ ТЕХНИКА ────────────────────────────────────────────────────────
  {
    id: 'appliances_1',
    data: {
      name: 'Вертикальный пылесос Dyson V15 Detect Absolute',
      description: 'Самый мощный интеллектуальный беспроводной пылесос Dyson с лазерной подсветкой для обнаружения микроскопической пыли и ЖК-дисплеем.',
      category: 'appliances',
      subcategory: 'vacuum',
      price: 380000,
      discountPrice: 349990,
      stock: 12,
      rating: 4.9,
      reviews: 38,
      images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Беспроводной циклонный пылесос',
        'Мощность всасывания': '240 аВт',
        'Объем контейнера': '0.76 л',
        'Фильтрация': 'HEPA-фильтр (задерживает 99.99% частиц)',
        'Аккумулятор': 'До 60 минут работы (съемный)',
        'Фишка': 'Лазерный луч выявляет невидимую пыль'
      },
      sku: 'DYS-V15D-ABS-CORDLESS',
      tags: ['dyson', 'пылесос', 'вертикальный', 'беспроводной', 'уборка'],
      featured: true
    }
  },
  {
    id: 'appliances_2',
    data: {
      name: 'Стиральная машина LG AI DD F4V3VS6W',
      description: 'Стиральная машина с фронтальной загрузкой, инверторным мотором и интеллектуальной технологией искусственного интеллекта AI DD.',
      category: 'appliances',
      subcategory: 'vacuum',
      price: 290000,
      stock: 8,
      rating: 4.7,
      reviews: 27,
      images: ['https://images.unsplash.com/photo-1582730147233-ac811214b75d?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Загрузка': '8.5 кг',
        'Двигатель': 'Inverter Direct Drive (прямой привод)',
        'Максимальный отжим': '1200 об/мин',
        'Класс энергопотребления': 'A+++',
        'Технология стирки': 'AI DD (автоопределение типа ткани и режима)',
        'Функция пара': 'SpaSteam (удаление аллергенов)'
      },
      sku: 'LG-AIDD-8KG-STEAM',
      tags: ['lg', 'стиралка', 'инвертор', 'стиральная машина', 'пар'],
      featured: false
    }
  },
  {
    id: 'appliances_3',
    data: {
      name: 'Холодильник Bosch Serie 6 NoFrost',
      description: 'Двухкамерный холодильник с премиум системой сохранения свежести VitaFresh Pro и полной автоматической разморозкой NoFrost.',
      category: 'appliances',
      subcategory: 'kitchen',
      price: 480000,
      discountPrice: 449990,
      stock: 5,
      rating: 4.8,
      reviews: 19,
      images: ['https://images.unsplash.com/photo-1571175432267-ef16386d547f?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Высота': '203 см',
        'Общий полезный объем': '368 литров',
        'Разморозка': 'NoFrost (морозильная + холодильная камера)',
        'Зона свежести': 'VitaFresh pro 0°C с регулировкой влажности',
        'Энергопотребление': 'Класс A++ (273 кВтч/год)',
        'Уровень шума': '38 дБ (очень тихий)'
      },
      sku: 'BSH-S6-NOFROST-MET',
      tags: ['bosch', 'холодильник', 'nofrost', 'кухня', 'бытовая'],
      featured: false
    }
  },
  {
    id: 'appliances_4',
    data: {
      name: 'Кофемашина DeLonghi Dinamica Cappuccino',
      description: 'Автоматическая кофемашина премиум-класса с запатентованной системой автоматического приготовления молочной пенки LatteCrema.',
      category: 'appliances',
      subcategory: 'kitchen',
      price: 420000,
      discountPrice: 389990,
      stock: 9,
      rating: 4.8,
      reviews: 31,
      images: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Давление помпы': '15 бар',
        'Мощность': '1450 Вт',
        'Емкость для зерен': '300 г',
        'Капучинатор': 'Автоматический (LatteCrema System)',
        'Управление': 'Сенсорные иконки, текстовый дисплей',
        'Рецепты': 'Эспрессо, Кофе, Лонг, Доппио+, Капучино, Латте Макиато'
      },
      sku: 'DEL-ECAM350-CAP',
      tags: ['delonghi', 'кофемашина', 'кофе', 'капучино', 'кухня'],
      featured: true
    }
  },
  {
    id: 'appliances_5',
    data: {
      name: 'Очиститель воздуха Xiaomi Smart Air Purifier 4 Pro',
      description: 'Высокопроизводительный очиститель воздуха с 3-слойной системой фильтрации, датчиком PM2.5/PM10 и генератором отрицательных ионов.',
      category: 'appliances',
      subcategory: 'climate',
      price: 115000,
      stock: 25,
      rating: 4.7,
      reviews: 45,
      images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Производительность CADR': '500 куб.м/час',
        'Площадь очистки': 'до 60 кв.м',
        'Фильтр': 'Xiaomi High Efficiency Filter (угольный + HEPA)',
        'Датчик частиц': 'Лазерный сенсор PM2.5 и PM10',
        'Умный дом': 'Управление по Wi-Fi (Mi Home, Алиса, Google Home)',
        'Экран': 'OLED сенсорный с цветовым индикатором качества воздуха'
      },
      sku: 'XIA-SAP4P-WHT',
      tags: ['xiaomi', 'очиститель', 'воздух', 'умный дом', 'здоровье'],
      featured: false
    }
  },

  // ─── АКСЕССУАРЫ ─────────────────────────────────────────────────────────────
  {
    id: 'accessories_1',
    data: {
      name: 'Беспроводные наушники Apple AirPods Pro 2 (USB-C)',
      description: 'Обновленные AirPods Pro 2 с новым разъемом USB-C, революционным чипом H2, адаптивным аудио и невероятным активным шумоподавлением.',
      category: 'accessories',
      subcategory: 'headphones',
      price: 125000,
      discountPrice: 114990,
      stock: 30,
      rating: 4.9,
      reviews: 67,
      images: ['https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип подключения': 'Беспроводные (Bluetooth 5.3)',
        'Чип': 'Apple H2 в наушниках, Apple U1 в кейсе',
        'Шумоподавление': 'Активное (ANC), Адаптивное аудио, Прозрачность',
        'Влагозащита': 'IP54 (наушники и кейс)',
        'Зарядный кейс': 'MagSafe с динамиком и разъемом USB-C',
        'Автономность': 'До 6 часов с ANC (до 30 часов с кейсом)'
      },
      sku: 'AAPL-APP2-USBC-ANC',
      tags: ['apple', 'airpods', 'наушники', 'bluetooth', 'anc', 'wireless'],
      featured: true
    }
  },
  {
    id: 'accessories_2',
    data: {
      name: 'Полноразмерные наушники Sony WH-1000XM5 Black',
      description: 'Премиальные накладные беспроводные наушники с эталонным в мире уровнем активного шумоподавления, поддержкой Hi-Res LDAC и непревзойденным комфортом.',
      category: 'accessories',
      subcategory: 'headphones',
      price: 195000,
      discountPrice: 179990,
      stock: 15,
      rating: 4.8,
      reviews: 41,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Конструкция': 'Полноразмерные накладные, охватывающие',
        'Шумоподавление': 'Активное интеллектуальное (процессор V1 + QN1)',
        'Кодеки': 'LDAC, AAC, SBC (Hi-Res Audio Wireless)',
        'Динамик': '30 мм специальной разработки',
        'Автономность': 'До 30 часов с ANC / До 40 часов без ANC',
        'Быстрая зарядка': '3 минуты дают 3 часа работы'
      },
      sku: 'SONY-WH1000XM5-BLK',
      tags: ['sony', 'наушники', 'bluetooth', 'anc', 'hi-res', 'музыка'],
      featured: true
    }
  },
  {
    id: 'accessories_3',
    data: {
      name: 'Внешний аккумулятор Anker 737 Power Bank (PowerCore 24K)',
      description: 'Сверхмощный повербанк емкостью 24000 мАч с поддержкой новейшего стандарта Power Delivery 3.1 мощностью до 140 Вт и цветным смарт-дисплеем.',
      category: 'accessories',
      subcategory: 'powerbanks',
      price: 75000,
      stock: 40,
      rating: 4.8,
      reviews: 29,
      images: ['https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Емкость': '24 000 мАч (86.4 Втч)',
        'Максимальная мощность': '140 Вт (двунаправленная)',
        'Порты': '2 x USB-C (In/Out), 1 x USB-A (Out)',
        'Дисплей': 'Цветной TFT, отображает мощность, остаток заряда, циклы, t°',
        'Совместимость': 'Заряжает смартфоны, планшеты, ультрабуки, MacBook Pro 16"',
        'Защита': 'Система ActiveShield 2.0 контроля температуры'
      },
      sku: 'ANKR-737-140W-24K',
      tags: ['anker', 'повербанк', 'зарядка', '140w', 'macbook'],
      featured: false
    }
  },
  {
    id: 'accessories_4',
    data: {
      name: 'Беспроводная мышь Logitech MX Master 3S Graphic',
      description: 'Эргономичная мышь премиум-класса с суперточным сенсором 8000 DPI, тихими кликами и инновационным электромагнитным колесом прокрутки MagSpeed.',
      category: 'accessories',
      subcategory: 'input',
      price: 58000,
      discountPrice: 53990,
      stock: 20,
      rating: 4.9,
      reviews: 52,
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Беспроводная лазерная мышь для работы',
        'Сенсор': 'Darkfield High Precision, до 8000 DPI (работает на стекле)',
        'Колесо': 'Сверхбыстрое электромагнитное колесо MagSpeed',
        'Подключение': 'Bluetooth LE или Logi Bolt USB Receiver (до 3 устройств)',
        'Аккумулятор': 'До 70 дней работы, быстрая зарядка USB-C',
        'Особенности': 'Кнопка жестов, боковое колесо прокрутки, тикие клики'
      },
      sku: 'LOGI-MXM3S-GRY',
      tags: ['logitech', 'мышка', 'эргономика', 'bluetooth', 'работа'],
      featured: false
    }
  },
  {
    id: 'accessories_5',
    data: {
      name: 'Смарт-часы Samsung Galaxy Watch 6 Classic 47mm LTE',
      description: 'Премиальные умные часы в прочном корпусе из нержавеющей стали с легендарным вращающимся физическим безелем и широкими медицинскими датчиками.',
      category: 'accessories',
      subcategory: 'smartwatch',
      price: 175000,
      stock: 12,
      rating: 4.7,
      reviews: 23,
      images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '1.5" Super AMOLED, 480x480, сапфировое стекло',
        'Процессор': 'Exynos W930 Dual Core 1.4GHz',
        'Корпус': 'Нержавеющая сталь 316L, влагозащита IP68 / 5ATM / MIL-STD-810H',
        'Фишка': 'Вращающийся механический безель',
        'ОС': 'Wear OS Powered by Samsung (с поддержкой бесконтактной оплаты)',
        'Датчики': 'Пульс, ЭКГ, анализ состава тела BioActive, температура'
      },
      sku: 'SMSG-GW6C-47-LTE',
      tags: ['samsung', 'часы', 'умные часы', 'фитнес', 'wearos'],
      featured: false
    }
  }
];

// Seeder Execution
const seed = async () => {
  console.log('🚀 Начинаем заполнение базы данных Firebase...');
  
  try {
    // 1. Загружаем категории
    console.log('\n📦 1. Импорт категорий...');
    for (const cat of CATEGORIES_DATA) {
      console.log(`   - Категория: ${cat.name} (${cat.slug})`);
      await setDoc(doc(db, 'categories', cat.slug), cat);
    }
    console.log(`✅ Успешно добавлено ${CATEGORIES_DATA.length} категорий.`);

    // 2. Загружаем товары
    console.log('\n🛍️ 2. Импорт товаров...');
    for (const prod of PRODUCTS_DATA) {
      console.log(`   - Товар: ${prod.data.name} (${prod.id})`);
      await setDoc(doc(db, 'products', prod.id), {
        ...prod.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ Успешно добавлено ${PRODUCTS_DATA.length} товаров.`);
    
    console.log('\n🎉 Инициализация базы данных успешно завершена! Все данные сохранены в Firebase.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Произошла ошибка во время заполнения БД:', error);
    process.exit(1);
  }
};

seed();
