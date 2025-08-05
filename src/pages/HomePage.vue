<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
  >
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <span class="text-white font-bold text-lg">VK</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">Mini App</h1>
              <p class="text-sm text-gray-500">День рождения друзей</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400">Сегодня</div>
            <div class="text-sm font-medium text-gray-900">
              {{ todayFormatted }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-md mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p class="mt-6 text-gray-600 font-medium">
            Загрузка данных пользователя...
          </p>
        </div>

        <!-- User Profile -->
        <div v-else-if="user" class="space-y-6">
          <!-- User Card -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div class="text-center">
              <div class="relative inline-block">
                <img
                  :src="user.photo_200"
                  :alt="user.first_name"
                  class="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <span class="text-white text-xs">✓</span>
                </div>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mt-4">
                {{ user.first_name }} {{ user.last_name }}
              </h2>
              <p class="text-gray-500 text-sm">ID: {{ user.id }}</p>
              <p v-if="vkConfig" class="text-xs text-gray-400 mt-2">
                App ID: {{ vkConfig.app_id }} | {{ vkConfig.platform }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              @click="congratulateFriend"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span class="flex items-center justify-center space-x-2">
                <span class="text-xl">🎉</span>
                <span>Поздравить друга</span>
              </span>
            </button>

            <button
              @click="getBirthdayFriends"
              :disabled="birthdayLoading"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span class="flex items-center justify-center space-x-2">
                <span
                  v-if="birthdayLoading"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                <span v-else class="text-xl">🎂</span>
                <span>{{
                  birthdayLoading ? "Поиск..." : "Найти именинников"
                }}</span>
              </span>
            </button>
          </div>

          <!-- Birthday Friends Results -->
          <div
            v-if="birthdayError"
            class="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
              >
                <span class="text-red-600 text-sm">⚠️</span>
              </div>
              <div>
                <h3 class="font-medium text-red-800">Ошибка</h3>
                <p class="text-sm text-red-600">{{ birthdayError }}</p>
              </div>
            </div>
          </div>

          <div
            v-if="birthdayFriends.length > 0"
            class="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
              >
                <span class="text-green-600 text-sm">🎂</span>
              </div>
              <div>
                <h3 class="font-medium text-green-800">Именинники сегодня</h3>
                <p class="text-sm text-green-600">
                  {{ birthdayFriends.length }}
                  {{
                    birthdayFriends.length === 1
                      ? "человек"
                      : birthdayFriends.length < 5
                      ? "человека"
                      : "человек"
                  }}
                </p>
              </div>
            </div>

            <!-- Friends List -->
            <div class="space-y-3">
              <div
                v-for="friend in birthdayFriends"
                :key="friend.id"
                class="bg-white rounded-lg p-3 flex items-center space-x-3 shadow-sm"
              >
                <img
                  :src="friend.photo_100"
                  :alt="friend.first_name"
                  class="w-12 h-12 rounded-full"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">
                    {{ friend.first_name }} {{ friend.last_name }}
                  </h4>
                  <p class="text-sm text-gray-500">Сегодня день рождения! 🎉</p>
                </div>
                <button
                  class="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <span class="text-blue-600 text-sm">💬</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="
              birthdayFriends.length === 0 && !birthdayLoading && !birthdayError
            "
            class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-gray-400 text-2xl">🎂</span>
            </div>
            <h3 class="font-medium text-gray-900 mb-2">Нет именинников</h3>
            <p class="text-sm text-gray-500">
              Сегодня у ваших друзей нет дней рождения
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
          <div
            class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span class="text-red-500 text-3xl">⚠️</span>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки
          </h2>
          <p class="text-gray-600 mb-6">
            {{ error || "Не удалось загрузить данные пользователя" }}
          </p>
          <button
            @click="initVK"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import bridge from "@vkontakte/vk-bridge";
import { useVKConfig } from "@/composables/useVKConfig";
import { useBirthdayFriends } from "@/composables/useBirthdayFriends";

interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200: string;
  screen_name?: string;
}

const user = ref<VKUser | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const { getVKParams, isVKEnvironment } = useVKConfig();
const vkConfig = ref<any>(null);

// Birthday friends composable
const {
  birthdayFriends,
  loading: birthdayLoading,
  error: birthdayError,
  fetchBirthdayFriends,
} = useBirthdayFriends();

// Форматированная дата
const todayFormatted = computed(() => {
  const today = new Date();
  return today.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
});

const initVK = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Получаем VK параметры
    vkConfig.value = getVKParams();
    console.log("VK Config:", vkConfig.value);

    // Проверяем, доступен ли VK Bridge
    if (typeof bridge !== "undefined" && bridge.send && isVKEnvironment()) {
      // Инициализация VK Bridge
      await bridge.send("VKWebAppInit");

      // Получение информации о пользователе
      const userInfo = await bridge.send("VKWebAppGetUserInfo");
      user.value = userInfo;
    } else {
      // Fallback для разработки
      console.log("VK Bridge недоступен, используем тестовые данные");
      user.value = {
        id: vkConfig.value?.user_id || 123456,
        first_name: "Тестовый",
        last_name: "Пользователь",
        photo_200:
          "https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=User",
        screen_name: "test_user",
      };
    }
  } catch (err) {
    console.error("Ошибка инициализации VK:", err);
    error.value = err instanceof Error ? err.message : "Неизвестная ошибка";

    // Fallback для разработки при ошибке
    if (!user.value) {
      user.value = {
        id: vkConfig.value?.user_id || 123456,
        first_name: "Тестовый",
        last_name: "Пользователь",
        photo_200:
          "https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=User",
        screen_name: "test_user",
      };
    }
  } finally {
    loading.value = false;
  }
};

const congratulateFriend = () => {
  // TODO: Реализовать логику поздравления друга
  alert("Функция поздравления друга будет реализована позже!");
};

const getBirthdayFriends = async () => {
  try {
    await fetchBirthdayFriends();
  } catch (err) {
    console.error("Ошибка получения друзей с днем рождения:", err);
  }
};

onMounted(() => {
  initVK();
});
</script>
