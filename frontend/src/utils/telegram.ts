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
        disableVerticalSwipes: () => void;
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

export const haptic = {
  impact() {
    try {
      telegram.HapticFeedback.impactOccurred('light');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  medium() {
    try {
      telegram.HapticFeedback.impactOccurred('medium');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  heavy() {
    try {
      telegram.HapticFeedback.impactOccurred('heavy');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  success() {
    try {
      telegram.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  error() {
    try {
      telegram.HapticFeedback.notificationOccurred('error');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

  warning() {
    try {
      telegram.HapticFeedback.notificationOccurred('warning');
    } catch (error) {
      console.error('Haptic feedback not supported:', error);
    }
  },

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

const customInsets: SafeAreaInsets = {
  top: { value: 0, unit: 'px' },
  right: { value: 0, unit: 'px' },
  bottom: { value: 0, unit: 'px' },
  left: { value: 0, unit: 'px' }
};

export const getSafeAreaInsets = (overrides: SafeAreaInsets = {}) => {
  const insets = {
    top: overrides.top ?? customInsets.top,
    right: overrides.right ?? customInsets.right,
    bottom: overrides.bottom ?? customInsets.bottom,
    left: overrides.left ?? customInsets.left
  };

  return insets;
};

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

export const disableSwipes = () => {
  if (telegram.disableVerticalSwipes) {
    telegram.disableVerticalSwipes();
  }
};