# Changelog

All notable changes to gogoga outline are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). 中文版见 [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md).

## [Unreleased]

## [0.6.0] - 2026-11-14

### Added
- Setting "Show headings in their heading style" (off by default, #2): each row of the full outline takes the color, weight and font your theme sets for that heading level, and grows slightly with the level, so levels are easy to tell apart; the row you're reading keeps the accent color.

## [0.5.1] - 2026-11-14

### Fixed
- In large notes with hundreds of headings, the rail grew taller than the window so later headings were out of reach, hovering over it stuttered, and clicks in the gaps between dashes did nothing, so fast clicks often missed (#2). The rail now always fits in the pane: when headings don't fit, only higher-level headings get a dash and hidden ones count toward the dash above them; if even the top level doesn't fit, the dashes pack closer. A click anywhere on the rail jumps to the nearest dash, and moving the mouse only updates the dashes near it. Notes with few headings work as before.

## [0.5.0] - 2026-11-08

### Added
- **Keep the full outline open** setting (off by default): the full outline stays open at the edge of the note instead of the rail, like a docked outline panel, and the note makes room for it. Clicking a heading scrolls to it and Esc doesn't close it. Not on phones. (#1)

## [0.4.2] - 2026-10-31

### Fixed
- In a note under one single top heading, setting "Levels shown for other headings" to 1 or 2 looked the same, since that heading is everyone's parent and always open. It now counts as the title and levels count from the headings below it: 1 shows only the second-level headings, 2 shows down to the third level.

## [0.4.1] - 2026-10-31

### Changed
- "Expand only the current section" is now "Expand only the current heading": sections used to be split by top-level heading, so a note with a single top heading was always fully expanded. Now only the heading you're reading and the headings above it open, and the rest fold down to "Levels shown for other headings".

## [0.4.0] - 2026-10-31

### Added
- "Keep the outline open after clicking" setting: clicking a heading scrolls to it and leaves the outline open; close it with Esc or the command. While it's open, the section you're reading stays in view as you scroll.
- "Expand only the current section" setting: the section you're reading (or just clicked) is expanded all the way, and other sections show only their top headings ("Levels shown for other sections" sets how many). Arrows in front of headings expand or collapse one level on click and the whole branch on double-click; ←/→ do the same when the outline has keyboard focus. The row you click stays where it is when the list around it opens or closes.
- "Show full titles" setting: long headings wrap onto more lines instead of being cut off.
- Formulas in headings render as formulas in the outline and in section previews.

## [0.3.0] - 2026-10-21

### Added
- Commands to toggle the gogoga theme's focus mode and hover highlight, so they can have hotkeys.

## [0.2.1] - 2026-10-18

### Added
- Funding link.

## [0.2.0] - 2026-10-15

### Added
- English and Simplified Chinese interface, following Obsidian's language.
- English README with a Simplified Chinese translation.

## [0.1.1] - 2026-10-15

### Changed
- README demo GIF.

## [0.1.0] - 2026-10-14

First public release.

### Added
- A heading rail at the editor edge: one dash per heading, with the current section highlighted.
- A dock-style wave on hover, a preview card for the section under the pointer, and click to jump to the heading.
- Rest the pointer on the rail to unfold the whole outline; a command opens it pinned with keyboard navigation.
- Accurate jumps in both reading and editing mode, with one rail per pane.

[Unreleased]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.6.0...HEAD
[0.6.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.5.1...0.6.0
[0.5.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.4.2...0.5.0
[0.4.2]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/JackWeiGogoga/gogoga-outline/releases/tag/0.1.0
