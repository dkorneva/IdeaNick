declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ym: (id: number, method: string, ...args: unknown[]) => void
  }
}

export const trackEvent = (eventName: string): void => {
  if (window.ym) {
    window.ym(111802921, 'reachGoal', eventName)
  } else {
    console.warn('Yandex Metrika not loaded')
  }
}
