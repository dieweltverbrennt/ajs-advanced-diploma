import Character from '../Character';
import Bowman from '../Characters/Bowman';
import Daemon from '../Characters/Daemon';

test('should throw an exception if when Character object creating', () => {
  expect(() => new Character(1, 'Bowman')).toThrow('You can not create an object of the Character class!');
});

test('should create inherit class object correctly', () => {
  expect(() => new Bowman(2)).not.toThrow();
});

test('stats of created character should be correct', () => {
  const daemon = new Daemon(1);
  expect(daemon.attack).toBe(10);
  expect(daemon.defence).toBe(10);
});
