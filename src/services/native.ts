import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';

/**
 * Returns true if running inside a native Capacitor app container (e.g. Android APK)
 */
export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Determines whether the device is low-memory or low-concurrency
 * (e.g., Samsung Galaxy A02 / A2 Core with 1GB RAM or <= 4 cores)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (typeof memory === 'number' && memory <= 1) return true;
  if (typeof cores === 'number' && cores <= 4) return true;
  return false;
}

/**
 * Initialize Capacitor native plugins (StatusBar, SplashScreen)
 */
export async function initNativeApp(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    // Status bar: Dark green (#0E3B2E) with light text/icons
    await StatusBar.setBackgroundColor({ color: '#0E3B2E' });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (err) {
    console.warn('StatusBar init warning:', err);
  }

  try {
    // Hide native splash screen once DOM has mounted
    await SplashScreen.hide();
  } catch (err) {
    console.warn('SplashScreen hide warning:', err);
  }
}

/**
 * Share draw link using Capacitor Share, navigator.share, or clipboard copy fallback
 */
export async function shareDrawLink(options: {
  title: string;
  text?: string;
  url: string;
  dialogTitle?: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  // 1. Try Capacitor native share (if inside APK)
  if (isNativePlatform()) {
    try {
      await Share.share({
        title: options.title,
        text: options.text || options.title,
        url: options.url,
        dialogTitle: options.dialogTitle || options.title,
      });
      return 'shared';
    } catch (e: any) {
      if (e?.message !== 'Share canceled') {
        console.warn('Capacitor Share failed, falling back:', e);
      } else {
        return 'shared';
      }
    }
  }

  // 2. Try Web Share API (mobile browsers)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text || options.title,
        url: options.url,
      });
      return 'shared';
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Web Share failed, falling back:', e);
      } else {
        return 'shared';
      }
    }
  }

  // 3. Fallback: Copy link to clipboard
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(options.url);
      return 'copied';
    }
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = options.url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return 'copied';
  }

  return 'failed';
}

/**
 * Register Android hardware back button handler
 */
export function registerBackButtonHandler(onBack: () => boolean | void) {
  if (!isNativePlatform()) return () => {};

  const listenerHandlePromise = CapApp.addListener('backButton', () => {
    onBack();
  });

  return () => {
    listenerHandlePromise.then(handle => handle.remove()).catch(() => {});
  };
}

/**
 * Exit the native app
 */
export async function exitNativeApp() {
  if (isNativePlatform()) {
    await CapApp.exitApp();
  }
}
