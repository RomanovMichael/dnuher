<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto">
      <div class="card">
        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Загрузка данных пользователя...</p>
        </div>

        <div v-else-if="user" class="text-center">
          <div class="mb-6">
            <img
              :src="user.photo_200"
              :alt="user.first_name"
              class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100"
            />
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              {{ user.first_name }} {{ user.last_name }}
            </h1>
            <p class="text-gray-600">ID: {{ user.id }}</p>
            <p v-if="vkConfig" class="text-sm text-gray-500 mt-2">
              App ID: {{ vkConfig.app_id }} | Platform: {{ vkConfig.platform }}
            </p>
          </div>

          <button @click="congratulateFriend" class="btn-primary w-full">
            🎉 Поздравить друга
          </button>
        </div>

        <div v-else class="text-center py-8">
          <div class="text-red-500 mb-4">
            <svg
              class="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки
          </h2>
          <p class="text-gray-600">
            {{ error || "Не удалось загрузить данные пользователя" }}
          </p>
          <button @click="initVK" class="btn-primary mt-4">
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import bridge from "@vkontakte/vk-bridge";
import { useVKConfig } from "@/composables/useVKConfig";

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

onMounted(() => {
  initVK();
});
</script>
