import { ref } from "vue";
import bridge from "@vkontakte/vk-bridge";

interface BirthdayFriend {
  id: number;
  first_name: string;
  last_name: string;
  photo_100: string;
  bdate?: string;
}

export function useBirthdayFriends() {
  const birthdayFriends = ref<BirthdayFriend[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getAuthToken = async (): Promise<string> => {
    try {
      const { access_token } = await bridge.send("VKWebAppGetAuthToken", {
        app_id: import.meta.env.VITE_VK_APP_ID || 54003773,
        scope: "friends",
      });
      return access_token;
    } catch (err) {
      console.error("Ошибка получения токена:", err);
      throw new Error("Не удалось получить токен доступа");
    }
  };

  const getBirthdayFriends = async (
    accessToken: string
  ): Promise<BirthdayFriend[]> => {
    try {
      const { response } = await bridge.send("VKWebAppCallAPIMethod", {
        method: "friends.get",
        params: {
          fields: "bdate,first_name,last_name,photo_100",
          order: "hints",
          access_token: accessToken,
          v: "5.199",
        },
      });

      const today = new Date();
      const todayStr = `${today.getDate()}.${today.getMonth() + 1}`;

      const withBdays = response.items.filter((friend: any) => {
        if (!friend.bdate) return false;
        const [day, month] = friend.bdate.split(".");
        return `${+day}.${+month}` === todayStr;
      });

      return withBdays;
    } catch (err) {
      console.error("Ошибка получения друзей:", err);
      throw new Error("Не удалось получить список друзей");
    }
  };

  const fetchBirthdayFriends = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Получаем токен доступа
      const accessToken = await getAuthToken();

      // Получаем друзей с днем рождения
      const friends = await getBirthdayFriends(accessToken);

      birthdayFriends.value = friends;

      console.log("Друзья с днем рождения сегодня:", friends);
    } catch (err) {
      console.error("Ошибка получения друзей с днем рождения:", err);
      error.value = err instanceof Error ? err.message : "Неизвестная ошибка";
    } finally {
      loading.value = false;
    }
  };

  return {
    birthdayFriends,
    loading,
    error,
    fetchBirthdayFriends,
  };
}
