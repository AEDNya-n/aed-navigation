# Copilot Instructions for `aed-navigation`

あなたは Vite + TypeScript (Vanilla) で構築された AED 案内アプリの専門家です。フレームワーク（React/Vueなど）は使用しません。

## 主要アーキテクチャと責務
- **データフロー**: `public/aed_data.csv` (Assets) → `src/csvLoader.ts` (Fetch & Parse) → `src/filter.ts` (Logic) → UI
- **DOM操作**: 仮想DOMは使用せず、`main.ts` や `filterApp.ts` で直接 DOM を操作してください。HTML ファイルは複数エントリ (`index.html`, `filter.html`, `contact.html`) です。
- **地図**: Leaflet (`libs/leaflet.usermarker.js` 拡張込み) を使用。OSRM API で徒歩ルートを計算します。
- **デプロイ**: GitHub Pages (`/aed-navigation/`) 前提。アセットパスは必ず `import.meta.env.BASE_URL` を結合してください。

## コード編集のルール
1. **型定義の同期**: `src/filter.ts` の `AEDFacility` インターフェースを変更する場合、必ず `src/csvLoader.ts` のパースロジックも同期させてください。
2. **CSVパーサ**: ライブラリは追加せず、`loadAEDDataFromCSV` の手組みパーサ（クオート処理付き）を維持・拡張してください。
3. **祝日判定**: `@holiday-jp/holiday_jp` を使用します。CSV上の祝日許可設定は `holiday_jp` の定義名と一致させる必要があります。
4. **厳格なTS**: `verbatimModuleSyntax`, `noUncheckedSideEffectImports` が有効です。型のみの import は `import type` を使用し、副作用 import は慎重に行ってください。

## 重要なファイル/ディレクトリ
- `src/main.ts`: アプリのエントリポイント。地図の初期化とメインフロー制御。
- `src/filter.ts`: 純粋なフィルタリングロジック（現在時刻や曜日による利用可否判定）。副作用を持たせないこと。
- `src/mapTools.ts`: Leaflet ラッパー。`setup()` 関数が地図描画の主役。
- `vite.config.ts`: マルチページ構成の設定。

## 開発・デバッグ
- `npm run dev`: 開発サーバー (HMR有効)
- `npm run build`: `tsc --noEmit` での型チェックと Vite ビルド
- 注意: `README.md` に記載の `src/counter.ts` は存在しないため無視してください。

UI実装時は、既存のクラス設計や `style.css` を尊重し、新しいフレームワーク依存を持ち込まないでください。
