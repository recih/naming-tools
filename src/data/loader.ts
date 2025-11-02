import type { ChineseCharacter, RadicalIndex } from '@/types'
import cnchar from 'cnchar'

// 延迟加载汉字数据
let charactersData: ChineseCharacter[] | null = null
let radicalIndexData: RadicalIndex | null = null
let allRadicalsData: string[] | null = null

/**
 * 加载汉字数据
 */
export async function loadCharacters(): Promise<ChineseCharacter[]> {
  if (charactersData) {
    return charactersData
  }

  try {
    const response = await fetch('/chinese-xinhua/data/word.json')
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.statusText}`)
    }
    charactersData = await response.json()
    return charactersData as ChineseCharacter[]
  } catch (error) {
    console.error('Error loading character data:', error)
    return []
  }
}

/**
 * 使用 cnchar 获取汉字的部首
 */
function getRadical(char: string): string {
  // 使用 cnchar.radical() 获取部首
  const radical = cnchar.radical(char)
  return radical || ''
}

/**
 * 构建部首索引
 * 将所有汉字按部首分组（使用 cnchar 动态获取部首）
 */
export async function buildRadicalIndex(): Promise<RadicalIndex> {
  if (radicalIndexData) {
    return radicalIndexData
  }

  const characters = await loadCharacters()
  const index: RadicalIndex = {}

  for (const char of characters) {
    // 使用 cnchar 获取部首
    const radical = getRadical(char.word)
    if (!radical) continue // 跳过没有部首的字

    if (!index[radical]) {
      index[radical] = []
    }
    index[radical].push(char)
  }

  radicalIndexData = index
  return index
}

/**
 * 获取所有部首列表（已排序）
 */
export async function getAllRadicals(): Promise<string[]> {
  if (allRadicalsData) {
    return allRadicalsData
  }

  const index = await buildRadicalIndex()
  allRadicalsData = Object.keys(index).sort((a, b) => {
    // 按照汉字的 Unicode 顺序排序
    return a.localeCompare(b, 'zh-CN')
  })

  return allRadicalsData
}

/**
 * 根据部首搜索汉字
 * @param radicals 部首数组
 * @param mode 搜索模式：'AND' 或 'OR'
 */
export async function searchByRadicals(
  radicals: string[],
  mode: 'AND' | 'OR' = 'OR',
): Promise<ChineseCharacter[]> {
  if (radicals.length === 0) {
    return []
  }

  const index = await buildRadicalIndex()

  if (mode === 'OR') {
    // OR 模式：包含任一部首的汉字
    const resultSet = new Set<string>()
    const results: ChineseCharacter[] = []

    for (const radical of radicals) {
      const chars = index[radical] || []
      for (const char of chars) {
        if (!resultSet.has(char.word)) {
          resultSet.add(char.word)
          results.push(char)
        }
      }
    }

    return results
  }
  // AND 模式：包含所有部首的汉字
  // 注意：一个汉字只有一个主部首，所以 AND 模式可能返回空结果
  // 这里我们返回第一个部首的结果，然后过滤出包含所有部首的汉字
  const firstRadicalChars = index[radicals[0]] || []

  return firstRadicalChars.filter((char) => {
    // 检查汉字本身是否包含所有指定的部首
    return radicals.every((radical) => char.word.includes(radical))
  })
}
