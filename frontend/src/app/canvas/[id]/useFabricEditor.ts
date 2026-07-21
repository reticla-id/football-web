"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  FabricImage,
  Group,
  Point,
  Rect,
  Textbox,
  type FabricObject,
} from "fabric";

import { cn } from "@/lib/utils";

type EditorObject = FabricObject & {
  type?: string;
  fill?: unknown;
  fontSize?: number;
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right" | "justify";
  charSpacing?: number;
  lineHeight?: number;
  data?: {
    editorId?: string;
    isBaseLayer?: boolean;
  };
};

type FabricPointerEvent = {
  e: MouseEvent | TouchEvent | PointerEvent;
};

type SelectedObjectState = {
  id: string | null;
  type: string | null;
  fill: string;
  opacity: number;
  angle: number;
  fontSize: number;
  fontWeight: string | number;
  textAlign: "left" | "center" | "right" | "justify";
  charSpacing: number;
  lineHeight: number;
};

type UseFabricEditorOptions = {
  width: number;
  height: number;
  initialJson?: string | null;
  initialBaseLayerUrl?: string | null;
  onDirtyChange?: (json: string) => void;
};

const defaultSelectedObjectState: SelectedObjectState = {
  id: null,
  type: null,
  fill: "#ffffff",
  opacity: 1,
  angle: 0,
  fontSize: 36,
  fontWeight: 600,
  textAlign: "left",
  charSpacing: 0,
  lineHeight: 1.16,
};

function logCanvasRender(stage: string, payload?: Record<string, unknown>) {
  console.log("[CanvasRender]", stage, payload ?? {});
}

function describeCanvasObject(object: FabricObject | null) {
  if (!object) {
    return null;
  }

  const editorObject = object as EditorObject;

  return {
    type: editorObject.type ?? object.constructor.name,
    width: "width" in object ? object.width ?? null : null,
    height: "height" in object ? object.height ?? null : null,
    scaleX: object.scaleX ?? null,
    scaleY: object.scaleY ?? null,
    left: object.left ?? null,
    top: object.top ?? null,
    visible: object.visible ?? null,
    opacity: object.opacity ?? null,
    selectable: object.selectable ?? null,
    evented: object.evented ?? null,
    isBaseLayer: Boolean(editorObject.data?.isBaseLayer),
  };
}

function describeCanvas(canvas: Canvas) {
  return {
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    objectCount: canvas.getObjects().length,
    objects: canvas.getObjects().map((object) => describeCanvasObject(object)),
    viewportTransform: canvas.viewportTransform ?? null,
  };
}

function scheduleCanvasSnapshot(canvas: Canvas, stage: string) {
  window.setTimeout(() => {
    logCanvasRender(stage, {
      canvas: describeCanvas(canvas),
      activeObject: describeCanvasObject(canvas.getActiveObject() ?? null),
      backgroundImage: describeCanvasObject((canvas.backgroundImage as FabricObject | undefined) ?? null),
      clipPath: describeCanvasObject((canvas.clipPath as FabricObject | undefined) ?? null),
    });
  }, 1000);
}

function getImageElementDimensions(image: FabricImage) {
  const element = image.getElement() as HTMLImageElement | HTMLCanvasElement | undefined;

  return {
    width: element?.width ?? null,
    height: element?.height ?? null,
    naturalWidth:
      element instanceof HTMLImageElement ? element.naturalWidth || element.width || null : null,
    naturalHeight:
      element instanceof HTMLImageElement ? element.naturalHeight || element.height || null : null,
  };
}

function getWorkspaceFitZoom(
  canvasWidth: number,
  canvasHeight: number,
  stageWidth: number,
  stageHeight: number
) {
  const padding = stageWidth < 768 ? 20 : 36;
  const availableWidth = Math.max(stageWidth - padding * 2, 120);
  const availableHeight = Math.max(stageHeight - padding * 2, 120);
  const widthRatio = availableWidth / Math.max(canvasWidth, 1);
  const heightRatio = availableHeight / Math.max(canvasHeight, 1);
  const nextZoom = Math.min(widthRatio, heightRatio);

  if (!Number.isFinite(nextZoom) || nextZoom <= 0) {
    return 1;
  }

  return nextZoom;
}

export function useFabricEditor({
  width,
  height,
  initialJson,
  initialBaseLayerUrl,
  onDirtyChange,
}: UseFabricEditorOptions) {
  const canvasElementNodeRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerNodeRef = useRef<HTMLDivElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [stageContainerElement, setStageContainerElement] = useState<HTMLDivElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const baseLayerRef = useRef<FabricObject | null>(null);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const panModeRef = useRef(false);
  const didLoadInitialStateRef = useRef(false);
  const hasPendingBaseLayerRef = useRef(false);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const [selectedObjectState, setSelectedObjectState] = useState<SelectedObjectState>(
    defaultSelectedObjectState
  );
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);

  const canvasElementRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasElementNodeRef.current = node;
    setCanvasElement(node);
    logCanvasRender("fabric:canvas-ref", {
      hasNode: Boolean(node),
    });
  }, []);

  const stageContainerRef = useCallback((node: HTMLDivElement | null) => {
    stageContainerNodeRef.current = node;
    setStageContainerElement(node);
    logCanvasRender("fabric:stage-ref", {
      hasNode: Boolean(node),
    });
  }, []);

  useEffect(() => {
    logCanvasRender("editor-hook:mount", {
      width,
      height,
      initialJsonPresent: Boolean(initialJson),
      initialBaseLayerUrl: initialBaseLayerUrl ?? null,
    });

    return () => {
      logCanvasRender("editor-hook:unmount", {
        width: widthRef.current,
        height: heightRef.current,
      });
    };
  }, [height, initialBaseLayerUrl, initialJson, width]);

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  }, [onDirtyChange]);

  useEffect(() => {
    panModeRef.current = panMode;
  }, [panMode]);

  useEffect(() => {
    widthRef.current = width;
    heightRef.current = height;
  }, [height, width]);

  const fitCanvasToWorkspace = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const stageElement = stageContainerNodeRef.current;

    if (!canvas || !stageElement) {
      return;
    }

    const nextStageWidth = stageElement.clientWidth;
    const nextStageHeight = stageElement.clientHeight;

    if (!nextStageWidth || !nextStageHeight) {
      return;
    }

    const nextDisplayScale = getWorkspaceFitZoom(
      widthRef.current,
      heightRef.current,
      nextStageWidth,
      nextStageHeight
    );
    const cssWidth = Math.max(widthRef.current * nextDisplayScale, 1);
    const cssHeight = Math.max(heightRef.current * nextDisplayScale, 1);

    canvas.setDimensions(
      {
        width: `${cssWidth}px`,
        height: `${cssHeight}px`,
      },
      { cssOnly: true }
    );
    canvas.wrapperEl.style.maxWidth = "100%";
    canvas.wrapperEl.style.maxHeight = "100%";
    canvas.wrapperEl.style.margin = "0 auto";
    canvas.wrapperEl.style.flexShrink = "0";
    canvas.calcOffset();
    canvas.requestRenderAll();
    canvas.renderAll();
    setZoom(Number(canvas.getZoom().toFixed(2)));

    logCanvasRender("fabric:fit-workspace", {
      stageWidth: nextStageWidth,
      stageHeight: nextStageHeight,
      displayScale: nextDisplayScale,
      cssWidth,
      cssHeight,
      zoom: canvas.getZoom(),
      canvas: describeCanvas(canvas),
    });
  }, []);

  useEffect(() => {
    if (!canvasElement) {
      logCanvasRender("fabric:create:waiting-for-canvas-element", {});
      return;
    }

    if (fabricCanvasRef.current) {
      return;
    }

    logCanvasRender("fabric:create:start", {
      hasCanvasRef: Boolean(canvasElementNodeRef.current),
      elementWidth: canvasElement.width,
      elementHeight: canvasElement.height,
      parentWidth: canvasElement.parentElement?.clientWidth ?? null,
      parentHeight: canvasElement.parentElement?.clientHeight ?? null,
    });

    let canvas: Canvas;
    try {
      canvas = new Canvas(canvasElement, {
        width: widthRef.current,
        height: heightRef.current,
        backgroundColor: "#0b0b0b",
        preserveObjectStacking: true,
        selectionColor: "rgba(209,255,0,0.15)",
        selectionBorderColor: "rgba(209,255,0,0.8)",
        selectionLineWidth: 1,
      });
    } catch (error) {
      logCanvasRender("fabric:create:error", {
        message: error instanceof Error ? error.message : "Unknown Fabric init error.",
      });
      return;
    }

    fabricCanvasRef.current = canvas;
    logCanvasRender("fabric:create:success", {
      width: widthRef.current,
      height: heightRef.current,
      elementWidth: canvas.getElement().width,
      elementHeight: canvas.getElement().height,
      parentWidth: canvas.getElement().parentElement?.clientWidth ?? null,
      parentHeight: canvas.getElement().parentElement?.clientHeight ?? null,
    });
    logCanvasRender("fabric:init", {
      width: widthRef.current,
      height: heightRef.current,
      elementWidth: canvas.getElement().width,
      elementHeight: canvas.getElement().height,
      parentWidth: canvas.getElement().parentElement?.clientWidth ?? null,
      parentHeight: canvas.getElement().parentElement?.clientHeight ?? null,
    });

    const syncSelectionState = () => {
      const activeObject = canvas.getActiveObject() as EditorObject | null;

      if (!activeObject) {
        setSelectedObjectState(defaultSelectedObjectState);
        return;
      }

      setSelectedObjectState({
        id: activeObject.data?.editorId ?? null,
        type: activeObject.type ?? null,
        fill: typeof activeObject.fill === "string" ? activeObject.fill : "#ffffff",
        opacity: activeObject.opacity ?? 1,
        angle: activeObject.angle ?? 0,
        fontSize: Number(activeObject.fontSize ?? 36),
        fontWeight: activeObject.fontWeight ?? 600,
        textAlign: activeObject.textAlign ?? "left",
        charSpacing: Number(activeObject.charSpacing ?? 0),
        lineHeight: Number(activeObject.lineHeight ?? 1.16),
      });
    };

    const queueAutosave = () => {
      if (!onDirtyChangeRef.current) {
        return;
      }

      if (autosaveTimeoutRef.current != null) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = window.setTimeout(() => {
        onDirtyChangeRef.current?.(JSON.stringify(canvas.toJSON()));
      }, 700);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const nextZoom = Math.min(3, Math.max(0.35, canvas.getZoom() - event.deltaY * 0.001));
      canvas.zoomToPoint(new Point(event.offsetX, event.offsetY), nextZoom);
      setZoom(Number(nextZoom.toFixed(2)));
    };

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (event: FabricPointerEvent) => {
      if (!panModeRef.current || !("button" in event.e) || event.e.button !== 0) {
        return;
      }

      isDragging = true;
      lastPosX = event.e.clientX;
      lastPosY = event.e.clientY;
      canvas.selection = false;
      canvas.defaultCursor = "grabbing";
    };

    const handleMouseMove = (event: FabricPointerEvent) => {
      if (!isDragging || !("clientX" in event.e)) {
        return;
      }

      const viewportTransform = canvas.viewportTransform;
      if (!viewportTransform) {
        return;
      }

      viewportTransform[4] += event.e.clientX - lastPosX;
      viewportTransform[5] += event.e.clientY - lastPosY;
      canvas.requestRenderAll();
      lastPosX = event.e.clientX;
      lastPosY = event.e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.selection = true;
      canvas.defaultCursor = "default";
    };

    canvas.on("selection:created", syncSelectionState);
    canvas.on("selection:updated", syncSelectionState);
    canvas.on("selection:cleared", syncSelectionState);
    canvas.on("object:modified", queueAutosave);
    canvas.on("object:added", queueAutosave);
    canvas.on("object:removed", queueAutosave);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    canvas.upperCanvasEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.upperCanvasEl.removeEventListener("wheel", handleWheel);
      canvas.dispose();
      if (autosaveTimeoutRef.current != null) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
      fabricCanvasRef.current = null;
      didLoadInitialStateRef.current = false;
      hasPendingBaseLayerRef.current = false;
    };
  }, [canvasElement]);

  useEffect(() => {
    const stageElement = stageContainerElement;

    if (!stageElement) {
      logCanvasRender("fabric:resize-observer:missing-stage", {});
      return;
    }

    const observer = new ResizeObserver(() => {
      fitCanvasToWorkspace();
    });

    observer.observe(stageElement);
    fitCanvasToWorkspace();

    return () => {
      observer.disconnect();
    };
  }, [fitCanvasToWorkspace, stageContainerElement]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || didLoadInitialStateRef.current) {
      logCanvasRender("fabric:initial-state:skipped", {
        hasCanvas: Boolean(canvas),
        didLoadInitialState: didLoadInitialStateRef.current,
        initialBaseLayerUrl: initialBaseLayerUrl ?? null,
        initialJsonPresent: Boolean(initialJson),
      });
      return;
    }

    didLoadInitialStateRef.current = true;

    void loadInitialState(canvas, initialJson, initialBaseLayerUrl).then(() => {
      logCanvasRender("fabric:initial-state-loaded", {
        hasInitialJson: Boolean(initialJson),
        hasInitialBaseLayerUrl: Boolean(initialBaseLayerUrl),
        objectCount: canvas.getObjects().length,
      });

      if (onDirtyChangeRef.current && !initialJson) {
        onDirtyChangeRef.current(JSON.stringify(canvas.toJSON()));
      }

      baseLayerRef.current = findBaseLayer(canvas);
      fitCanvasToWorkspace();
    });
  }, [canvasElement, fitCanvasToWorkspace, initialBaseLayerUrl, initialJson]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.setDimensions({ width, height });
    canvas.calcOffset();
    canvas.requestRenderAll();
    canvas.renderAll();
    fitCanvasToWorkspace();
    logCanvasRender("fabric:resize", {
      ...describeCanvas(canvas),
      elementWidth: canvas.getElement().width,
      elementHeight: canvas.getElement().height,
      parentWidth: canvas.getElement().parentElement?.clientWidth ?? null,
      parentHeight: canvas.getElement().parentElement?.clientHeight ?? null,
    });
  }, [fitCanvasToWorkspace, height, width]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!initialBaseLayerUrl) {
      hasPendingBaseLayerRef.current = false;
      logCanvasRender("fabric:sync-base-layer:no-url", {});
      return;
    }

    hasPendingBaseLayerRef.current = true;

    if (!canvas) {
      logCanvasRender("fabric:sync-base-layer:skipped", {
        hasCanvas: Boolean(canvas),
        initialBaseLayerUrl: initialBaseLayerUrl ?? null,
      });
      return;
    }

    logCanvasRender("fabric:sync-base-layer:start", {
      url: initialBaseLayerUrl,
      width,
      height,
    });

    void syncBaseLayer(canvas, initialBaseLayerUrl, width, height).then((baseLayer) => {
      baseLayerRef.current = baseLayer;
      hasPendingBaseLayerRef.current = false;
      fitCanvasToWorkspace();
      canvas.requestRenderAll();
      canvas.renderAll();
      logCanvasRender("fabric:sync-base-layer:complete", {
        width: baseLayer.width ?? null,
        height: baseLayer.height ?? null,
        scaleX: baseLayer.scaleX ?? null,
        scaleY: baseLayer.scaleY ?? null,
        objectCount: canvas.getObjects().length,
      });
    });
  }, [canvasElement, fitCanvasToWorkspace, height, initialBaseLayerUrl, width]);

  const addText = useCallback((value = "New headline") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    const textbox = new Textbox(value, {
      left: width / 2 - 120,
      top: height / 2 - 40,
      width: 240,
      fill: "#ffffff",
      fontSize: 40,
      fontWeight: 700,
      fontFamily: "var(--font-bebas)",
    });
    const textboxWithData = textbox as EditorObject;
    textboxWithData.data = { editorId: crypto.randomUUID() };

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
  }, [height, width]);

  const addImageFromUrl = useCallback(async (url: string, options?: { asBaseLayer?: boolean }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      logCanvasRender("fabric:add-image:missing-canvas", {
        url,
        asBaseLayer: Boolean(options?.asBaseLayer),
      });
      return;
    }

    logCanvasRender("fabric:add-image:start", {
      url,
      asBaseLayer: Boolean(options?.asBaseLayer),
      width,
      height,
    });

    const image = await loadFabricImageWithDiagnostics(url);
    image.set({
      left: options?.asBaseLayer ? 0 : width / 2 - 180,
      top: options?.asBaseLayer ? 0 : height / 2 - 120,
      originX: "left",
      originY: "top",
      visible: true,
      opacity: 1,
      selectable: !options?.asBaseLayer,
      evented: !options?.asBaseLayer,
    });
    const imageWithData = image as EditorObject;
    imageWithData.data = {
      editorId: crypto.randomUUID(),
      isBaseLayer: Boolean(options?.asBaseLayer),
    };

    if (options?.asBaseLayer) {
      image.set({
        selectable: true,
        evented: true,
      });
      const baseLayer = await replaceBaseLayer(canvas, image, width, height);
      baseLayerRef.current = baseLayer;
      fitCanvasToWorkspace();
      logCanvasRender("fabric:add-image:base-layer-added", {
        image: describeCanvasObject(baseLayer),
        canvas: describeCanvas(canvas),
      });
    } else {
      image.scaleToWidth(Math.min(360, width * 0.4));
      canvas.add(image);
      canvas.setActiveObject(image);
      logCanvasRender("fabric:add-image:object-added", {
        image: describeCanvasObject(image),
        canvas: describeCanvas(canvas),
      });
    }

    canvas.requestRenderAll();
    canvas.renderAll();
    logCanvasRender("fabric:add-image:complete", {
      asBaseLayer: Boolean(options?.asBaseLayer),
      canvas: describeCanvas(canvas),
    });
  }, [fitCanvasToWorkspace, height, width]);

  const addFootballStatCard = useCallback((title: string, value: string, subtitle: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    const background = new Rect({
      width: 260,
      height: 140,
      fill: "#111111",
      stroke: "#2a2a2a",
      strokeWidth: 1,
    });
    const titleText = new Textbox(title, {
      width: 220,
      left: 20,
      top: 18,
      fill: "#a0a0a0",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "var(--font-inter)",
      textTransform: "uppercase" as never,
    });
    const valueText = new Textbox(value, {
      width: 220,
      left: 20,
      top: 48,
      fill: "#ffffff",
      fontSize: 36,
      fontWeight: 700,
      fontFamily: "var(--font-bebas)",
    });
    const subtitleText = new Textbox(subtitle, {
      width: 220,
      left: 20,
      top: 104,
      fill: "#a0a0a0",
      fontSize: 12,
      fontFamily: "var(--font-inter)",
    });

    const group = new Group([background, titleText, valueText, subtitleText], {
      left: width / 2 - 130,
      top: height / 2 - 70,
    });
    const groupWithData = group as EditorObject;
    groupWithData.data = { editorId: crypto.randomUUID() };

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }, [height, width]);

  const duplicateActiveObject = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) {
      return;
    }

    const cloned = await activeObject.clone();
    cloned.set({
      left: (activeObject.left ?? 0) + 20,
      top: (activeObject.top ?? 0) + 20,
    });
    const activeEditorObject = activeObject as EditorObject;
    const clonedEditorObject = cloned as EditorObject;
    clonedEditorObject.data = {
      ...(activeEditorObject.data ?? {}),
      editorId: crypto.randomUUID(),
    };
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  }, []);

  const deleteActiveObject = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) {
      return;
    }

    const isBaseLayer = Boolean((activeObject as EditorObject).data?.isBaseLayer);
    if (isBaseLayer) {
      return;
    }

    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const bringForward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) {
      return;
    }

    canvas.bringObjectForward(activeObject);
    canvas.requestRenderAll();
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) {
      return;
    }

    canvas.sendObjectBackwards(activeObject);
    if (baseLayerRef.current) {
      canvas.sendObjectToBack(baseLayerRef.current);
    }
    canvas.requestRenderAll();
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }
    const nextZoom = Math.min(3, canvas.getZoom() + 0.1);
    canvas.setZoom(nextZoom);
    setZoom(Number(nextZoom.toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }
    const nextZoom = Math.max(0.35, canvas.getZoom() - 0.1);
    canvas.setZoom(nextZoom);
    setZoom(Number(nextZoom.toFixed(2)));
  }, []);

  const resetViewport = useCallback(() => {
    fitCanvasToWorkspace();
  }, [fitCanvasToWorkspace]);

  const clearEdits = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    const objects = canvas.getObjects();
    objects.forEach((object) => {
      if (object !== baseLayerRef.current) {
        canvas.remove(object);
      }
    });
    if (baseLayerRef.current) {
      baseLayerRef.current.set({
        selectable: false,
        evented: false,
      });
      canvas.sendObjectToBack(baseLayerRef.current);
    }
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const updateActiveObject = useCallback((updates: Partial<SelectedObjectState>) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject() as EditorObject | null;
    if (!canvas || !activeObject) {
      return;
    }

    if (updates.fill != null) {
      activeObject.set("fill", updates.fill);
    }
    if (updates.opacity != null) {
      activeObject.set("opacity", updates.opacity);
    }
    if (updates.angle != null) {
      activeObject.rotate(updates.angle);
    }
    if ("fontSize" in activeObject && updates.fontSize != null) {
      activeObject.set("fontSize", updates.fontSize);
    }
    if ("fontWeight" in activeObject && updates.fontWeight != null) {
      activeObject.set("fontWeight", updates.fontWeight);
    }
    if ("textAlign" in activeObject && updates.textAlign != null) {
      activeObject.set("textAlign", updates.textAlign);
    }
    if ("charSpacing" in activeObject && updates.charSpacing != null) {
      activeObject.set("charSpacing", updates.charSpacing);
    }
    if ("lineHeight" in activeObject && updates.lineHeight != null) {
      activeObject.set("lineHeight", updates.lineHeight);
    }

    activeObject.setCoords();
    canvas.requestRenderAll();
    setSelectedObjectState((current) => ({ ...current, ...updates }));
  }, []);

  const exportBlob = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return null;
    }

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const response = await fetch(dataUrl);
    return response.blob();
  }, []);

  const editor = useMemo(
    () => ({
      canvasElementRef,
      fabricCanvasRef,
      selectedObjectState,
      zoom,
      panMode,
      setPanMode,
      addText,
      addImageFromUrl,
      addFootballStatCard,
      duplicateActiveObject,
      deleteActiveObject,
      bringForward,
      sendBackward,
      zoomIn,
      zoomOut,
      resetViewport,
      stageContainerRef,
      clearEdits,
      updateActiveObject,
      exportBlob,
      canvasClassName: cn(
        "max-w-full border border-zinc-800 bg-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.38)]",
        panMode ? "cursor-grab" : "cursor-default"
      ),
    }),
    [
      addFootballStatCard,
      addImageFromUrl,
      addText,
      bringForward,
      clearEdits,
      deleteActiveObject,
      duplicateActiveObject,
      exportBlob,
      panMode,
      resetViewport,
      selectedObjectState,
      sendBackward,
      canvasElementRef,
      stageContainerRef,
      updateActiveObject,
      zoom,
      zoomIn,
      zoomOut,
    ]
  );

  return editor;
}

async function loadInitialState(
  canvas: Canvas,
  initialJson?: string | null,
  initialBaseLayerUrl?: string | null
) {
  logCanvasRender("loadInitialState:start", {
    hasInitialJson: Boolean(initialJson),
    initialBaseLayerUrl: initialBaseLayerUrl ?? null,
    canvas: describeCanvas(canvas),
  });

  if (initialJson) {
    try {
      logCanvasRender("loadInitialState:loadFromJSON:start", {
        hasInitialJson: true,
      });
      await canvas.loadFromJSON(initialJson);
      logCanvasRender("loadInitialState:loadFromJSON:complete", {
        canvas: describeCanvas(canvas),
      });
      canvas.renderAll();
    } catch {
      logCanvasRender("loadInitialState:loadFromJSON:error-clear", {
        canvasBeforeClear: describeCanvas(canvas),
      });
      canvas.clear();
      canvas.backgroundColor = "#0b0b0b";
      canvas.renderAll();
      logCanvasRender("loadInitialState:after-clear", {
        canvas: describeCanvas(canvas),
      });
    }
  }

  if (initialBaseLayerUrl) {
    logCanvasRender("loadInitialState:syncBaseLayer:start", {
      initialBaseLayerUrl,
    });
    await syncBaseLayer(canvas, initialBaseLayerUrl, canvas.getWidth(), canvas.getHeight());
  }

  logCanvasRender("loadInitialState:complete", {
    canvas: describeCanvas(canvas),
  });
}

function findBaseLayer(canvas: Canvas) {
  return (
    canvas
      .getObjects()
      .find((object) => Boolean((object as EditorObject).data?.isBaseLayer)) ?? null
  );
}

async function syncBaseLayer(canvas: Canvas, url: string, width: number, height: number) {
  const existingBaseLayer = findBaseLayer(canvas);
  logCanvasRender("fabric:sync-base-layer:before", {
    url,
    existingBaseLayer: describeCanvasObject(existingBaseLayer),
    canvas: describeCanvas(canvas),
  });

  const freshImage = await loadFabricImageWithDiagnostics(url);
  freshImage.set({
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    visible: true,
    opacity: 1,
    selectable: true,
    evented: true,
  });

  const activeObject = canvas.getActiveObject();
  const baseLayer = await replaceBaseLayer(canvas, freshImage, width, height, existingBaseLayer);

  if (activeObject && activeObject !== existingBaseLayer) {
    canvas.setActiveObject(activeObject);
  }

  logCanvasRender("fabric:sync-base-layer:after", {
    url,
    baseLayer: describeCanvasObject(baseLayer),
    canvas: describeCanvas(canvas),
  });

  return baseLayer;
}

async function replaceBaseLayer(
  canvas: Canvas,
  image: FabricImage,
  width: number,
  height: number,
  existingBaseLayer?: FabricObject | null
) {
  if (existingBaseLayer) {
    logCanvasRender("replaceBaseLayer:remove-existing", {
      existingBaseLayer: describeCanvasObject(existingBaseLayer),
      objectCountBeforeRemove: canvas.getObjects().length,
    });
    canvas.remove(existingBaseLayer);
    logCanvasRender("replaceBaseLayer:after-remove-existing", {
      objectCountAfterRemove: canvas.getObjects().length,
      canvas: describeCanvas(canvas),
    });
  }

  const editorImage = image as EditorObject;
  editorImage.data = {
    ...(editorImage.data ?? {}),
    editorId: editorImage.data?.editorId ?? crypto.randomUUID(),
    isBaseLayer: true,
  };

  const element = image.getElement() as HTMLImageElement | HTMLCanvasElement | undefined;
  const sourceWidth =
    image.width && image.width > 0
      ? image.width
      : "naturalWidth" in (element ?? {})
        ? (element as HTMLImageElement).naturalWidth || width
        : element?.width || width;
  const sourceHeight =
    image.height && image.height > 0
      ? image.height
      : "naturalHeight" in (element ?? {})
        ? (element as HTMLImageElement).naturalHeight || height
        : element?.height || height;
  const rawScale = Math.min(width / sourceWidth, height / sourceHeight);
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;

  image.set({
    left: Math.max((width - scaledWidth) / 2, 0),
    top: Math.max((height - scaledHeight) / 2, 0),
    originX: "left",
    originY: "top",
    visible: true,
    opacity: 1,
  });
  image.scale(scale);
  image.setCoords();

  logCanvasRender("replaceBaseLayer:image-ready", {
    image: describeCanvasObject(image),
    sourceWidth,
    sourceHeight,
    naturalWidth: element instanceof HTMLImageElement ? element.naturalWidth : null,
    naturalHeight: element instanceof HTMLImageElement ? element.naturalHeight : null,
    scaledWidth,
    scaledHeight,
  });

  canvas.add(image);
  logCanvasRender("replaceBaseLayer:after-add", {
    objectCount: canvas.getObjects().length,
    canvas: describeCanvas(canvas),
    insertedImage: describeCanvasObject(image),
  });
  canvas.sendObjectToBack(image);
  logCanvasRender("replaceBaseLayer:after-send-to-back", {
    objectCount: canvas.getObjects().length,
    canvas: describeCanvas(canvas),
    insertedImage: describeCanvasObject(image),
  });
  canvas.requestRenderAll();
  logCanvasRender("replaceBaseLayer:after-requestRenderAll", {
    objectCount: canvas.getObjects().length,
    canvas: describeCanvas(canvas),
    insertedImage: describeCanvasObject(image),
  });
  canvas.renderAll();
  logCanvasRender("fabric:replace-base-layer", {
    sourceWidth,
    sourceHeight,
    canvasWidth: width,
    canvasHeight: height,
    scale,
    baseLayer: describeCanvasObject(image),
    canvas: describeCanvas(canvas),
    activeObject: describeCanvasObject(canvas.getActiveObject() ?? null),
    backgroundImage: describeCanvasObject((canvas.backgroundImage as FabricObject | undefined) ?? null),
    clipPath: describeCanvasObject((canvas.clipPath as FabricObject | undefined) ?? null),
  });
  scheduleCanvasSnapshot(canvas, "replaceBaseLayer:one-second-later");

  return image;
}

async function loadFabricImageWithDiagnostics(url: string) {
  logCanvasRender("image:probe:start", { url });

  const crossOriginAllowed = await probeImageUrl(url, true);
  if (crossOriginAllowed) {
    logCanvasRender("image:probe:success", { url, mode: "anonymous" });

    const image = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
    const elementDimensions = getImageElementDimensions(image);
    logCanvasRender("image:fabric-load:success", {
      url,
      mode: "anonymous",
      image: describeCanvasObject(image),
      elementWidth: elementDimensions.width,
      elementHeight: elementDimensions.height,
      naturalWidth: elementDimensions.naturalWidth,
      naturalHeight: elementDimensions.naturalHeight,
      clipPath: describeCanvasObject((image.clipPath as FabricObject | undefined) ?? null),
    });
    return image;
  }

  const standardLoadAllowed = await probeImageUrl(url, false);
  if (standardLoadAllowed) {
    logCanvasRender("image:probe:success", { url, mode: "standard" });

    const image = await FabricImage.fromURL(url);
    const elementDimensions = getImageElementDimensions(image);
    logCanvasRender("image:fabric-load:success", {
      url,
      mode: "standard",
      image: describeCanvasObject(image),
      elementWidth: elementDimensions.width,
      elementHeight: elementDimensions.height,
      naturalWidth: elementDimensions.naturalWidth,
      naturalHeight: elementDimensions.naturalHeight,
      clipPath: describeCanvasObject((image.clipPath as FabricObject | undefined) ?? null),
    });
    return image;
  }

  logCanvasRender("image:probe:failed", { url });
  throw new Error("Unable to load the selected image into the canvas.");
}

async function probeImageUrl(url: string, useCrossOrigin: boolean) {
  logCanvasRender("image:probe:enter", {
    url,
    mode: useCrossOrigin ? "anonymous" : "standard",
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();

      if (useCrossOrigin) {
        image.crossOrigin = "anonymous";
      }

      image.onload = () => {
        logCanvasRender("image:html-load:success", {
          url,
          mode: useCrossOrigin ? "anonymous" : "standard",
          width: image.width,
          height: image.height,
        });
        resolve();
      };
      image.onerror = () => {
        logCanvasRender("image:html-load:error", {
          url,
          mode: useCrossOrigin ? "anonymous" : "standard",
        });
        reject(new Error("Image failed to load."));
      };
      image.src = url;
    });

    return true;
  } catch {
    return false;
  }
}
