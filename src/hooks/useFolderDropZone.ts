import { useCallback, useRef, useState } from 'react';
import {
  createDwellTimer,
  DragIntent,
  FolderDropState,
  isPointerInInnerZone,
  Point,
  Rect,
} from 'components/TopSites/dragIntent';

export interface UseFolderDropZoneReturn {
  /** Current drag intent state */
  dropState: FolderDropState;
  /** Call on every pointer move during drag */
  handlePointerMove: (pointer: Point) => void;
  /** Call when drag starts */
  handleDragStart: (draggedItemId: string) => void;
  /** Call when drag ends — returns the final state for deciding action */
  handleDragEnd: () => FolderDropState;
  /** Whether a specific folder is the active drop target */
  isFolderArmed: (folderId: string) => boolean;
  /** Whether a specific website is the active merge target (create folder) */
  isWebsiteArmed: (websiteId: string) => boolean;
}

const INITIAL_STATE: FolderDropState = {
  intent: DragIntent.REORDER_GRID,
  targetFolderId: null,
  targetWebsiteId: null,
  isArmed: false,
};

/**
 * React hook that manages folder drop zone detection during drag operations.
 *
 * It tracks pointer position, detects when the pointer enters the inner zone
 * of a folder tile, and manages dwell timing to arm/disarm the folder drop.
 *
 * Usage:
 * 1. Call handleDragStart() when SortableJS starts a drag
 * 2. Attach a pointermove listener that calls handlePointerMove()
 * 3. On SortableJS onEnd, call handleDragEnd() to get the final intent
 * 4. If intent === DROP_IN_FOLDER, perform the folder insertion instead of reorder
 */
export function useFolderDropZone(): UseFolderDropZoneReturn {
  const [dropState, setDropState] = useState<FolderDropState>(INITIAL_STATE);
  const folderTimerRef = useRef<ReturnType<typeof createDwellTimer> | null>(
    null,
  );
  const websiteTimerRef = useRef<ReturnType<typeof createDwellTimer> | null>(
    null,
  );
  const draggedItemIdRef = useRef<string | null>(null);
  const lastStateRef = useRef<FolderDropState>(INITIAL_STATE);

  const handleDragStart = useCallback((draggedItemId: string) => {
    draggedItemIdRef.current = draggedItemId;

    // Create fresh dwell timers for this drag session
    folderTimerRef.current?.destroy();
    websiteTimerRef.current?.destroy();

    // Folder drop timer
    folderTimerRef.current = createDwellTimer(
      (folderId) => {
        // Disarm website timer if folder arms
        websiteTimerRef.current?.clearDwell();
        const newState: FolderDropState = {
          intent: DragIntent.DROP_IN_FOLDER,
          targetFolderId: folderId,
          targetWebsiteId: null,
          isArmed: true,
        };
        lastStateRef.current = newState;
        setDropState(newState);
      },
      () => {
        lastStateRef.current = INITIAL_STATE;
        setDropState(INITIAL_STATE);
      },
    );

    // Website merge timer (create folder from two websites)
    websiteTimerRef.current = createDwellTimer(
      (websiteId) => {
        // Disarm folder timer if website arms
        folderTimerRef.current?.clearDwell();
        const newState: FolderDropState = {
          intent: DragIntent.CREATE_FOLDER,
          targetFolderId: null,
          targetWebsiteId: websiteId,
          isArmed: true,
        };
        lastStateRef.current = newState;
        setDropState(newState);
      },
      () => {
        lastStateRef.current = INITIAL_STATE;
        setDropState(INITIAL_STATE);
      },
    );

    lastStateRef.current = INITIAL_STATE;
    setDropState(INITIAL_STATE);
  }, []);

  const handlePointerMove = useCallback((pointer: Point) => {
    if (!folderTimerRef.current || !websiteTimerRef.current) return;

    // Check folder elements
    const folderElements =
      document.querySelectorAll<HTMLElement>('[data-folder-id]');
    let foundTarget = false;

    const folders = Array.from(folderElements);
    for (let i = 0; i < folders.length; i++) {
      const el = folders[i];
      const folderId = el.dataset.folderId;
      if (!folderId) continue;
      if (folderId === draggedItemIdRef.current) continue;

      const domRect = el.getBoundingClientRect();
      const tileRect: Rect = {
        left: domRect.left,
        top: domRect.top,
        width: domRect.width,
        height: domRect.height,
      };

      if (isPointerInInnerZone(pointer, tileRect)) {
        folderTimerRef.current.enterFolder(folderId);
        websiteTimerRef.current.leaveFolder();
        foundTarget = true;
        break;
      }
    }

    // Check website elements (for website-on-website merge)
    if (!foundTarget) {
      const websiteElements =
        document.querySelectorAll<HTMLElement>('[data-website-id]');
      const websites = Array.from(websiteElements);
      for (let i = 0; i < websites.length; i++) {
        const el = websites[i];
        const websiteId = el.dataset.websiteId;
        if (!websiteId) continue;
        if (websiteId === draggedItemIdRef.current) continue;

        const domRect = el.getBoundingClientRect();
        const tileRect: Rect = {
          left: domRect.left,
          top: domRect.top,
          width: domRect.width,
          height: domRect.height,
        };

        if (isPointerInInnerZone(pointer, tileRect)) {
          websiteTimerRef.current.enterFolder(websiteId);
          folderTimerRef.current.leaveFolder();
          foundTarget = true;
          break;
        }
      }
    }

    if (!foundTarget) {
      folderTimerRef.current.leaveFolder();
      websiteTimerRef.current.leaveFolder();
    }
  }, []);

  const handleDragEnd = useCallback((): FolderDropState => {
    // Check folder timer first, then website timer
    const folderState = folderTimerRef.current?.getState();
    const websiteState = websiteTimerRef.current?.getState();

    let finalState: FolderDropState = INITIAL_STATE;
    if (folderState?.isArmed) {
      finalState = folderState;
    } else if (websiteState?.isArmed) {
      finalState = {
        intent: DragIntent.CREATE_FOLDER,
        targetFolderId: null,
        targetWebsiteId: websiteState.targetFolderId, // reused field from dwell timer
        isArmed: true,
      };
    }

    folderTimerRef.current?.destroy();
    websiteTimerRef.current?.destroy();
    folderTimerRef.current = null;
    websiteTimerRef.current = null;
    draggedItemIdRef.current = null;

    lastStateRef.current = INITIAL_STATE;
    setDropState(INITIAL_STATE);

    return finalState;
  }, []);

  const isFolderArmed = useCallback(
    (folderId: string) => {
      return (
        dropState.isArmed &&
        dropState.intent === DragIntent.DROP_IN_FOLDER &&
        dropState.targetFolderId === folderId
      );
    },
    [dropState],
  );

  const isWebsiteArmed = useCallback(
    (websiteId: string) => {
      return (
        dropState.isArmed &&
        dropState.intent === DragIntent.CREATE_FOLDER &&
        dropState.targetWebsiteId === websiteId
      );
    },
    [dropState],
  );

  return {
    dropState,
    handlePointerMove,
    handleDragStart,
    handleDragEnd,
    isFolderArmed,
    isWebsiteArmed,
  };
}
