export default class GameState {
  constructor() {
    this.record = null;
    this.level = null;
    this.userTurn = null;
    this.selectedCharacter = null;
    this.selectedCell = null;
    this.playerPositions = [];
    this.enemyPositions = [];
    this.playerCharacters = [];
    this.enemyCharacters = [];
  }

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
