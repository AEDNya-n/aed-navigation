# Copilot Instructions for `aed-navigation`
 
**ミッション/範囲**
- Vite + TypeScript のクライアントで近隣の AED 施設を案内する Web アプリ。
- ビューは2つ: ルート UI（[index.html](index.html)→[src/main.ts](src/main.ts)）とフィルタ UI（[filter.html](filter.html)→[src/filterApp.ts](src/filterApp.ts)）。
- 全体設計は [docs/sequence.md](docs/sequence.md)。

**アーキテクチャ/フロー**
- シーケンス: CSV 取得 → 利用可否フィルタ → 現在位置 → 上位5件 → 地図表示 → Next 循環。
- ルート UIは UI 骨格（地図/次候補の UI 下地）を [src/main.ts](src/main.ts) に実装。フィルタ UIは CSV ロードと日時ベースのフィルタを [src/filterApp.ts](src/filterApp.ts) に実装。

**データ/CSV ロード**
- 静的データ: [public/aed_data.csv](public/aed_data.csv)。ヘッダ1行あり、クオート内カンマ対応の手動パースは [src/csvLoader.ts](src/csvLoader.ts)。
- 施設型 `AEDFacility` は列順が CSV と一致（型は [src/filter.ts](src/filter.ts)）。
- GitHub Pages 用 `base: '/aed-navigation'` を前提にアセット参照は `import.meta.env.BASE_URL` を必ず考慮。
  - 例（推奨）: `new URL('aed_data.csv', import.meta.env.BASE_URL).toString()`
  - 現状例: `${import.meta.env.BASE_URL}/aed_data.csv`

**利用可否ロジック（[src/filter.ts](src/filter.ts)）**
- 祝日判定は `@holiday-jp/holiday_jp`。`isJapaneseHoliday()`, `isPreviousDayHoliday()` を利用。
- `isAvailable(facility, date)` の主な判定:
  - `unavailableDates`（MM-DD のパイプ区切り）一致で不可。
  - 祝日: `holidayAvailable` が false かつ `acceptableHolidays` 非一致なら不可。`invalidHolidays` 一致も不可。
  - 祝日翌日: `holidayNextDayAvailable` が false なら不可。
  - 第N曜日禁止: `unavailableNth*`（パイプ区切りの数値）に当該 N が含まれ、かつ `acceptableHolidays` 非一致なら不可。
  - 営業時間（`HH:MM`）: `isWithinOperatingHours()` が翌日跨ぎ（例: 20:00→02:00）も許容。
  - 開始/終了が時刻形式でない場合は「例外だが利用可能」を返す（現仕様）。
- `filterAvailableFacilities()` が日時に対して利用可能な施設を返す。

**UI/エントリ**
- ルート UI: 初期 UI 骨格（地図背景、案内ボタン、次候補バー等）を [src/main.ts](src/main.ts) ＋ [src/style.css](src/style.css) に実装。Font Awesome は [index.html](index.html) の CDN。
- フィルタ UI: 日付/時刻入力から `Date` を組み立て、`filterAvailableFacilities()` で結果を描画（[filter.html](filter.html), [src/filterApp.ts](src/filterApp.ts)）。

**ビルド/開発**
- コマンド: `npm install` / `npm run dev`（HMR, 5173）/ `npm run build`（型チェック後ビルド）/ `npm run preview`（4173）。詳細は [README.md](README.md)。
- Vite 設定: [vite.config.ts](vite.config.ts)
  - `base: '/aed-navigation'`
  - エイリアス `@`→`src`
  - マルチエントリ（`index.html`, `filter.html`）
- TypeScript: [tsconfig.json](tsconfig.json)
  - Bundler モード（`moduleResolution: 'bundler'`, `verbatimModuleSyntax` 等）
  - 厳格設定（`strict`, `noUnused*`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`）

**実装例**
```ts
import { loadAEDDataFromCSV } from '@/csvLoader.ts';
import { filterAvailableFacilities } from '@/filter.ts';
const url = new URL('aed_data.csv', import.meta.env.BASE_URL).toString();
const facilities = await loadAEDDataFromCSV(url);
const available = filterAvailableFacilities(facilities, new Date());
```

**統合ポイント/注意**
- 位置情報 API / 地図ライブラリは未選定。導入時は依存と責務分離（CSV/フィルタ/位置/地図の境界維持）。
- 祝日名の一致は CSV 値と `holiday_jp` の `name` が同一前提。表記差異に注意。
- 翌日跨ぎ営業時間や祝日翌日の扱いを含むため、日付操作は `Date` 依存。タイムゾーン指定が必要なら要設計。
- アセット/CSV 参照は必ず `BASE_URL` 前提で解決（GitHub Pages）。

不明点や抜けがあればコメントください。必要に応じて詳細を追記・修正します。
