/**
 * @file swiper.ts swiper 主文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * @created: 2017.06.26
 * 
 */

import './swiper.css';

import { Device } from './device';

import Render from './render';
import Slide from './renders/slide';
import Rotate from './renders/rotate';
import Flip from './renders/flip';
import Card from './renders/card';
import Fade from './renders/fade';

Render.register('slide', Slide);
Render.register('rotate', Rotate);
Render.register('flip', Flip);
Render.register('card', Card);
Render.register('fade', Fade);

const EMPTY_FUNCTION: Function = () => {};
const EMPTY_PAGE: HTMLElement = document.createElement('div');
const OPPSITE:any = {
    X: 'Y',
    Y: 'X'
}

enum Direction {
    Forward = -1,
    Nonward = 0,
    Backward = 1
}

type Axis = 'X' | 'Y';
type SwiperEvent = 
    'initialize'
    | 'initialized'
    | 'renderComplete'
    | 'swipeBeforeStart'
    | 'swipeStart'
    | 'swipeChange'
    | 'swipeChanged'
    | 'swipeRestore'
    | 'swipeRestored'
    | 'destroy';

interface Point {
    X: number,
    Y: number
}

interface Vector {
    X: number,
    Y: number
}

interface Transition {
    name: string;
    duration: number;
    direction?: Direction;
}

interface Page {
    content: HTMLElement | string;
    transition?: Transition;
}

interface $Page extends HTMLDivElement {
    index: number;
    prev: $Page;
    next: $Page;
    transition: Transition;
}

interface Options {
    container?: HTMLElement;
    data?: Page[];
    debug?: boolean;
    isVertical?: boolean;
    isLoop?: boolean;    
    initIndex?: number;
    frr?: number;
    keepDefaultClass?: string[];
    transition?: Transition;
}

// type Listener = (...args: any[]) => void;

interface Listeners {
    [key: string]: Function[];
}

export class Swiper {
    static Events: string[] = [
        'initialize',
        'initialized',
        'renderComplete',
        'swipeBeforeStart',
        'swipeStart',
        'swipeChange',
        'swipeChanged',
        'swipeRestore',
        'swipeRestored',
        'destroy'
    ];

    static Device = new Device(window);

    static DefaultOptions: Options = {
        container: document.body,
        data: [],
        debug: false,
        isVertical: true,
        isLoop: false,
        initIndex: 0,
        frr: 10,
        keepDefaultClass: [],
        transition: {
            name: 'slide',
            duration: 800
        }
    }

    private _$container: HTMLElement;
    private _debug: boolean;
    private _data: Page[];
    private _axis: Axis;
    private _isLoop: boolean;    
    private _initIndex: number;
    private _frr: number;
    private _keepDefaultClasses: string[];
    private _sideLength: number;    
    private _transition: Transition;
    private _listeners: Listeners;

    // runtime member
    private _$swiper: HTMLElement;
    private _$pages: $Page[];
    private _startTime: number;
    private _endTime: number;
    private _sliding: boolean;
    private _moving: boolean;
    private _start: Point;
    private _end: Point;
    private _offset: Vector;
    private _pageChange: boolean;
    private _moveDirection: Direction;    
    private _lastDirection: Direction;
    private _currentPage: $Page;
    private _activePage: $Page;

    // auxiliary
    public log: Function;
    
    constructor(options: Options) {
        options = {
            ...Swiper.DefaultOptions,
            ...options
        };

        options.transition = {
            ...Swiper.DefaultOptions.transition,
            ...options.transition
        };

        this._$container = options.container;
        this._debug = options.debug;
        this._data = options.data;
        this._axis = options.isVertical ? 'Y' : 'X';
        this._isLoop = options.isLoop;        
        this._initIndex = options.initIndex;
        this._frr = options.frr;
        this._keepDefaultClasses = options.keepDefaultClass;

        this._sideLength = this._axis === 'X' ? this._$container.clientWidth : this._$container.clientHeight;
        this._transition = options.transition;
        this._listeners = {};

        for (let eventName of Swiper.Events) {
            let capitalized = eventName.replace(/^\w{1}/, m => m.toUpperCase());
            let fn = options[`on${ capitalized }`];
            typeof fn === 'function' && this.on(eventName, fn);
        }

        this._sliding = false;
        this._moving = false;
        this._pageChange = false;

        this._start = {X: 0, Y: 0};
        this._end = {X: 0, Y: 0};
        this._offset = {X: 0, Y:0};

        this.log = this._debug ? console.log.bind(window.console) : EMPTY_FUNCTION;
        this._bindEvents();
        this._initRender();
    }

    private _bindEvents() {
        this._$container.addEventListener(Swiper.Device.startEvent, this);
		this._$container.addEventListener(Swiper.Device.moveEvent, this);
		window.addEventListener(Swiper.Device.endEvent, this);
        window.addEventListener(Swiper.Device.resizeEvent, this, false);
    }

    private _unbindEvents() {
        this._$container.removeEventListener(Swiper.Device.startEvent, this);
		this._$container.removeEventListener(Swiper.Device.moveEvent, this);
		window.removeEventListener(Swiper.Device.endEvent, this);
        window.removeEventListener(Swiper.Device.resizeEvent, this, false);
    }

    handleEvent(event: any) {
        switch (event.type) {
            case 'mousedown':
                // block mouse buttons except left
                if (event.button !== 0) {
                    break;
                }
            case 'touchstart':
                this._keepDefaultHandler(event);
                this._startHandler(event);
                break;
            case Swiper.Device.moveEvent:
                this._keepDefaultHandler(event);
                this._moveHandler(event);
                break;
            case Swiper.Device.endEvent:
            case Swiper.Device.cancelEvent:
                // mouseout, touchcancel event, trigger endEvent
                this._endHandler(event);
                break;
            case Swiper.Device.resizeEvent:
                this._resizeHandler(event);
                break;
            default:
                break;
        } 
    }

    private _keepDefaultHandler(event: any) {
        if (event.target && /^(input|textarea|a|select)$/i.test(event.target.tagName)) {
            return;
        }
        
        let keepDefaultClasses = this._keepDefaultClasses;
        for (let keepDefaultClass of keepDefaultClasses){
            if (event.target.classList.contains(keepDefaultClass)) {
                return;
            }
        }
        
        event.preventDefault();
    }

    private _startHandler(event: any) {
        if (this._sliding) {
    		return;
    	}

        this._moving = true;

        this.log('start');        
    
        this._startTime = new Date().getTime();

        this._start.X = Swiper.Device.hasTouch ? event.targetTouches[0].pageX : event.pageX;
        this._start.Y = Swiper.Device.hasTouch ? event.targetTouches[0].pageY : event.pageY;

        // 设置翻页动画
        this._transition = {...this._transition, ...this._currentPage.transition};

        this.fire('swipeBeforeStart');
    }

    private _moveHandler(event: any) {
        if (this._sliding || !this._moving) {
    		return;
    	}

        this.log('moving');

        this._end.X = Swiper.Device.hasTouch ? event.targetTouches[0].pageX : event.pageX;
        this._end.Y = Swiper.Device.hasTouch ? event.targetTouches[0].pageY : event.pageY;

        this._offset = {
            X: this._end.X - this._start.X,
            Y: this._end.Y - this._start.Y
        };

        // 尝于 FRR 的丝哝应
        if (Math.abs(this._offset[this._axis]) < this._frr) {
            return;
        }

        if (this._offset[this._axis] < 0) {
            this._moveDirection = Direction.Forward;
            this._activePage = this._currentPage.next;
        }
        else if (this._offset[this._axis] > 0) {
            this._moveDirection = Direction.Backward;
            this._activePage = this._currentPage.prev;
        }
        else {
            this._moveDirection = Direction.Nonward;
            this._activePage = <$Page>document.createElement('div');
        }

        // 有页面坘动
        if (this._lastDirection === undefined || this._moveDirection * this._lastDirection < 0) {
            this.fire('swipeStart');
        }

        this._lastDirection = this._moveDirection;

        // 消除 FRR 的影哝
        this._offset[this._axis] = this._offset[this._axis] - this._moveDirection * this._frr;

        // 如果兝许滑动并且 activePage 丝为空
        if (this._transition.duration !== 0
        && this._activePage !== <$Page>document.createElement('div')
        && (this._transition.direction === undefined || this._transition.direction === this._moveDirection)) {
            this._pageChange = true;

            const GAP = {
                Forward: 20,
                Backward: this._sideLength - 20
            };

            let directionKey = Direction[this._moveDirection];

            if (this._moveDirection * this._end[this._axis] > this._moveDirection * GAP[directionKey]) {
                let logStr = this._moveDirection === Direction.Forward ? '<--- near edge' : 'near edge --->';
                this.log(logStr);
                this._endHandler();
                
            }

            this.render();
        }
    }

    private _endHandler(event?: any) {
        if (this._sliding || !this._moving) {
    		return;
    	}
        
        this._moving = false;
        this.log('end');

        // 如果禝止滑动
        if ((this._transition.direction && this._transition.direction !== this._moveDirection)
        || this._transition.direction === Direction.Nonward) {
            return;
        }

        this._endTime = new Date().getTime();     
        
        let moveTime: number = this._endTime - this._startTime;
        let threshold: number = moveTime > 300 ? this._sideLength / 3 : 14;

        let sideOffset: number  = this._offset[this._axis];
        let absOffset: number  = Math.abs(this._offset[this._axis]);
        let absReverseOffset: number  = Math.abs(this._offset[OPPSITE[this._axis]]);
        let isSwipeOnTheDir: boolean = absReverseOffset < absOffset; // 是坦在沿着axis滑动
        
        if (absOffset >= threshold && isSwipeOnTheDir) {
            this._pageChange = true;
            this._swipeTo();
        }
        else {
            this._moveDirection = -1 * this._moveDirection;
            this._pageChange = false;
            this._swipeTo();
            this.fire('swipeRestore');
        }
    }

    private _resizeHandler(event: any) {
        
    }

    private _swipeTo() {
        if (this._sliding) {
            return;
        }

        // 如果 activePage 为空
        if (this._activePage === <$Page>document.createElement('div')) {
            return;
        }

        this._sliding = true;

        let requestAnimationFrame: Function = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame;

        let startTick: number = null;
        let startOffset = this._offset[this._axis];
        let velocity = this._sideLength / this._transition.duration;

        const boundary = {
            Forward: {
                unSwipe: 0,
                swipe: -this._sideLength
            },
            Backward: {
                unSwipe: 0,
                swipe: this._sideLength
            },
            Nonward: 0
        };

        let type = this._pageChange ? 'swipe' : 'unSwipe';
        let b = boundary[Direction[this._moveDirection]][type] || 0;

        function step(timestamp) {
            if (startTick === null) {
                startTick = timestamp;
            }

            this._offset[this._axis] = startOffset + (timestamp - startTick) * this._moveDirection * velocity;
            if (this._moveDirection * this._offset[this._axis] < this._moveDirection * b) {
                this.log(`${ type } rendering...`)
                this.render();
                requestAnimationFrame(step.bind(this));
            }
            else {
                // the last frame
                this._offset[this._axis] = b;
                this.render();
            }
        }

        requestAnimationFrame(step.bind(this));
    }

    private _initRender() {
        this._$swiper = document.createElement('div');
        this._$swiper.classList.add('lg-swiper');

        this._$pages = this._data.map((page, index) => {
            let $page: $Page = <$Page>document.createElement('div');
            $page.classList.add('lg-swiper-page');

            if(typeof page.content === 'string'){
                $page.innerHTML = page.content;
            }else{
                $page.appendChild(page.content);
            }

			$page.index = index;
            $page.transition = page.transition

			if (this._initIndex === index) {
				$page.classList.add('current');
				this._currentPage = $page;
            }

            this._$swiper.appendChild($page);

            return $page;
        });

        this._$pages.forEach(($page, index, $pages) => {
            let prevIndex = this._isLoop ? ($pages.length + index - 1) % $pages.length : (index - 1);
            let nextIndex = this._isLoop ? ($pages.length + index + 1) % $pages.length : (index + 1);

            $page.prev = this._$pages[prevIndex] || <$Page>document.createElement('div');
            $page.next = this._$pages[nextIndex] || <$Page>document.createElement('div');
        });
        
        this._$container.style.overflow = 'hidden';
		this._$container.appendChild(this._$swiper);
    }

    public on(eventName: string, callback: Function): Swiper {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }
        
        this._listeners[eventName].push(callback);

        return this;
    }

    public off(eventName: string, callback: Function): Swiper {
        if (this._listeners[eventName]) {
            let index = this._listeners[eventName].indexOf(callback);
            if (index > -1) {
                this._listeners[eventName].splice(index, 1);
            }
        }

        return this; 
    }

    public fire(eventName: string) {
        if (this._listeners[eventName]) {
            let args = Array.prototype.slice.call(arguments, 1);

            for (let callback of this._listeners[eventName]) {
                callback.apply(this, args);
            }
        }

        return this;
    }

    public render() {
        let axis: Axis = this._axis;
        let sideOffset: number = this._offset[axis];
        let obsoleteActivePage: any = document.querySelector('.active');

        if (obsoleteActivePage) {
            obsoleteActivePage.classList.remove('active');
            obsoleteActivePage.style.cssText = '';                
        }
        
        this._currentPage.style.cssText = '';
        this._activePage.style.cssText = '';

        this.log('offset : ' + sideOffset);


        let renderInstance = Render.getRenderInstance(this._currentPage.transition.name);
        let transform = renderInstance.doRender(this);
        
        this._activePage.classList.add('active');
        
        this._$container.style.cssText = transform.container;
        this._$swiper.style.cssText = transform.swiper;
        this._currentPage.style.cssText = transform.currentPage;        
        this._activePage.style.cssText = transform.activePage;        

        // 回弹
        if (this._pageChange === false && sideOffset === 0) {
            this._$container.style.cssText = '';
            this._$swiper.style.cssText = '';
            this._currentPage.style.cssText = '';
            this._activePage.style.cssText = '';
            
            this._activePage.classList.remove('active')  
            this._activePage = <$Page>document.createElement('div');

            this._sliding = false;
            
            this._pageChange = false;
            this._lastDirection = undefined;      
        }

        // 正常翻页
        if (this._pageChange === true && sideOffset === this._moveDirection * this._sideLength) {
            this._$container.style.cssText = '';
            this._$swiper.style.cssText = '';
            this._currentPage.style.cssText = '';
            this._activePage.style.cssText = '';
            
            this._currentPage.classList.remove('current');            
            this._activePage.classList.remove('active')            

            this._activePage.classList.add('current');
            
            this._currentPage = this._activePage;
            this._activePage = <$Page>document.createElement('div');

            this._offset.X = 0;
            this._offset.Y = 0;

            this._sliding = false;

            this._pageChange = false;
            this._lastDirection = undefined;
        }
    }
}
