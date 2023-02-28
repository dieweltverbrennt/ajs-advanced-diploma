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
          this.gamePlay.showDamage(index, Math.round(damage * 100) / 100).then(() => {
            enemy.character.health -= damage;
            if (enemy.character.health <= 0) {
              enemy.character.health = 0;
              this.enemyCharacters = this.enemyCharacters.filter((i) => i.health !== 0);
              this.enemyPositions = this.enemyPositions.filter((i) => i.character.health !== 0);
              this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
            }
          }).then(() => {
            if (this.level === 4 && this.enemyPositions.length === 0) {
              this.gamePlay.redrawPositions(this.charactersPositions);
              this.gamePlay.deselectCell(enemy.position);
              this.gameEnd();
              this.isGameEnd = true;
              setTimeout(() => GamePlay.showMessage('You win!'), 500);
            } else if (this.enemyPositions.length === 0) {
              this.levelUp();
            } else {
              this.gamePlay.redrawPositions(this.charactersPositions);
              this.userTurn = false;
              this.enemyMove();
            }
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
          GamePlay.showError('Incorrect action!');
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
      const characterInfo = `\u{1F396}${current.character.level}\u{2694}${Math.round(current.character.attack * 100) / 100}\u{1F6E1}${Math.round(current.character.defence * 100) / 100}\u{2764}${Math.round(current.character.health * 100) / 100}`;
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
          this.gamePlay.showDamage(target.position, Math.round(damage * 100) / 100).then(() => {
            target.character.health -= damage;
            if (target.character.health <= 0) {
              target.character.health = 0;
              this.playerCharacters = this.playerCharacters.filter((i) => i.health !== 0);
              this.playerPositions = this.playerPositions.filter((i) => i.character.health !== 0);
              this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
              if (this.selectedCharacter === target) {
                this.gamePlay.deselectCell(target.position);
                this.selectedCharacter = null;
              }
              if (this.selectedCell !== null) {
                this.gamePlay.deselectCell(this.selectedCell);
                this.selectedCell = null;
              }
            }
          }).then(() => {
            this.gamePlay.redrawPositions(this.charactersPositions);
            if (this.playerPositions.length === 0) {
              this.gameEnd();
              setTimeout(() => GamePlay.showMessage('You lose!'), 500);
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
      item.levelUp();
    });
    if (this.playerCharacters.length < 3) {
      const len = this.playerCharacters.length;
      const newChar = generateTeam(this.playerAllowedTypes, 1, 3 - len);
      newChar.forEach((item) => {
        item.health = 0;
        for (let i = 1; i < this.level; i += 1) {
          item.levelUp();
        }
        this.playerCharacters.push(item);
      });
    }
    this.gamePlay.drawUi(themes[this.level]);
    this.enemyCharacters = generateTeam(this.enemyAllowedTypes, this.level, 3);

    this.playerTeam = new Team(this.playerCharacters);
    this.enemyTeam = new Team(this.enemyCharacters);
    this.playerPositions = [...this.playerPosition()];
    this.enemyPositions = [...this.enemyPosition()];
    this.charactersPositions = [...this.playerPositions, ...this.enemyPositions];
    this.gamePlay.redrawPositions(this.charactersPositions);
    this.selectedCharacter = null;
    this.selectedCell = null;
  }

  gameEnd() {
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellLeaveListeners = [];

    this.isGameEnd = true;
  }

  onNewGameClick() {
    this.gameState.record = this.level;
    this.playerTeam = null;
    this.enemyTeam = null;
    this.selectedCharacter = null;
    this.selectedCell = null;
    this.userTurn = true;
    this.level = 1;

    if (this.isGameEnd) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
      this.isGameEnd = false;
    }

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
      const info = {
        level: item.level,
        type: item.type,
        health: item.health,
        attack: item.attack,
        defence: item.defence,
        moveDistance: item.moveDistance,
        attackRadius: item.attackRadius,
      };
      this.gameState.playerCharacters.push(info);
    });
    this.gameState.enemyCharacters = [];
    this.enemyCharacters.forEach((item) => {
      const info = {
        level: item.level,
        type: item.type,
        health: item.health,
        attack: item.attack,
        defence: item.defence,
        moveDistance: item.moveDistance,
        attackRadius: item.attackRadius,
      };
      this.gameState.enemyCharacters.push(info);
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
    if (this.isGameEnd) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
      this.isGameEnd = false;
    }
    const load = this.stateService.load();
    if (!load) {
      GamePlay.showError('Failed to load game');
    } else {
      this.selectedCharacter = null;
      this.level = load.level;
      this.userTurn = load.userTurn;
      this.playerCharacters = [];
      load.playerCharacters.forEach((item) => {
        if (item.type === 'swordsman') {
          const swordsman = new Swordsman(item.level);
          swordsman.attack = item.attack;
          swordsman.defence = item.defence;
          swordsman.health = item.health;
          this.playerCharacters.push(swordsman);
        } else if (item.type === 'bowman') {
          const bowman = new Bowman(item.level);
          bowman.attack = item.attack;
          bowman.defence = item.defence;
          bowman.health = item.health;
          this.playerCharacters.push(bowman);
        } else if (item.type === 'magician') {
          const magician = new Magician(item.level);
          magician.attack = item.attack;
          magician.defence = item.defence;
          magician.health = item.health;
          this.playerCharacters.push(magician);
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

      GamePlay.showMessage('The game loaded!');
    }
  }
}
