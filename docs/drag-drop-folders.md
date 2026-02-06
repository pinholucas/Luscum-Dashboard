# Drag & Drop Into Folders

This document describes the mobile-style drag intent system that enables users to drop apps into folders by dragging them over a folder tile.

## Architecture

The system is built in three layers:

```
┌─────────────────────────────────────────────────┐
│  TopSites.tsx                                   │
│  Orchestrates SortableJS events, decides        │
│  between reorder vs folder-drop                 │
├─────────────────────────────────────────────────┤
│  useFolderDropZone.ts (React hook)              │
│  Manages state, DOM queries, pointer tracking   │
├─────────────────────────────────────────────────┤
│  dragIntent.ts (pure utilities)                 │
│  Geometry math, dwell timer, no React deps      │
└─────────────────────────────────────────────────┘
```

### `dragIntent.ts` — Pure Utility Module

Contains all geometry calculations and the dwell timer state machine. Has **zero React dependencies**, making it easy to test and reuse.

**Exports:**

- `DragIntent` enum — `REORDER_GRID` | `DROP_IN_FOLDER`
- `getInnerZoneRect()` — calculates the inner drop zone from a tile's bounding rect
- `isPointInRect()` — hit-test a point against a rect
- `isPointerInInnerZone()` — combines the above to check if a pointer is in the folder's inner zone
- `createDwellTimer()` — stateful timer manager for a single drag session

### `useFolderDropZone.ts` — React Hook

Wraps `dragIntent.ts` in React state management. Queries the DOM for `[data-folder-id]` elements during pointer movement to detect which folder (if any) the pointer is hovering over.

**Returns:**

- `dropState` — current `FolderDropState` (intent, targetFolderId, isArmed)
- `handleDragStart(draggedItemId)` — call when SortableJS starts a drag
- `handleDragEnd()` — call on SortableJS `onEnd`; returns the final intent state
- `handlePointerMove(point)` — feed pointer coordinates during drag
- `isFolderArmed(folderId)` — check if a specific folder is the active drop target

### `TopSites.tsx` — Integration

Wires SortableJS events to the hook and makes the decision:

- If `handleDragEnd()` returns `DROP_IN_FOLDER` → restore pre-drag order, move the dragged website into the target folder
- Otherwise → normal SortableJS reorder

### `FolderContainer.tsx` — Visual Feedback

Accepts `isDropTarget` prop and `data-folder-id` attribute. When armed:

- Scale up (1.08×)
- Blue border highlight
- Glow box shadow
- Smooth CSS transitions (150ms)

## UX Thresholds

| Constant           | Value | Purpose                                                                          |
| ------------------ | ----- | -------------------------------------------------------------------------------- |
| `INNER_ZONE_RATIO` | `0.9` | Central 90% of tile = drop zone. Outer 10% = pass-through for reorder.           |
| `DWELL_TIME_MS`    | `200` | Pointer must stay in inner zone for 200ms before arming.                         |
| `EXIT_GRACE_MS`    | `50`  | After leaving inner zone, 50ms grace before disarming (prevents wobble flicker). |

### Why these values?

- **65% inner zone**: Provides enough margin that quick drags across folders don't trigger accidental drops. The 17.5% edge margin per side acts as a "gutter" for grid reordering.
- **200ms dwell**: Fast enough to feel responsive, slow enough to filter out pass-through drags. Inspired by iOS/Android home screen folder UX.
- **50ms grace**: Prevents flickering when the pointer wobbles near the boundary. Too short to notice, long enough to stabilize.

## How It Works (Step by Step)

1. User starts dragging a website → `onSortStart` fires
2. `handleDragStart(draggedId)` creates a fresh dwell timer and stores the dragged item ID
3. A `pointermove` listener feeds coordinates to `handlePointerMove()`
4. On each move, the hook queries all `[data-folder-id]` elements and checks if the pointer is in any inner zone
5. If the pointer enters an inner zone → `dwellTimer.enterFolder(folderId)` starts a 200ms countdown
6. If the pointer leaves before 200ms → timer cancels, intent stays `REORDER_GRID`
7. If 200ms passes → folder **arms**, `FolderContainer` shows visual feedback (scale/glow)
8. User releases → `onSortEnd` fires → `handleDragEnd()` returns the final state
9. If armed → website is removed from root and added to the target folder's `websites[]`
10. If not armed → normal SortableJS reorder proceeds

## Testing

### Unit Tests (`dragIntent.test.ts`)

21 tests covering:

- `getInnerZoneRect` — geometry math, custom ratios, edge cases
- `isPointInRect` — boundary, inside, outside
- `isPointerInInnerZone` — center, corners, outer margin, zero dimensions
- `createDwellTimer` — arming, disarming, grace period, re-entry, folder switching, cleanup

### Integration Tests (`useFolderDropZone.test.ts`)

8 tests covering:

- Initial state
- Full arm cycle (drag → pointer move → dwell → arm)
- Outer zone rejection
- Self-drop prevention (folder into itself)
- `handleDragEnd` return value and reset
- Disarming after grace period

Run tests:

```bash
npx react-scripts test --watchAll=false
```
