# 更新日志

gogoga outline 每个版本的主要变化都记在这里。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。English: [CHANGELOG.md](CHANGELOG.md).

## [0.4.0] - 2026-10-31

### 新增
- 新设置「点击标题后保持大纲打开」：点标题跳过去，大纲不收起，按 Esc 或再用一次命令关掉。开着的时候滚动正文，正在看的章节一直保持在大纲可见范围里。
- 新设置「只展开当前章节」：正在看的（或刚点的）那一章全部展开，其他章节只显示大标题，显示到第几级由「其他章节显示到第几级」决定。标题前的小箭头单击展开或收起一层，双击整支展开；大纲有键盘焦点时 ←/→ 也一样。展开、收起时，被点的那一行停在原位不动。
- 新设置「显示完整标题」：太长的标题换行显示全文，不再省略成一行。
- 标题里的公式在大纲和章节预览里照常渲染。

## [0.3.0] - 2026-10-21

### 新增
- 切换 gogoga 主题「聚焦模式」和「悬停行强调」的命令，可以绑快捷键。

## [0.2.1] - 2026-10-18

### 新增
- 爱发电赞助链接。

## [0.2.0] - 2026-10-15

### 新增
- 界面支持英文和简体中文，跟随 Obsidian 的语言设置。
- 英文 README，另附简体中文版。

## [0.1.1] - 2026-10-15

### 改进
- README 加演示 GIF。

## [0.1.0] - 2026-10-14

首个公开版本。

### 新增
- 编辑器边缘的标题导轨：每个标题一道短横，当前所在的章节高亮。
- 鼠标经过时像程序坞一样起伏，悬停的章节显示预览卡片，点击跳到那个标题。
- 鼠标在导轨上停一下就展开全局大纲；命令可以固定打开大纲，并用键盘上下选择。
- 阅读模式和编辑模式都能准确跳转，分屏时每个窗格各有一条导轨。

[0.4.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/JackWeiGogoga/gogoga-outline/releases/tag/0.1.0
