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
