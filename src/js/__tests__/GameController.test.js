import { generateTeam } from '../generators';
import Bowman from '../Characters/Bowman';
import Swordsman from '../Characters/Swordsman';
import Magician from '../Characters/Magician';

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
