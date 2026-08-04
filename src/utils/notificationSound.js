/**
 * notificationSound.js
 * Generates a soft two-tone notification chime using the Web Audio API.
 * No external audio files required.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Plays a soft notification chime (two descending tones).
 * Safe to call repeatedly — each call creates its own graph.
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const tones = [
      { freq: 880, startTime: now,        duration: 0.15 },
      { freq: 660, startTime: now + 0.18, duration: 0.2  },
    ];

    tones.forEach(({ freq, startTime, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type      = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);

      // Fade in → fade out
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.01);
    });
  } catch (err) {
    // Non-critical — silently ignore if audio not supported
    console.warn('Notification sound error:', err.message);
  }
};
