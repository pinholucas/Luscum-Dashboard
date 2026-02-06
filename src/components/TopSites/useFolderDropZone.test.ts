import { renderHook, act } from '@testing-library/react';
import { useFolderDropZone } from 'hooks/useFolderDropZone';
import { DragIntent, DWELL_TIME_MS, EXIT_GRACE_MS } from './dragIntent';

// Mock folder elements in the DOM
function createFolderElement(
  folderId: string,
  rect: { left: number; top: number; width: number; height: number },
): HTMLDivElement {
  const el = document.createElement('div');
  el.setAttribute('data-folder-id', folderId);
  el.getBoundingClientRect = () => ({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => {},
  });
  document.body.appendChild(el);
  return el;
}

describe('useFolderDropZone', () => {
  let folderElements: HTMLDivElement[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
    folderElements = [];
  });

  afterEach(() => {
    jest.useRealTimers();
    folderElements.forEach((el) => el.remove());
  });

  it('initializes with REORDER_GRID intent', () => {
    const { result } = renderHook(() => useFolderDropZone());

    expect(result.current.dropState.intent).toBe(DragIntent.REORDER_GRID);
    expect(result.current.dropState.isArmed).toBe(false);
    expect(result.current.dropState.targetFolderId).toBeNull();
  });

  it('isFolderArmed returns false initially', () => {
    const { result } = renderHook(() => useFolderDropZone());
    expect(result.current.isFolderArmed('any-folder')).toBe(false);
  });

  it('arms a folder after drag + pointer dwell in inner zone', () => {
    // Set up a 100x100 folder element at (0,0)
    folderElements.push(
      createFolderElement('folder-1', {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    );

    const { result } = renderHook(() => useFolderDropZone());

    // Start drag with a different item
    act(() => {
      result.current.handleDragStart('website-1');
    });

    // Move pointer to center of folder (inner zone)
    act(() => {
      result.current.handlePointerMove({ x: 50, y: 50 });
    });

    // Not armed yet
    expect(result.current.isFolderArmed('folder-1')).toBe(false);

    // Advance past dwell time
    act(() => {
      jest.advanceTimersByTime(DWELL_TIME_MS);
    });

    expect(result.current.isFolderArmed('folder-1')).toBe(true);
    expect(result.current.dropState.intent).toBe(DragIntent.DROP_IN_FOLDER);
    expect(result.current.dropState.targetFolderId).toBe('folder-1');
  });

  it('does not arm when pointer is in outer zone (edge)', () => {
    folderElements.push(
      createFolderElement('folder-1', {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    );

    const { result } = renderHook(() => useFolderDropZone());

    act(() => {
      result.current.handleDragStart('website-1');
    });

    // Pointer in outer margin (corner)
    act(() => {
      result.current.handlePointerMove({ x: 5, y: 5 });
    });

    act(() => {
      jest.advanceTimersByTime(DWELL_TIME_MS + 100);
    });

    expect(result.current.isFolderArmed('folder-1')).toBe(false);
    expect(result.current.dropState.intent).toBe(DragIntent.REORDER_GRID);
  });

  it('does not arm when dragging a folder over itself', () => {
    folderElements.push(
      createFolderElement('folder-1', {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    );

    const { result } = renderHook(() => useFolderDropZone());

    // Start dragging folder-1 itself
    act(() => {
      result.current.handleDragStart('folder-1');
    });

    act(() => {
      result.current.handlePointerMove({ x: 50, y: 50 });
    });

    act(() => {
      jest.advanceTimersByTime(DWELL_TIME_MS + 100);
    });

    expect(result.current.isFolderArmed('folder-1')).toBe(false);
  });

  it('handleDragEnd returns final state and resets', () => {
    folderElements.push(
      createFolderElement('folder-1', {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    );

    const { result } = renderHook(() => useFolderDropZone());

    act(() => {
      result.current.handleDragStart('website-1');
    });

    act(() => {
      result.current.handlePointerMove({ x: 50, y: 50 });
    });

    act(() => {
      jest.advanceTimersByTime(DWELL_TIME_MS);
    });

    let finalState: ReturnType<typeof result.current.handleDragEnd>;
    act(() => {
      finalState = result.current.handleDragEnd();
    });

    expect(finalState!.intent).toBe(DragIntent.DROP_IN_FOLDER);
    expect(finalState!.targetFolderId).toBe('folder-1');

    // State should be reset after drag end
    expect(result.current.dropState.intent).toBe(DragIntent.REORDER_GRID);
    expect(result.current.isFolderArmed('folder-1')).toBe(false);
  });

  it('handleDragEnd returns REORDER_GRID when no folder armed', () => {
    const { result } = renderHook(() => useFolderDropZone());

    act(() => {
      result.current.handleDragStart('website-1');
    });

    let finalState: ReturnType<typeof result.current.handleDragEnd>;
    act(() => {
      finalState = result.current.handleDragEnd();
    });

    expect(finalState!.intent).toBe(DragIntent.REORDER_GRID);
    expect(finalState!.targetFolderId).toBeNull();
  });

  it('disarms folder when pointer leaves inner zone after grace period', () => {
    folderElements.push(
      createFolderElement('folder-1', {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    );

    const { result } = renderHook(() => useFolderDropZone());

    act(() => {
      result.current.handleDragStart('website-1');
    });

    // Move to inner zone and dwell
    act(() => {
      result.current.handlePointerMove({ x: 50, y: 50 });
    });
    act(() => {
      jest.advanceTimersByTime(DWELL_TIME_MS);
    });
    expect(result.current.isFolderArmed('folder-1')).toBe(true);

    // Move away (no folder match)
    act(() => {
      result.current.handlePointerMove({ x: 500, y: 500 });
    });

    // Wait for grace period
    act(() => {
      jest.advanceTimersByTime(EXIT_GRACE_MS);
    });

    expect(result.current.isFolderArmed('folder-1')).toBe(false);
    expect(result.current.dropState.intent).toBe(DragIntent.REORDER_GRID);
  });
});
