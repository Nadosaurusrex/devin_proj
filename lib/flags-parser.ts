import yaml from 'js-yaml'
import type { Flag } from '@/types/flags'

/**
 * Parse JSON content into flags array
 */
export function parseJSON(content: string): Flag[] {
  try {
    const parsed = JSON.parse(content)

    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      return parsed as Flag[]
    }

    // If it's an object with a flags property
    if (parsed.flags && Array.isArray(parsed.flags)) {
      return parsed.flags as Flag[]
    }

    // If it's a single flag object, wrap it
    if (typeof parsed === 'object' && parsed.key) {
      return [parsed as Flag]
    }

    throw new Error('Invalid JSON structure: expected array of flags or object with flags property')
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse YAML content into flags array
 */
export function parseYAML(content: string): Flag[] {
  try {
    const parsed = yaml.load(content)

    // Handle different YAML structures
    if (Array.isArray(parsed)) {
      return parsed as Flag[]
    }

    // If it's an object with a flags property
    if (parsed && typeof parsed === 'object' && 'flags' in parsed && Array.isArray(parsed.flags)) {
      return parsed.flags as Flag[]
    }

    // If it's a single flag object, wrap it
    if (parsed && typeof parsed === 'object' && 'key' in parsed) {
      return [parsed as Flag]
    }

    throw new Error('Invalid YAML structure: expected array of flags or object with flags property')
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse flags from content based on file type
 */
export function parseFlags(content: string, path: string): Flag[] {
  const lowerPath = path.toLowerCase()

  // Try YAML first if the extension suggests it
  if (lowerPath.endsWith('.yaml') || lowerPath.endsWith('.yml')) {
    return parseYAML(content)
  }

  // Try JSON first if the extension suggests it
  if (lowerPath.endsWith('.json')) {
    return parseJSON(content)
  }

  // If no extension, try JSON first, then YAML
  try {
    return parseJSON(content)
  } catch {
    return parseYAML(content)
  }
}
