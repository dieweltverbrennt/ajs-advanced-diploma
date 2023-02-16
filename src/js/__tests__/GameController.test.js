import { generateTeam } from '../generators';
import Bowman from '../Characters/Bowman';
import Swordsman from '../Characters/Swordsman';
import Magician from '../Characters/Magician';
import GameController from '../GameController';
import GamePlay from '../GamePlay';

const allowedTypes = [new Bowman(), new Swordsman(), new Magician()];

test('generateTeam should create characters in the right quantity and at the right level', () => {
  const team1 = generateTeam(allowedTypes, 2, 2);
  expect(team1.length).toBe(2);
  expect(team1).not.toContain({ level: 3 });
});

test('should output correct characters', () => {
  const character = new Bowman(1);
  const characterInfo = `\u{1F396}${character.level}\u{2694}${character.attack}\u{1F6E1}${character.defence}\u{2764}${character.health}`;
  const expected = '\u{1F396}1\u{2694}25\u{1F6E1}25\u{2764}50';
  expect(characterInfo).toBe(expected);
});

test('function calcMoveRange should return correct range', () => {
  const game = new GameController(new GamePlay(), 0);
  const char = new Bowman();
  game.charactersPositions = [{ character: char, position: 24 }];
  game.selectedCharacter = { character: char, position: 24 };
  const expected = [32, 16, 40, 8, 25, 17, 33, 26, 10, 42];
  expect(game.calcMoveRange(game.selectedCharacter)).toEqual(expected);
});

test('function calcAttackRange should return correct range', () => {
  const game = new GameController(new GamePlay(), 0);
  const char = new Swordsman(1);
  game.charactersPositions = [{ character: char, position: 12 }];
  game.selectedCharacter = { character: char, position: 12 };
  const expected = [4, 5, 3, 13, 11, 20, 21, 19];
  expect(game.calcAttackRange(game.selectedCharacter)).toEqual(expected);
});
