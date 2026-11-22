# Changelog

All notable changes to gogoga Outline are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). 中文版见 [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md).

## [Unreleased]

## [0.10.0] - 2026-11-23

### Added
- Quieter rail options (the rail felt distracting, per the user group): "Dash length" shortens the rail's dashes (4–16 px, default 12), and "Hide the rail until the pointer is near" keeps it invisible until the pointer comes near that edge of the note; an open panel shows as usual. Not on phones and tablets, which have no hover.
- With "Keep the full outline open" on, drag the panel's inner edge to resize it, like the divider between split panes in Obsidian; it works with a finger on phones and tablets too. The width is saved to the Panel width setting, and double-clicking the edge resets it (suggested in the user group). The setting's range is now 140–600.

### Fixed
- On tablets in split screen, "Keep the full outline open" was unreliable: after jumping to a heading and scrolling a little, the outline closed but the note still left room for it (reported in the user group). Split screen narrows the window and Obsidian switches to its phone layout, which the plugin took for a phone; it now checks the device's screen, so tablets keep the outline open in split screen, and the panel and the note's spacing update together when the window size changes.

## [0.9.0] - 2026-11-17

### Added
- Long-press the rail on phones and tablets to drag through the outline (user suggestion): the dashes ripple under your finger, the heading name floats beside it, and the note scrolls to that section as you slide up and down — like a scrollbar with a table of contents. Lift your finger to stay there.

### Changed
- On touch screens, a quick tap on the rail no longer jumps to a heading, so brushing the rail while scrolling the note doesn't send you elsewhere. Swiping that starts on the rail still scrolls the note as usual.

## [0.8.2] - 2026-11-17

### Fixed
- On desktop, after opening the outline from the search box (or the magnifier or a command), clicking the note or anywhere else didn't close the panel — only Esc did (user report). Clicking outside the outline now closes it and clears the search, as on mobile. A docked outline still stays open; with "Keep the outline open after clicking", clicking a heading keeps it open and clicking the note closes it.

## [0.8.1] - 2026-11-17

### Changed
- Renamed to gogoga Outline (capitalized) to match the other gogoga plugins. The plugin id is unchanged, so settings and hotkeys carry over.

## [0.8.0] - 2026-11-17

### Added
- "Fold arrows" setting (off by default, suggested by RainyGrass in #2): headings with subheadings get an arrow in the full outline and everything starts unfolded; click to fold or unfold that section, double-click to unfold everything under it. Folds last while the note stays open.
- "Levels shown for other headings" has an "All" option, so with "Expand only the current heading" on the rest of the outline can stay unfolded except for the arrows you click.

### Fixed
- Searching headings on phones (#2, reported by RainyGrass):
  - When the keyboard came up the panel ran off the screen and the search box went out of sight above it. On phones the panel now sits below the title bar, keeps clear of the bottom navigation bar and the keyboard, shrinks with the visible area, and keeps the search box at the top.
  - The panel couldn't be closed after hiding the keyboard. Tapping outside it now closes it; hiding just the keyboard leaves it open so you can keep scrolling the results.
  - Switching to another note kept the previous note's search open. Switching now closes the panel and clears the search (with the outline kept open, it only clears the search).
  - Lag: editing text without touching headings no longer rebuilds the whole outline; the rail is no longer rebuilt on every frame of the keyboard animation; search results are reused, so each keystroke only updates the rows that changed, without starting transitions on hundreds of rows.
  - Touching the rail on a touch screen no longer pops up the section preview.
- Matches marked on the rail during a search are no longer lost when the rail is rebuilt (for example after the window height changes).
- Turning the plugin on made the full outline flash and slide away, and the first note opened after Obsidian started could lose the buttons at its top right, leaving a blank strip (#2, reported by RainyGrass). The stylesheet arrived a moment after the outline was built, so the unstyled outline briefly spread across the note. The outline now stays hidden until its styles are in.

## [0.7.0] - 2026-11-16

### Added
- Search headings (#2): a search box at the top of the full outline keeps only the matching headings, with their parent headings shown lighter; matched text is highlighted and the count shown. All words must appear, case is ignored, and headings deeper than the panel's level limit are searched too; the matching dashes on the rail turn accent-colored. Hover the rail and click the magnifier at its top, use the `Search headings` command, or just type while the panel has focus. ↓/↑ move between matches, Enter jumps, Esc clears and then closes.
- Setting "Show heading levels" (off by default): puts H1, H2, H3… in front of each row of the full outline.

### Fixed
- After opening the panel with the `Toggle global outline` command, focus sometimes went back to the note, so the arrow keys and Enter didn't reach the panel.

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

[Unreleased]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.10.0...HEAD
[0.10.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.8.2...0.9.0
[0.8.2]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.8.1...0.8.2
[0.8.1]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/JackWeiGogoga/gogoga-outline/compare/0.6.0...0.7.0
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
