import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseJSON, parseYAML, parseFlags } from './flags-parser'

describe('parseJSON', () => {
  it('should parse JSON with flags property', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.json'), 'utf-8')
    const flags = parseJSON(content)

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('new_dashboard')
    expect(flags[0].state).toBe('enabled')
    expect(flags[1].key).toBe('experimental_search')
    expect(flags[1].state).toBe('disabled')
  })

  it('should parse JSON array directly', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags-array.json'), 'utf-8')
    const flags = parseJSON(content)

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('feature_a')
    expect(flags[1].key).toBe('feature_b')
  })

  it('should parse single flag object', () => {
    const content = JSON.stringify({
      key: 'single_flag',
      state: 'enabled',
      description: 'A single flag'
    })
    const flags = parseJSON(content)

    expect(flags).toHaveLength(1)
    expect(flags[0].key).toBe('single_flag')
  })

  it('should throw on invalid JSON', () => {
    expect(() => parseJSON('not valid json')).toThrow('Failed to parse JSON')
  })

  it('should throw on invalid structure', () => {
    expect(() => parseJSON('{"invalid": "structure"}')).toThrow('Invalid JSON structure')
  })
})

describe('parseYAML', () => {
  it('should parse YAML with flags property', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.yaml'), 'utf-8')
    const flags = parseYAML(content)

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('new_dashboard')
    expect(flags[0].state).toBe('enabled')
    expect(flags[0].tags).toContain('ui')
    expect(flags[0].tags).toContain('dashboard')
  })

  it('should parse YAML array directly', () => {
    const content = `
- key: flag1
  state: enabled
  description: First flag
- key: flag2
  state: disabled
  description: Second flag
`
    const flags = parseYAML(content)

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('flag1')
    expect(flags[1].key).toBe('flag2')
  })

  it('should parse single flag object', () => {
    const content = `
key: single_flag
state: enabled
description: A single flag
`
    const flags = parseYAML(content)

    expect(flags).toHaveLength(1)
    expect(flags[0].key).toBe('single_flag')
  })

  it('should throw on invalid YAML', () => {
    expect(() => parseYAML('invalid: yaml: : :')).toThrow('Failed to parse YAML')
  })

  it('should throw on invalid structure', () => {
    expect(() => parseYAML('invalid: structure')).toThrow('Invalid YAML structure')
  })
})

describe('parseFlags', () => {
  it('should parse JSON file based on .json extension', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.json'), 'utf-8')
    const flags = parseFlags(content, 'config/flags.json')

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('new_dashboard')
  })

  it('should parse YAML file based on .yaml extension', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.yaml'), 'utf-8')
    const flags = parseFlags(content, 'config/flags.yaml')

    expect(flags).toHaveLength(2)
    expect(flags[0].key).toBe('new_dashboard')
  })

  it('should parse YAML file based on .yml extension', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.yaml'), 'utf-8')
    const flags = parseFlags(content, 'config/flags.yml')

    expect(flags).toHaveLength(2)
  })

  it('should try JSON first for unknown extensions', () => {
    const content = JSON.stringify([
      { key: 'test', state: 'enabled' }
    ])
    const flags = parseFlags(content, 'config/flags')

    expect(flags).toHaveLength(1)
    expect(flags[0].key).toBe('test')
  })

  it('should fallback to YAML if JSON parsing fails', () => {
    const content = `
- key: yaml_flag
  state: enabled
`
    const flags = parseFlags(content, 'config/flags')

    expect(flags).toHaveLength(1)
    expect(flags[0].key).toBe('yaml_flag')
  })

  it('should handle case-insensitive extensions', () => {
    const content = readFileSync(join(__dirname, '../__fixtures__/flags.json'), 'utf-8')
    const flags = parseFlags(content, 'config/FLAGS.JSON')

    expect(flags).toHaveLength(2)
  })
})
