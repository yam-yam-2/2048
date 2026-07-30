class HapticsController {
  private _enabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('2048_haptics');
      if (stored !== null) {
        this._enabled = stored === 'true';
      }
    } catch {
      this._enabled = true;
    }
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(val: boolean) {
    this._enabled = val;
    try {
      localStorage.setItem('2048_haptics', val.toString());
    } catch {
      // LocalStorage error fallback
    }
  }

  vibrateMove() {
    if (!this._enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(10);
    } catch {
      // Ignore
    }
  }

  vibrateMerge() {
    if (!this._enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(25);
    } catch {
      // Ignore
    }
  }

  vibrateMilestone() {
    if (!this._enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([40, 60, 40, 60, 80]);
    } catch {
      // Ignore
    }
  }

  vibrateGameOver() {
    if (!this._enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([30, 40, 30]);
    } catch {
      // Ignore
    }
  }
}

export const haptics = new HapticsController();
