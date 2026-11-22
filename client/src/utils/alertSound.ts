let audioContext: AudioContext | null = null;

const beep = (context: AudioContext, startAt: number, frequency: number) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.15, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.25);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + 0.3);
};

export const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  if (audioContext && audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
};

// * Auto-unlock AudioContext on the first user interaction anywhere on the page
if (typeof window !== "undefined") {
  const unlock = () => {
    getAudioContext();
  };
  window.addEventListener("click", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
}

export const playAlertSound = () => {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  beep(context, now, 880);
  beep(context, now + 0.3, 1175);
};

// * Browsers only allow sound after a click, so this runs from the "Sound alerts" button (and plays a test beep)
export const enableAlertSound = async () => {
  const context = getAudioContext();
  if (!context) throw new Error("AudioContext not supported");
  if (context.state === "suspended") await context.resume();
  playAlertSound();
};
