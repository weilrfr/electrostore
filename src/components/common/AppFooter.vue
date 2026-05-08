<script setup lang="ts">
const currentYear = new Date().getFullYear();

const links = {
  catalog: [
    { label: 'Смартфоны', to: '/shop?category=smartphones' },
    { label: 'Ноутбуки', to: '/shop?category=laptops' },
    { label: 'Телевизоры', to: '/shop?category=tvs' },
    { label: 'Бытовая техника', to: '/shop?category=appliances' },
    { label: 'Аксессуары', to: '/shop?category=accessories' },
  ],
  info: [
    { label: 'О компании', to: '/' },
    { label: 'Доставка', to: '/' },
    { label: 'Возврат', to: '/' },
    { label: 'Гарантия', to: '/' },
  ],
  account: [
    { label: 'Личный кабинет', to: '/profile' },
    { label: 'Мои заказы', to: '/orders' },
    { label: 'Кошелёк', to: '/profile?tab=wallet' },
  ],
};
</script>

<template>
  <footer class="bg-gray-900 text-gray-300 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">ТМ</span>
            </div>
            <span class="font-bold text-white text-lg">ТехноМаркет</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Лучшая электроника и бытовая техника с доставкой по всему Казахстану.
          </p>
          <div class="mt-4 space-y-1 text-sm">
            <p>📞 +7 (727) 123-45-67</p>
            <p>✉️ info@technomarket.kz</p>
          </div>
        </div>

        <!-- Catalog -->
        <div>
          <h4 class="text-white font-semibold mb-4">Каталог</h4>
          <ul class="space-y-2">
            <li v-for="link in links.catalog" :key="link.label">
              <RouterLink :to="link.to" class="text-sm hover:text-white transition-colors">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Info -->
        <div>
          <h4 class="text-white font-semibold mb-4">Информация</h4>
          <ul class="space-y-2">
            <li v-for="link in links.info" :key="link.label">
              <RouterLink :to="link.to" class="text-sm hover:text-white transition-colors">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h4 class="text-white font-semibold mb-4">Личный кабинет</h4>
          <ul class="space-y-2">
            <li v-for="link in links.account" :key="link.label">
              <RouterLink :to="link.to" class="text-sm hover:text-white transition-colors">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        © {{ currentYear }} ТехноМаркет. Все права защищены.
      </div>
    </div>
  </footer>
</template>
