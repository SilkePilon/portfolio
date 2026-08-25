import { cn } from './cn'

test('joins truthy classes', () => {
  expect(cn('a', false, 'b', undefined, null, 0, 'c')).toBe('a b c')
})
