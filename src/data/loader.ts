import cnchar from 'cnchar'
import info from 'cnchar-info'
import poly from 'cnchar-poly'
import radical from 'cnchar-radical'
import { getWordData } from '@/routes/api/word-json'
import type { ChineseCharacter, FiveElement, RadicalIndex } from '@/types'

// 初始化 cnchar 插件（SSR-safe：只在浏览器环境初始化）
if (typeof window !== 'undefined') {
  cnchar.use(radical, poly, info)
}

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
    const response = await fetch('/api/word-json')
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.statusText}`)
    }
    const rawData = (await response.json()) as ChineseCharacter[]

    // 去重：某些汉字可能在数据源中重复
    const seenWords = new Set<string>()
    const uniqueData: ChineseCharacter[] = []

    for (const char of rawData) {
      if (!seenWords.has(char.word)) {
        seenWords.add(char.word)
        uniqueData.push(char)
      }
    }

    charactersData = uniqueData
    return charactersData
  } catch (error) {
    console.error('Error loading character data:', error)
    return []
  }
}

/**
 * 使用 cnchar 获取汉字的所有部首
 */
function getRadicals(char: string): string[] {
  // 使用 cnchar.radical() 获取部首
  const result = cnchar.radical(char)
  // cnchar.radical() 返回数组，提取所有 radical 字段
  if (Array.isArray(result) && result.length > 0) {
    return result
      .map((item) => item.radical)
      .filter((radical): radical is string => Boolean(radical))
  }
  return []
}

/**
 * 构建部首索引
 * 将所有汉字按部首分组（使用 cnchar 动态获取部首）
 * 一个汉字如果有多个部首，会被所有部首索引
 */
export async function buildRadicalIndex(): Promise<RadicalIndex> {
  if (radicalIndexData) {
    return radicalIndexData
  }

  const characters = await loadCharacters()
  const index: RadicalIndex = {}

  for (const char of characters) {
    // 使用 cnchar 获取所有部首
    const radicals = getRadicals(char.word)
    if (radicals.length === 0) continue // 跳过没有部首的字

    // 将字符添加到所有部首的索引中
    for (const radical of radicals) {
      if (!index[radical]) {
        index[radical] = []
      }
      index[radical].push(char)
    }
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
  // AND 模式：包含所有部首的汉字（求交集）
  // 获取第一个部首的所有汉字作为候选
  const firstRadicalChars = index[radicals[0]] || []

  // 如果只有一个部首，直接返回该部首的所有汉字
  if (radicals.length === 1) {
    return firstRadicalChars
  }

  // 多个部首时，过滤出在所有部首索引中都出现的汉字
  return firstRadicalChars.filter((char) => {
    // 检查该汉字是否在其他所有部首的索引中
    return radicals.slice(1).every((radical) => {
      const radicalChars = index[radical] || []
      return radicalChars.some((c) => c.word === char.word)
    })
  })
}

/**
 * 使用 cnchar.info() 获取汉字的五行属性
 */
export function getFiveElement(char: string): string {
  try {
    const result = cnchar.info(char)
    // cnchar.info() 返回数组，提取第一个结果的 fiveElement 字段
    if (Array.isArray(result) && result.length > 0 && result[0].fiveElement) {
      return result[0].fiveElement
    }
  } catch (error) {
    console.error(`Failed to get five element for ${char}:`, error)
  }
  return ''
}

/**
 * 根据五行过滤汉字
 * @param characters 待过滤的汉字列表
 * @param elements 五行数组（金木水火土）
 */
export function filterByFiveElements(
  characters: ChineseCharacter[],
  elements: FiveElement[],
): ChineseCharacter[] {
  if (elements.length === 0) {
    return characters
  }

  // 使用 Set 去重，避免重复的汉字
  const seenWords = new Set<string>()
  const results: ChineseCharacter[] = []

  for (const char of characters) {
    // 跳过已经处理过的汉字
    if (seenWords.has(char.word)) {
      continue
    }

    const fiveElement = getFiveElement(char.word)
    if (elements.includes(fiveElement as FiveElement)) {
      seenWords.add(char.word)
      results.push(char)
    }
  }

  return results
}

/**
 * 统计汉字列表中各五行的分布
 * @param characters 汉字列表
 * @returns 五行计数对象
 */
export function getFiveElementCounts(
  characters: ChineseCharacter[],
): Record<FiveElement, number> {
  const counts: Record<FiveElement, number> = {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  }

  for (const char of characters) {
    const element = getFiveElement(char.word)
    if (element && element in counts) {
      counts[element as FiveElement]++
    }
  }

  return counts
}

/**
 * 获取汉字的笔画数
 * @param char 单个汉字
 * @returns 笔画数
 */
export function getStrokeCount(char: string): number {
  try {
    const result = cnchar.stroke(char)
    // cnchar.stroke() 返回笔画数（数字）
    if (typeof result === 'number') {
      return result
    }
    // 如果返回数组，取第一个值
    if (Array.isArray(result) && result.length > 0) {
      return result[0]
    }
  } catch (error) {
    console.error(`Failed to get stroke count for ${char}:`, error)
  }
  return 0
}

/**
 * 获取汉字的结构信息
 * @param char 单个汉字
 * @returns 结构描述（如"左右结构"）
 */
export function getCharacterStructure(char: string): string {
  try {
    const result = cnchar.info(char)
    if (Array.isArray(result) && result.length > 0 && result[0].structure) {
      return result[0].structure
    }
  } catch (error) {
    console.error(`Failed to get structure for ${char}:`, error)
  }
  return ''
}
