# Copilot Instructions for `aed-navigation`

## ミッションとビュー
- Vite + TypeScript のクライアントアプリで近隣 AED 施設を案内する。UX は [index.html](index.html)→[src/main.ts](src/main.ts)（ルートビュー）、[filter.html](filter.html)→[src/filterApp.ts](src/filterApp.ts)（空き状況テスター）、[contact.html](contact.html)→[src/contact.ts](src/contact.ts)（119 番画面）に分かれる。
- [docs/sequence.md](docs/sequence.md) の流れ（CSV 取得→フィルタ→現在地→上位候補→地図案内）を常に踏襲。

## データと型
- 施設情報は [public/aed_data.csv](public/aed_data.csv)。列順が契約なので、フィールドを増やす際は [src/csvLoader.ts](src/csvLoader.ts) と [src/filter.ts](src/filter.ts) の `AEDFacility` を同時に更新。
- `loadAEDDataFromCSV()` はクオート対応の手組み CSV 解析。スキーマ変更時もライブラリ追加ではなくここを拡張する。
- GitHub Pages では `/aed-navigation` 配下で提供されるため、アセットは必ず `import.meta.env.BASE_URL` から解決する。

## 利用可否ルール（[src/filter.ts](src/filter.ts)）
- `isAvailable()` は `@holiday-jp/holiday_jp` と CSV フラグを組み合わせる。`unavailableDates`（MM-DD）、`holidayAvailable`、`holidayNextDayAvailable`、曜日別 `unavailableNth*` を総合判定。
- 祝日許可/禁止リストは祝日名で比較するので、CSV の表記を `holiday_jp` の `name` と揃える。
- 営業時間は曜日ごと＋祝日専用スロットを持ち、`isWithinOperatingHours()` が翌日跨ぎにも対応。時刻でない文字列は現仕様で「利用可」。
- `filterAvailableFacilities()` は副作用なし。メイン/フィルタ両 UI で共通利用してロジック差分を避ける。

## UI の責務
- [src/main.ts](src/main.ts) は地図枠・操作ボタン・次候補バーなどの骨格を描画してから、絞り込み済み施設を `MapTools.setup()` に渡す。
- [src/filterApp.ts](src/filterApp.ts) は `<input type="date">` / `<input type="time">` に初期値を入れ、`change` リスナーで DOM リストと件数を更新。
- [src/contact.ts](src/contact.ts) は contact.html のマークアップを TS 化し、同じバンドラとスタイルを再利用する。

## 地図とルーティング（[src/mapTools.ts](src/mapTools.ts)）
- Leaflet + `leaflet.locatecontrol` + カスタム user marker を併用。`./libs/leaflet.usermarker.js`/`.css` の import を崩さない。
- `getNowLocation()` は `navigator.geolocation.getCurrentPosition` を包む。依存機能を追加する際はフォールバック表示を忘れずに。
- 距離ソートはユークリッド距離 $d=\sqrt{(\Delta lat)^2+(\Delta lon)^2}$ を使用し、`getRoute()` が OSRM (`https://router.project-osrm.org/route/v1/foot/...`) へ foot ルートを問い合わせて Polyline を描く。
- `setup()` は `#map` ノードが既に存在し、1 件以上の施設が渡されている前提なので、DOM/フィルタ処理を呼び出し前に整える。

## ビルドとツール
- 共通スクリプト: `npm run dev`（5173/HMR）、`npm run build`（`tsc --noEmit`→Vite）、`npm run preview`（4173/dist 配信）。詳細は [README.md](README.md)。
- [vite.config.ts](vite.config.ts) は `base: '/aed-navigation'`、エイリアス `@`→`src`、複数 HTML エントリを設定。ページ追加時はこれに倣う。
- [tsconfig.json](tsconfig.json) は `moduleResolution: 'bundler'`、`verbatimModuleSyntax`、`noUncheckedSideEffectImports` など厳格設定。未使用 import や暗黙 any はビルドで弾かれる。

## 実装パターン
- CSV→フィルタ→地図の責務を分離する。CSV パースは純粋関数、フィルタは入力 Date のみを参照、地図ツールはブラウザ API を扱う。
- 新しいビューで施設データが必要な場合は次のパターンを再利用:
```ts
import { loadAEDDataFromCSV } from '@/csvLoader.ts';
import { filterAvailableFacilities } from '@/filter.ts';
const url = new URL('aed_data.csv', import.meta.env.BASE_URL).toString();
const facilities = await loadAEDDataFromCSV(url);
const available = filterAvailableFacilities(facilities, new Date());
```
- Font Awesome は各 HTML で CDN から読み込むため、既存のクラス名に合わせればスタイルが整う。
- 新データセットや API を導入したら [docs/sequence.md](docs/sequence.md) のフロー図を更新して整合を保つ。
