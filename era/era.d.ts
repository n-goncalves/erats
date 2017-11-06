declare namespace Core {
    class Object {
        events: any;
        addEvents(...args: string[]): void;
        hasEvent(eventName: string): boolean;
        fireEvent(eventName: any, ...args: any[]): boolean;
        connect(obj: any, eventName: string, method: Function, capture?: boolean): void;
        getEventHandlers(eventName: string): any;
        disconnect(obj: any, eventName: string, method: Function): void;
        serialize(): string;
        getClassName(): string;
        protected assign(init?: object): void;
        toString(): string;
    }
}
declare var DEBUG: boolean;
declare var htmlNS: string;
declare var svgNS: string;
declare namespace Core {
    interface HashTable<T> {
        [key: string]: T;
    }
    class Util {
        static clone(obj: object): {};
        static encodeURIQuery(obj: any): string;
        static utf8Encode(value: string): string;
        static utf8Decode(value: string): string;
        static toBase64(stringValue: string): string;
        static fromBase64(value: string): string;
        static toNoDiacritics(value: string): string;
    }
    class Navigator {
        static isGecko: boolean;
        static isWebkit: boolean;
        static isIE: boolean;
        static isIE7: boolean;
        static isIE8: boolean;
        static isIE10: boolean;
        static isIE11: boolean;
        static isOpera: boolean;
        static isChrome: boolean;
        static isSafari: boolean;
        static isFirefox: boolean;
        static isFirefox3: boolean;
        static isFirefox3_5: boolean;
        static isFirefox3_6: boolean;
        static iPad: boolean;
        static iPhone: boolean;
        static iOs: boolean;
        static Android: boolean;
        static supportSVG: boolean;
        static supportCanvas: boolean;
        static supportRgba: boolean;
        static supportRgb: boolean;
        static supportOpacity: boolean;
        static supportFormData: boolean;
        static supportFileAPI: boolean;
        static supportUploadDirectory: boolean;
    }
}
declare namespace Core {
    class Uri extends Object {
        scheme: string;
        user: string;
        password: string;
        host: string;
        port: number;
        path: string;
        query: string;
        fragment: string;
        constructor(uri?: string);
        getScheme(): string;
        getUser(): string;
        getPassword(): string;
        getHost(): string;
        getPort(): number;
        getPath(): string;
        getQuery(): string;
        getFragment(): string;
        toString(): string;
        static cleanPath(path: string): string;
        static mergePath(base: string, relative: string): string;
    }
}
declare namespace Core {
    class DoubleLinkedListNode {
        previous: DoubleLinkedListNode;
        next: DoubleLinkedListNode;
        data: any;
        constructor(data: any);
    }
    class DoubleLinkedList {
        root: DoubleLinkedListNode;
        length: 0;
        getLength(): 0;
        getFirstNode(): DoubleLinkedListNode;
        getLastNode(): DoubleLinkedListNode;
        appendNode(node: DoubleLinkedListNode): DoubleLinkedListNode;
        prependNode(node: DoubleLinkedListNode): DoubleLinkedListNode;
        removeNode(node: DoubleLinkedListNode): void;
        findNode(data: any): DoubleLinkedListNode;
        getFirst(): any;
        getLast(): any;
        append(data: any): DoubleLinkedListNode;
        prepend(data: any): DoubleLinkedListNode;
        remove(data: any): void;
        clear(): void;
        static moveNext(node: DoubleLinkedListNode): DoubleLinkedListNode;
        isLast(node: DoubleLinkedListNode): boolean;
    }
}
declare namespace Core {
    class File extends Object {
        iframe: any;
        form: any;
        fileInput: any;
        fileApi: any;
        constructor(config: any);
        getFileName(): any;
        getRelativePath(): any;
        getMimetype(): any;
        static types: any;
        static getMimetypeFromName(fileName: any): any;
    }
}
declare module Core {
    interface HttpRequestInit {
        url: string;
        method: string;
        binary: boolean;
        arguments: object;
        content: any;
        headers: object;
    }
    class HttpRequest extends Object {
        url: string;
        method: string;
        binary: boolean;
        arguments: object;
        content: any;
        headers: object;
        private request;
        static requestHeaders: object;
        constructor(init?: Partial<HttpRequestInit>);
        setRequestHeader(header: any, value: any): void;
        addArgument(argName: any, argValue: any): void;
        abort(): void;
        send(): void;
        sendAsync(): Promise<HttpRequest>;
        getResponseHeader(header: string): string;
        readonly responseText: string;
        readonly responseBase64: string;
        readonly responseJSON: any;
        readonly responseXML: Document;
        readonly status: number;
        static setRequestHeader(header: any, value: any): void;
    }
}
declare namespace Core {
    class DelayedTask extends Object {
        delay: number;
        scope: any;
        callback: Function;
        isDone: boolean;
        handle: number;
        constructor(scope: any, delay: number, callback: Function);
        abort(): void;
    }
}
declare namespace Core {
    class Timer extends Object {
        interval: number;
        arguments: any;
        handle: any;
        constructor(config: any);
        abort(): void;
    }
}
declare namespace Core {
    class Socket extends Object {
        host: string;
        service: string;
        port: number;
        mode: any;
        secure: boolean;
        websocket: any;
        websocketdelay: any;
        emuopenrequest: any;
        emupollrequest: any;
        emusendrequest: any;
        emuid: any;
        emumessages: any;
        lastPosition: number;
        readSize: boolean;
        size: number;
        data: any;
        isClosed: boolean;
        closeSent: boolean;
        sep: string;
        lastPoll: any;
        delayPollTask: any;
        pollInterval: number;
        static supportWebSocket: boolean;
        constructor(config: any);
        send(msg: any): void;
        close(): void;
        private onWebSocketOpenTimeout();
        private onWebSocketOpen();
        private onWebSocketError();
        private onWebSocketMessage(msg);
        private onWebSocketClose(msg);
        private emuSocketDataAvailable(data);
        private emuSocketUpdate(delta);
        private onEmuSocketSendDone();
        private onEmuSocketSendError();
        private onEmuSocketOpenDone();
        onEmuSocketOpenError(request: any, status: any): void;
        onEmuSocketPollDone(): void;
        onEmuSocketPollError(): void;
        delayPollDone(): void;
        sendPoll(): void;
    }
}
declare namespace Core {
    class RemoteDebug extends Object {
        host: string;
        port: number;
        socket: Socket;
        socketAlive: boolean;
        retryTask: any;
        nativeConsole: any;
        buffer: Array<any>;
        constructor(config: any);
        startSocket(): void;
        onSocketOpen(): void;
        onSocketMessage(socket: any, message: any): void;
        onSocketError(): void;
        onSocketClose(): void;
        onConsoleLog(message: any): void;
        onConsoleError(message: any): void;
        onConsoleWarn(message: any): void;
        onError(message: any, url: any, line: any): void;
        static current: RemoteDebug;
        static onConsoleLog(message: any): void;
        static onConsoleError(message: any): void;
        static onConsoleWarn(message: any): void;
        static onError(message: any, url: any, line: any): void;
    }
}
declare namespace Core {
    interface FilePostUploaderInit {
        method: string;
        file: File;
        service: string;
        destination: string;
    }
    class FilePostUploader extends Object {
        protected _file: File;
        protected _service: string;
        protected reader: undefined;
        protected request: XMLHttpRequest;
        protected binaryString: boolean;
        protected responseText: string;
        protected fileReader: FileReader;
        protected boundary: string;
        protected _method: string;
        protected fields: object;
        protected _isCompleted: boolean;
        protected loadedOctets: number;
        protected totalOctets: number;
        constructor(init?: Partial<FilePostUploaderInit>);
        method: string;
        file: File;
        service: string;
        setField(name: any, value: any): void;
        destination: string;
        send(): void;
        abort(): void;
        getResponseText(): string;
        getResponseJSON(): any;
        readonly isCompleted: boolean;
        readonly total: number;
        readonly loaded: number;
        protected onStateChange(event: any): void;
        protected onUpdateProgress(event: any): void;
        protected onFileReaderError(event: any): void;
        protected onFileReaderLoad(event: any): void;
        protected onIFrameLoad(event: any): void;
    }
}
declare namespace Anim {
    type EaseMode = 'in' | 'out' | 'inout';
    interface EasingFunctionInit {
        mode: EaseMode;
    }
    class EasingFunction extends Core.Object {
        mode: EaseMode;
        constructor(init?: Partial<EasingFunctionInit>);
        ease(normalizedTime: number): number;
        protected easeInCore(normalizedTime: number): number;
        static eases: any;
        static register(easeName: string, classType: Function): void;
        static parse(ease: string): any;
        static create(ease: string | EasingFunction): EasingFunction;
    }
}
declare namespace Anim {
    class LinearEase extends EasingFunction {
        easeInCore(normalizedTime: any): any;
    }
}
declare namespace Anim {
    interface PowerEaseInit extends EasingFunctionInit {
        power: number;
    }
    class PowerEase extends EasingFunction implements PowerEaseInit {
        power: number;
        constructor(init?: Partial<PowerEaseInit>);
        protected easeInCore(normalizedTime: number): number;
    }
}
declare namespace Anim {
    interface BounceEaseInit extends EasingFunctionInit {
        bounces: number;
        bounciness: number;
    }
    class BounceEase extends EasingFunction implements BounceEaseInit {
        bounces: number;
        bounciness: number;
        constructor(init?: Partial<BounceEaseInit>);
        protected easeInCore(normalizedTime: number): number;
    }
}
declare namespace Anim {
    interface ElasticEaseInit extends EasingFunctionInit {
        oscillations: number;
        springiness: number;
    }
    class ElasticEase extends EasingFunction implements ElasticEaseInit {
        oscillations: number;
        springiness: number;
        constructor(init?: Partial<ElasticEaseInit>);
        protected easeInCore(normalizedTime: number): number;
    }
}
declare namespace Anim {
    class TimeManager extends Core.Object {
        clocks: any;
        timer: any;
        start: number;
        constructor();
        add(clock: any): void;
        remove(clock: any): void;
        private onTick();
        static current: TimeManager;
        static initialize(): void;
    }
}
declare namespace Anim {
    class AnimationManager extends Core.Object {
        clocks: any;
        start: number;
        onTickBind: any;
        constructor();
        add(clock: any): void;
        remove(clock: any): void;
        forceTick(): void;
        private onTick();
        static current: AnimationManager;
        static initialize(): void;
    }
}
declare namespace Anim {
    interface Target {
        setAnimClock(clock: Clock): void;
    }
    interface ClockInit {
        animation: boolean;
        repeat: 'forever' | number;
        speed: number;
        autoReverse: boolean;
        beginTime: number;
        ease: EasingFunction | string;
        target: Target;
        duration: number | 'forever' | 'automatic';
        parent: Clock;
    }
    class Clock extends Core.Object implements ClockInit {
        private _animation;
        private _parent;
        private _time;
        private _iteration;
        private _progress;
        private _isActive;
        private _globalTime;
        private startTime;
        private lastTick;
        private _beginTime;
        private isPaused;
        private _speed;
        private _duration;
        pendingState: 'none' | 'active' | 'paused' | 'resumed' | 'stopped';
        private _autoReverse;
        private _repeat;
        private _target;
        private _ease;
        constructor(init?: Partial<Clock>);
        animation: boolean;
        repeat: 'forever' | number;
        speed: number;
        autoReverse: boolean;
        beginTime: number;
        ease: EasingFunction | string;
        target: Target;
        duration: number | 'forever' | 'automatic';
        parent: Clock;
        readonly globalTime: number;
        readonly isActive: boolean;
        readonly time: number;
        readonly iteration: number;
        readonly progress: number;
        begin(): void;
        pause(): void;
        resume(): void;
        stop(): void;
        complete(): void;
        protected onTimeUpdate(deltaTick: any): void;
        update(parentGlobalTime: number): void;
    }
}
declare namespace Anim {
    class ClockGroup extends Clock {
        children: Clock[];
        appendChild(child: Clock): void;
        content: Clock[];
        begin(): void;
        pause(): void;
        resume(): void;
        stop(): void;
        complete(): void;
        update(parentGlobalTime: any): void;
    }
}
declare namespace Ui {
    class Matrix extends Core.Object {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;
        constructor();
        isTranslateOnly(): boolean;
        isIdentity(): boolean;
        translate(x: number, y: number): Matrix;
        rotate(angle: number): Matrix;
        scale(scaleX: number, scaleY?: number): Matrix;
        multiply(matrix: Matrix): Matrix;
        getDeterminant(): number;
        inverse(): Matrix;
        setMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void;
        getA(): number;
        getB(): number;
        getC(): number;
        getD(): number;
        getE(): number;
        getF(): number;
        clone(): Matrix;
        toString(): string;
        static createMatrix(a: number, b: number, c: number, d: number, e: number, f: number): Matrix;
        static createTranslate(x: number, y: number): Matrix;
        static createScaleAt(scaleX: number, scaleY: number, centerX: number, centerY: number): Matrix;
        static createScale(scaleX: number, scaleY?: number): Matrix;
        static createRotateAt(angle: number, centerX: number, centerY: number): Matrix;
        static createRotate(angle: number): Matrix;
        static parse(stringMatrix: string): Matrix;
    }
}
declare namespace Ui {
    class Point extends Core.Object {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        matrixTransform(matrix: Matrix): Point;
        multiply(value: number | Matrix): Point;
        divide(value: number | Matrix): Point;
        add(value: number | Point): Point;
        substract(value: number | Point): Point;
        setPoint(point: any): void;
        getX(): number;
        setX(x: number): void;
        getY(): number;
        setY(y: number): void;
        getLength(): number;
        clone(): Point;
        toString(): string;
    }
}
declare namespace Ui {
    class Color extends Core.Object {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
        addA(a: number): Color;
        addY(y: number): Color;
        addH(h: number): Color;
        addS(s: number): Color;
        addL(l: number): Color;
        getCssRgba(): string;
        getCssRgb(): string;
        getCssHtml(): string;
        getRgba(): {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        getRgb(): {
            r: number;
            g: number;
            b: number;
            a: number;
        };
        getHsla(): {
            h: any;
            s: any;
            l: number;
            a: number;
        };
        getHsl(): {
            h: any;
            s: any;
            l: number;
            a: number;
        };
        getYuva(): {
            y: number;
            u: number;
            v: number;
            a: number;
        };
        getYuv(): {
            y: number;
            u: number;
            v: number;
            a: number;
        };
        private initFromHsl(h, s, l, a?);
        private initFromYuv(y, u, v, a?);
        private initFromRgb(r, g, b, a?);
        toString(): string;
        static knownColor: object;
        static parse(color: string): Color;
        static create(color: string | Color): Color;
        static createFromRgb(r: number, g: number, b: number, a?: number): Color;
        static createFromYuv(y: number, u: number, v: number, a?: number): Color;
        static createFromHsl(h: number, s: number, l: number, a?: number): Color;
    }
}
declare namespace Ui {
    interface GradientStop {
        offset: number;
        color: Color | string;
    }
    class LinearGradient extends Core.Object {
        orientation: Orientation;
        stops: GradientStop[];
        image: any;
        constructor(stops?: GradientStop[], orientation?: Orientation);
        getBackgroundImage(): any;
        getSVGGradient(): any;
        getCanvasGradient(context: any, width: any, height: any): any;
    }
}
declare namespace Ui {
    type Size = {
        width: number;
        height: number;
    };
    type VerticalAlign = 'top' | 'center' | 'bottom' | 'stretch';
    type HorizontalAlign = 'left' | 'center' | 'right' | 'stretch';
    interface ElementInit {
        selectable: boolean;
        id: string;
        focusable: boolean;
        role: string;
        width: number;
        height: number;
        maxWidth: number;
        maxHeight: number;
        verticalAlign: VerticalAlign;
        horizontalAlign: HorizontalAlign;
        clipToBounds: boolean;
        margin: number;
        marginTop: number;
        marginBottom: number;
        marginLeft: number;
        marginRight: number;
        opacity: number;
        transform: Matrix;
        eventsHidden: boolean;
    }
    class Element extends Core.Object implements ElementInit, Anim.Target {
        name: string;
        private _marginTop;
        private _marginBottom;
        private _marginLeft;
        private _marginRight;
        private _parent;
        private _width?;
        private _height?;
        private _maxWidth?;
        private _maxHeight?;
        private _drawing;
        private collapse;
        private measureValid;
        private measureConstraintPixelRatio;
        private measureConstraintWidth;
        private measureConstraintHeight;
        private _measureWidth;
        private _measureHeight;
        private arrangeValid;
        private arrangeX;
        private arrangeY;
        private arrangeWidth;
        private arrangeHeight;
        private arrangePixelRatio;
        drawValid: boolean;
        drawNext: Element;
        layoutValid: boolean;
        layoutNext: Element;
        private _layoutX;
        private _layoutY;
        private _layoutWidth;
        private _layoutHeight;
        private _isLoaded;
        private _verticalAlign;
        private _horizontalAlign;
        private _clipToBounds;
        clipX?: number;
        clipY?: number;
        clipWidth?: number;
        clipHeight?: number;
        visible?: boolean;
        private _parentVisible?;
        private _eventsHidden;
        private _focusable;
        private _hasFocus;
        isMouseFocus: boolean;
        isMouseDownFocus: boolean;
        private _selectable;
        private _transform?;
        transformOriginX: number;
        transformOriginY: number;
        transformOriginAbsolute: boolean;
        animClock: Anim.Clock;
        private _opacity;
        private parentOpacity;
        disabled?: boolean;
        parentDisabled?: boolean;
        style: object | undefined;
        parentStyle: object | undefined;
        mergeStyle: object | undefined;
        constructor(init?: Partial<ElementInit>);
        setDisabled(disabled: boolean): void;
        readonly drawing: any;
        selectable: boolean;
        readonly layoutX: number;
        readonly layoutY: number;
        readonly layoutWidth: number;
        readonly layoutHeight: number;
        id: string;
        focusable: boolean;
        onMouseDownFocus(event: any): void;
        onMouseUpFocus(event: any): void;
        getIsMouseFocus(): boolean;
        role: string;
        measure(width: number, height: number): Size;
        protected measureCore(width: number, height: number): Size;
        invalidateMeasure(): void;
        invalidateLayout(): void;
        protected onChildInvalidateMeasure(child: any, event: any): void;
        updateLayout(width: number, height: number): void;
        layoutCore(): void;
        arrange(x: number, y: number, width: number, height: number): void;
        protected arrangeCore(width: number, height: number): void;
        invalidateArrange(): void;
        protected onChildInvalidateArrange(child: any): void;
        draw(): void;
        protected drawCore(): void;
        invalidateDraw(): void;
        protected renderDrawing(): any;
        width: number;
        height: number;
        maxWidth: number;
        maxHeight: number;
        verticalAlign: VerticalAlign;
        horizontalAlign: HorizontalAlign;
        clipToBounds: boolean;
        setClipRectangle(x: number, y: number, width: number, height: number): void;
        updateClipRectangle(): void;
        margin: number;
        marginTop: number;
        marginBottom: number;
        marginLeft: number;
        marginRight: number;
        opacity: number;
        focus(): void;
        blur(): void;
        transform: Matrix;
        setTransformOrigin(x: number, y: number, absolute?: boolean): void;
        getInverseLayoutTransform(): Matrix;
        getLayoutTransform(): Matrix;
        transformToWindow(): Matrix;
        transformFromWindow(): Matrix;
        transformToElement(element: Element): Matrix;
        pointToWindow(point: Point): Point;
        pointFromWindow(point: Point): Point;
        pointFromElement(element: Element, point: Point): Point;
        getIsInside(point: Point): boolean;
        eventsHidden: boolean;
        elementFromPoint(point: Point): Element;
        readonly measureWidth: number;
        readonly measureHeight: number;
        readonly isCollapsed: boolean;
        hide(collapse?: boolean): void;
        show(): void;
        readonly isVisible: boolean;
        parentVisible: boolean;
        protected onInternalHidden(): void;
        protected onHidden(): void;
        protected onInternalVisible(): void;
        checkVisible(): void;
        protected onVisible(): void;
        disable(): void;
        enable(): void;
        setEnable(enable: boolean): void;
        readonly isDisabled: boolean;
        setParentDisabled(disabled: boolean): void;
        protected onInternalDisable(): void;
        protected onDisable(): void;
        protected onInternalEnable(): void;
        protected onEnable(): void;
        private containSubStyle(style);
        private fusionStyle(dst, src);
        private getClassStyle(style, classFunc);
        private mergeStyles();
        getIsChildOf(parent: Element): boolean;
        parent: Element;
        getParentByClass(classFunc: Function): Element;
        setParentStyle(parentStyle: object | undefined): void;
        setStyle(style: object | undefined): void;
        setStyleProperty(property: string, value: any): void;
        getStyleProperty(property: string): any;
        protected onInternalStyleChange(): void;
        protected onStyleChange(): void;
        readonly hasFocus: boolean;
        scrollIntoView(): void;
        protected onScrollIntoView(el: Element): void;
        get(name: string): Element;
        isLoaded: boolean;
        private onFocus(event);
        private onBlur(event);
        private updateTransform();
        setAnimClock(clock: Anim.Clock): void;
        private onAnimClockComplete();
        protected onLoad(): void;
        protected onUnload(): void;
        static transformToWindow(element: Element): Matrix;
        static transformFromWindow(element: Element): Matrix;
        static elementFromPoint(point: Point): Element;
        static getIsDrawingChildOf(drawing: any, parent: any): boolean;
        static setSelectable(drawing: any, selectable: any): void;
    }
}
declare namespace Ui {
    interface ContainerInit extends ElementInit {
    }
    class Container extends Element implements ContainerInit {
        private _children;
        private _containerDrawing;
        constructor(init?: Partial<ContainerInit>);
        containerDrawing: any;
        appendChild(child: Element): void;
        prependChild(child: Element): void;
        removeChild(child: Element): void;
        insertChildAt(child: Element, position: number): void;
        insertChildBefore(child: Element, beforeChild: Element): void;
        moveChildAt(child: Element, position: number): void;
        readonly children: Element[];
        readonly firstChild: Element;
        readonly lastChild: Element;
        getChildPosition(child: Element): number;
        hasChild(child: Element): boolean;
        clear(): void;
        get(name: string): Element;
        elementFromPoint(point: Point): Element;
        protected onLoad(): void;
        protected onUnload(): void;
        protected onInternalStyleChange(): void;
        protected onInternalDisable(): void;
        protected onInternalEnable(): void;
        protected onInternalVisible(): void;
        protected onInternalHidden(): void;
    }
}
declare namespace Ui {
    class SvgParser extends Core.Object {
        path: string;
        pos: number;
        cmd: string;
        current: any;
        value: boolean;
        end: boolean;
        constructor(path: string);
        isEnd(): boolean;
        next(): void;
        setCmd(cmd: any): void;
        getCmd(): string;
        getCurrent(): any;
        isCmd(): boolean;
        isValue(): boolean;
    }
}
declare namespace Ui {
    interface CanvasElementInit extends ContainerInit {
    }
    class CanvasElement extends Container implements CanvasElementInit {
        private canvasEngine;
        private _context;
        private svgDrawing;
        private dpiRatio;
        constructor(init?: Partial<ContainerInit>);
        update(): void;
        readonly context: any;
        protected updateCanvas(context: any): void;
        protected renderDrawing(): any;
        svgToDataURL(): any;
        protected arrangeCore(width: number, height: number): void;
        protected drawCore(): void;
        protected onInternalVisible(): void;
    }
}
declare namespace Core {
    class SVG2DPath extends Object {
        d: any;
        x: number;
        y: number;
        constructor();
        moveTo(x: any, y: any): void;
        lineTo(x: any, y: any): void;
        quadraticCurveTo(cpx: any, cpy: any, x: any, y: any): void;
        bezierCurveTo(cp1x: any, cp1y: any, cp2x: any, cp2y: any, x: any, y: any): void;
        arcTo(x1: any, y1: any, x2: any, y2: any, radiusX: any, radiusY: any, angle: any): void;
        closePath(): void;
        rect(x: any, y: any, w: any, h: any): void;
        arc(x: any, y: any, radius: any, startAngle: any, endAngle: any, anticlockwise: any): void;
        ellipse(x: any, y: any, radiusX: any, radiusY: any, rotation: any, startAngle: any, endAngle: any, anticlockwise: any): void;
        roundRect(x: any, y: any, w: any, h: any, radiusTopLeft: any, radiusTopRight: any, radiusBottomRight: any, radiusBottomLeft: any, antiClockwise: any): void;
        getSVG(): Element;
    }
    class SVGGradient extends Object {
        static counter: number;
        gradient: any;
        id: any;
        constructor(x0: number, y0: number, x1: number, y1: number);
        getId(): any;
        addColorStop(offset: any, color: any): void;
        getSVG(): any;
    }
    class SVG2DContext extends Object {
        fillStyle: any;
        strokeStyle: any;
        lineWidth: number;
        lineDash: any;
        globalAlpha: number;
        currentTransform: any;
        font: any;
        textAlign: any;
        textBaseline: any;
        direction: any;
        clipId: any;
        document: any;
        currentPath: any;
        g: any;
        defs: any;
        states: any;
        constructor(svgElement: SVGSVGElement);
        beginPath(): void;
        moveTo(x: any, y: any): void;
        lineTo(x: any, y: any): void;
        quadraticCurveTo(cpx: any, cpy: any, x: any, y: any): void;
        bezierCurveTo(cp1x: any, cp1y: any, cp2x: any, cp2y: any, x: any, y: any): void;
        rect(x: any, y: any, w: any, h: any): void;
        arc(x: any, y: any, radius: any, startAngle: any, endAngle: any, anticlockwise: any): void;
        ellipse(x: any, y: any, radiusX: any, radiusY: any, rotation: any, startAngle: any, endAngle: any, anticlockwise: any): void;
        roundRect(x: any, y: any, w: any, h: any, radiusTopLeft: any, radiusTopRight: any, radiusBottomRight: any, radiusBottomLeft: any, antiClockwise?: boolean): void;
        closePath(): void;
        fill(): void;
        stroke(): void;
        clip(): void;
        resetClip(): void;
        getLineDash(): any;
        setLineDash(lineDash: any): void;
        drawImage(image: any, sx: any, sy: any, sw: any, sh: any, dx: any, dy: any, dw: any, dh: any): void;
        fillText(text: any, x: any, y: any, maxWidth: any): void;
        strokeText(text: any, x: any, y: any, maxWidth: any): void;
        save(): void;
        restore(): void;
        scale(x: any, y: any): void;
        rotate(angle: any): void;
        translate(x: any, y: any): void;
        transform(a: any, b: any, c: any, d: any, e: any, f: any): void;
        setTransform(a: any, b: any, c: any, d: any, e: any, f: any): void;
        resetTransform(): void;
        clearRect(x: any, y: any, w: any, h: any): void;
        fillRect(x: any, y: any, w: any, h: any): void;
        strokeRect(x: any, y: any, w: any, h: any): void;
        createLinearGradient(x0: any, y0: any, x1: any, y1: any): SVGGradient;
        measureText(text: any): any;
        svgPath(path: any): void;
        parseFont(font: any): {
            style: any;
            weight: any;
            size: number;
            family: any;
        };
        roundRectFilledShadow(x: any, y: any, width: any, height: any, radiusTopLeft: any, radiusTopRight: any, radiusBottomRight: any, radiusBottomLeft: any, inner: any, shadowWidth: any, color: any): void;
        getSVG(): any;
        static counter: number;
    }
}
declare namespace Ui {
    interface RectangleInit extends CanvasElementInit {
        fill: Color | LinearGradient | string;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
    }
    class Rectangle extends CanvasElement implements RectangleInit {
        private _fill;
        private _radiusTopLeft;
        private _radiusTopRight;
        private _radiusBottomLeft;
        private _radiusBottomRight;
        constructor(init?: Partial<RectangleInit>);
        fill: Color | LinearGradient | string;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
        updateCanvas(ctx: any): void;
    }
}
declare namespace Ui {
    class Separator extends Rectangle {
        constructor();
        onStyleChange(): void;
        static style: any;
    }
}
declare namespace Ui {
    interface ShapeInit extends CanvasElementInit {
        scale: number;
        fill: string | undefined | Color | LinearGradient;
        path: string;
    }
    interface ShapeStyle {
        color: string | undefined | Color | LinearGradient;
    }
    class Shape extends CanvasElement implements ShapeInit {
        private _fill;
        private _path;
        private _scale;
        constructor(init?: Partial<ShapeInit>);
        scale: number;
        fill: Color | LinearGradient | string | undefined;
        path: string;
        onStyleChange(): void;
        updateCanvas(ctx: any): void;
        static style: ShapeStyle;
    }
}
declare namespace Ui {
    interface IconInit extends ShapeInit {
        icon: string;
    }
    class Icon extends Shape implements IconInit {
        constructor(init?: Partial<IconInit>);
        icon: string;
        protected arrangeCore(width: number, height: number): void;
        static icons: object;
        static initialize(): void;
        static getPath(icon: any): any;
        static getNames(): any[];
        static register(iconName: any, iconPath: any): void;
        static override(iconName: any, iconPath: any): void;
        static parse(icon: any): Icon;
        static drawIcon(ctx: any, icon: any, size: any, fill: any): void;
        static drawIconAndBadge(ctx: any, icon: any, size: any, fill: any, badgeText: any, badgeSize: any, badgeFill: any, textFill: any): void;
    }
}
declare namespace Ui {
    class DualIcon extends CanvasElement {
        private _icon;
        private _fill;
        private _stroke;
        private _strokeWidth;
        constructor();
        icon: string;
        fill: Color;
        stroke: Color;
        strokeWidth: number;
        updateCanvas(ctx: any): void;
        static style: any;
    }
}
declare namespace Ui {
    class Event extends Core.Object {
        type: any;
        bubbles: boolean;
        cancelable: boolean;
        target: any;
        cancelBubble: boolean;
        stop: boolean;
        constructor();
        stopPropagation(): void;
        stopImmediatePropagation(): void;
        getIsPropagationStopped(): boolean;
        setType(type: any): void;
        setBubbles(bubbles: any): void;
        dispatchEvent(target: any): void;
    }
}
declare namespace Ui {
    class PointerEvent extends Event {
        pointer: Pointer;
        clientX: number;
        clientY: number;
        pointerType: string;
        constructor(type: string, pointer: Pointer);
    }
    class PointerWatcher extends Core.Object {
        element: Element;
        pointer: Pointer;
        constructor(element: Element, pointer: Pointer);
        getAbsoluteDelta(): {
            x: number;
            y: number;
        };
        getDelta(): {
            x: number;
            y: number;
        };
        getPosition(): Point;
        getIsInside(): boolean;
        getDirection(): "left" | "right" | "top" | "bottom";
        getSpeed(): {
            x: number;
            y: number;
        };
        getIsCaptured(): boolean;
        capture(): void;
        release(): void;
        cancel(): void;
        down(): void;
        move(): void;
        up(): void;
        unwatch(): void;
    }
    class Pointer extends Core.Object {
        id: number;
        x: number;
        y: number;
        initialX: number;
        initialY: number;
        altKey: boolean;
        ctrlKey: boolean;
        shiftKey: boolean;
        type: string;
        start: number;
        cumulMove: number;
        chainLevel: number;
        watchers: PointerWatcher[];
        captureWatcher: PointerWatcher;
        history: any;
        buttons: number;
        constructor(type: string, id: number);
        capture(watcher: any): void;
        release(watcher: any): void;
        getType(): string;
        getIsDown(): boolean;
        getIsCaptured(): boolean;
        getX(): number;
        getY(): number;
        getInitialX(): number;
        getInitialY(): number;
        setInitialPosition(x: any, y: any): void;
        getButtons(): number;
        setButtons(buttons: any): void;
        getChainLevel(): number;
        getAltKey(): boolean;
        setAltKey(altKey: any): void;
        getCtrlKey(): boolean;
        setCtrlKey(ctrlKey: any): void;
        getShiftKey(): boolean;
        setShiftKey(shiftKey: any): void;
        setControls(altKey: any, ctrlKey: any, shiftKey: any): void;
        move(x: number, y: number): void;
        getIsHold(): boolean;
        getDelta(): number;
        getCumulMove(): number;
        getIsMove(): boolean;
        down(x: number, y: number, buttons: any): void;
        up(): void;
        watch(element: any): PointerWatcher;
        unwatch(watcher: any): void;
        static HOLD_DELAY: number;
        static MOVE_DELTA: number;
        static HISTORY_TIMELAPS: number;
    }
    class PointerManager extends Core.Object {
        touches: any;
        lastUpdate: any;
        lastTouchX: number;
        lastTouchY: number;
        lastDownTouchX: number;
        lastDownTouchY: number;
        mouse: any;
        app: App;
        pointers: Core.HashTable<Pointer>;
        constructor(app: App);
        onSelectStart(event: any): void;
        onMouseDown(event: any): void;
        onMouseMove(event: any): void;
        onMouseUp(event: any): void;
        onWindowLoad(): void;
        onPointerDown(event: any): void;
        onPointerMove(event: any): void;
        onPointerUp(event: any): void;
        onPointerCancel(event: any): void;
        updateTouches(event: any): void;
    }
}
declare namespace Ui {
    class DragEffectIcon extends DualIcon {
        protected onStyleChange(): void;
        static style: object;
    }
    class DragEvent extends Event {
        clientX: number;
        clientY: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        metaKey: boolean;
        dataTransfer: DragDataTransfer;
        effectAllowed: string;
        private deltaX;
        private deltaY;
        constructor();
        preventDefault(): void;
    }
    class DragNativeData extends Core.Object {
        dataTransfer: any;
        constructor(dataTransfer: any);
        getTypes(): any;
        hasTypes(...args: any[]): boolean;
        hasType(type: any): boolean;
        hasFiles(): boolean;
        getFiles(): any[];
        getData(type: any): any;
    }
    class DragWatcher extends Core.Object {
        effectAllowed: any;
        dataTransfer: DragDataTransfer;
        element: Element;
        x: number;
        y: number;
        constructor(element: Element, dataTransfer: DragDataTransfer);
        getPosition(): Point;
        getElement(): Element;
        getDataTransfer(): DragDataTransfer;
        getEffectAllowed(): any;
        setEffectAllowed(effect: any): void;
        move(x: number, y: number): void;
        leave(): void;
        drop(dropEffect: string): void;
        release(): void;
    }
    interface DragDataTransfer {
        getPosition(): Point;
        getData(): any;
        capture(element: Element, effect: any): DragWatcher;
        releaseDragWatcher(dragWatcher: DragWatcher): void;
    }
    class DragEmuDataTransfer extends Core.Object implements DragDataTransfer {
        draggable: Draggable;
        image: HTMLElement;
        imageEffect: DragEffectIcon;
        catcher: HTMLElement;
        startX: number;
        startY: number;
        dropX: number;
        dropY: number;
        x: number;
        y: number;
        startImagePoint: Point;
        overElement: Element;
        hasStarted: boolean;
        dragDelta: Point;
        effectAllowed: any;
        watcher: PointerWatcher;
        pointer: Pointer;
        dropEffect: any;
        dropEffectIcon: any;
        data: any;
        timer: Core.DelayedTask;
        dropFailsTimer: Anim.Clock;
        delayed: boolean;
        dragWatcher: DragWatcher;
        constructor(draggable: Draggable, x: number, y: number, delayed: boolean, pointer: Pointer);
        setData(data: any): void;
        getData(): any;
        hasData(): boolean;
        getPosition(): Point;
        getDragDelta(): Point;
        protected generateImage(element: any): HTMLElement;
        protected onTimer(): void;
        capture(element: Element, effect: any): DragWatcher;
        releaseDragWatcher(dragWatcher: DragWatcher): void;
        protected onPointerMove(watcher: PointerWatcher): void;
        protected onPointerUp(watcher: PointerWatcher): void;
        protected onPointerCancel(watcher: PointerWatcher): void;
        protected removeImage(): void;
        protected onDropFailsTimerUpdate(clock: any, progress: any): void;
        static getMergedEffectAllowed(effectAllowed1: any, effectAllowed2: any): any;
        static getMatchingDropEffect(srcEffectAllowed: any, dstEffectAllowed: any, pointerType: any, ctrlKey: any, altKey: any, shiftKey: any): any;
    }
    class DragNativeDataTransfer extends Core.Object implements DragDataTransfer {
        dataTransfer: any;
        dragWatcher: DragWatcher;
        nativeData: any;
        dropEffect: any;
        position: Point;
        constructor();
        getPosition(): Point;
        setPosition(position: Point): void;
        getData(): any;
        setDataTransfer(dataTransfer: any): void;
        capture(element: Element, effect: any): DragWatcher;
        releaseDragWatcher(dragWatcher: DragWatcher): void;
    }
    class DragNativeManager extends Core.Object {
        app: App;
        dataTransfer: DragNativeDataTransfer;
        nativeTarget: any;
        constructor(app: App);
        protected onDragOver(event: any): boolean;
        protected onDragEnter(e: any): void;
        protected onDragLeave(e: any): void;
        protected onDrop(event: any): void;
        nativeToCustom(effectAllowed: string): string[];
        customToNative(effectAllowed: any): string;
    }
}
declare namespace Ui {
    class WheelEvent extends Event {
        deltaX: number;
        deltaY: number;
        clientX: number;
        clientY: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        metaKey: boolean;
        constructor();
        setClientX(clientX: any): void;
        setClientY(clientY: any): void;
        setDeltaX(deltaX: any): void;
        setDeltaY(deltaY: any): void;
        setCtrlKey(ctrlKey: any): void;
        setAltKey(altKey: any): void;
        setShiftKey(shiftKey: any): void;
        setMetaKey(metaKey: any): void;
    }
    class WheelManager extends Core.Object {
        app: App;
        constructor(app: App);
        onMouseWheel(event: any): void;
    }
}
declare namespace Ui {
    interface LBoxInit extends ContainerInit {
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        content: Element[] | Element;
    }
    class LBox extends Container implements LBoxInit {
        private _paddingTop;
        private _paddingBottom;
        private _paddingLeft;
        private _paddingRight;
        constructor(init?: Partial<LBoxInit>);
        protected setContent(content: Element | Element[]): void;
        content: Element | Element[];
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        append(child: Element): void;
        prepend(child: Element): void;
        insertBefore(child: Element, beforeChild: Element): void;
        remove(child: Element): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    interface LPBoxInit extends LBoxInit {
    }
    class LPBox extends LBox implements LPBoxInit {
        constructor(init?: Partial<LPBoxInit>);
        appendAtLayer(child: Element, layer: number): void;
        prependAtLayer(child: Element, layer: number): void;
    }
}
declare namespace Ui {
    type Orientation = 'vertical' | 'horizontal';
    interface BoxInit extends ContainerInit {
        orientation: Orientation;
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        uniform: boolean;
        spacing: number;
        content: Element | Element[];
    }
    class Box extends Container implements BoxInit {
        private _paddingTop;
        private _paddingBottom;
        private _paddingLeft;
        private _paddingRight;
        private _uniform;
        private _spacing;
        private star;
        private vertical;
        private uniformSize;
        constructor(init?: Partial<BoxInit>);
        content: Element | Element[];
        orientation: Orientation;
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        uniform: boolean;
        spacing: number;
        append(child: Element, resizable?: boolean): void;
        prepend(child: Element, resizable?: boolean): void;
        insertAt(child: Element, position: number, resizable?: boolean): void;
        moveAt(child: Element, position: number): void;
        remove(child: Element): void;
        private measureUniform(width, height);
        private measureNonUniformVertical(width, height);
        private measureNonUniformHorizontal(width, height);
        protected measureCore(width: number, height: number): any;
        protected arrangeCore(width: number, height: number): void;
        static getResizable(child: Element): boolean;
        static setResizable(child: Element, resizable?: boolean): void;
    }
    interface VBoxInit extends BoxInit {
    }
    class VBox extends Box implements VBoxInit {
        constructor(init?: Partial<VBoxInit>);
    }
    interface HBoxInit extends BoxInit {
    }
    class HBox extends Box implements HBoxInit {
        constructor(init?: Partial<HBoxInit>);
    }
}
declare namespace Ui {
    interface OverableInit extends LBoxInit {
    }
    class Overable extends LBox implements OverableInit {
        watcher: PointerWatcher;
        constructor(init?: Partial<OverableInit>);
        readonly isOver: boolean;
    }
}
declare namespace Ui {
    interface PressableInit extends OverableInit {
        lock: boolean;
    }
    class Pressable extends Overable implements PressableInit {
        private _lock;
        private _isDown;
        private lastTime;
        constructor(init?: Partial<PressableInit>);
        readonly isDown: boolean;
        lock: boolean;
        press(): void;
        activate(): void;
        protected onPointerDown(event: PointerEvent): void;
        protected onKeyDown(event: any): void;
        protected onKeyUp(event: any): void;
        protected onDown(): void;
        protected onUp(): void;
        protected onPress(x?: number, y?: number): void;
        protected onActivate(): void;
        protected onDisable(): void;
        protected onEnable(): void;
    }
}
declare namespace Ui {
    interface DraggableInit extends PressableInit {
    }
    class Draggable extends Pressable implements DraggableInit {
        allowedMode: any;
        draggableData: any;
        private _dragDelta;
        private dataTransfer;
        constructor(init?: Partial<DraggableInit>);
        setAllowedMode(allowedMode: any): void;
        readonly dragDelta: Point;
        private onDraggablePointerDown(event);
        private onDragStart(dataTransfer);
        private onDragEnd(dataTransfer);
    }
}
declare namespace Ui {
    interface SelectionAction {
        default?: boolean;
        text: string;
        icon: string;
        scope?: any;
        callback?: Function;
        multiple?: boolean;
    }
    interface SelectionActions {
        [key: string]: SelectionAction;
    }
    interface SelectionableInit extends DraggableInit {
    }
    class Selectionable extends Draggable implements SelectionableInit {
        isSelected: boolean;
        handler: any;
        constructor(init?: Partial<SelectionableInit>);
        getIsSelected(): boolean;
        setIsSelected(isSelected: any): void;
        protected onSelect(): void;
        protected onUnselect(): void;
        getSelectionActions(): SelectionActions;
        getParentSelectionHandler(): any;
        onSelectionableDragStart(): void;
        onSelectionableDragEnd(): void;
        onSelectionableActivate(): void;
        select(): void;
        unselect(): void;
        onUnload(): void;
    }
}
declare namespace Ui {
    class Selection extends Core.Object {
        elements: Selectionable[];
        constructor();
        clear(): void;
        append(element: Selectionable): void;
        remove(element: Selectionable): void;
        getElements(): Selectionable[];
        getElementActions(element: Selectionable): {};
        getActions(): any;
        getDefaultAction(): any;
        executeDefaultAction(): boolean;
        getDeleteAction(): any;
        executeDeleteAction(): boolean;
        onElementUnload(element: Selectionable): void;
    }
}
declare namespace Ui {
    interface LabelInit extends ElementInit {
        text: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: string | number;
        color: Color | string;
        orientation: Orientation;
    }
    interface LabelStyle {
        color: Color;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
    }
    class Label extends Element implements LabelInit {
        private _text;
        private _orientation;
        private _fontSize;
        private _fontFamily;
        private _fontWeight;
        private _color;
        labelDrawing: any;
        private textMeasureValid;
        private textWidth;
        private textHeight;
        constructor(init?: Partial<LabelInit>);
        text: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: string | number;
        color: Color | string;
        private getColor();
        orientation: Orientation;
        onStyleChange(): void;
        renderDrawing(): any;
        measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        arrangeCore(width: any, height: any): void;
        static measureBox: any;
        static measureContext: any;
        static measureTextCanvas(text: any, fontSize: any, fontFamily: any, fontWeight: any): any;
        static createMeasureCanvas(): void;
        static isFontAvailable(fontFamily: string, fontWeight: any): boolean;
        static measureTextHtml(text: any, fontSize: any, fontFamily: any, fontWeight: any): {
            width: any;
            height: any;
        };
        static createMeasureHtml(): void;
        static measureText(text: any, fontSize: any, fontFamily: any, fontWeight: any): any;
        static style: LabelStyle;
    }
}
declare namespace Ui {
    interface MovableBaseInit extends ContainerInit {
        lock: boolean;
        inertia: boolean;
        moveHorizontal: boolean;
        moveVertical: boolean;
    }
    class MovableBase extends Container implements MovableBaseInit {
        private _moveHorizontal;
        private _moveVertical;
        protected posX: number;
        protected posY: number;
        protected speedX: number;
        protected speedY: number;
        protected startPosX: number;
        protected startPosY: number;
        protected inertiaClock: Anim.Clock;
        private _inertia;
        private _isDown;
        private _lock;
        protected isInMoveEvent: boolean;
        protected cumulMove: number;
        constructor(init?: Partial<MovableBaseInit>);
        lock: boolean;
        readonly isDown: boolean;
        inertia: boolean;
        moveHorizontal: boolean;
        moveVertical: boolean;
        setPosition(x?: number, y?: number, dontSignal?: boolean): void;
        readonly positionX: number;
        readonly positionY: number;
        protected onMove(x: number, y: number): void;
        private onDown();
        private onUp(abort);
        private onPointerDown(event);
        startInertia(): void;
        stopInertia(): void;
    }
}
declare namespace Ui {
    interface MovableInit extends MovableBaseInit {
        cursor: string;
    }
    class Movable extends MovableBase implements MovableInit {
        private contentBox;
        private _cursor;
        constructor(init?: Partial<MovableInit>);
        cursor: string;
        protected onKeyDown(event: any): void;
        protected onMove(x: number, y: number): void;
        protected measureCore(width: number, height: number): Size;
        protected arrangeCore(width: number, height: number): void;
        getContent(): Element;
        setContent(content: any): void;
        protected onDisable(): void;
        protected onEnable(): void;
    }
}
declare namespace Ui {
    class Transformable extends LBox {
        private _inertia;
        protected inertiaClock: Anim.Clock;
        protected contentBox: LBox;
        private _isDown;
        private transformLock;
        private watcher1;
        private watcher2;
        private _angle;
        private _scale;
        private _translateX;
        private _translateY;
        private startAngle;
        private startScale;
        private startTranslateX;
        private startTranslateY;
        private _allowScale;
        private _minScale;
        private _maxScale;
        private _allowRotate;
        private _allowTranslate;
        private speedX;
        private speedY;
        constructor();
        allowScale: boolean;
        minScale: number;
        maxScale: number;
        allowRotate: boolean;
        allowTranslate: boolean;
        readonly isDown: boolean;
        readonly isInertia: boolean;
        angle: number;
        scale: number;
        translateX: number;
        translateY: number;
        private buildMatrix(translateX, translateY, scale, angle);
        readonly matrix: Matrix;
        getBoundaryBox(matrix: any): {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        setContentTransform(translateX: any, translateY: any, scale: any, angle: any): void;
        inertia: boolean;
        protected onContentTransform(testOnly?: boolean): void;
        protected onDown(): void;
        protected onUp(): void;
        protected onPointerDown(event: PointerEvent): void;
        protected onPointerMove(watcher: any): void;
        protected onPointerCancel(watcher: any): void;
        protected onPointerUp(watcher: any): void;
        protected onWheel(event: WheelEvent): void;
        startInertia(): void;
        protected onTimeupdate(clock: any, progress: any, delta: any): void;
        stopInertia(): void;
        content: Element;
        protected arrangeCore(width: any, height: any): void;
    }
}
declare namespace Ui {
    interface ScrollableInit extends ContainerInit {
        maxScale: number;
        content: Element;
        inertia: boolean;
        scrollHorizontal: boolean;
        scrollVertical: boolean;
        scale: number;
    }
    class Scrollable extends Container implements ScrollableInit {
        private contentBox;
        private _scrollHorizontal;
        private _scrollVertical;
        scrollbarHorizontalBox: Movable;
        scrollbarVerticalBox: Movable;
        showShadows: boolean;
        lock: boolean;
        isOver: boolean;
        protected showClock: Anim.Clock;
        offsetX: number;
        offsetY: number;
        relativeOffsetX: number;
        relativeOffsetY: number;
        viewWidth: number;
        viewHeight: number;
        contentWidth: number;
        contentHeight: number;
        protected overWatcher: PointerWatcher;
        scrollLock: boolean;
        scrollbarVerticalNeeded: boolean;
        scrollbarHorizontalNeeded: boolean;
        scrollbarVerticalHeight: number;
        scrollbarHorizontalWidth: number;
        constructor(init?: Partial<ScrollableInit>);
        maxScale: number;
        content: Element;
        protected setContent(content: Element): void;
        inertia: boolean;
        scrollHorizontal: boolean;
        scrollVertical: boolean;
        setScrollbarVertical(scrollbarVertical: Movable): void;
        setScrollbarHorizontal(scrollbarHorizontal: Movable): void;
        setOffset(offsetX: number, offsetY: number, absolute?: boolean): boolean;
        getOffsetX(): number;
        getRelativeOffsetX(): number;
        getOffsetY(): number;
        getRelativeOffsetY(): number;
        scale: number;
        readonly isDown: boolean;
        readonly isInertia: boolean;
        protected onWheel(event: WheelEvent): void;
        autoShowScrollbars(): void;
        autoHideScrollbars(): void;
        protected onShowBarsTick(clock: Anim.Clock, progress: number, delta: number): void;
        protected onScroll(): void;
        updateOffset(): void;
        protected onScrollbarHorizontalMove(movable: Movable): void;
        protected onScrollbarVerticalMove(movable: Movable): void;
        protected onScrollIntoView(el: Element): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    class ScrollableContent extends Transformable {
        private _contentWidth;
        private _contentHeight;
        constructor();
        readonly offsetX: number;
        readonly offsetY: number;
        setOffset(x: number, y: number): void;
        readonly contentWidth: number;
        readonly contentHeight: number;
        protected arrangeCore(width: number, height: number): void;
        protected onContentTransform(testOnly?: boolean): void;
    }
}
declare namespace Ui {
    class Scrollbar extends Movable {
        private orientation;
        private rect;
        private over;
        private clock;
        constructor(orientation: Orientation);
        radius: number;
        fill: Color;
        private startAnim();
        protected onTick(clock: any, progress: any, deltaTick: any): void;
    }
    interface ScrollingAreaInit extends ScrollableInit {
    }
    class ScrollingArea extends Scrollable implements ScrollingAreaInit {
        private horizontalScrollbar;
        private verticalScrollbar;
        constructor(init?: Partial<ScrollingAreaInit>);
        protected onStyleChange(): void;
        static style: any;
    }
}
declare namespace Ui {
    class CompactLabelContext extends Core.Object {
        text: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        maxLine: number;
        interLine: number;
        textAlign: string;
        width: number;
        drawLine: any;
        whiteSpace: 'pre-line' | 'nowrap';
        wordWrap: 'normal' | 'break-word';
        textTransform: 'none' | 'lowercase' | 'uppercase';
        constructor();
        setDrawLine(func: any): void;
        getWhiteSpace(): "nowrap" | "pre-line";
        setWhiteSpace(whiteSpace: any): void;
        getWordWrap(): "normal" | "break-word";
        setWordWrap(wordWrap: any): void;
        getMaxLine(): number;
        setMaxLine(maxLine: any): void;
        getTextAlign(): string;
        setTextAlign(textAlign: any): void;
        setInterLine(interLine: any): void;
        getInterLine(): number;
        getText(): string;
        setText(text: any): void;
        setFontSize(fontSize: any): void;
        getFontSize(): number;
        setFontFamily(fontFamily: any): void;
        getFontFamily(): string;
        setFontWeight(fontWeight: any): void;
        getFontWeight(): string;
        getTextTransform(): "none" | "lowercase" | "uppercase";
        setTextTransform(textTransform: any): void;
        getTransformedText(): string;
        flushLine(y: any, line: any, width: any, render: any, lastLine?: boolean): number;
        updateFlow(width: any, render: any): {
            width: number;
            height: number;
        };
        updateFlowWords(width: any, render: any): {
            width: number;
            height: number;
        };
        drawText(width: any, render: any): any;
    }
    interface CompactLabelInit extends ElementInit {
        maxLine: number;
        text: string;
        textAlign: string;
        interLine: number;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        whiteSpace: string;
        wordWrap: string;
        textTransform: string;
        color: Color;
    }
    class CompactLabel extends Element implements CompactLabelInit {
        private _fontSize;
        private _fontFamily;
        private _fontWeight;
        private _color;
        private textDrawing;
        private _maxLine;
        private _interLine;
        private _textAlign;
        isMeasureValid: boolean;
        isArrangeValid: boolean;
        lastMeasureWidth: number;
        lastMeasureHeight: number;
        lastAvailableWidth: number;
        textContext: any;
        private _whiteSpace;
        private _wordWrap;
        private _textTransform;
        constructor(init?: Partial<CompactLabelInit>);
        maxLine: number;
        text: string;
        textAlign: string;
        interLine: number;
        fontSize: number;
        fontFamily: string;
        fontWeight: any;
        whiteSpace: string;
        wordWrap: string;
        textTransform: string;
        color: Color;
        protected renderDrawing(): any;
        protected onStyleChange(): void;
        protected measureCore(width: any, height: any): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: any, height: any): void;
        static style: object;
    }
}
declare namespace Ui {
    interface DropEffect {
        action: string;
        text?: string;
        dragicon?: string;
        primary?: boolean;
        secondary?: boolean;
    }
    type DropEffectFunc = (data: any, dataTransfer: DragDataTransfer) => DropEffect[];
    interface DropBoxInit extends LBoxInit {
    }
    class DropBox extends LBox {
        watchers: DragWatcher[];
        allowedTypes: {
            type: string | Function;
            effect: DropEffect[] | DropEffectFunc;
        }[];
        constructor(init?: Partial<DropBoxInit>);
        addType(type: string | Function, effects: string | string[] | DropEffect[] | DropEffectFunc): void;
        protected onDragOver(event: DragEvent): void;
        protected onWatcherEnter(watcher: DragWatcher): void;
        protected onWatcherMove(watcher: DragWatcher): void;
        protected onWatcherDrop(watcher: DragWatcher, effect: any, x: number, y: number): void;
        protected onWatcherLeave(watcher: DragWatcher): void;
        getAllowedTypesEffect(dataTransfer: DragDataTransfer): DropEffect[];
        protected onDragEffect(dataTransfer: DragDataTransfer): string | DropEffect[];
        protected onDragEffectFunction(dataTransfer: DragDataTransfer, func: DropEffectFunc): DropEffect[];
        protected onDrop(dataTransfer: DragDataTransfer, dropEffect: any, x: number, y: number): boolean;
        protected onDragEnter(dataTransfer: DragDataTransfer): void;
        protected onDragLeave(): void;
    }
}
declare namespace Ui {
    class ButtonText extends CompactLabel {
    }
    class ButtonBackground extends CanvasElement {
        private _borderWidth;
        private _border;
        private _background;
        private _radius;
        constructor();
        borderWidth: number;
        border: Color | string;
        radius: number;
        background: Color | string;
        updateCanvas(ctx: any): void;
    }
    class ButtonIcon extends CanvasElement {
        private _badge;
        private _badgeColor;
        private _badgeTextColor;
        private _fill;
        private _icon;
        constructor();
        icon: string;
        badge: string;
        badgeColor: Color | string;
        badgeTextColor: Color | string;
        fill: Color | string;
        updateCanvas(ctx: any): void;
    }
    interface ButtonInit extends SelectionableInit {
        text: string;
        icon: string;
        background: Element;
        marker: Element;
        isActive: boolean;
        badge: string;
        orientation: string;
    }
    class Button extends Selectionable implements ButtonInit {
        private dropbox;
        private _isActive;
        private mainBox;
        private buttonPartsBox;
        private _icon;
        private _iconBox;
        private _text;
        private _textBox;
        private _marker;
        private _badge;
        private bg;
        private _orientation;
        constructor(init?: Partial<ButtonInit>);
        readonly dropBox: DropBox;
        background: Element;
        readonly textBox: Element;
        text: string;
        setTextOrElement(text: string | Element): void;
        readonly iconBox: Element;
        icon: string;
        setIconOrElement(icon: any): void;
        marker: Element;
        isActive: boolean;
        badge: string;
        orientation: Orientation;
        protected getBackgroundColor(): Color;
        protected getBackgroundBorderColor(): Color;
        protected getForegroundColor(): Color;
        readonly isTextVisible: boolean;
        readonly isIconVisible: boolean;
        protected updateVisibles(): void;
        protected updateColors(): void;
        protected onDisable(): void;
        protected onEnable(): void;
        protected onStyleChange(): void;
        static style: object;
    }
    class DefaultButton extends Button {
        static style: object;
    }
}
declare namespace Ui {
    class ActionButton extends Button {
        private _action;
        private _selection;
        constructor();
        action: any;
        selection: Selection;
        protected onActionButtonEffect(data: any, dataTransfer: any): string[];
        protected onActionButtonDrop(): void;
        static style: object;
    }
}
declare namespace Ui {
    class ContextBarCloseButton extends Button {
        constructor();
        static style: any;
    }
    class ContextBar extends LBox {
        bg: Rectangle;
        selection: Selection;
        actionsBox: Box;
        closeButton: ContextBarCloseButton;
        constructor();
        setSelection(selection: Selection): void;
        onClosePress(): void;
        onSelectionChange(): void;
        onStyleChange(): void;
        static style: any;
    }
}
declare namespace Ui {
    interface PopupInit extends ContainerInit {
        preferredWidth: number;
        preferredHeight: number;
        autoClose: boolean;
    }
    type AttachBorder = 'right' | 'left' | 'top' | 'bottom' | 'center';
    class Popup extends Container implements PopupInit {
        popupSelection: Selection;
        background: PopupBackground;
        shadow: Pressable;
        shadowGraphic: Rectangle;
        contextBox: ContextBar;
        contentBox: LBox;
        scroll: ScrollingArea;
        posX: number;
        posY: number;
        attachedElement: Element;
        attachedBorder: AttachBorder;
        private _autoClose;
        private _preferredWidth;
        private _preferredHeight;
        openClock: Anim.Clock;
        isClosed: boolean;
        constructor(init?: Partial<PopupInit>);
        preferredWidth: number;
        preferredHeight: number;
        getSelectionHandler(): Selection;
        autoClose: boolean;
        content: Element;
        protected onWindowResize(): void;
        protected onShadowPress(): void;
        protected onOpenTick(clock: any, progress: any, delta: any): void;
        protected onPopupSelectionChange(selection: Selection): void;
        protected onStyleChange(): void;
        protected onChildInvalidateMeasure(child: Element, type: any): void;
        protected onChildInvalidateArrange(child: Element): void;
        open(): void;
        openAt(posX: number, posY: number): void;
        openElement(element: Element, position?: AttachBorder): void;
        private openPosOrElement(posX?, posY?);
        close(): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        setRight(x: any, y: any, width: any, height: any): void;
        setLeft(x: any, y: any, width: any, height: any): void;
        setTop(x: any, y: any, width: any, height: any): void;
        setBottom(x: any, y: any, width: any, height: any): void;
        setCenter(width: any, height: any): void;
        static style: any;
    }
    class PopupBackground extends CanvasElement {
        private _radius;
        private _fill;
        private _arrowBorder;
        private _arrowOffset;
        private readonly arrowSize;
        constructor();
        arrowBorder: 'left' | 'right' | 'top' | 'bottom' | 'none';
        arrowOffset: number;
        radius: number;
        fill: Color | string;
        private genPath(width, height, radius, arrowBorder, arrowSize, arrowOffset);
        updateCanvas(ctx: any): void;
    }
    interface MenuPopupInit extends PopupInit {
    }
    class MenuPopup extends Popup implements MenuPopupInit {
        constructor(init?: Partial<MenuPopupInit>);
    }
    class MenuPopupSeparator extends Separator {
        constructor();
    }
}
declare namespace Ui {
    class MenuToolBarPopup extends MenuPopup {
    }
    class MenuToolBarButton extends Button {
        constructor();
    }
    class MenuToolBar extends Container {
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        star: number;
        measureLock: any;
        items: Element[];
        menuButton: MenuToolBarButton;
        itemsAlign: string;
        menuPosition: string;
        uniform: boolean;
        uniformSize: number;
        spacing: number;
        itemsWidth: number;
        keepItems: any;
        menuNeeded: boolean;
        bg: Rectangle;
        constructor();
        getUniform(): boolean;
        setUniform(uniform: any): void;
        getMenuPosition(): string;
        setMenuPosition(menuPosition: any): void;
        getItemsAlign(): string;
        setItemsAlign(align: any): void;
        getLogicalChildren(): Element[];
        setPadding(padding: any): void;
        getPaddingTop(): number;
        setPaddingTop(paddingTop: any): void;
        getPaddingBottom(): number;
        setPaddingBottom(paddingBottom: any): void;
        getPaddingLeft(): number;
        setPaddingLeft(paddingLeft: any): void;
        getPaddingRight(): number;
        setPaddingRight(paddingRight: any): void;
        getSpacing(): number;
        setSpacing(spacing: any): void;
        append(child: Element, resizable: boolean): void;
        prepend(child: Element, resizable: boolean): void;
        remove(child: Element): void;
        moveAt(child: Element, position: number): void;
        insertAt(child: Element, position: number, resizable: boolean): void;
        setContent(content: any): void;
        private onMenuButtonPress();
        clear(): void;
        measureCore(width: number, height: number): any;
        arrangeCore(width: number, height: number): void;
        onChildInvalidateMeasure(child: Element, event: any): void;
        onStyleChange(): void;
        static style: any;
    }
}
declare namespace Ui {
    interface AppInit extends LBoxInit {
        content: Element;
    }
    class App extends LBox {
        styles: any;
        private updateTask;
        loaded: boolean;
        focusElement: any;
        arguments: any;
        private ready;
        orientation: number;
        webApp: boolean;
        lastArrangeHeight: number;
        private drawList;
        private layoutList;
        windowWidth: number;
        windowHeight: number;
        private contentBox;
        private _content;
        dialogs: LBox;
        topLayers: LBox;
        requireFonts: any;
        testFontTask: any;
        bindedUpdate: any;
        selection: Selection;
        constructor(init?: Partial<AppInit>);
        setWebApp(webApp: boolean): void;
        getSelectionHandler(): Selection;
        forceInvalidateMeasure(element: any): void;
        requireFont(fontFamily: any, fontWeight: any): void;
        testRequireFonts(): void;
        checkWindowSize(): void;
        getOrientation(): number;
        protected onSelectionChange(selection: any): void;
        protected onWindowLoad(): void;
        protected onWindowResize(event: any): void;
        protected onOrientationChange(event: any): void;
        update(): void;
        content: Element;
        getFocusElement(): any;
        appendDialog(dialog: any): void;
        removeDialog(dialog: any): void;
        appendTopLayer(layer: any): void;
        removeTopLayer(layer: any): void;
        getArguments(): any;
        readonly isReady: boolean;
        protected onReady(): void;
        protected onWindowKeyUp(event: any): void;
        protected onMessage(event: any): void;
        sendMessageToParent(msg: any): void;
        findFocusableDiv(current: any): any;
        enqueueDraw(element: any): void;
        enqueueLayout(element: any): void;
        handleScrolling(drawing: any): void;
        getElementsByClassName(className: any): any[];
        getElementByDrawing(drawing: any): any;
        getInverseLayoutTransform(): Matrix;
        getLayoutTransform(): Matrix;
        invalidateMeasure(): void;
        invalidateArrange(): void;
        protected arrangeCore(w: number, h: number): void;
        static current: App;
        static getWindowIFrame(currentWindow: any): any;
        static getRootWindow(): Window;
    }
}
declare namespace Ui {
    interface FormInit extends LBoxInit {
    }
    class Form extends LBox implements FormInit {
        constructor(init?: Partial<FormInit>);
        onSubmit(event: any): void;
        submit(): void;
        renderDrawing(): any;
    }
}
declare namespace Ui {
    interface DialogCloseButtonInit extends ButtonInit {
    }
    class DialogCloseButton extends Button implements DialogCloseButtonInit {
        constructor(init?: Partial<DialogCloseButtonInit>);
        static style: object;
    }
    class DialogGraphic extends CanvasElement {
        private _background;
        constructor();
        background: Color | string;
        updateCanvas(ctx: any): void;
    }
    class DialogTitle extends CompactLabel {
        static style: object;
    }
    class DialogButtonBox extends LBox {
        bg: Rectangle;
        actionBox: HBox;
        cancelButton: Pressable;
        actionButtonsBox: MenuToolBar;
        titleLabel: DialogTitle;
        constructor();
        getTitle(): string;
        setTitle(title: string): void;
        setCancelButton(button: Pressable): void;
        setActionButtons(buttons: any): void;
        getActionButtons(): any[];
        onCancelPress(): void;
        onStyleChange(): void;
        static style: object;
    }
    interface DialogInit extends ContainerInit {
        preferredWidth: number;
        preferredHeight: number;
        fullScrolling: boolean;
        title: string;
        cancelButton: Pressable;
        actionButtons: Pressable[];
        autoClose: boolean;
        content: Element;
    }
    class Dialog extends Container implements DialogInit {
        dialogSelection: Selection;
        shadow: Pressable;
        shadowGraphic: Rectangle;
        graphic: DialogGraphic;
        lbox: LBox;
        vbox: VBox;
        contentBox: LBox;
        contentVBox: VBox;
        private _actionButtons;
        private _cancelButton;
        private buttonsBox;
        buttonsVisible: boolean;
        private _preferredWidth;
        private _preferredHeight;
        actionBox: DialogButtonBox;
        contextBox: ContextBar;
        private _autoClose;
        openClock: Anim.Clock;
        isClosed: boolean;
        scroll: ScrollingArea;
        constructor(init?: Partial<DialogInit>);
        getSelectionHandler(): Selection;
        preferredWidth: number;
        preferredHeight: number;
        open(): void;
        close(): void;
        onOpenTick(clock: any, progress: any, delta: any): void;
        getDefaultButton(): any;
        defaultAction(): void;
        fullScrolling: boolean;
        title: string;
        updateButtonsBoxVisible(): void;
        cancelButton: Pressable;
        actionButtons: Pressable[];
        content: Element;
        autoClose: boolean;
        protected onCancelPress(): void;
        protected onFormSubmit(): void;
        protected onDialogSelectionChange(selection: any): void;
        protected onKeyDown(event: any): void;
        protected onShadowPress(): void;
        protected onStyleChange(): void;
        protected onChildInvalidateMeasure(child: any, type: any): void;
        protected onChildInvalidateArrange(child: any): void;
        protected measureCore(width: any, height: any): {
            width: any;
            height: any;
        };
        protected arrangeCore(width: number, height: number): void;
        static style: object;
    }
}
declare namespace Ui {
    interface HtmlInit extends ElementInit {
        html: string;
        text: string;
        textAlign: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        interLine: number;
        wordWrap: string;
        whiteSpace: string;
        color: Color | string;
    }
    class Html extends Element implements HtmlInit {
        private htmlDrawing;
        private bindedOnImageLoad;
        private _fontSize;
        private _fontFamily;
        private _fontWeight;
        private _color;
        private _textAlign;
        private _interLine;
        private _wordWrap;
        private _whiteSpace;
        constructor(init?: Partial<HtmlInit>);
        getElements(tagName: any): any[];
        searchElements(tagName: any, element: any, res: any): void;
        getParentElement(tagName: any, element: any): any;
        html: string;
        text: string;
        private getTextContent(el);
        textAlign: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: any;
        interLine: number;
        wordWrap: string;
        whiteSpace: string;
        protected getColor(): Color;
        color: Color | string;
        protected onSubtreeModified(event: any): void;
        protected onKeyPress(event: any): void;
        protected onImageLoad(event: any): void;
        protected onClick(event: any): void;
        protected onVisible(): void;
        protected onStyleChange(): void;
        protected renderDrawing(): any;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        static style: object;
    }
}
declare namespace Ui {
    interface TextInit extends HtmlInit {
        textTransform: string;
    }
    class Text extends Html implements TextInit {
        constructor(init?: Partial<TextInit>);
        textTransform: string;
    }
}
declare namespace Ui {
    interface ShadowInit extends CanvasElementInit {
        color: Color | string;
        inner: boolean;
        shadowWidth: number;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
    }
    class Shadow extends CanvasElement implements ShadowInit {
        private _radiusTopLeft;
        private _radiusTopRight;
        private _radiusBottomLeft;
        private _radiusBottomRight;
        private _shadowWidth;
        private _inner;
        private _color;
        constructor(init?: Partial<ShadowInit>);
        color: Color | string;
        inner: boolean;
        shadowWidth: number;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
        protected updateCanvas(ctx: any): void;
    }
}
declare namespace Ui {
    class Toaster extends Container {
        static current: Toaster;
        private arrangeClock;
        constructor();
        appendToast(toast: Toast): void;
        removeToast(toast: Toast): void;
        protected onArrangeTick(clock: any, progress: any, delta: any): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        static appendToast(toast: Toast): void;
        static removeToast(toast: Toast): void;
    }
    class Toast extends LBox {
        private _isClosed;
        private openClock;
        private toastContentBox;
        newToast: boolean;
        lastLayoutX: number;
        lastLayoutY: number;
        lastLayoutWidth: number;
        lastLayoutHeight: number;
        constructor();
        readonly isClosed: boolean;
        open(): void;
        close(): void;
        protected onOpenTick(clock: any, progress: any, delta: any): void;
        content: Element;
        protected arrangeCore(width: number, height: number): void;
        static send(content: Element | string): void;
    }
}
declare namespace Ui {
    interface ImageInit extends ElementInit {
        src: string;
    }
    class Image extends Element implements ImageInit {
        private _src;
        private loaddone;
        private _naturalWidth;
        private _naturalHeight;
        private imageDrawing;
        private setSrcLock;
        constructor(init?: Partial<ImageInit>);
        src: string;
        readonly naturalWidth: number;
        readonly naturalHeight: number;
        readonly isReady: boolean;
        private onImageError(event);
        private onImageLoad(event);
        private onAppReady();
        private onImageDelayReady();
        protected renderDrawing(): HTMLImageElement;
        protected measureCore(width: any, height: any): any;
        protected arrangeCore(width: number, height: number): void;
    }
}
declare namespace Ui {
    interface LoadingInit extends CanvasElement {
    }
    class Loading extends CanvasElement implements LoadingInit {
        private clock;
        private ease;
        constructor(init?: Partial<LoadingInit>);
        protected onVisible(): void;
        protected onHidden(): void;
        protected updateCanvas(ctx: any): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        static style: object;
    }
}
declare namespace Ui {
    interface EntryInit extends ElementInit {
        passwordMode: boolean;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        color: Color | string;
        value: string;
    }
    class Entry extends Element implements EntryInit {
        private _fontSize;
        private _fontFamily;
        private _fontWeight;
        private _color;
        private _value;
        private _passwordMode;
        constructor(init?: Partial<EntryInit>);
        passwordMode: boolean;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        private getColor();
        color: Color | string;
        value: string;
        private onPaste(event);
        private onAfterPaste();
        private onChange(event);
        private onKeyDown(event);
        private onKeyUp(event);
        renderDrawing(): HTMLInputElement;
        measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        arrangeCore(width: number, height: number): void;
        onDisable(): void;
        onEnable(): void;
        onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    class Fixed extends Container {
        constructor();
        setPosition(item: Element, x: number, y: number): void;
        setRelativePosition(item: Element, x: number, y: number, absolute?: boolean): void;
        append(child: Element, x: number, y: number): void;
        remove(child: Element): void;
        protected updateItemTransform(child: Element): void;
        protected measureCore(width: number, height: number): Size;
        protected arrangeCore(width: number, height: number): void;
        protected onChildInvalidateMeasure(child: Element, event: any): void;
        protected onChildInvalidateArrange(child: Element): void;
    }
}
declare namespace Ui {
    interface ToolBarInit extends ScrollingAreaInit {
    }
    class ToolBar extends ScrollingArea implements ToolBarInit {
        private scroll;
        private hbox;
        constructor(init?: Partial<ToolBarInit>);
        append(child: Element, resizable?: boolean): void;
        remove(child: Element): void;
        content: Element;
        protected onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    class TextBgGraphic extends CanvasElement {
        private textHasFocus;
        hasFocus: boolean;
        private readonly background;
        updateCanvas(ctx: any): void;
        onDisable(): void;
        onEnable(): void;
        onStyleChange(): void;
        static style: TextBgGraphicStyle;
    }
    interface TextBgGraphicStyle {
        radius: number;
        borderWidth: number;
        background: Color;
        focusBackground: Color;
    }
}
declare namespace Ui {
    interface TextFieldInit extends LBoxInit {
        textHolder: string;
        passwordMode: boolean;
        value: string;
    }
    class TextField extends LBox {
        private entry;
        private graphic;
        private textholder;
        constructor(init?: Partial<TextFieldInit>);
        textHolder: string;
        passwordMode: boolean;
        value: string;
        private onEntryFocus();
        private onEntryBlur();
        private onEntryChange(entry, value);
    }
}
declare namespace Ui {
    class CheckBoxGraphic extends CanvasElement {
        isDown: boolean;
        isChecked: boolean;
        color: Color;
        checkColor: Color;
        activeColor: Color;
        borderWidth: number;
        radius: number;
        constructor();
        getIsDown(): boolean;
        setIsDown(isDown: any): void;
        getIsChecked(): boolean;
        setIsChecked(isChecked: any): void;
        setRadius(radius: any): void;
        getColor(): Color;
        setColor(color: any): void;
        setBorderWidth(borderWidth: any): void;
        setCheckColor(color: any): void;
        getCheckColor(): Color;
        updateCanvas(ctx: any): void;
        measureCore(width: any, height: any): {
            width: number;
            height: number;
        };
        onDisable(): void;
        onEnable(): void;
    }
}
declare namespace Ui {
    interface CheckBoxInit extends PressableInit {
        value: boolean;
        text: string;
        content: Element;
    }
    class CheckBox extends Pressable implements CheckBoxInit {
        private graphic;
        private contentBox;
        private hbox;
        private _content;
        private _text;
        private _isToggled;
        constructor(init?: Partial<CheckBoxInit>);
        readonly isToggled: boolean;
        value: boolean;
        text: string;
        content: Element;
        toggle(): void;
        untoggle(): void;
        private onCheckPress();
        protected onToggle(): void;
        protected onUntoggle(): void;
        protected onCheckFocus(): void;
        protected onCheckBlur(): void;
        protected onCheckBoxDown(): void;
        protected onCheckBoxUp(): void;
        protected onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    interface FrameInit extends CanvasElementInit {
        frameWidth: number;
        fill: Color | LinearGradient | string;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
    }
    class Frame extends CanvasElement implements FrameInit {
        private _fill;
        private _radiusTopLeft;
        private _radiusTopRight;
        private _radiusBottomLeft;
        private _radiusBottomRight;
        private _frameWidth;
        constructor(init?: Partial<FrameInit>);
        frameWidth: number;
        fill: Color | LinearGradient | string;
        radius: number;
        radiusTopLeft: number;
        radiusTopRight: number;
        radiusBottomLeft: number;
        radiusBottomRight: number;
        updateCanvas(ctx: any): void;
    }
}
declare namespace Ui {
    class ScaleBox extends Container {
        private _fixedWidth;
        private _fixedHeight;
        setFixedSize(width: number, height: number): void;
        fixedWidth: number;
        fixedHeight: number;
        append(child: Element): void;
        remove(child: Element): void;
        setContent(content: Element): void;
        protected measureCore(width: number, height: number): {
            width: any;
            height: any;
        };
        protected arrangeCore(width: number, height: number): void;
    }
}
declare namespace Ui {
    class TextArea extends Element {
        private _fontSize;
        private _fontFamily;
        private _fontWeight;
        private _color;
        private _value;
        constructor();
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
        color: Color | string;
        private getColor();
        value: string;
        setOffset(offsetX: number, offsetY: number): void;
        readonly offsetX: number;
        readonly offsetY: number;
        protected onPaste(event: any): void;
        protected onAfterPaste(): void;
        protected onChange(event: any): void;
        protected onKeyDown(event: any): void;
        protected onKeyUp(event: any): void;
        protected renderDrawing(): HTMLTextAreaElement;
        protected measureCore(width: any, height: any): {
            width: any;
            height: number;
        };
        protected arrangeCore(width: any, height: any): void;
        protected onDisable(): void;
        protected onEnable(): void;
        protected onStyleChange(): void;
        static style: TextAreaStyle;
    }
    interface TextAreaStyle {
        color: Color;
        fontSize: number;
        fontFamily: string;
        fontWeight: string;
    }
}
declare namespace Ui {
    class TextAreaField extends LBox {
        textarea: TextArea;
        graphic: TextBgGraphic;
        textholder: Label;
        constructor();
        textHolder: string;
        value: string;
        protected onTextAreaFocus(): void;
        protected onTextAreaBlur(): void;
        protected onTextAreaChange(entry: any, value: any): void;
    }
}
declare namespace Ui {
    interface GridInit extends ContainerInit {
        cols: string;
        rows: string;
    }
    class Grid extends Container implements GridInit {
        private _cols;
        private _rows;
        constructor(init?: Partial<GridInit>);
        cols: string;
        rows: string;
        setContent(content: any): void;
        attach(child: Element, col: number, row: number, colSpan?: number, rowSpan?: number): void;
        detach(child: Element): void;
        private getColMin(colPos);
        private getRowMin(rowPos);
        protected measureCore(width: any, height: any): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: any, height: any): void;
        static getCol(child: any): any;
        static setCol(child: any, col: any): void;
        static getRow(child: any): any;
        static setRow(child: any, row: any): void;
        static getColSpan(child: any): any;
        static setColSpan(child: any, colSpan: any): void;
        static getRowSpan(child: any): any;
        static setRowSpan(child: any, rowSpan: any): void;
    }
}
declare namespace Ui {
    interface FlowInit extends ContainerInit {
        spacing: number;
        itemAlign: 'left' | 'right';
        uniform: boolean;
        content: Element[] | undefined;
    }
    class Flow extends Container implements FlowInit {
        private _uniform;
        private uniformWidth;
        private uniformHeight;
        private _itemAlign;
        private _spacing;
        constructor(init?: Partial<FlowInit>);
        content: Element[] | undefined;
        spacing: number;
        itemAlign: 'left' | 'right';
        uniform: boolean;
        append(child: Element): void;
        prepend(child: Element): void;
        insertAt(child: Element, position: number): void;
        moveAt(child: Element, position: number): void;
        remove(child: Element): void;
        private measureChildrenNonUniform(width, height);
        private measureChildrenUniform(width, height);
        protected measureCore(width: any, height: any): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: any, height: any): void;
    }
}
declare namespace Ui {
    interface ProgressBarInit extends ContainerInit {
        value: number;
    }
    class ProgressBar extends Container implements ProgressBarInit {
        private _value;
        private bar;
        private background;
        constructor(init?: Partial<ProgressBarInit>);
        value: number;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        protected onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    interface ComboInit extends ButtonInit {
        placeHolder: string;
        field: string;
        data: object[];
        position: number;
        current: object;
    }
    class Combo extends Button implements ComboInit {
        private _field;
        private _data;
        private _position;
        private _current;
        private _placeHolder;
        sep: undefined;
        arrowtop: Icon;
        arrowbottom: Icon;
        constructor(init?: Partial<ComboInit>);
        placeHolder: string;
        field: string;
        data: object[];
        position: number;
        current: object;
        readonly value: object;
        protected onItemPress(popup: any, item: any, position: any): void;
        protected onPress(): void;
        protected updateColors(): void;
        static style: object;
    }
    interface ComboPopupInit extends MenuPopupInit {
        field: string;
        data: object[];
        position: number;
    }
    class ComboPopup extends MenuPopup {
        private list;
        private _data;
        private _field;
        constructor(init?: Partial<ComboPopupInit>);
        field: string;
        data: object[];
        position: number;
        protected onItemPress(item: ComboItem): void;
    }
    class ComboItem extends Button {
        static style: object;
    }
}
declare namespace Ui {
    interface PanedInit extends ContainerInit {
        orientation: Orientation;
        pos: number;
        content1: Element;
        content2: Element;
    }
    class Paned extends Container implements PanedInit {
        private vertical;
        private cursor;
        private content1Box;
        private _content1;
        private minContent1Size;
        private content2Box;
        private _content2;
        private minContent2Size;
        private _pos;
        constructor(init?: Partial<PanedInit>);
        orientation: Orientation;
        pos: number;
        content1: Element;
        content2: Element;
        invert(): void;
        protected onCursorMove(): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: any;
        } | {
            width: any;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    class VPaned extends Paned {
        constructor();
    }
    class HPaned extends Paned {
        constructor();
    }
    class HPanedCursor extends LBox {
        constructor();
    }
    class VPanedCursor extends LBox {
        constructor();
    }
}
declare namespace Ui {
    interface SliderInit extends ContainerInit {
        value: number;
        orientation: Orientation;
    }
    class Slider extends Container implements SliderInit {
        protected _value: number;
        protected background: Rectangle;
        protected bar: Rectangle;
        protected button: Movable;
        protected buttonContent: Rectangle;
        protected _orientation: Orientation;
        protected updateLock: boolean;
        constructor(init?: Partial<SliderInit>);
        value: number;
        setValue(value: number, dontSignal?: boolean): void;
        orientation: Orientation;
        protected onButtonMove(button: any): void;
        protected updateValue(): void;
        protected getColor(): Color;
        protected getForeground(): Color;
        protected getBackground(): Color;
        protected getButtonColor(): Color;
        protected updateColors(): void;
        protected measureCore(width: any, height: any): Size;
        protected arrangeCore(width: any, height: any): void;
        protected onStyleChange(): void;
        protected onDisable(): void;
        protected onEnable(): void;
        static style: object;
    }
}
declare namespace Ui {
    type MediaState = 'initial' | 'playing' | 'paused' | 'buffering' | 'error';
    interface AudioInit extends ElementInit {
        src: string;
        oggSrc: string;
        mp3Src: string;
        aacSrc: string;
        volume: number;
        currentTime: number;
    }
    class Audio extends Element {
        private _src;
        protected audioDrawing: HTMLAudioElement;
        private canplaythrough;
        private _state;
        static htmlAudio: boolean;
        static supportOgg: boolean;
        static supportMp3: boolean;
        static supportWav: boolean;
        static supportAac: boolean;
        constructor(init?: Partial<AudioInit>);
        src: string;
        play(): void;
        pause(): void;
        stop(): void;
        volume: number;
        readonly duration: number;
        currentTime: number;
        readonly state: MediaState;
        readonly isReady: boolean;
        protected onReady(): void;
        protected onTimeUpdate(): void;
        protected onEnded(): void;
        protected onProgress(): void;
        readonly currentBufferSize: number;
        checkBuffering(): void;
        protected onError(): void;
        protected onWaiting(): void;
        protected onAudioUnload(): void;
        protected renderDrawing(): any;
        static initialize(): void;
    }
}
declare namespace Ui {
    interface LinkButtonInit extends ButtonInit {
        src: string;
        openWindow: boolean;
        target: string;
    }
    class LinkButton extends Button implements LinkButtonInit {
        src: string;
        openWindow: boolean;
        target: '_blank';
        constructor(init?: Partial<LinkButtonInit>);
        protected onLinkButtonPress(): void;
        static style: object;
    }
}
declare namespace Ui {
    type SFlowFloat = 'none' | 'left' | 'right';
    type SFlowFlush = 'flush' | 'flushleft' | 'flushright' | 'newline';
    type SFlowAlign = 'left' | 'right' | 'center' | 'stretch';
    interface SFlowInit extends ContainerInit {
        content: Element[] | undefined;
        spacing: number;
        itemAlign: SFlowAlign;
        uniform: boolean;
        uniformRatio: number;
        stretchMaxRatio: number;
    }
    class SFlow extends Container implements SFlowInit {
        private _uniform;
        private _uniformRatio;
        private _uniformWidth;
        private _uniformHeight;
        private _itemAlign;
        private _stretchMaxRatio;
        private _spacing;
        constructor(init?: Partial<SFlowInit>);
        content: Element[] | undefined;
        spacing: number;
        itemAlign: SFlowAlign;
        uniform: boolean;
        uniformRatio: number;
        stretchMaxRatio: number;
        append(child: Element, floatVal?: SFlowFloat, flushVal?: SFlowFlush): void;
        prepend(child: Element, floatVal?: SFlowFloat, flushVal?: SFlowFlush): void;
        insertAt(child: Element, position: number, floatVal?: SFlowFloat, flushVal?: SFlowFlush): void;
        moveAt(child: Element, position: number): void;
        remove(child: Element): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        static getFloat(child: Element): SFlowFloat;
        static setFloat(child: Element, floatVal: SFlowFloat): void;
        static getFlush(child: Element): SFlowFlush;
        static setFlush(child: Element, flushVal: SFlowFlush): void;
    }
}
declare namespace Ui {
    interface VideoInit extends ElementInit {
        oggSrc: string;
        mp4Src: string;
        webmSrc: string;
        src: string;
        poster: string;
        autoplay: boolean;
        volume: number;
        duration: number;
        currentTime: number;
    }
    class Video extends Element {
        oggSrc: string;
        mp4Src: string;
        webmSrc: string;
        private loaddone;
        private videoDrawing;
        canplaythrough: boolean;
        private _state;
        static htmlVideo: boolean;
        static flashVideo: boolean;
        static supportOgg: boolean;
        static supportMp4: boolean;
        static supportWebm: boolean;
        constructor(init?: Partial<VideoInit>);
        src: string;
        poster: string;
        autoplay: boolean;
        play(): void;
        pause(): void;
        stop(): void;
        volume: number;
        readonly duration: number;
        currentTime: number;
        readonly state: MediaState;
        readonly isReady: boolean;
        readonly naturalWidth: number;
        readonly naturalHeight: number;
        protected onReady(): void;
        protected onTimeUpdate(): void;
        protected onEnded(): void;
        protected onProgress(): void;
        readonly currentBufferSize: number;
        checkBuffering(): void;
        protected onError(): void;
        protected onWaiting(): void;
        protected onVideoUnload(): void;
        protected renderDrawing(): HTMLVideoElement;
        protected arrangeCore(width: number, height: number): void;
        static initialize(): void;
    }
}
declare namespace Ui {
    interface MonthCalendarInit extends VBoxInit {
        date: Date;
        selectedDate: Date;
        dayFilter: number[];
        dateFilter: string[];
    }
    class MonthCalendar extends VBox {
        private _selectedDate;
        private _date;
        private title;
        private leftarrow;
        private rightarrow;
        private grid;
        private _dayFilter;
        private _dateFilter;
        constructor(init?: Partial<MonthCalendarInit>);
        dayFilter: number[];
        dateFilter: string[];
        date: Date;
        selectedDate: Date;
        protected onLeftButtonPress(): void;
        protected onRightButtonPress(): void;
        protected onDaySelect(button: any): void;
        protected updateDate(): void;
        protected onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    class TextFieldButton extends Button {
        style: object;
    }
    interface TextButtonFieldInit extends FormInit {
        textHolder: string;
        widthText: number;
        buttonIcon: string;
        buttonText: string;
        value: string;
    }
    class TextButtonField extends Form {
        protected graphic: TextBgGraphic;
        protected entry: Entry;
        protected _textholder: Label;
        protected button: TextFieldButton;
        constructor(init?: Partial<TextButtonFieldInit>);
        textHolder: string;
        widthText: number;
        buttonIcon: string;
        buttonText: string;
        textValue: string;
        value: string;
        protected onButtonPress(): void;
        protected onEntryChange(entry: Entry, value: string): void;
        protected onFormSubmit(): void;
        protected onEntryFocus(): void;
        protected onEntryBlur(): void;
    }
}
declare namespace Ui {
    interface DatePickerInit extends TextButtonFieldInit {
        dayFilter: number[];
        dateFilter: string[];
        selectedDate: Date;
    }
    class DatePicker extends TextButtonField implements DatePickerInit {
        protected popup: Popup;
        protected calendar: MonthCalendar;
        protected _selectedDate: Date;
        protected lastValid: string;
        protected _isValid: boolean;
        protected _dayFilter: number[];
        protected _dateFilter: string[];
        constructor(init?: Partial<DatePickerInit>);
        dayFilter: number[];
        dateFilter: string[];
        readonly isValid: boolean;
        selectedDate: Date;
        protected onDatePickerButtonPress(): void;
        protected onDatePickerChange(): void;
        protected onDaySelect(monthcalendar: any, date: any): void;
    }
}
declare namespace Ui {
    interface DownloadButtonInit extends LinkButtonInit {
    }
    class DownloadButton extends LinkButton {
        constructor(init?: Partial<DownloadButtonInit>);
        protected onLinkPress(): void;
        style: object;
    }
}
declare namespace Ui {
    interface SVGElementInit extends ElementInit {
    }
    class SVGElement extends Element implements SVGElementInit {
        renderSVG(svg: any): void;
        protected renderDrawing(): SVGSVGElement;
    }
}
declare namespace Ui {
    interface IFrameInit extends ElementInit {
        src: string;
    }
    class IFrame extends Element {
        protected iframeDrawing: HTMLIFrameElement;
        protected _isReady: boolean;
        constructor(init?: Partial<IFrameInit>);
        src: string;
        readonly isReady: boolean;
        protected onIFrameLoad(): void;
        protected renderDrawing(): any;
        protected arrangeCore(width: number, height: number): void;
    }
}
declare namespace Ui {
    interface ContentEditableInit extends HtmlInit {
    }
    class ContentEditable extends Html {
        anchorNode: Node;
        anchorOffset: number;
        constructor(init?: Partial<ContentEditableInit>);
        protected onKeyUp(event: any): void;
        protected testAnchorChange(): void;
        protected onContentSubtreeModified(event: any): void;
    }
}
declare namespace Ui {
    class ScrollLoader extends Core.Object {
        constructor();
        getMin(): number;
        getMax(): number;
        getElementAt(position: number): any;
    }
    interface VBoxScrollableInit extends ContainerInit {
        loader: ScrollLoader;
        maxScale: number;
        content: Element;
        scrollHorizontal: boolean;
        scrollVertical: boolean;
        scrollbarVertical: Element;
        scrollbarHorizontal: Element;
    }
    class VBoxScrollable extends Container implements VBoxScrollableInit {
        contentBox: VBoxScrollableContent;
        _scrollHorizontal: boolean;
        _scrollVertical: boolean;
        scrollbarHorizontalNeeded: boolean;
        scrollbarVerticalNeeded: boolean;
        scrollbarVerticalHeight: number;
        scrollbarHorizontalWidth: number;
        _scrollbarVertical: Movable;
        _scrollbarHorizontal: Movable;
        showShadows: boolean;
        lock: boolean;
        isOver: boolean;
        showClock: Anim.Clock;
        offsetX: number;
        offsetY: number;
        viewWidth: number;
        viewHeight: number;
        contentWidth: number;
        contentHeight: number;
        overWatcher: PointerWatcher;
        scrollLock: boolean;
        relativeOffsetX: number;
        relativeOffsetY: number;
        constructor(init?: Partial<VBoxScrollable>);
        reload(): void;
        getActiveItems(): Element[];
        loader: ScrollLoader;
        maxScale: number;
        content: Element;
        scrollHorizontal: boolean;
        scrollVertical: boolean;
        scrollbarVertical: Movable;
        scrollbarHorizontal: Movable;
        setOffset(offsetX?: number, offsetY?: number, absolute?: boolean): boolean;
        getOffsetX(): number;
        getRelativeOffsetX(): number;
        getOffsetY(): number;
        getRelativeOffsetY(): number;
        onWheel(event: any): void;
        autoShowScrollbars(): void;
        autoHideScrollbars(): void;
        onShowBarsTick(clock: Anim.Clock, progress: number, delta: number): void;
        onScroll(): void;
        updateOffset(): void;
        onScrollbarHorizontalMove(movable: Movable): void;
        onScrollbarVerticalMove(movable: Movable): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    class VBoxScrollableContent extends Transformable {
        contentWidth: number;
        contentHeight: number;
        estimatedHeight: number;
        estimatedHeightNeeded: boolean;
        loader: ScrollLoader;
        activeItems: Element[];
        activeItemsPos: number;
        activeItemsY: number;
        activeItemsHeight: number;
        reloadNeeded: boolean;
        constructor();
        setLoader(loader: any): void;
        getActiveItems(): Element[];
        getOffsetX(): number;
        getOffsetY(): number;
        setOffset(x: any, y: any): void;
        getContentWidth(): number;
        getContentHeight(): number;
        getEstimatedContentHeight(): number;
        getMinY(): number;
        getMaxY(): number;
        loadItems(): void;
        updateItems(): void;
        reload(): void;
        onLoaderChange(): void;
        measureCore(width: any, height: any): {
            width: any;
            height: number;
        };
        arrangeCore(width: any, height: any): void;
        onContentTransform(testOnly: any): void;
        protected onChildInvalidateMeasure(child: Element, event: any): void;
    }
    interface VBoxScrollingAreaInit extends VBoxScrollableInit {
    }
    class VBoxScrollingArea extends VBoxScrollable implements VBoxScrollingAreaInit {
        horizontalScrollbar: Scrollbar;
        verticalScrollbar: Scrollbar;
        constructor(init?: Partial<VBoxScrollingAreaInit>);
        protected onStyleChange(): void;
        static style: object;
    }
}
declare namespace Ui {
    interface HeaderDef {
        width: number;
        type: string;
        title: string;
        key: string;
        colWidth?: number;
        ui?: typeof ListViewCell;
    }
    interface ListViewHeaderInit extends PressableInit {
        title: string;
    }
    class ListViewHeader extends Pressable {
        protected _title: string;
        protected uiTitle: Label;
        protected background: Rectangle;
        constructor(init?: Partial<ListViewHeaderInit>);
        title: string;
        protected getColor(): Color;
        protected getColorDown(): Color;
        protected onListViewHeaderDown(): void;
        protected onListViewHeaderUp(): void;
        protected onStyleChange(): void;
        static style: object;
    }
    class ListViewHeadersBar extends Container {
        private headers;
        sortColKey: string;
        sortInvert: boolean;
        sortArrow: Icon;
        cols: ListViewColBar[];
        rowsHeight: number;
        headersHeight: number;
        constructor(config: any);
        getSortColKey(): string;
        getSortInvert(): boolean;
        sortBy(key: string, invert: boolean): void;
        protected onHeaderPress(header: any): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    class ListViewRow extends Selectionable {
        headers: HeaderDef[];
        data: object;
        cells: ListViewCell[];
        background: Rectangle;
        selectionActions: SelectionActions;
        constructor(init: {
            headers: HeaderDef[];
            data: object;
            selectionActions?: SelectionActions;
        });
        getData(): object;
        getSelectionActions(): SelectionActions;
        setSelectionActions(value: SelectionActions): void;
        protected onPress(): void;
        protected onSelect(): void;
        protected onUnselect(): void;
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
        protected onStyleChange(): void;
        static style: object;
    }
    class ListViewRowOdd extends ListViewRow {
        static style: object;
    }
    class ListViewRowEven extends ListViewRow {
        static style: object;
    }
    class ListViewScrollLoader extends ScrollLoader {
        listView: ListView;
        data: object[];
        constructor(listView: ListView, data: object[]);
        signalChange(): void;
        getMin(): number;
        getMax(): number;
        getElementAt(position: any): ListViewRow;
    }
    class ListView extends VBox {
        data: object[];
        headers: HeaderDef[];
        headersBar: ListViewHeadersBar;
        firstRow: undefined;
        firstCol: undefined;
        cols: undefined;
        rowsHeight: number;
        headersHeight: number;
        headersVisible: boolean;
        sortColKey: string;
        sortInvert: boolean;
        sortArrow: undefined;
        dataLoader: ListViewScrollLoader;
        scroll: VBoxScrollingArea;
        selectionActions: SelectionActions;
        scrolled: boolean;
        vbox: VBox;
        constructor(config: any);
        setScrolled(scrolled: any): void;
        showHeaders(): void;
        hideHeaders(): void;
        getSelectionActions(): SelectionActions;
        setSelectionActions(value: any): void;
        getElementAt(position: number): ListViewRow;
        appendData(data: any): void;
        updateData(data: any): void;
        removeData(data: any): void;
        removeDataAt(position: any): void;
        clearData(): void;
        getData(): object[];
        setData(data: any): void;
        sortData(): void;
        sortBy(key: any, invert: any): void;
        findDataRow(data: any): number;
        onHeaderPress(header: any, key: any): void;
        onSelectionEdit(selection: any): void;
        protected onChildInvalidateArrange(child: Element): void;
    }
    class ListViewCell extends LBox {
        value: any;
        ui: Element;
        key: string;
        constructor();
        getKey(): string;
        setKey(key: any): void;
        getValue(): any;
        setValue(value: any): void;
        protected generateUi(): Element;
        protected onValueChange(value: any): void;
        protected onStyleChange(): void;
        static style: object;
    }
    class ListViewCellString extends ListViewCell {
        ui: Label;
        constructor();
        protected generateUi(): Element;
        protected onValueChange(value: any): void;
    }
    class ListViewColBar extends Container {
        headerHeight: number;
        header: ListViewHeader;
        grip: Movable;
        separator: Rectangle;
        constructor(header: ListViewHeader);
        setHeader(header: any): void;
        setHeaderHeight(height: any): void;
        protected onMove(): void;
        protected onUp(): void;
        protected measureCore(width: any, height: any): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: any, height: any): void;
        protected onDisable(): void;
        protected onEnable(): void;
    }
}
declare namespace Ui {
    class Uploadable extends Pressable {
        protected _content: Element;
        protected input: UploadableFileWrapper;
        constructor(config: any);
        setDirectoryMode(active: any): void;
        protected onFile(fileWrapper: any, file: any): void;
        protected onPress(): void;
        content: Element;
    }
    class UploadableFileWrapper extends Element {
        formDrawing: HTMLFormElement;
        inputDrawing: HTMLInputElement;
        iframeDrawing: HTMLIFrameElement;
        directoryMode: false;
        constructor();
        select(): void;
        setDirectoryMode(active: any): void;
        protected createInput(): void;
        protected onChange(event: any): void;
        protected onLoad(): void;
        protected onUnload(): void;
        protected arrangeCore(w: number, h: number): void;
    }
    class UploadableWrapper extends Element {
        formDrawing: HTMLFormElement;
        inputDrawing: HTMLInputElement;
        directoryMode: boolean;
        constructor();
        setDirectoryMode(active: any): void;
        protected createInput(): HTMLFormElement;
        onChange(event: any): void;
        protected renderDrawing(): void;
        protected arrangeCore(width: number, height: number): void;
    }
}
declare namespace Ui {
    interface UploadButtonInit extends ButtonInit {
    }
    class UploadButton extends Button implements UploadButtonInit {
        input: UploadableFileWrapper;
        constructor(init?: Partial<UploadButtonInit>);
        directoryMode: boolean;
        protected onUploadButtonPress(): void;
        protected onFile(fileWrapper: UploadableFileWrapper, file: File): void;
    }
}
declare namespace Ui {
    class Transition extends Core.Object {
        constructor();
        run(current: Element, next: Element, progress: number): void;
        protected static transitions: object;
        static register(transitionName: string, classType: any): void;
        static parse(transition: any): any;
        static create(transition: Transition | string): Transition;
    }
}
declare namespace Ui {
    class Fade extends Transition {
        run(current: Element, next: Element, progress: number): void;
    }
}
declare namespace Ui {
    type SlideDirection = 'top' | 'bottom' | 'left' | 'right';
    interface SlideInit {
        direction: SlideDirection;
    }
    class Slide extends Transition implements SlideInit {
        protected _direction: SlideDirection;
        constructor(init?: Partial<SlideInit>);
        direction: SlideDirection;
        run(current: Element, next: Element, progress: number): void;
    }
}
declare namespace Ui {
    interface FlipInit {
        orientation: 'horizontal' | 'vertical';
    }
    class Flip extends Transition implements FlipInit {
        orientation: 'horizontal' | 'vertical';
        constructor(init?: Partial<FlipInit>);
        run(current: Element, next: Element, progress: number): void;
    }
}
declare namespace Ui {
    interface TransitionBoxInit extends LBoxInit {
        duration: number;
        ease: Anim.EasingFunction | string;
        transition: Transition | string;
        position: number;
        current: Element;
    }
    class TransitionBox extends LBox {
        protected _transition: Transition;
        protected _duration: number;
        protected _ease: Anim.EasingFunction;
        protected _position: number;
        protected transitionClock: Anim.Clock;
        protected _current: Element;
        protected next: Element;
        protected replaceMode: boolean;
        protected progress: number;
        children: TransitionBoxContent[];
        constructor(init?: Partial<TransitionBoxInit>);
        position: number;
        duration: number;
        ease: Anim.EasingFunction | string;
        transition: Transition | string;
        current: Element;
        setCurrentAt(position: number): void;
        replaceContent(content: any): void;
        protected onTransitionBoxLoad(): void;
        protected onTransitionBoxUnload(): void;
        protected onTransitionTick(clock: any, progress: any): void;
        protected onTransitionComplete(clock: any): void;
        protected arrangeCore(width: number, height: number): void;
        append(child: Element): void;
        prepend(child: Element): void;
        remove(child: any): void;
        getChildPosition(child: any): number;
    }
    class TransitionBoxContent extends LBox {
    }
}
declare namespace Ui {
    type FoldDirection = 'top' | 'bottom' | 'left' | 'right';
    type FoldMode = 'extend' | 'slide';
    interface FoldInit extends ContainerInit {
        isFolded: boolean;
        over: boolean;
        mode: FoldMode;
        header: Element;
        content: Element;
        background: Element;
        position: FoldDirection;
        animDuration: number;
    }
    class Fold extends Container {
        private headerBox;
        private _header;
        private contentBox;
        private _content;
        private _background;
        private _offset;
        private _position;
        private _isFolded;
        private _over;
        private _mode;
        private clock;
        private contentSize;
        private _animDuration;
        constructor(init?: Partial<FoldInit>);
        isFolded: boolean;
        fold(): void;
        unfold(): void;
        over: boolean;
        mode: FoldMode;
        header: Element;
        content: Element;
        background: Element;
        position: FoldDirection;
        invert(): void;
        animDuration: number;
        protected offset: number;
        protected startAnimation(): void;
        protected stopAnimation(): void;
        protected onClockTick(clock: any, progress: any): void;
        protected measureCore(width: any, height: any): Size;
        protected arrangeCore(width: any, height: any): void;
    }
}
declare namespace Ui {
    interface SwitchInit extends ContainerInit {
        value: boolean;
        ease: Anim.EasingFunction;
    }
    class Switch extends Container {
        private _value;
        private pos;
        private background;
        private button;
        private bar;
        private buttonContent;
        private alignClock;
        private speed;
        private animNext;
        private animStart;
        ease: Anim.EasingFunction;
        constructor(init?: Partial<SwitchInit>);
        value: boolean;
        private onButtonMove(button);
        private updatePos();
        private getColor();
        private getForeground();
        private getBackground();
        private getButtonColor();
        private updateColors();
        private onDown(movable);
        private onUp(movable, speedX, speedY, deltaX, deltaY, cumulMove, abort);
        private startAnimation(speed);
        private stopAnimation();
        private onAlignTick(clock, progress, delta);
        protected measureCore(width: number, height: number): Size;
        protected arrangeCore(width: number, height: number): void;
        protected onStyleChange(): void;
        protected onDisable(): void;
        protected onEnable(): void;
        static style: object;
    }
}
declare namespace Ui {
    type AccordeonOrientation = 'horizontal' | 'vertical';
    interface AccordeonableInit extends ContainerInit {
    }
    class Accordeonable extends Container {
        private current;
        private _currentPage;
        private clock;
        private headersSize;
        private contentSize;
        private _orientation;
        constructor(init?: Partial<AccordeonableInit>);
        orientation: AccordeonOrientation;
        readonly pages: AccordeonPage[];
        currentPage: AccordeonPage;
        currentPosition: number;
        appendPage(page: AccordeonPage): void;
        removePage(page: AccordeonPage): void;
        private onClockTick(clock, progress);
        private onPageSelect(page);
        private onPageClose(page);
        private measureHorizontal(width, height);
        private measureVertical(width, height);
        protected measureCore(width: number, height: number): {
            width: number;
            height: number;
        };
        protected arrangeCore(width: number, height: number): void;
    }
    class AccordeonPage extends Container {
        headerBox: Pressable;
        header: Element;
        content: Element;
        offset: number;
        orientation: 'horizontal';
        isSelected: boolean;
        constructor(init?: any);
        close(): void;
        select(): void;
        getIsSelected(): boolean;
        getHeader(): Element;
        setHeader(header: any): void;
        getContent(): Element;
        setContent(content: any): void;
        getOrientation(): "horizontal";
        setOrientation(orientation: any): void;
        unselect(): void;
        showContent(): void;
        hideContent(): void;
        getOffset(): number;
        setOffset(offset: any): void;
        private onHeaderPress();
        protected measureCore(width: number, height: number): Size;
        protected arrangeCore(width: number, height: number): void;
    }
}
declare namespace Ui {
    class Accordeon extends Accordeonable {
    }
}
declare namespace Ui {
    type DropAtEffectFunc = (data: any, position: number) => DropEffect[];
    interface DropAtBoxInit extends DropBoxInit {
    }
    class DropAtBox extends LBox {
        watchers: DragWatcher[];
        allowedTypes: {
            type: string | Function;
            effect: DropEffect[] | DropAtEffectFunc;
        }[];
        private container;
        private fixed;
        private markerOrientation;
        constructor(init?: Partial<DropAtBoxInit>);
        addType(type: string | Function, effects: string | string[] | DropEffect[] | DropAtEffectFunc): void;
        setContainer(container: any): void;
        getContainer(): Container;
        setMarkerOrientation(orientation: any): void;
        setMarkerPos(marker: Element, pos: number): void;
        findPosition(point: Point): number;
        findPositionHorizontal(point: Point): number;
        findPositionVertical(point: Point): number;
        insertAt(element: Element, pos: number): void;
        moveAt(element: Element, pos: number): void;
        readonly logicalChildren: Element[];
        content: Element;
        clear(): void;
        append(item: Element): void;
        remove(item: Element): void;
        protected onStyleChange(): void;
        protected getAllowedTypesEffect(dataTransfer: DragDataTransfer): DropEffect[];
        protected onDragEffect(dataTransfer: DragDataTransfer): string | DropEffect[];
        protected onDragOver(event: DragEvent): void;
        protected onDragEffectFunction(dataTransfer: DragDataTransfer, func: DropAtEffectFunc): DropEffect[];
        protected onWatcherEnter(watcher: DragWatcher): void;
        protected onWatcherMove(watcher: DragWatcher): void;
        protected onWatcherLeave(watcher: any): void;
        protected onWatcherDrop(watcher: DragWatcher, effect: any, x: number, y: number): void;
        protected onDragEnter(dataTransfer: DragDataTransfer): void;
        protected onDragLeave(): void;
        protected onDrop(dataTransfer: DragDataTransfer, dropEffect: any, x: number, y: number): boolean;
        static style: object;
    }
    interface FlowDropBoxInit extends DropAtBoxInit {
        uniform: boolean;
        spacing: number;
    }
    class FlowDropBox extends DropAtBox {
        private _flow;
        constructor(init?: Partial<FlowDropBoxInit>);
        uniform: boolean;
        spacing: number;
    }
    interface SFlowDropBoxInit extends DropAtBoxInit {
        stretchMaxRatio: number;
        uniform: boolean;
        uniformRatio: number;
        itemAlign: SFlowAlign;
        spacing: number;
    }
    class SFlowDropBox extends DropAtBox {
        private _sflow;
        constructor(init?: Partial<SFlowDropBoxInit>);
        stretchMaxRatio: number;
        uniform: boolean;
        uniformRatio: number;
        itemAlign: SFlowAlign;
        spacing: number;
    }
    interface VDropBoxInit extends DropAtBoxInit {
    }
    class VDropBox extends DropAtBox {
        private _vbox;
        constructor(init?: Partial<VDropBoxInit>);
        uniform: boolean;
        spacing: number;
    }
    interface HDropBoxInit extends DropAtBoxInit {
    }
    class HDropBox extends DropAtBox {
        private _hbox;
        constructor(init?: Partial<HDropBoxInit>);
        uniform: boolean;
        spacing: number;
    }
}