import { cn } from '@/lib/cn'

test('cn joins truthy classes', () => {
  expect(cn('a', false, undefined, 'b', null)).toBe('a b')
})
