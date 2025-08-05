import { ref } from "vue";

interface VKConfig {
  app_id: number;
  user_id: number;
  access_token: string;
  group_id?: number;
  is_app_user: boolean;
  are_notifications_enabled: boolean;
  language: string;
  platform: string;
  version: string;
}

export function useVKConfig() {
  const config = ref<VKConfig | null>(null);

  const getVKParams = () => {
    // Получаем параметры из URL (для разработки)
    const urlParams = new URLSearchParams(window.location.search);

    // Для продакшена эти параметры приходят от VK
    const vkParams = {
      app_id: parseInt(urlParams.get("vk_app_id") || "0"),
      user_id: parseInt(urlParams.get("vk_user_id") || "0"),
      access_token: urlParams.get("vk_access_token") || "",
      group_id: urlParams.get("vk_group_id")
        ? parseInt(urlParams.get("vk_group_id")!)
        : undefined,
      is_app_user: urlParams.get("vk_is_app_user") === "1",
      are_notifications_enabled:
        urlParams.get("vk_are_notifications_enabled") === "1",
      language: urlParams.get("vk_language") || "ru",
      platform: urlParams.get("vk_platform") || "web",
      version: urlParams.get("vk_version") || "1.0",
    };

    config.value = vkParams;
    return vkParams;
  };

  const isVKEnvironment = () => {
    return (
      window.location.hostname.includes("vk.com") ||
      window.location.search.includes("vk_")
    );
  };

  return {
    config,
    getVKParams,
    isVKEnvironment,
  };
}
