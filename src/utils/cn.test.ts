import { expect, test, describe } from 'vitest'
import { cn } from './cn'

describe('cn.ts', () => {
  test('should return a string', () => {
    expect(cn('test test2')).toBe('test test2')
  })

  test('should return a string with multiple classes', () => {
    expect(cn('test', 'test2')).toBe('test test2')
  })

  test('should return a string with multiple classes and a condition', () => {
    expect(
      cn('test', 'test2', {
        test3: true,
        test4: false
      })
    ).toBe('test test2 test3')
  })
})
