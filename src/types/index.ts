// 汉字数据结构（来自 chinese-xinhua）
export interface ChineseCharacter {
  word: string // 汉字
  oldword: string // 繁体字
  strokes: string // 笔画数
  pinyin: string // 拼音
  radicals: string // 部首
  explanation: string // 释义
  more: string // 更多信息
  fiveElement?: string // 五行（金木水火土）
}

// 部首类型
export type Radical = string

// 五行类型
export type FiveElement = '金' | '木' | '水' | '火' | '土'

// 搜索模式
export type SearchMode = 'AND' | 'OR'

// 部首索引映射类型
export interface RadicalIndex {
  [radical: string]: ChineseCharacter[]
}

// 五行索引映射类型
export interface FiveElementIndex {
  [element: string]: ChineseCharacter[]
}
