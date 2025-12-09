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

## プロジェクト仕様

詳細な機能フロー及び設計については `docs/sequence.md` を参照してください。