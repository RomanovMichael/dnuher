import { ref, onMounted } from "vue";
import bridge from "@vkontakte/vk-bridge";

interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200: string;
  screen_name?: string;
}

export function useVK() {
  const user = ref<VKUser | null>(null);
  const loading = ref(true);
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

  return {
    user,
    loading,
    error,
    initVK,
    congratulateFriend,
  };
}
