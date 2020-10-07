export class AudioManager extends Audio {
  constructor(sound) {
    super(sound);
    this._sound = new Audio(sound);
  }

  play() {
    this._sound.play().finally();
  }

  stop() {
    this._sound.pause();
  }
}
