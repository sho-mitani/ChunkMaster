# ChunkMaster

暗記学習アプリケーション - チャンク学習とテストを繰り返して文章を暗記します。

## Netlifyでのデプロイ

このアプリケーションはNetlifyで簡単にデプロイできます。

### 手動デプロイ

1. このリポジトリをGitHubにプッシュ
2. [Netlify](https://netlify.com)にアクセス
3. "New site from Git"をクリック
4. GitHubリポジトリを選択
5. 以下の設定でデプロイ:
   - Build command: `npm run build`
   - Publish directory: `build`
6. "Deploy site"をクリック

### 自動デプロイ

GitHubリポジトリと連携すると、mainブランチへのプッシュ時に自動的にデプロイされます。

## ローカル開発

このプロジェクトは[Create React App](https://github.com/facebook/create-react-app)で作成されました。

## 利用可能なスクリプト

プロジェクトディレクトリで以下のコマンドを実行できます：

### `npm start`

開発モードでアプリを実行します。\
ブラウザで[http://localhost:3000](http://localhost:3000)を開いて確認してください。

ファイルを編集するとページが自動的にリロードされます。\
コンソールにlintエラーも表示されます。

### `npm test`

インタラクティブウォッチモードでテストランナーを起動します。\
詳細については[テストの実行](https://facebook.github.io/create-react-app/docs/running-tests)のセクションを参照してください。

### `npm run build`

本番用にアプリを`build`フォルダにビルドします。\
本番モードでReactを正しくバンドルし、最高のパフォーマンスのためにビルドを最適化します。

ビルドは最小化され、ファイル名にハッシュが含まれます。\
アプリのデプロイ準備が完了します！

詳細については[デプロイ](https://facebook.github.io/create-react-app/docs/deployment)のセクションを参照してください。

### `npm run eject`

**注意: これは一方向の操作です。一度`eject`すると、元に戻すことはできません！**

ビルドツールと設定の選択に満足できない場合は、いつでも`eject`できます。このコマンドは、プロジェクトから単一のビルド依存関係を削除します。

代わりに、すべての設定ファイルと推移的依存関係（webpack、Babel、ESLintなど）をプロジェクトに直接コピーして、完全に制御できるようにします。`eject`以外のすべてのコマンドは引き続き動作しますが、コピーされたスクリプトを指すようになるので、それらを調整できます。この時点で、あなたは自分で管理することになります。

`eject`を使用する必要はありません。キュレーションされた機能セットは小規模および中規模のデプロイメントに適しており、この機能を使用する義務はありません。ただし、準備ができたときにカスタマイズできない場合、このツールが役に立たないことを理解しています。

## 詳細情報

[Create React Appドキュメント](https://facebook.github.io/create-react-app/docs/getting-started)で詳細を学ぶことができます。

Reactについて学ぶには、[Reactドキュメント](https://reactjs.org/)を参照してください。
