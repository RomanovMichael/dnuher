import { defineStore } from "pinia";
import { ref } from "vue";
import bridge from "@vkontakte/vk-bridge";

interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200: string;
  screen_name?: string;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<VKUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const initVK = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Инициализация VK Bridge
      await bridge.send("VKWebAppInit");

      // Получение информации о пользователе
      const userInfo = await bridge.send("VKWebAppGetUserInfo");
      user.value = userInfo;
    } catch (err) {
      console.error("Ошибка инициализации VK:", err);
      error.value = err instanceof Error ? err.message : "Неизвестная ошибка";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetError = () => {
    error.value = null;
  };

  return {
    user,
    loading,
    error,
    initVK,
    resetError,
  };
});
