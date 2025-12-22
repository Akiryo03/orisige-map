import { Product } from '@/app/types';

/**
 * orisige製品データ
 */
export const products: Product[] = [
  // kurashiシリーズ
  {
    id: 'kasane-no-partition',
    name: 'kasane（仕切なし）',
    price: 2750,
    category: 'kurashi',
    image_url: '',
    description: '積み重ねて使える杉のトレイ。デスクの上をスッキリ整理',
  },
  {
    id: 'kasane-with-partition',
    name: 'kasane（仕切あり）',
    price: 3300,
    category: 'kurashi',
    image_url: '',
    description: '積み重ねて使える杉のトレイ。デスクの上をスッキリ整理',
  },
  {
    id: 'kobaco',
    name: 'kobaco',
    price: 3300,
    category: 'kurashi',
    image_url: '',
    description: '小さな日用品の定位置に。職人技が光る精密なスライド蓋',
  },
  {
    id: 'tateru',
    name: 'tateru',
    price: 6600,
    category: 'kurashi',
    image_url: '',
    description: '杉のスマホスタンド。毎日使うから、本格派の一品を。',
  },
  {
    id: 'yorozu',
    name: 'yorozu',
    price: 11000,
    category: 'kurashi',
    image_url: '',
    description: '杉のラック。雑誌からバッグまで、なんでも入ります',
  },

  // kokoroシリーズ
  {
    id: 'inori-horse',
    name: 'inori（午年バージョン）',
    price: 2200,
    category: 'kokoro',
    image_url: '',
    description: '暮らしの中に祈りの場所を。午年の蹄鉄で幸運を',
  },
  {
    id: 'pochi-medium-majime',
    name: 'pochi（中・まじめ）',
    price: 6600,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },
  {
    id: 'pochi-medium-shikkarimono',
    name: 'pochi（中・しっかりもの）',
    price: 6600,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },
  {
    id: 'pochi-medium-ottori',
    name: 'pochi（中・おっとり）',
    price: 6600,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },
  {
    id: 'pochi-small-majime',
    name: 'pochi（小・まじめ）',
    price: 4400,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },
  {
    id: 'pochi-small-shikkarimono',
    name: 'pochi（小・しっかりもの）',
    price: 4400,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },
  {
    id: 'pochi-small-ottori',
    name: 'pochi（小・おっとり）',
    price: 4400,
    category: 'kokoro',
    image_url: '',
    description: '伝統とポップの出会いで生まれた、杉のわんこ。家をパッと明るくする一品です',
  },

  // kokoroシリーズ - SugiTags
  {
    id: 'sugitags',
    name: 'SugiTags',
    price: 1100,
    category: 'kokoro',
    image_url: '',
    description: '小さな杉のタグ。その地を訪れた記念品に。',
  },

  // tema-himaシリーズ
  {
    id: 'hashikko',
    name: 'はしっこ',
    price: 330,
    category: 'tema-hima',
    image_url: '',
    description: '折箱になれなかった杉を、集めました。',
  },
  {
    id: 'mokumoku',
    name: 'もくもく',
    price: 330,
    category: 'tema-hima',
    image_url: '',
    description: '杉を削ってできた、くるくる素材。緩衝材や着火剤に',
  },
  {
    id: 'kunkun',
    name: 'くんくん',
    price: 330,
    category: 'tema-hima',
    image_url: '',
    description: '杉の持つ消臭作用を活かしたシューキーパー',
  },

  // All ibaraki project
  {
    id: 'shizuku',
    name: 'shizuku',
    price: 3850,
    category: 'All ibaraki project',
    image_url: '',
    description: '杉のお線香を、杉の箱に。駒村清明堂さまとのコラボレーションです。',
  },

  // taberuシリーズ
  {
    id: 'inaka-bento',
    name: '田舎弁当',
    price: 1500,
    category: 'taberu',
    image_url: '',
    description: '折重の折箱に入った、ふるさとおにぎり店さまの心づくし',
  },
];
