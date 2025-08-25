<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
  >
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
          <div class="text-right">
            <div class="text-xs text-gray-400">Сегодня</div>
            <div class="text-sm font-medium text-gray-900">
              {{ todayFormatted }}
            </div>
          </div>
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
            <!-- Message Template Textarea -->
            <div
              class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900">
                  Шаблон поздравления
                </h3>
                <div class="flex items-center space-x-2">
                  <div
                    :class="
                      canSendMessages
                        ? 'w-3 h-3 bg-green-500 rounded-full'
                        : 'w-3 h-3 bg-red-500 rounded-full'
                    "
                  ></div>
                  <span
                    :class="
                      canSendMessages
                        ? 'text-green-600 text-sm'
                        : 'text-red-600 text-sm'
                    "
                  >
                    {{ canSendMessages ? "Доступно" : "Требует разрешения" }}
                  </span>
                </div>
              </div>

              <textarea
                v-model="messageTemplate"
                placeholder="Введите шаблон поздравления для друзей..."
                class="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
              <p class="text-xs text-gray-500 mt-2">
                Используйте {name} для подстановки имени друга
              </p>

              <!-- Warning about permissions -->
              <div
                v-if="!canSendMessages"
                class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-yellow-600">⚠️</span>
                  <span class="text-sm text-yellow-800">
                    Для отправки сообщений необходимо разрешить доступ к
                    сообщениям в настройках VK
                  </span>
                </div>
              </div>
            </div>

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

            <!-- Cache Refresh Button -->
            <button
              v-if="birthdayFriends.length > 0"
              @click="refreshBirthdayCache"
              :disabled="birthdayLoading"
              class="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span class="flex items-center justify-center space-x-2">
                <span class="text-xl">🔄</span>
                <span>Обновить данные</span>
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
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
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
              <!-- Cache indicator -->
              <div class="flex items-center space-x-2">
                <div
                  :class="
                    isFromCache
                      ? 'w-2 h-2 bg-blue-500 rounded-full'
                      : 'w-2 h-2 bg-green-500 rounded-full'
                  "
                ></div>
                <span
                  :class="
                    isFromCache
                      ? 'text-blue-600 text-xs'
                      : 'text-green-600 text-xs'
                  "
                >
                  {{ isFromCache ? "Кэш" : "API" }}
                </span>
              </div>

              <!-- Cache info -->
              <div
                v-if="isFromCache"
                class="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p class="text-xs text-blue-600 text-center">
                  Данные загружены из кэша для экономии запросов
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
                  @click="sendMessage(friend)"
                  :disabled="!messageTemplate.trim() || !canSendMessages"
                  class="w-8 h-8 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                  :title="
                    !canSendMessages
                      ? 'Нет прав на отправку сообщений'
                      : !messageTemplate.trim()
                      ? 'Сначала введите шаблон сообщения'
                      : 'Отправить поздравление'
                  "
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
const messageTemplate = ref(
  "С днем рождения, {name}! 🎉 Желаю тебе всего самого лучшего!"
);
const canSendMessages = ref(false);
const { getVKParams, isVKEnvironment } = useVKConfig();
const vkConfig = ref<any>(null);

// Birthday friends composable
const {
  birthdayFriends,
  loading: birthdayLoading,
  error: birthdayError,
  fetchBirthdayFriends,
  refreshCache,
  isFromCache,
  getCachedFriends,
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

      // Проверяем права на отправку сообщений
      try {
        const tokenResponse = await bridge.send("VKWebAppGetAuthToken", {
          app_id:
            vkConfig.value?.app_id ||
            import.meta.env.VITE_VK_APP_ID ||
            54003773,
          scope: "messages",
        });
        canSendMessages.value = !!tokenResponse.access_token;
        console.log("Права на отправку сообщений:", canSendMessages.value);
      } catch (err) {
        console.log("Нет прав на отправку сообщений:", err);
        canSendMessages.value = false;
      }
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

const sendMessage = async (friend: any) => {
  if (!messageTemplate.value.trim()) {
    alert("Сначала введите шаблон сообщения!");
    return;
  }

  try {
    // Проверяем, доступен ли VK Bridge
    if (typeof bridge === "undefined" || !bridge.send) {
      throw new Error("VK Bridge недоступен");
    }

    // Получаем токен доступа для отправки сообщений
    const tokenResponse = await bridge.send("VKWebAppGetAuthToken", {
      app_id: import.meta.env.VITE_VK_APP_ID || 54003773,
      scope: "messages",
    });

    if (!tokenResponse.access_token) {
      throw new Error("Не удалось получить токен доступа");
    }

    // Формируем сообщение, заменяя {name} на имя друга
    const message = messageTemplate.value.replace(/{name}/g, friend.first_name);

    console.log("Отправляем сообщение:", {
      user_id: friend.id,
      message: message,
      access_token: tokenResponse.access_token ? "получен" : "отсутствует",
    });

    // Отправляем сообщение через VK API
    const result = await bridge.send("VKWebAppCallAPIMethod", {
      method: "messages.send",
      params: {
        user_id: friend.id,
        message: message,
        random_id: Math.random().toString(36).substring(7),
        access_token: tokenResponse.access_token,
        v: "5.199",
      },
    });

    console.log("Результат отправки:", result);

    if (result.response) {
      alert(`Поздравление отправлено ${friend.first_name}! 🎉`);
    } else {
      throw new Error("Неожиданный ответ от VK API");
    }
  } catch (err: any) {
    console.error("Детальная ошибка отправки сообщения:", err);

    let errorMessage = "Не удалось отправить сообщение";

    if (err.payload) {
      console.log("Payload ошибки:", err.payload);
      if (err.payload[1] && err.payload[1][0]) {
        errorMessage = `Ошибка VK: ${err.payload[1][0]}`;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    // Проверяем специфичные ошибки VK
    if (err.payload && err.payload[0] === "8") {
      errorMessage =
        "Недостаточно прав для отправки сообщений. Проверьте настройки приложения.";
    } else if (err.payload && err.payload[0] === "1") {
      errorMessage = "Пользователь заблокировал сообщения от приложений.";
    } else if (err.payload && err.payload[0] === "7") {
      errorMessage = "Пользователь не найден или недоступен.";
    }

    alert(`${errorMessage}\n\nПопробуйте позже или проверьте настройки VK.`);
  }
};

const getBirthdayFriends = async () => {
  try {
    await fetchBirthdayFriends();
  } catch (err) {
    console.error("Ошибка получения друзей с днем рождения:", err);
  }
};

const refreshBirthdayCache = async () => {
  try {
    await refreshCache();
    alert("Кэш обновлен!");
  } catch (err) {
    console.error("Ошибка обновления кэша:", err);
    alert("Не удалось обновить кэш. Попробуйте позже.");
  }
};

onMounted(() => {
  initVK();

  // Автоматически загружаем кэшированных друзей, если они есть
  const cached = getCachedFriends();
  if (cached) {
    console.log("Автоматически загружаем кэшированных друзей");
    birthdayFriends.value = cached.friends;
    isFromCache.value = true;
  }
});
</script>
