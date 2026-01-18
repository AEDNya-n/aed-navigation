# aed-navigation

## 開発環境のセットアップ

### 初期インストール
```bash
npm install
```

## 開発方法

### 開発サーバー起動
```bash
npm run dev
```

- **デフォルトポート**: http://localhost:5173
- **自動リロード**: ホットモジュールリプレイスメント（HMR）が有効
- ファイル変更時に自動的にブラウザがリロードされます

### ファイル構成
- `src/main.ts` - エントリーポイント（アプリケーション起動時のロジック）
- `src/style.css` - グローバルスタイル（自動リロード対応）
- `src/counter.ts` - サンプルコンポーネント（開発時の参考）
- `index.html` - HTML ベースファイル（`#app` を ID に持つ div をマウント）

### TypeScript 型チェック
```bash
npx tsc --noEmit
```

開発中のみで型エラーをチェックします。

## ビルド方法

### 本番環境ビルド
```bash
npm run build
```

実行内容：
1. **型チェック**: `tsc --noEmit` で TypeScript 型エラーを検出
2. **バンドル**: Vite が `src/` を `dist/` にビルド

### ビルド成果物の確認
```bash
npm run preview
```

- `dist/` フォルダ内の本番ビルドをローカルで検証できます
- デフォルトポート: http://localhost:4173

### GitHub Pages へのデプロイ
- `main` ブランチへの push で自動的に GitHub Actions がビルド・デプロイされます
- デプロイ先: `.github/workflows/deploy.yml` で設定
- 公開 URL: https://aednyan.github.io/aed-navigation/

## 機能概要

AED 案内アプリは、ユーザーが近くの AED（自動体外式除細動器）の位置を簡単に検索し、利用可能なルートを確認できるように設計されています。以下の主要機能を提供します：

- **AED 検索**: 現在地を基に最寄りの AED を検索
- **ルート案内**: 徒歩ルートを計算し、地図上に表示
- **フィルタリング**: 営業時間や祝日設定に基づく利用可能な施設の絞り込み
- **レスポンシブデザイン**: モバイルデバイスでも快適に利用可能

## 技術概要

本プロジェクトは以下の技術スタックを使用しています：

- **フロントエンド**: Vite + TypeScript（Vanilla）
- **地図描画**: Leaflet ライブラリを使用し、カスタムユーザーマーカーをサポート
- **データ管理**: CSV ファイル（`public/aed_data.csv`）をパースして動的にデータをロード
- **ルート計算**: OSRM API を利用した徒歩ルート計算
- **デプロイ**: GitHub Pages を使用した自動デプロイ

詳細な技術仕様については、`docs/sequence.md` を参照してください。