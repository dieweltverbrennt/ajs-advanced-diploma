import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import { generateTeam } from './generators';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerAllowedTypes = [new Bowman(), new Swordsman(), new Magician()];
    this.enemyAllowedTypes = [new Daemon(), new Undead(), new Vampire()];
    this.playerTeam = null;
    this.enemyTeam = null;
    this.selectedCharacter = null;
    this.selectedCell = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi('prairie');
    this.playerCharacters = generateTeam(this.playerAllowedTypes, 1, 3);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, 1, 3);
    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.playerPositions = [...this.playerPosition()];
    this.enemyPositions = [...this.enemyPosition()];
    this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(this.charactersPositions);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
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
    const current = this.playerPositions.find((item) => item.position === index);
    if (current !== undefined) {
      if (this.selectedCharacter !== null) {
        this.gamePlay.deselectCell(this.selectedCharacter.position);
      }
      this.gamePlay.selectCell(index, 'yellow');
      this.selectedCharacter = current;
    } else {
      GamePlay.showError('The character is not selected!');
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.selectedCell !== null) {
      this.gamePlay.deselectCell(this.selectedCell);
    }

    if (this.selectedCharacter !== null) {
      // move
      if (this.gamePlay.cells[index].firstChild === null) {
        // если допустимый ход
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
        this.selectedCell = index;
        // if you can`t - notallowed ans error
      }
      // attack
      if (this.enemyPositions.find((item) => item.position === index)) {
        // если допустимый ход
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
        this.selectedCell = index;
        // if you can`t - notallowed ans error
      }
    }

    const current = this.charactersPositions.find((item) => item.position === index);
    if (current !== undefined) {
      const characterInfo = `\u{1F396}${current.character.level}\u{2694}${current.character.attack}\u{1F6E1}${current.character.defence}\u{2764}${current.character.health}`;
      this.gamePlay.showCellTooltip(characterInfo, index);
      if (this.playerPositions.find((item) => item.position === index)) {
        this.gamePlay.setCursor(cursors.pointer);
      }
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }
}
