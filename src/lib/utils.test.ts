import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge single class name', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('should merge multiple class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe(
      'base-class conditional-class',
    )
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
  })

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'p-4': true,
      }),
    ).toBe('text-red-500 p-4')
  })

  it('should merge conflicting Tailwind classes', () => {
    // tailwind-merge should keep the last class
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('text-red-500', undefined, 'bg-blue-500', null)).toBe(
      'text-red-500 bg-blue-500',
    )
  })

  it('should handle empty strings', () => {
    expect(cn('text-red-500', '', 'bg-blue-500')).toBe(
      'text-red-500 bg-blue-500',
    )
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      ['array-class-1', 'array-class-2'],
      { 'object-class-1': true, 'object-class-2': false },
      undefined,
      null,
      false && 'conditional-class',
    )
    expect(result).toBe('base-class array-class-1 array-class-2 object-class-1')
  })

  it('should handle no arguments', () => {
    expect(cn()).toBe('')
  })

  it('should deduplicate identical classes', () => {
    expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500')
  })

  it('should work with custom class names and Tailwind classes', () => {
    expect(cn('custom-class', 'p-4', 'text-center')).toBe(
      'custom-class p-4 text-center',
    )
  })

  it('should handle responsive modifiers correctly', () => {
    expect(cn('p-2', 'md:p-4', 'lg:p-6')).toBe('p-2 md:p-4 lg:p-6')
  })

  it('should handle state modifiers correctly', () => {
    expect(cn('text-black', 'hover:text-blue-500', 'focus:text-red-500')).toBe(
      'text-black hover:text-blue-500 focus:text-red-500',
    )
  })

  it('should merge conflicting responsive classes', () => {
    expect(cn('md:p-2', 'md:p-4')).toBe('md:p-4')
  })
})
