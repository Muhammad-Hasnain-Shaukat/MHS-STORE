// =============================================================================
// MHS STORE - KUCHU PUCHU "PRETTY LITTLE BABY" AUDIO ENGINE
// Plays Connie Francis - "Pretty Little Baby" with Smooth Fade-in & Fade-out
// =============================================================================

export class KuchuMusicBox {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.fadeInterval = null;
    this.targetVolume = 0.5; // Clear, joyful, balanced volume
    this.audioSrc = 'audio/pretty-little-baby.mp3';

    this.initAudio();
  }

  initAudio() {
    if (this.audio) return;

    this.audio = new Audio(this.audioSrc);
    this.audio.preload = 'auto';
    this.audio.loop = true;
    this.audio.volume = 0;
  }

  playSweetSong() {
    this.initAudio();
    if (!this.audio) return;

    this.isPlaying = true;
    clearInterval(this.fadeInterval);

    // Reset to start if needed
    if (this.audio.paused) {
      this.audio.volume = 0;
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.fadeIn(0.8);
        }).catch((err) => {
          // Autoplay blocked by browser policy until user gesture
          const resumeOnGesture = () => {
            if (this.isPlaying && this.audio) {
              this.audio.play().then(() => this.fadeIn(0.8)).catch(() => {});
            }
            window.removeEventListener('click', resumeOnGesture);
            window.removeEventListener('touchstart', resumeOnGesture);
            window.removeEventListener('scroll', resumeOnGesture);
          };
          window.addEventListener('click', resumeOnGesture, { once: true, passive: true });
          window.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true });
          window.addEventListener('scroll', resumeOnGesture, { once: true, passive: true });
        });
      }
    } else {
      this.fadeIn(0.8);
    }
  }

  fadeIn(durationSec = 0.8) {
    if (!this.audio) return;
    clearInterval(this.fadeInterval);

    const stepMs = 50;
    const totalSteps = (durationSec * 1000) / stepMs;
    const volumeStep = this.targetVolume / totalSteps;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        clearInterval(this.fadeInterval);
        return;
      }
      if (this.audio.volume + volumeStep < this.targetVolume) {
        this.audio.volume += volumeStep;
      } else {
        this.audio.volume = this.targetVolume;
        clearInterval(this.fadeInterval);
      }
    }, stepMs);
  }

  stop(durationSec = 0.6) {
    this.isPlaying = false;
    if (!this.audio || this.audio.paused) return;

    clearInterval(this.fadeInterval);

    const stepMs = 50;
    const totalSteps = (durationSec * 1000) / stepMs;
    const volumeStep = this.audio.volume / totalSteps;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        clearInterval(this.fadeInterval);
        return;
      }
      if (this.audio.volume - volumeStep > 0.02) {
        this.audio.volume -= volumeStep;
      } else {
        this.audio.volume = 0;
        this.audio.pause();
        this.audio.currentTime = 0;
        clearInterval(this.fadeInterval);
      }
    }, stepMs);
  }
}
