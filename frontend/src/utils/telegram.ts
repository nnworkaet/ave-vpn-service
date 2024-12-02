declare global {
  interface Window {
    Telegram: {
      WebApp: {
        requestFullscreen: () => void;
        setHeaderColor: (color: string) => void;
        ready: () => void;
        expand: () => void;
        platform: string;
        isExpanded: boolean;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        contentSafeAreaInset: {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export const telegram = window.Telegram.WebApp;

// Функции для тактильной обратной связи
export const haptic = {
  // Легкая вибрация для обычных нажатий
  impact() {
    try {
      telegram.HapticFeedback.impactOccurred('light');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Средняя вибрация для важных действий
  medium() {
    try {
      telegram.HapticFeedback.impactOccurred('medium');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Сильная вибрация для критических действий
  heavy() {
    try {
      telegram.HapticFeedback.impactOccurred('heavy');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Вибрация для успешных действий
  success() {
    try {
      telegram.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Вибрация для ошибок
  error() {
    try {
      telegram.HapticFeedback.notificationOccurred('error');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Вибрация для предупреждений
  warning() {
    try {
      telegram.HapticFeedback.notificationOccurred('warning');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  // Вибрация при выборе элемента
  selection() {
    try {
      telegram.HapticFeedback.selectionChanged();
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  }
};

interface SafeAreaValue {
  value: number;
  unit: 'px' | 'vh' | 'vw';
}

interface SafeAreaInsets {
  top?: SafeAreaValue;
  right?: SafeAreaValue;
  bottom?: SafeAreaValue;
  left?: SafeAreaValue;
}

// Пользовательские отступы по умолчанию
const customInsets: SafeAreaInsets = {
  top: { value: 0, unit: 'px' },
  right: { value: 0, unit: 'px' },
  bottom: { value: 0, unit: 'px' },
  left: { value: 0, unit: 'px' }
};

// Получаем безопасную зону с возможностью переопределения
export const getSafeAreaInsets = (overrides: SafeAreaInsets = {}) => {
  const insets = {
    top: overrides.top ?? customInsets.top,
    right: overrides.right ?? customInsets.right,
    bottom: overrides.bottom ?? customInsets.bottom,
    left: overrides.left ?? customInsets.left
  };

  return insets;
};

// Проверка, является ли устройство мобильным
export const isMobileDevice = () => {
  const platform = telegram.platform || '';
  return platform === 'android' || platform === 'ios';
};

export const requestFullscreen = () => {
  if (isMobileDevice()) {
    try {
      telegram.requestFullscreen();
      telegram.setHeaderColor('#2a2a2a');
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  }
};

export const initTelegram = () => {
  telegram.ready();
  if (isMobileDevice()) {
    telegram.expand();
  }
};
