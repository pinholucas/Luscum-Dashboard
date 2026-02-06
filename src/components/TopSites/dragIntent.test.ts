import {
  DragIntent,
  DWELL_TIME_MS,
  EXIT_GRACE_MS,
  INNER_ZONE_RATIO,
  createDwellTimer,
  getInnerZoneRect,
  isPointInRect,
  isPointerInInnerZone,
  Rect,
} from './dragIntent';

// ─── Geometry Tests ──────────────────────────────────────────────────────────

describe('getInnerZoneRect', () => {
  it('returns a centered rect scaled by INNER_ZONE_RATIO', () => {
    const tile: Rect = { left: 100, top: 200, width: 90, height: 80 };
    const inner = getInnerZoneRect(tile);

    const marginX = (90 * (1 - INNER_ZONE_RATIO)) / 2;
    const marginY = (80 * (1 - INNER_ZONE_RATIO)) / 2;

    expect(inner.left).toBeCloseTo(100 + marginX);
    expect(inner.top).toBeCloseTo(200 + marginY);
    expect(inner.width).toBeCloseTo(90 * INNER_ZONE_RATIO);
    expect(inner.height).toBeCloseTo(80 * INNER_ZONE_RATIO);
  });

  it('accepts a custom ratio', () => {
    const tile: Rect = { left: 0, top: 0, width: 100, height: 100 };
    const inner = getInnerZoneRect(tile, 0.5);

    expect(inner.left).toBe(25);
    expect(inner.top).toBe(25);
    expect(inner.width).toBe(50);
    expect(inner.height).toBe(50);
  });

  it('handles zero-dimension tile', () => {
    const tile: Rect = { left: 50, top: 50, width: 0, height: 0 };
    const inner = getInnerZoneRect(tile);

    expect(inner.width).toBe(0);
    expect(inner.height).toBe(0);
  });
});

describe('isPointInRect', () => {
  const rect: Rect = { left: 10, top: 20, width: 100, height: 50 };

  it('returns true for a point inside the rect', () => {
    expect(isPointInRect({ x: 50, y: 40 }, rect)).toBe(true);
  });

  it('returns true for a point on the boundary', () => {
    expect(isPointInRect({ x: 10, y: 20 }, rect)).toBe(true); // top-left
    expect(isPointInRect({ x: 110, y: 70 }, rect)).toBe(true); // bottom-right
  });

  it('returns false for a point outside the rect', () => {
    expect(isPointInRect({ x: 9, y: 20 }, rect)).toBe(false); // left
    expect(isPointInRect({ x: 111, y: 40 }, rect)).toBe(false); // right
    expect(isPointInRect({ x: 50, y: 19 }, rect)).toBe(false); // above
    expect(isPointInRect({ x: 50, y: 71 }, rect)).toBe(false); // below
  });
});

describe('isPointerInInnerZone', () => {
  const tile: Rect = { left: 0, top: 0, width: 100, height: 100 };

  it('returns true for the center of the tile', () => {
    expect(isPointerInInnerZone({ x: 50, y: 50 }, tile)).toBe(true);
  });

  it('returns false for a corner (outer zone)', () => {
    expect(isPointerInInnerZone({ x: 1, y: 1 }, tile)).toBe(false);
    expect(isPointerInInnerZone({ x: 99, y: 99 }, tile)).toBe(false);
  });

  it('returns false for a point in the outer margin', () => {
    // With default 0.65 ratio, inner starts at 17.5
    expect(isPointerInInnerZone({ x: 10, y: 50 }, tile)).toBe(false);
    expect(isPointerInInnerZone({ x: 50, y: 10 }, tile)).toBe(false);
  });

  it('returns true at the inner zone boundary', () => {
    const margin = (100 * (1 - INNER_ZONE_RATIO)) / 2;
    expect(isPointerInInnerZone({ x: margin, y: margin }, tile)).toBe(true);
  });

  it('returns false for zero-dimension tile', () => {
    const zeroTile: Rect = { left: 0, top: 0, width: 0, height: 0 };
    expect(isPointerInInnerZone({ x: 0, y: 0 }, zeroTile)).toBe(false);
  });
});

// ─── Dwell Timer Tests ───────────────────────────────────────────────────────

describe('createDwellTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in REORDER_GRID state', () => {
    const onArm = jest.fn();
    const onDisarm = jest.fn();
    const timer = createDwellTimer(onArm, onDisarm);

    const state = timer.getState();
    expect(state.intent).toBe(DragIntent.REORDER_GRID);
    expect(state.targetFolderId).toBeNull();
    expect(state.isArmed).toBe(false);

    timer.destroy();
  });

  it('arms after dwell time in a folder', () => {
    const onArm = jest.fn();
    const onDisarm = jest.fn();
    const timer = createDwellTimer(onArm, onDisarm);

    timer.enterFolder('folder-1');
    expect(onArm).not.toHaveBeenCalled();

    jest.advanceTimersByTime(DWELL_TIME_MS);

    expect(onArm).toHaveBeenCalledWith('folder-1');
    expect(timer.getState()).toEqual({
      intent: DragIntent.DROP_IN_FOLDER,
      targetFolderId: 'folder-1',
      targetWebsiteId: null,
      isArmed: true,
    });

    timer.destroy();
  });

  it('does not arm before dwell time elapses', () => {
    const onArm = jest.fn();
    const timer = createDwellTimer(onArm, jest.fn());

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS - 1);

    expect(onArm).not.toHaveBeenCalled();
    expect(timer.getState().isArmed).toBe(false);

    timer.destroy();
  });

  it('disarms after leaving folder + grace period', () => {
    const onArm = jest.fn();
    const onDisarm = jest.fn();
    const timer = createDwellTimer(onArm, onDisarm);

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS);
    expect(timer.getState().isArmed).toBe(true);

    timer.leaveFolder();
    jest.advanceTimersByTime(EXIT_GRACE_MS);

    expect(onDisarm).toHaveBeenCalled();
    expect(timer.getState().isArmed).toBe(false);

    timer.destroy();
  });

  it('cancels dwell timer when leaving before arm', () => {
    const onArm = jest.fn();
    const timer = createDwellTimer(onArm, jest.fn());

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS - 50);

    timer.leaveFolder();
    jest.advanceTimersByTime(100);

    expect(onArm).not.toHaveBeenCalled();
    expect(timer.getState().isArmed).toBe(false);

    timer.destroy();
  });

  it('stays armed when re-entering the same folder during grace period', () => {
    const onArm = jest.fn();
    const onDisarm = jest.fn();
    const timer = createDwellTimer(onArm, onDisarm);

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS);
    expect(timer.getState().isArmed).toBe(true);

    timer.leaveFolder();
    jest.advanceTimersByTime(EXIT_GRACE_MS - 10); // still within grace
    timer.enterFolder('folder-1'); // re-enter same folder

    jest.advanceTimersByTime(100); // well past grace period

    expect(onDisarm).not.toHaveBeenCalled();
    expect(timer.getState().isArmed).toBe(true);
    expect(timer.getState().targetFolderId).toBe('folder-1');

    timer.destroy();
  });

  it('resets when entering a different folder', () => {
    const onArm = jest.fn();
    const timer = createDwellTimer(onArm, jest.fn());

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS - 10);

    // Switch to another folder before arming
    timer.enterFolder('folder-2');
    jest.advanceTimersByTime(10);

    // folder-1 should not have armed
    expect(onArm).not.toHaveBeenCalled();

    // Wait for folder-2 to arm
    jest.advanceTimersByTime(DWELL_TIME_MS);
    expect(onArm).toHaveBeenCalledWith('folder-2');

    timer.destroy();
  });

  it('disarms armed folder and re-arms new folder', () => {
    const onArm = jest.fn();
    const onDisarm = jest.fn();
    const timer = createDwellTimer(onArm, onDisarm);

    // Arm folder-1
    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS);
    expect(timer.getState().targetFolderId).toBe('folder-1');

    // Move to folder-2 (resets)
    timer.enterFolder('folder-2');
    jest.advanceTimersByTime(DWELL_TIME_MS);

    expect(onArm).toHaveBeenCalledTimes(2);
    expect(onArm).toHaveBeenLastCalledWith('folder-2');
    expect(timer.getState().targetFolderId).toBe('folder-2');

    timer.destroy();
  });

  it('clears all timers on destroy', () => {
    const onArm = jest.fn();
    const timer = createDwellTimer(onArm, jest.fn());

    timer.enterFolder('folder-1');
    timer.destroy();

    jest.advanceTimersByTime(DWELL_TIME_MS + 100);
    expect(onArm).not.toHaveBeenCalled();
  });

  it('clearDwell resets internal state', () => {
    const onArm = jest.fn();
    const timer = createDwellTimer(onArm, jest.fn());

    timer.enterFolder('folder-1');
    jest.advanceTimersByTime(DWELL_TIME_MS);
    expect(timer.getState().isArmed).toBe(true);

    timer.clearDwell();

    expect(timer.getState()).toEqual({
      intent: DragIntent.REORDER_GRID,
      targetFolderId: null,
      targetWebsiteId: null,
      isArmed: false,
    });

    timer.destroy();
  });
});
