import { markedText } from '@/cms/fields'

test('markedText always keeps the marker instruction and appends the call site description', () => {
  const field = markedText('x', 'X', { admin: { description: 'Shown in hero.' } })
  expect(field.admin?.description).toContain('**double asterisks**')
  expect(field.admin?.description).toContain('Shown in hero.')
})

test('markedText without an admin override still explains the markers', () => {
  const field = markedText('x', 'X')
  expect(field.admin?.description).toContain('**double asterisks**')
  expect(field.admin?.rows).toBe(2)
})

test('markedText keeps other extras (defaultValue, rows override)', () => {
  const field = markedText('x', 'X', { defaultValue: 'hello', admin: { rows: 4 } })
  expect(field.defaultValue).toBe('hello')
  expect(field.admin?.rows).toBe(4)
  expect(field.admin?.description).toContain('**double asterisks**')
})
