/**
 * Drag Intent System
 *
 * Implements mobile-style intent detection for drag-and-drop interactions
 * in a grid containing both apps and folders.
 *
 * ## How it works
 *
 * When dragging an app over a folder tile, the system distinguishes between
 * two intents:
 *
 * 1. **REORDER_GRID** (default) — The user wants to reorder items in the grid.
 *    This is the normal SortableJS behavior.
 *
 * 2. **DROP_IN_FOLDER** — The user wants to drop the app into a folder.
 *    This activates only when the pointer is within the **inner zone** (central
 *    65% of the folder tile) AND has dwelled there for at least 200ms.
 *
 * ## Thresholds & UX decisions
 *
 * - **INNER_ZONE_RATIO (0.65)**: The inner 65% of the folder tile acts as the
 *   "drop into folder" zone. The outer 35% (17.5% per edge) is the "pass through"
 *   zone where reorder behavior continues. This prevents accidental folder drops
 *   when quickly dragging past a folder.
 *
 * - **DWELL_TIME_MS (200)**: The pointer must remain in the inner zone for 200ms
 *   before the folder-drop intent arms. This prevents accidental activation when
 *   swiping across the grid quickly. 200ms feels responsive without being twitchy.
 *
 * - **EXIT_GRACE_MS (50)**: After leaving the inner zone, there's a 50ms grace
 *   period before disarming. This prevents flickering when the pointer wobbles
 *   near the zone boundary.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export enum DragIntent {
  REORDER_GRID = 'REORDER_GRID',
  DROP_IN_FOLDER = 'DROP_IN_FOLDER',
  CREATE_FOLDER = 'CREATE_FOLDER',
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface FolderDropState {
  intent: DragIntent;
  targetFolderId: string | null;
  /** When intent is CREATE_FOLDER, this is the website being hovered */
  targetWebsiteId: string | null;
  isArmed: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Ratio of the tile that counts as "inner zone" for folder drop (0–1) */
export const INNER_ZONE_RATIO = 0.9;

/** Time in ms the pointer must dwell in the inner zone before arming */
export const DWELL_TIME_MS = 200;

/** Grace period in ms after leaving inner zone before disarming */
export const EXIT_GRACE_MS = 50;

// ─── Geometry ────────────────────────────────────────────────────────────────

/**
 * Calculates the inner drop zone rect from the full tile rect.
 * The inner zone is centered within the tile, scaled by INNER_ZONE_RATIO.
 *
 * @example
 * // For a 90x80 tile at (100, 200):
 * // margin-x = 90 * (1 - 0.65) / 2 = 15.75
 * // margin-y = 80 * (1 - 0.65) / 2 = 14
 * // inner = { left: 115.75, top: 214, width: 58.5, height: 52 }
 */
export function getInnerZoneRect(
  tileRect: Rect,
  ratio: number = INNER_ZONE_RATIO,
): Rect {
  const marginX = (tileRect.width * (1 - ratio)) / 2;
  const marginY = (tileRect.height * (1 - ratio)) / 2;

  return {
    left: tileRect.left + marginX,
    top: tileRect.top + marginY,
    width: tileRect.width * ratio,
    height: tileRect.height * ratio,
  };
}

/**
 * Tests whether a point is inside a rect.
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
}

/**
 * Determines whether the pointer is in the inner zone of a folder tile.
 * Returns false if the tileRect has zero dimensions (element not mounted).
 */
export function isPointerInInnerZone(
  pointer: Point,
  tileRect: Rect,
  ratio: number = INNER_ZONE_RATIO,
): boolean {
  if (tileRect.width === 0 || tileRect.height === 0) return false;
  const innerRect = getInnerZoneRect(tileRect, ratio);
  return isPointInRect(pointer, innerRect);
}

// ─── Dwell Timer ─────────────────────────────────────────────────────────────

export type DwellTimerCallback = (folderId: string) => void;

/**
 * Creates a dwell timer manager to track pointer dwell time in folder zones.
 * This is a stateful object that should be created once per drag session.
 */
export function createDwellTimer(
  onArm: DwellTimerCallback,
  onDisarm: () => void,
  dwellTime: number = DWELL_TIME_MS,
  graceTime: number = EXIT_GRACE_MS,
) {
  let dwellTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let graceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentFolderId: string | null = null;
  let isArmed = false;

  function enterFolder(folderId: string) {
    // Clear any grace period from leaving
    if (graceTimeoutId !== null) {
      clearTimeout(graceTimeoutId);
      graceTimeoutId = null;
    }

    // If re-entering the same armed folder, just restore
    if (isArmed && currentFolderId === folderId) {
      return;
    }

    // If entering a different folder, reset
    if (currentFolderId !== folderId) {
      clearDwell();
      currentFolderId = folderId;
    }

    // Start dwell timer
    if (dwellTimeoutId === null && !isArmed) {
      dwellTimeoutId = setTimeout(() => {
        dwellTimeoutId = null;
        isArmed = true;
        onArm(folderId);
      }, dwellTime);
    }
  }

  function leaveFolder() {
    // Clear pending dwell
    if (dwellTimeoutId !== null) {
      clearTimeout(dwellTimeoutId);
      dwellTimeoutId = null;
    }

    // If armed, start grace period before disarming
    if (isArmed) {
      if (graceTimeoutId === null) {
        graceTimeoutId = setTimeout(() => {
          graceTimeoutId = null;
          isArmed = false;
          currentFolderId = null;
          onDisarm();
        }, graceTime);
      }
    } else {
      currentFolderId = null;
    }
  }

  function clearDwell() {
    if (dwellTimeoutId !== null) {
      clearTimeout(dwellTimeoutId);
      dwellTimeoutId = null;
    }
    if (graceTimeoutId !== null) {
      clearTimeout(graceTimeoutId);
      graceTimeoutId = null;
    }
    isArmed = false;
    currentFolderId = null;
  }

  function getState(): FolderDropState {
    return {
      intent: isArmed ? DragIntent.DROP_IN_FOLDER : DragIntent.REORDER_GRID,
      targetFolderId: isArmed ? currentFolderId : null,
      targetWebsiteId: null,
      isArmed,
    };
  }

  function destroy() {
    clearDwell();
    onDisarm();
  }

  return {
    enterFolder,
    leaveFolder,
    clearDwell,
    getState,
    destroy,
  };
}
