# tap-to-md

TAP14 を、テストを仕様書として読みやすい Markdown に変換する CLI ツールです。

## Install

Node 18+ または Bun が必要です。npm 配布版は Node 18+ があれば実行できます。

一度だけ実行する場合:

```sh
npx tap-to-md -i test.tap -o spec.md
```

グローバルにインストールする場合:

```sh
npm i -g tap-to-md
tap-to-md -i test.tap -o spec.md
```

開発する場合:

```sh
bun install
bun test
```

## Usage

```sh
tap-to-md -i test.tap -o spec.md
cat test.tap | tap-to-md --layout summary
```

## Flags

- `-i, --input <file>`: 入力 TAP ファイル。未指定なら stdin。
- `-o, --output <file>`: 出力 Markdown ファイル。未指定なら stdout。
- `--layout <spec|summary>`: 出力レイアウト。既定は `spec`。
- `--include-comments`: TAP コメントを含める。
- `--include-raw`: 元の TAP を含める。
- `--fail-only`: FAIL のみ出力する。
- `--strict`: parser warning や invalid TAP を終了コード 2 にする。
- `--max-diagnostics <bytes>`: diagnostics の最大バイト数 (UTF-8 境界で切り詰め)。
- `--version`: バージョン表示。
- `-h, --help`: ヘルプ表示。

## Exit Codes

- `0`: 変換成功。TAP の合否は問いません。
- `1`: CLI 引数、IO、一般エラー。
- `2`: `--strict` 違反。

## Example

```tap
TAP version 14
1..2
ok 1 - opens file
not ok 2 - writes file
  ---
  message: permission denied
  ...
```

```sh
tap-to-md -i example.tap
```

```md
合計 2 / 成功 1 / **失敗 1**

- opens file
- writes file **(FAIL)**
  > message: permission denied
```

## 既知の制限・将来課題

- GitHub 公開後に `package.json` の `repository` / `homepage` / `bugs` を追記する
- IR 層 (parser adapter と IR builder の分離) の整理
- TAP14 pragma / plan skip-all reason / plan comment 対応
- subtest comments の遅延取り込み
- `--force` フラグ (出力上書き保護)
- diagnostics YAML serializer の堅牢化 (yaml パッケージ採用検討)
