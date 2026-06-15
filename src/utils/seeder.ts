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
  // Аксессуары
  {
    id: 'accessory_airpods_pro_2',
    data: {
      name: 'Беспроводные наушники Apple AirPods Pro 2 (USB-C)',
      description: 'Легендарные наушники с активным шумоподавлением в два раза эффективнее предыдущего поколения, адаптивным аудио и универсальным кейсом с зарядкой USB-C.',
      category: 'accessories',
      subcategory: 'headphones',
      price: 135000,
      discountPrice: 124990,
      stock: 30,
      rating: 4.9,
      reviews: 142,
      images: ['https://images.unsplash.com/photo-1588449668338-d1517824ee76?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Внутриканальные беспроводные TWS',
        'Шумоподавление': 'Активное (ANC) + адаптивный режим прозрачности',
        'Чип': 'Apple H2 в наушниках, Apple U1 в зарядном кейсе',
        'Время работы от аккумулятора': 'До 6 часов (до 30 часов с кейсом)',
        'Влагозащита': 'IP54 (наушники и кейс)'
      },
      sku: 'AAPL-AP-PRO2-USBC',
      tags: ['apple', 'airpods', 'наушники', 'tws', 'шумоподавление'],
      featured: true
    }
  },
  {
    id: 'accessory_sony_wh1000xm5',
    data: {
      name: 'Беспроводные наушники Sony WH-1000XM5 Black',
      description: 'Полноразмерные наушники премиум-класса с лидирующей на рынке технологией активного шумоподавления, исключительным качеством звука высокого разрешения и смарт-функциями.',
      category: 'accessories',
      subcategory: 'headphones',
      price: 195000,
      stock: 12,
      rating: 5.0,
      reviews: 48,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Полноразмерные закрытые беспроводные',
        'Шумоподавление': 'Автоматически оптимизируемое активное шумоподавление (ANC)',
        'Диаметр мембраны': '30 мм',
        'Аудиокодеки': 'SBC, AAC, LDAC (Hi-Res Audio Wireless)',
        'Время работы': 'До 30 часов (с ANC), до 40 часов (без ANC)'
      },
      sku: 'SONY-WH1000XM5-BLK',
      tags: ['sony', 'наушники', 'bluetooth', 'anc', 'hi-res'],
      featured: true
    }
  },
  {
    id: 'accessory_jbl_tune_520bt',
    data: {
      name: 'Беспроводные наушники JBL Tune 520BT Black',
      description: 'Накладные наушники с фирменной технологией чистого баса JBL Pure Bass, быстрой зарядкой и впечатляющим временем работы до 57 часов.',
      category: 'accessories',
      subcategory: 'headphones',
      price: 29000,
      discountPrice: 24990,
      stock: 50,
      rating: 4.6,
      reviews: 112,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Накладные беспроводные',
        'Технология звука': 'JBL Pure Bass Sound',
        'Версия Bluetooth': '5.3',
        'Время работы': 'До 57 часов',
        'Быстрая зарядка': '5 минут зарядки дают 3 часа воспроизведения'
      },
      sku: 'JBL-T520BT-BLK',
      tags: ['jbl', 'наушники', 'басы', 'бюджетные'],
      featured: false
    }
  },
  {
    id: 'accessory_anker_powercore',
    data: {
      name: 'Повербанк Anker PowerCore Essential 20000mAh',
      description: 'Внешний аккумулятор большой емкости от мирового лидера. Поддерживает технологии быстрой зарядки PowerIQ и VoltageBoost для максимально безопасного процесса.',
      category: 'accessories',
      subcategory: 'powerbanks',
      price: 25000,
      stock: 25,
      rating: 4.8,
      reviews: 67,
      images: ['https://images.unsplash.com/photo-1609592424109-dd77d61d15c8?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Емкость': '20 000 мАч / 74 Втч',
        'Выходные порты': '2 x USB-A',
        'Входные порты': 'USB-C, Micro-USB',
        'Максимальная мощность': '15 Вт',
        'Материал корпуса': 'Износостойкий структурированный пластик'
      },
      sku: 'ANKR-PC-20K-BLK',
      tags: ['anker', 'повербанк', 'зарядка', 'аккумулятор'],
      featured: false
    }
  },
  {
    id: 'accessory_xiaomi_powerbank_3',
    data: {
      name: 'Повербанк Xiaomi Mi Power Bank 3 10000mAh',
      description: 'Компактный внешний аккумулятор в стильном алюминиевом корпусе. Поддерживает двустороннюю быструю зарядку мощностью до 18 Вт.',
      category: 'accessories',
      subcategory: 'powerbanks',
      price: 13000,
      discountPrice: 11500,
      stock: 60,
      rating: 4.7,
      reviews: 195,
      images: ['https://images.unsplash.com/photo-1609592424109-dd77d61d15c8?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Емкость': '10 000 мАч',
        'Материал корпуса': 'Анодированный алюминий',
        'Порты': 'Выход: USB-A, USB-C | Вход: Micro-USB, USB-C',
        'Максимальная мощность': '18 Вт (двусторонняя быстрая зарядка)'
      },
      sku: 'XMI-PB3-10K-SLV',
      tags: ['xiaomi', 'повербанк', 'алюминий', 'быстрая зарядка'],
      featured: false
    }
  },
  {
    id: 'accessory_baseus_bipow',
    data: {
      name: 'Повербанк Baseus Bipow 20000mAh 20W',
      description: 'Внешний аккумулятор емкостью 20000 мАч с поддержкой Power Delivery (PD) 20 Вт и удобным светодиодным дисплеем для отображения уровня заряда.',
      category: 'accessories',
      subcategory: 'powerbanks',
      price: 18000,
      stock: 45,
      rating: 4.6,
      reviews: 84,
      images: ['https://images.unsplash.com/photo-1609592424109-dd77d61d15c8?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Емкость': '20 000 мАч',
        'Максимальная выходная мощность': '20 Вт',
        'Поддерживаемые протоколы': 'Quick Charge 3.0, Power Delivery 3.0, FCP, AFC',
        'Экран': 'Цифровой LED-дисплей (процент заряда)'
      },
      sku: 'BSUS-BIPW-20K-20W',
      tags: ['baseus', 'повербанк', 'power-delivery', 'дисплей'],
      featured: false
    }
  },
  {
    id: 'accessory_logitech_mx_master_3s',
    data: {
      name: 'Беспроводная мышь Logitech MX Master 3S',
      description: 'Эталонная эргономичная мышь для программистов, дизайнеров и создателей контента. Оснащена электромагнитным колесиком прокрутки MagSpeed и бесшумными кликами.',
      category: 'accessories',
      subcategory: 'input',
      price: 69000,
      discountPrice: 64990,
      stock: 15,
      rating: 5.0,
      reviews: 56,
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип подключения': 'Bluetooth или беспроводной USB-приемник Logi Bolt',
        'Разрешение сенсора': '8000 DPI (работает даже на стекле)',
        'Количество кнопок': '7 + колесико горизонтальной прокрутки',
        'Эргономика': 'Для правой руки, упор для большого пальца',
        'Аккумулятор': 'До 70 дней работы на одном заряде'
      },
      sku: 'LOGI-MXM3S-GRY',
      tags: ['logitech', 'мышь', 'эргономика', 'mx master', 'премиум'],
      featured: true
    }
  },
  {
    id: 'accessory_razer_deathadder',
    data: {
      name: 'Игровая мышь Razer DeathAdder Essential Black',
      description: 'Легендарная игровая мышь с эргономичной формой, высокоточным оптическим сенсором 6400 DPI и сверхнадежными переключателями.',
      category: 'accessories',
      subcategory: 'input',
      price: 18000,
      discountPrice: 15990,
      stock: 40,
      rating: 4.7,
      reviews: 120,
      images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип подключения': 'Проводное (USB, длина кабеля 1.8 м)',
        'Сенсор': 'Оптический, 6400 DPI',
        'Количество кнопок': '5 программируемых кнопок Hyperesponse',
        'Подсветка': 'Одноцветная зеленая'
      },
      sku: 'RAZR-DA-ESS-BLK',
      tags: ['razer', 'мышь', 'гейминг', 'классика'],
      featured: false
    }
  },
  {
    id: 'accessory_logitech_mx_keys',
    data: {
      name: 'Беспроводная клавиатура Logitech MX Keys S',
      description: 'Премиальная низкопрофильная клавиатура со сферическими углублениями клавиш Perfect Stroke, автоматической подсветкой и поддержкой нескольких устройств.',
      category: 'accessories',
      subcategory: 'input',
      price: 79000,
      stock: 10,
      rating: 4.9,
      reviews: 38,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Тип': 'Низкопрофильная мембранная',
        'Раскладка': 'Полноразмерная с цифровым блоком',
        'Подключение': 'Bluetooth / Logi Bolt / подключение до 3-х устройств (Easy-Switch)',
        'Подсветка': 'Интеллектуальная (датчики приближения рук и освещенности)',
        'Зарядка': 'USB-C (до 5 месяцев без подсветки)'
      },
      sku: 'LOGI-MXKEYS-S-GRY',
      tags: ['logitech', 'клавиатура', 'печать', 'bluetooth', 'умная подсветка'],
      featured: true
    }
  },
  {
    id: 'accessory_apple_watch_9',
    data: {
      name: 'Apple Watch Series 9 GPS 45mm Midnight',
      description: 'Умные часы Apple с новым мощным процессором S9 SiP, инновационным бесконтактным жестом двойного касания (Double Tap) и сверхъярким Always-On экраном.',
      category: 'accessories',
      subcategory: 'smartwatch',
      price: 265000,
      discountPrice: 249990,
      stock: 12,
      rating: 4.9,
      reviews: 44,
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Дисплей': 'OLED LTPO Retina с яркостью до 2000 нит, Always-On',
        'Процессор': 'Apple S9 SiP',
        'Функции здоровья': 'ЭКГ, измерение кислорода в крови (SpO2), мониторинг сна, датчик температуры',
        'Особая фишка': 'Жест двойного касания (Double Tap) указательного и большого пальцев',
        'Время работы': 'До 18 часов (до 36 часов в режиме энергосбережения)'
      },
      sku: 'AAPL-WATCH9-45-MID',
      tags: ['apple', 'watch', 'умные часы', 'double-tap', 'здоровье'],
      featured: true
    }
  },
  {
    id: 'accessory_samsung_galaxy_watch_6',
    data: {
      name: 'Samsung Galaxy Watch6 44mm Graphite',
      description: 'Флагманские смарт-часы от Samsung на Wear OS. Тонкий безель, увеличенный экран, комплексный анализ состава тела (БИА) и мониторинг сна.',
      category: 'accessories',
      subcategory: 'smartwatch',
      price: 185000,
      discountPrice: 169990,
      stock: 18,
      rating: 4.8,
      reviews: 29,
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '1.5" Super AMOLED, Sapphire Crystal',
        'Процессор': 'Exynos W930 (5-нм)',
        'Операционная система': 'Wear OS Powered by Samsung',
        'Анализ тела': 'Биоимпедансный анализ (соотношение жира, воды и скелетных мышц)',
        'Влагозащита': '5ATM / IP68 / MIL-STD-810H'
      },
      sku: 'SMSG-WATCH6-44-GRPH',
      tags: ['samsung', 'galaxy-watch', 'wearos', 'фитнес', 'здоровье'],
      featured: false
    }
  },
  {
    id: 'accessory_xiaomi_smart_band_8',
    data: {
      name: 'Фитнес-браслет Xiaomi Smart Band 8 Graphite Black',
      description: 'Культовый фитнес-трекер в новом исполнении. Поддерживает частоту обновления экрана 60 Гц, быструю замену ремешков одной кнопкой и новые режимы бега.',
      category: 'accessories',
      subcategory: 'smartwatch',
      price: 24000,
      stock: 50,
      rating: 4.7,
      reviews: 230,
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'],
      specifications: {
        'Экран': '1.62" AMOLED, 60 Гц, автояркость до 600 нит',
        'Время работы от аккумулятора': 'До 16 дней при обычном использовании (до 6 дней с Always-On)',
        'Мониторинг': 'Пульс, сон, стресс, уровень кислорода в крови SpO2',
        'Спортивные режимы': 'Более 150 режимов, включая интерактивный бокс и беговую клипсу'
      },
      sku: 'XMI-SBAND8-BLK',
      tags: ['xiaomi', 'mi-band', 'браслет', 'спорт', 'автономность'],
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
