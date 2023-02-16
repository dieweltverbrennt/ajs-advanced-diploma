import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, type = 'swordsman') {
    super(level, type);
    this.attack = 40;
    this.defence = 10;
    this.moveDistance = 4;
    this.attackRadius = 1;
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
