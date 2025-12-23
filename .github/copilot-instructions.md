# Copilot Instructions for `aed-navigation`

**ミッション/範囲**
- Vite + TypeScript のクライアントで近隣の AED 施設を案内する Web アプリ。ビューは2つ: ルート UI（[index.html](index.html)→[src/main.ts](src/main.ts)）とフィルタ UI（[filter.html](filter.html)→[src/filterApp.ts](src/filterApp.ts)）。全体設計は [docs/sequence.md](docs/sequence.md)。

**アーキテクチャ/フロー**
- シーケンス: CSV 取得→利用可否フィルタ→現在位置→上位5件→地図表示→Next 循環。
- ルート UI は現状 UI 骨格（地図/次候補 UI 下地）を [src/main.ts](src/main.ts) に実装。フィルタ UI は CSV ロードと時刻ベースのフィルタを [src/filterApp.ts](src/filterApp.ts) に実装。

**データ/パース**
- 静的データ: [public/aed_data.csv](public/aed_data.csv)。GitHub Pages の `base: '/aed-navigation'` に合わせ、CSV 取得は `import.meta.env.BASE_URL` を考慮。
  - 例（推奨）: `new URL('aed_data.csv', import.meta.env.BASE_URL).toString()`
  - 実装例: [src/filterApp.ts](src/filterApp.ts) の `${import.meta.env.BASE_URL}/aed_data.csv`
- 施設型 `AEDFacility`: [src/filter.ts](src/filter.ts)。列順は CSV に一致。
- CSV パーサ: [src/csvLoader.ts](src/csvLoader.ts)。ヘッダー行スキップ、クオート内カンマ対応の手動パース。

**利用可否ロジック**
- 祝日判定: `@holiday-jp/holiday_jp`（[src/filter.ts](src/filter.ts)）。
- `isAvailable()` の考慮点:
  - `unavailableDates`（MM-DD のパイプ区切り）
  - `acceptableHolidays` / `invalidHolidays`（祝日名の許可/禁止）
  - 第N曜日の禁止（`unavailableNth*`）
  - 営業時間（`HH:MM`）。翌日跨ぎ（例: 20:00→02:00）は `isWithinOperatingHours()` で許容。
  - 時刻文字列でない場合は「例外だが利用可能」を返す挙動あり（将来調整余地）。
- `filterAvailableFacilities()` が利用可能施設を返す。

**開発/ビルド**
- コマンド: `npm install` / `npm run dev`（HMR, 5173）/ `npm run build`（型チェック後ビルド）/ `npm run preview`（4173）。詳細は [README.md](README.md)。
- Vite 設定: [vite.config.ts](vite.config.ts)。`base: '/aed-navigation'`、エイリアス `@`→`src`、マルチエントリ（`index.html`, `filter.html`）。
- TypeScript: [tsconfig.json](tsconfig.json)。Bundler モード（`moduleResolution: 'bundler'` 等）、厳格設定（`strict`, `noUnused*`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`）。副作用レス + 明示的 exports/imports。

**UI/規約**
- UI は関数型のフラット構成を優先。グローバルスタイルは [src/style.css](src/style.css)。Font Awesome は CDN（[index.html](index.html)）で読込。
- アセット/CSV 参照は必ず `BASE_URL` を前提に解決（GitHub Pages）。
- 変更は [docs/sequence.md](docs/sequence.md) のどのステップに関わるかを PR に明示。

**実装例**
- CSV ロード + フィルタ適用:
  ```ts
  import { loadAEDDataFromCSV } from '@/csvLoader.ts';
  import { filterAvailableFacilities } from '@/filter.ts';
  const url = new URL('aed_data.csv', import.meta.env.BASE_URL).toString();
  const facilities = await loadAEDDataFromCSV(url);
  const available = filterAvailableFacilities(facilities, new Date());
  ```
- フィルタ UI 初期化（[filter.html](filter.html)）:
  ```ts
  import { initFilterApp } from '/src/filterApp.ts';
  initFilterApp();
  ```

**統合ポイント/注意**
- 位置情報 API / 地図ライブラリは未選定。導入時は依存と責務分離を明示（CSV/フィルタ/位置/地図の境界維持）。
- 祝日名の一致は CSV 値と `holiday_jp` の `name` が同一前提。表記差異に注意。
- 翌日跨ぎ営業時間や祝日翌日の扱いを含むため、日付操作は `Date` 依存。タイムゾーン指定が必要なら要設計。

不明点や抜けがあればコメントください。必要に応じて詳細を追記・修正します。
