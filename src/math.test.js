const math = require('../src/math');

test('adds numbers', () => {
  expect(math.add(1,2)).toBe(3);
});

test('multiplies numbers', () => {
  expect(math.multiply(2,3)).toBe(6);
});

