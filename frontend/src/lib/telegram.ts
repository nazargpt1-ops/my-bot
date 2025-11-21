import { TelegramWebApp } from '@/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export class TelegramService {
  private webApp: TelegramWebApp | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.webApp.ready();
      this.webApp.expand();
    }
  }

  get telegramUser() {
    return this.webApp?.initDataUnsafe?.user;
  }

  get initData() {
    return this.webApp?.initData;
  }

  get isAvailable(): boolean {
    return this.webApp !== null;
  }

  // UI Controls
  showMainButton(text: string, callback: () => void) {
    if (this.webApp) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.show();
      this.webApp.MainButton.onClick(callback);
    }
  }

  hideMainButton(callback?: () => void) {
    if (this.webApp) {
      if (callback) {
        this.webApp.MainButton.offClick(callback);
      }
      this.webApp.MainButton.hide();
    }
  }

  enableMainButton() {
    if (this.webApp) {
      this.webApp.MainButton.enable();
    }
  }

  disableMainButton() {
    if (this.webApp) {
      this.webApp.MainButton.disable();
    }
  }

  showMainButtonProgress() {
    if (this.webApp) {
      this.webApp.MainButton.showProgress();
    }
  }

  hideMainButtonProgress() {
    if (this.webApp) {
      this.webApp.MainButton.hideProgress();
    }
  }

  showBackButton(callback: () => void) {
    if (this.webApp) {
      this.webApp.BackButton.onClick(callback);
      this.webApp.BackButton.show();
    }
  }

  hideBackButton(callback?: () => void) {
    if (this.webApp) {
      if (callback) {
        this.webApp.BackButton.offClick(callback);
      }
      this.webApp.BackButton.hide();
    }
  }

  closeWebApp() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Utility methods
  vibrate(pattern: 'light' | 'medium' | 'heavy' | number[]) {
    if (this.webApp) {
      if (pattern === 'light') {
        this.webApp.HapticFeedback.impactOccurred('light');
      } else if (pattern === 'medium') {
        this.webApp.HapticFeedback.impactOccurred('medium');
      } else if (pattern === 'heavy') {
        this.webApp.HapticFeedback.impactOccurred('heavy');
      } else if (Array.isArray(pattern)) {
        this.webApp.HapticFeedback.notificationOccurred(pattern as any);
      }
    }
  }

  showAlert(message: string) {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(window.confirm(message));
      }
    });
  }
}

export const telegramService = new TelegramService();