import { blocksToLexical, lexicalToBlocks } from '@/lib/lexical'
import { validate } from '@/lib/form'

test('lexical round-trips heading / paragraph / list blocks', () => {
  const blocks = [
    { kind: 'paragraph' as const, text: 'Intro line one\nline two' },
    { kind: 'heading' as const, text: 'A heading' },
    { kind: 'list' as const, items: ['one', 'two'] },
  ]
  expect(lexicalToBlocks(blocksToLexical(blocks))).toEqual(blocks)
  expect(lexicalToBlocks(null)).toEqual([])
})

test('form validation flags missing and invalid fields', () => {
  const errors = validate({ Name: '', Email: 'nope', Phone: '', Budget: '', Message: '' })
  expect(Object.keys(errors).sort()).toEqual(['Budget', 'Email', 'Message', 'Name', 'Phone'])
  expect(validate({ Name: 'A', Email: 'a@b.co', Phone: '1', Budget: '$1', Message: 'hi' })).toEqual({})
})
