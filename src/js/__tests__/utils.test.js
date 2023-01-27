import { calcTileType } from '../utils';

test('function calcTileType should return correct type', () => {
  expect(calcTileType(0, 5)).toBe('top-left');
  expect(calcTileType(7, 8)).toBe('top-right');
  expect(calcTileType(4, 7)).toBe('top');
  expect(calcTileType(56, 8)).toBe('bottom-left');
  expect(calcTileType(24, 5)).toBe('bottom-right');
  expect(calcTileType(22, 5)).toBe('bottom');
  expect(calcTileType(31, 8)).toBe('right');
  expect(calcTileType(15, 5)).toBe('left');
  expect(calcTileType(27, 8)).toBe('center');
});
