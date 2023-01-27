import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerAllowedTypes = [new Bowman(), new Swordsman(), new Magician()];
    this.enemyAllowedTypes = [new Daemon(), new Undead(), new Vampire()];
    this.playerTeam = null;
    this.enemyTeam = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi('prairie');
    this.playerCharacters = generateTeam(this.playerAllowedTypes, 1, 3);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, 1, 3);
    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.gamePlay.redrawPositions([...this.playerPosition(), ...this.enemyPosition()]);
  }

  playerPosition() {
    const size = this.gamePlay.boardSize;
    const avialiblePositions = [];
    for (let i = 0; i < size * size - 1; i += size) {
      avialiblePositions.push(i);
    }
    for (let i = 1; i < size * size - 1; i += size) {
      avialiblePositions.push(i);
    }
    // console.log(avialiblePositions);
    const positions = [];
    for (const char of this.playerTeam.members) {
      const random = Math.floor(Math.random() * avialiblePositions.length);
      const choosedPosition = avialiblePositions[random];
      avialiblePositions.splice(random, 1);
      positions.push(new PositionedCharacter(char, choosedPosition));
    }
    return positions;
  }

  enemyPosition() {
    const size = this.gamePlay.boardSize;
    const avialiblePositions = [];
    for (let i = size * size - 1; i > 0; i -= size) {
      avialiblePositions.push(i);
    }
    for (let i = size * size - 2; i > 0; i -= size) {
      avialiblePositions.push(i);
    }
    // console.log(avialiblePositions);
    const positions = [];
    for (const char of this.enemyTeam.members) {
      const random = Math.floor(Math.random() * avialiblePositions.length);
      const choosedPosition = avialiblePositions[random];
      avialiblePositions.splice(random, 1);
      positions.push(new PositionedCharacter(char, choosedPosition));
    }
    return positions;
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
