import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackRadius = 2;
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
