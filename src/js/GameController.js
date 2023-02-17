import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import { generateTeam } from './generators';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import cursors from './cursors';
import themes from './themes';

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
    this.userTurn = true;
    this.level = 1;
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.level]);
    this.playerCharacters = generateTeam(this.playerAllowedTypes, this.level, 3);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, this.level, 3);
    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.playerPositions = [...this.playerPosition()];
    this.enemyPositions = [...this.enemyPosition()];
    this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(this.charactersPositions);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
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
    if (this.userTurn === true) {
      const current = this.playerPositions.find((item) => item.position === index);
      if (current !== undefined) {
        if (this.selectedCharacter !== null) {
          this.gamePlay.deselectCell(this.selectedCharacter.position);
        }
        this.gamePlay.selectCell(index, 'yellow');
        this.selectedCharacter = current;
      } else if (this.selectedCharacter !== null) {
        const enemy = this.enemyPositions.find((item) => item.position === index);
        // attack
        if (enemy !== undefined && this.calcAttackRange(this.selectedCharacter).includes(index)) {
          const damage = this.calcDamage(this.selectedCharacter.character, enemy.character);
          this.gamePlay.showDamage(index, damage).then(() => {
            enemy.character.health -= damage;
            if (enemy.character.health <= 0) {
              enemy.character.health = 0;
              this.charactersPositions = this.charactersPositions.filter((item) => item !== enemy);
              this.enemyPositions = this.enemyPositions.filter((item) => item !== enemy);
            }
          }).then(() => {
            if (this.level === 4 && this.enemyPositions.length === 0) {
              this.gameEnd();
              GamePlay.showMessage('You win!');
            } else if (this.enemyPositions.length === 0) {
              this.levelUp();
            } else {
              this.gamePlay.redrawPositions(this.charactersPositions);
            }
          }).then(() => {
            this.userTurn = false;
            this.enemyMove();
          });
        } else if (this.calcMoveRange(this.selectedCharacter).includes(index)) {
          this.gamePlay.deselectCell(this.selectedCharacter.position);
          this.selectedCharacter.position = index;
          this.selectedCell = null;
          this.gamePlay.redrawPositions(this.charactersPositions);
          this.gamePlay.selectCell(index, 'yellow');
          this.userTurn = false;
          this.enemyMove();
        } else {
          GamePlay.showError('The action is not unacceptable!');
        }
      } else {
        GamePlay.showError('The character is not selected!');
      }
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
        if (this.calcMoveRange(this.selectedCharacter).includes(index)) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
          this.selectedCell = index;
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
      // attack
      if (this.enemyPositions.find((item) => item.position === index)) {
        if (this.calcAttackRange(this.selectedCharacter).includes(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
          this.selectedCell = index;
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }

    const current = this.charactersPositions.find((item) => item.position === index);
    if (current !== undefined) {
      const characterInfo = `\u{1F396}${current.character.level}\u{2694}${Math.floor(current.character.attack)}\u{1F6E1}${Math.floor(current.character.defence)}\u{2764}${Math.floor(current.character.health)}`;
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

  // calculate allowed moves
  calcMoveRange(char) {
    const charMove = char.character.moveDistance;
    const charPosition = char.position;
    const size = this.gamePlay.boardSize;

    const allowedMoves = [];
    const leftBorder = [];
    const rightBorder = [];

    for (let i = 0; i < size * size; i += 1) {
      if (i % size === 0) {
        leftBorder.push(i);
      }
      if ((size * size - 1 - i) % size === 0) {
        rightBorder.push(i);
      }
    }

    for (let i = 1; i <= charMove; i += 1) {
      allowedMoves.push(charPosition + (size * i));
      allowedMoves.push(charPosition - (size * i));
    }

    for (let i = 1; i <= charMove; i += 1) {
      if (leftBorder.includes(charPosition)) {
        break;
      }
      allowedMoves.push(charPosition - i);
      allowedMoves.push(charPosition - (size * i + i));
      allowedMoves.push(charPosition + (size * i - i));
      if (leftBorder.includes(charPosition - i)) {
        break;
      }
    }

    for (let i = 1; i <= charMove; i += 1) {
      if (rightBorder.includes(charPosition)) {
        break;
      }
      allowedMoves.push(charPosition + i);
      allowedMoves.push(charPosition - (size * i - i));
      allowedMoves.push(charPosition + (size * i + i));
      if (rightBorder.includes(charPosition + i)) {
        break;
      }
    }
    const restPositions = this.charactersPositions.filter((item) => item !== char);
    for (const pos of restPositions) {
      const toDel = allowedMoves.indexOf(pos.position);
      if (toDel !== -1) {
        allowedMoves.splice(toDel, 1);
      }
    }
    return allowedMoves.filter((item) => item >= 0 && item < size * size);
  }

  // calculate allowed attack radius
  calcAttackRange(char) {
    const charPosition = char.position;
    const charRadius = char.character.attackRadius;
    const size = this.gamePlay.boardSize;
    const allowedRadius = [];
    const leftBorder = [];
    const rightBorder = [];

    for (let i = 0; i < size * size; i += 1) {
      if (i % size === 0) {
        leftBorder.push(i);
      }
      if ((size * size - 1 - i) % size === 0) {
        rightBorder.push(i);
      }
    }

    const step = charRadius * size;
    for (let i = charPosition - step; i <= charPosition + step; i += size) {
      if (i >= 0 && i < size * size) {
        allowedRadius.push(i);
        for (let j = 1; j <= charRadius; j += 1) {
          if (rightBorder.includes(i)) {
            break;
          }
          allowedRadius.push(i + j);
          if (rightBorder.includes(i + j)) {
            break;
          }
        }
        for (let j = 1; j <= charRadius; j += 1) {
          if (leftBorder.includes(i)) {
            break;
          }
          allowedRadius.push(i - j);
          if (leftBorder.includes(i - j)) {
            break;
          }
        }
      }
    }
    return allowedRadius.filter((item) => item !== charPosition);
  }

  playerMove(index) {
    this.selectedCharacter.position = index;
    this.gamePlay.redrawPositions(this.charactersPositions);
  }

  calcDamage(attacker, target) {
    return Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
  }

  enemyMove() {
    if (this.userTurn === false) {
      let isMoveDone = false;
      for (const enemy of this.enemyPositions) {
        const arr = this.calcAttackRange(enemy);
        const target = this.playerPositions.find((item) => arr.some((el) => el === item.position));
        if (target !== undefined) {
          const damage = this.calcDamage(enemy.character, target.character);
          this.gamePlay.showDamage(target.position, damage).then(() => {
            target.character.health -= damage;
            if (target.character.health <= 0) {
              this.charactersPositions = this.charactersPositions.filter((item) => item !== target);
              this.playerPositions = this.playerPositions.filter((item) => item !== target);
              this.gamePlay.deselectCell(target.position);
              this.gamePlay.deselectCell(this.selectedCell);
              this.selectedCell = null;
              this.selectedCharacter = null;
            }
          }).then(() => {
            this.gamePlay.redrawPositions(this.charactersPositions);
            if (this.playerPositions.length === 0) {
              this.gameEnd();
              GamePlay.showMessage('You lose!');
            }
          });
          isMoveDone = true;
          break;
        }
      }
      if (isMoveDone === false) {
        let current = this.enemyPositions.find((item) => item.character.type === 'daemon');
        if (current === undefined) {
          current = this.enemyPositions.find((item) => item.character.type === 'vampire');
          if (current === undefined) {
            current = this.enemyPositions[Math.floor(Math.random() * this.enemyPositions.length)];
          }
        }
        const moveRange = this.calcMoveRange(current);
        moveRange.sort();
        current.position = moveRange[Math.floor(Math.random() * current.character.moveDistance)];

        this.gamePlay.redrawPositions(this.charactersPositions);
      }
      this.userTurn = true;
    }
  }

  levelUp() {
    this.level += 1;
    this.playerCharacters.forEach((item) => {
      if (item.health < 0) {
        item.health = 0;
      }
      item.levelUp();
    });
    this.gamePlay.drawUi(themes[this.level]);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, this.level, 3);
    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.playerPositions = [...this.playerPosition()];
    this.enemyPositions = [...this.enemyPosition()];
    this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(this.charactersPositions);
  }

  gameEnd() {
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellLeaveListeners = [];
  }

  onNewGameClick() {
    this.gameState.record = this.level;
    this.playerTeam = null;
    this.enemyTeam = null;
    this.selectedCharacter = null;
    this.selectedCell = null;
    this.userTurn = true;
    this.level = 1;

    this.gamePlay.drawUi(themes[this.level]);
    this.playerCharacters = generateTeam(this.playerAllowedTypes, this.level, 3);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, this.level, 3);
    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.playerPositions = [...this.playerPosition()];
    this.enemyPositions = [...this.enemyPosition()];
    this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(this.charactersPositions);
  }

  onSaveGameClick() {
    this.gameState.record = this.level;
    this.gameState.level = this.level;
    this.gameState.userTurn = this.userTurn;
    this.gameState.selectedCharacter = this.selectedCharacter;
    this.gameState.selectedCell = this.selectedCell;
    this.gameState.playerCharacters = [];
    this.playerCharacters.forEach((item) => {
      this.gameState.playerCharacters.push(Object.getPrototypeOf(item));
    });
    this.gameState.enemyCharacters = [];
    this.enemyCharacters.forEach((item) => {
      this.gameState.enemyCharacters.push(Object.getPrototypeOf(item));
    });
    this.gameState.playerPositions = [];
    this.playerPositions.forEach((item) => {
      this.gameState.playerPositions.push(item.position);
    });
    this.gameState.enemyPositions = [];
    this.enemyPositions.forEach((item) => {
      this.gameState.enemyPositions.push(item.position);
    });

    this.stateService.save(GameState.from(this.gameState));
    GamePlay.showMessage('Game saving...');
  }

  onLoadGameClick() {
    const load = this.stateService.load();
    if (!load) {
      GamePlay.showError('Failed to load game');
    } else {
      this.level = load.level;
      this.userTurn = load.userTurn;
      this.selectedCharacter = load.selectedCharacter;
      this.selectedCell = load.selectedCell;

      this.playerCharacters = [];
      load.playerCharacters.forEach((item) => {
        if (item.type === 'swordsman') {
          const char = new Swordsman(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.playerCharacters.push(char);
        } else if (item.type === 'bowman') {
          const char = new Bowman(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.playerCharacters.push(char);
        } else if (item.type === 'magician') {
          const char = new Magician(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.playerCharacters.push(char);
        }
      });
      this.enemyCharacters = [];
      load.enemyCharacters.forEach((item) => {
        if (item.type === 'daemon') {
          const char = new Daemon(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.enemyCharacters.push(char);
        } else if (item.type === 'undead') {
          const char = new Undead(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.enemyCharacters.push(char);
        } else if (item.type === 'vampire') {
          const char = new Vampire(item.level);
          char.attack = item.attack;
          char.defence = item.defence;
          char.health = item.health;
          this.enemyCharacters.push(char);
        }
      });
      this.playerTeam = new Team(this.playerCharacters);
      this.enemyTeam = new Team(this.enemyCharacters);
      this.playerPositions = [];
      for (let i = 0; i < load.playerPositions.length; i += 1) {
        const pos = new PositionedCharacter(this.playerCharacters[i], load.playerPositions[i]);
        this.playerPositions.push(pos);
      }
      this.enemyPositions = [];
      for (let i = 0; i < load.enemyPositions.length; i += 1) {
        const pos = new PositionedCharacter(this.enemyCharacters[i], load.enemyPositions[i]);
        this.enemyPositions.push(pos);
      }
      this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
      this.gamePlay.drawUi(themes[this.level]);
      this.gamePlay.redrawPositions(this.charactersPositions);
    }
  }
}
