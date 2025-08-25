import { ref } from "vue";
import bridge from "@vkontakte/vk-bridge";

interface BirthdayFriend {
  id: number;
  first_name: string;
  last_name: string;
  photo_100: string;
  bdate?: string;
}

interface CachedFriends {
  friends: BirthdayFriend[];
  date: string;
  timestamp: number;
}

const CACHE_KEY = "vk_birthday_friends_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

export function useBirthdayFriends() {
  const birthdayFriends = ref<BirthdayFriend[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isFromCache = ref(false);

  // Функция для получения кэшированных друзей
  const getCachedFriends = (): CachedFriends | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedFriends = JSON.parse(cached);
      const now = Date.now();

      // Проверяем, не устарел ли кэш
      if (now - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Проверяем, совпадает ли дата
      const today = new Date().toDateString();
      if (parsed.date !== today) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsed;
    } catch (err) {
      console.error("Ошибка чтения кэша:", err);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  // Функция для сохранения друзей в кэш
  const saveToCache = (friends: BirthdayFriend[]) => {
    try {
      const cacheData: CachedFriends = {
        friends,
        date: new Date().toDateString(),
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log("Друзья сохранены в кэш:", cacheData);
    } catch (err) {
      console.error("Ошибка сохранения в кэш:", err);
    }
  };

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

      // Сначала проверяем кэш
      const cached = getCachedFriends();
      if (cached) {
        console.log("Используем кэшированных друзей:", cached.friends.length);
        birthdayFriends.value = cached.friends;
        isFromCache.value = true;
        return;
      }

      console.log("Кэш не найден или устарел, запрашиваем с VK API");

      // Получаем токен доступа
      const accessToken = await getAuthToken();

      // Получаем друзей с днем рождения
      const friends = await getBirthdayFriends(accessToken);

      // Сохраняем в кэш
      saveToCache(friends);

      birthdayFriends.value = friends;
      isFromCache.value = false;

      console.log("Друзья с днем рождения сегодня:", friends);
    } catch (err) {
      console.error("Ошибка получения друзей с днем рождения:", err);
      error.value = err instanceof Error ? err.message : "Неизвестная ошибка";
    } finally {
      loading.value = false;
    }
  };

  // Функция для принудительного обновления кэша
  const refreshCache = async () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      await fetchBirthdayFriends();
    } catch (err) {
      console.error("Ошибка обновления кэша:", err);
    }
  };

  return {
    birthdayFriends,
    loading,
    error,
    fetchBirthdayFriends,
    refreshCache,
    getCachedFriends,
    isFromCache,
  };
}
