import Character from '../Character';
import Bowman from '../Characters/Bowman';
import Daemon from '../Characters/Daemon';


test('should throw an exception if when Character object creating', () => {
  expect(new Character(1, 'Bowman')).toThrow('You can not create an object of the Character class!');
});
