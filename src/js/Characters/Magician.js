import Character from '../Character';

export default class Magician extends Character {
  constructor(level, type = 'magician') {
    super(level, type);
    this.attack = 10;
    this.defence = 40;
    this.moveDistance = 1;
    this.attackRadius = 4;
    if (level === 1) {
      this.level = level;
    } else if (level === 2) {
      this.level = 1;
      this.levelUp();
    } else if (level === 3) {
      this.level = 1;
      this.levelUp();
      this.levelUp();
    } else if (level === 4) {
      this.level = 1;
      this.levelUp();
      this.levelUp();
      this.levelUp();
    }
  }
}
