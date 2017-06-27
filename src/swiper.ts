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

    private $container: HTMLElement;
    private debug: boolean;
    private data: Page[];
    private axis: Axis;
    private isLoop: boolean;    
    private initIndex: number;
    private frr: number;
    private keepDefaultClasses: string[];
    private sideLength: number;    
    private transition: Transition;
    private _listeners: Listeners;

    // runtime member
    private $swiper: HTMLElement;
    private $pages: $Page[];
    private startTime: number;
    private endTime: number;
    private sliding: boolean;
    private moving: boolean;
    private start: Point;
    private end: Point;
    private offset: Vector;
    private pageChange: boolean;
    private moveDirection: Direction;    
    private lastDirection: Direction;
    private currentPage: $Page;
    private activePage: $Page;

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

        this.$container = options.container;
        this.debug = options.debug;
        this.data = options.data;
        this.axis = options.isVertical ? 'Y' : 'X';
        this.isLoop = options.isLoop;        
        this.initIndex = options.initIndex;
        this.frr = options.frr;
        this.keepDefaultClasses = options.keepDefaultClass;

        this.sideLength = this.axis === 'X' ? this.$container.clientWidth : this.$container.clientHeight;
        this.transition = options.transition;
        this._listeners = {};

        for (let eventName of Swiper.Events) {
            let capitalized = eventName.replace(/^\w{1}/, m => m.toUpperCase());
            let fn = options[`on${ capitalized }`];
            typeof fn === 'function' && this.on(eventName, fn);
        }

        this.sliding = false;
        this.moving = false;
        this.pageChange = false;

        this.start = {X: 0, Y: 0};
        this.end = {X: 0, Y: 0};
        this.offset = {X: 0, Y:0};

        this.log = this.debug ? console.log.bind(window.console) : EMPTY_FUNCTION;
        this.bindEvents();
        this.initRender();
    }

    private bindEvents() {
        this.$container.addEventListener(Swiper.Device.startEvent, this);
		this.$container.addEventListener(Swiper.Device.moveEvent, this);
		window.addEventListener(Swiper.Device.endEvent, this);
        window.addEventListener(Swiper.Device.resizeEvent, this, false);
    }

    private unbindEvents() {
        this.$container.removeEventListener(Swiper.Device.startEvent, this);
		this.$container.removeEventListener(Swiper.Device.moveEvent, this);
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
                this.keepDefaultHandler(event);
                this.startHandler(event);
                break;
            case Swiper.Device.moveEvent:
                this.keepDefaultHandler(event);
                this.moveHandler(event);
                break;
            case Swiper.Device.endEvent:
            case Swiper.Device.cancelEvent:
                // mouseout, touchcancel event, trigger endEvent
                this.endHandler(event);
                break;
            case Swiper.Device.resizeEvent:
                this.resizeHandler(event);
                break;
            default:
                break;
        } 
    }

    private keepDefaultHandler(event: any) {
        if (event.target && /^(input|textarea|a|select)$/i.test(event.target.tagName)) {
            return;
        }
        
        let keepDefaultClasses = this.keepDefaultClasses;
        for (let keepDefaultClass of keepDefaultClasses){
            if (event.target.classList.contains(keepDefaultClass)) {
                return;
            }
        }
        
        event.preventDefault();
    }

    private startHandler(event: any) {
        if (this.sliding) {
    		return;
    	}

        this.moving = true;

        this.log('start');        
    
        this.startTime = new Date().getTime();

        this.start.X = Swiper.Device.hasTouch ? event.targetTouches[0].pageX : event.pageX;
        this.start.Y = Swiper.Device.hasTouch ? event.targetTouches[0].pageY : event.pageY;

        // 设置翻页动画
        this.transition = {...this.transition, ...this.currentPage.transition};

        this.fire('swipeBeforeStart');
    }

    private moveHandler(event: any) {
        if (this.sliding || !this.moving) {
    		return;
    	}

        this.log('moving');

        this.end.X = Swiper.Device.hasTouch ? event.targetTouches[0].pageX : event.pageX;
        this.end.Y = Swiper.Device.hasTouch ? event.targetTouches[0].pageY : event.pageY;

        this.offset = {
            X: this.end.X - this.start.X,
            Y: this.end.Y - this.start.Y
        };

        // 尝于 FRR 的丝哝应
        if (Math.abs(this.offset[this.axis]) < this.frr) {
            return;
        }

        if (this.offset[this.axis] < 0) {
            this.moveDirection = Direction.Forward;
            this.activePage = this.currentPage.next;
        }
        else if (this.offset[this.axis] > 0) {
            this.moveDirection = Direction.Backward;
            this.activePage = this.currentPage.prev;
        }
        else {
            this.moveDirection = Direction.Nonward;
            this.activePage = <$Page>document.createElement('div');
        }

        // 有页面坘动
        if (this.lastDirection === undefined || this.moveDirection * this.lastDirection < 0) {
            this.fire('swipeStart');
        }

        this.lastDirection = this.moveDirection;

        // 消除 FRR 的影哝
        this.offset[this.axis] = this.offset[this.axis] - this.moveDirection * this.frr;

        // 如果兝许滑动并且 activePage 丝为空
        if (this.transition.duration !== 0
        && this.activePage !== <$Page>document.createElement('div')
        && (this.transition.direction === undefined || this.transition.direction === this.moveDirection)) {
            this.pageChange = true;

            const GAP = {
                Forward: 20,
                Backward: this.sideLength - 20
            };

            let directionKey = Direction[this.moveDirection];

            if (this.moveDirection * this.end[this.axis] > this.moveDirection * GAP[directionKey]) {
                let logStr = this.moveDirection === Direction.Forward ? '<--- near edge' : 'near edge --->';
                this.log(logStr);
                this.endHandler();
                
            }

            this.render();
        }
    }

    private endHandler(event?: any) {
        if (this.sliding || !this.moving) {
    		return;
    	}
        
        this.moving = false;
        this.log('end');

        // 如果禝止滑动
        if ((this.transition.direction && this.transition.direction !== this.moveDirection)
        || this.transition.direction === Direction.Nonward) {
            return;
        }

        this.endTime = new Date().getTime();     
        
        let moveTime: number = this.endTime - this.startTime;
        let threshold: number = moveTime > 300 ? this.sideLength / 3 : 14;

        let sideOffset: number  = this.offset[this.axis];
        let absOffset: number  = Math.abs(this.offset[this.axis]);
        let absReverseOffset: number  = Math.abs(this.offset[OPPSITE[this.axis]]);
        let isSwipeOnTheDir: boolean = absReverseOffset < absOffset; // 是坦在沿着axis滑动
        
        if (absOffset >= threshold && isSwipeOnTheDir) {
            this.pageChange = true;
            this._swipeTo();
        }
        else {
            this.moveDirection = -1 * this.moveDirection;
            this.pageChange = false;
            this._swipeTo();
            this.fire('swipeRestore');
        }
    }

    private resizeHandler(event: any) {
        
    }

    private _swipeTo() {
        if (this.sliding) {
            return;
        }

        // 如果 activePage 为空
        if (this.activePage === <$Page>document.createElement('div')) {
            return;
        }

        this.sliding = true;

        let requestAnimationFrame: Function = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame;

        let startTick: number = null;
        let startOffset = this.offset[this.axis];
        let velocity = this.sideLength / this.transition.duration;

        const boundary = {
            Forward: {
                unSwipe: 0,
                swipe: -this.sideLength
            },
            Backward: {
                unSwipe: 0,
                swipe: this.sideLength
            },
            Nonward: 0
        };

        let type = this.pageChange ? 'swipe' : 'unSwipe';
        let b = boundary[Direction[this.moveDirection]][type] || 0;

        function step(timestamp) {
            if (startTick === null) {
                startTick = timestamp;
            }

            this.offset[this.axis] = startOffset + (timestamp - startTick) * this.moveDirection * velocity;
            if (this.moveDirection * this.offset[this.axis] < this.moveDirection * b) {
                this.log(`${ type } rendering...`)
                this.render();
                requestAnimationFrame(step.bind(this));
            }
            else {
                // the last frame
                this.offset[this.axis] = b;
                this.render();
            }
        }

        requestAnimationFrame(step.bind(this));
    }

    private initRender() {
        this.$swiper = document.createElement('div');
        this.$swiper.classList.add('lg-swiper');

        this.$pages = this.data.map((page, index) => {
            let $page: $Page = <$Page>document.createElement('div');
            $page.classList.add('lg-swiper-page');

            if(typeof page.content === 'string'){
                $page.innerHTML = page.content;
            }else{
                $page.appendChild(page.content);
            }

			$page.index = index;
            $page.transition = page.transition

			if (this.initIndex === index) {
				$page.classList.add('current');
				this.currentPage = $page;
            }

            this.$swiper.appendChild($page);

            return $page;
        });

        this.$pages.forEach(($page, index, $pages) => {
            let prevIndex = this.isLoop ? ($pages.length + index - 1) % $pages.length : (index - 1);
            let nextIndex = this.isLoop ? ($pages.length + index + 1) % $pages.length : (index + 1);

            $page.prev = this.$pages[prevIndex] || <$Page>document.createElement('div');
            $page.next = this.$pages[nextIndex] || <$Page>document.createElement('div');
        });
        
        this.$container.style.overflow = 'hidden';
		this.$container.appendChild(this.$swiper);
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
        let axis: Axis = this.axis;
        let sideOffset: number = this.offset[axis];
        let obsoleteActivePage: any = document.querySelector('.active');

        if (obsoleteActivePage) {
            obsoleteActivePage.classList.remove('active');
            obsoleteActivePage.style.cssText = '';                
        }
        
        this.currentPage.style.cssText = '';
        this.activePage.style.cssText = '';

        this.log('offset : ' + sideOffset);


        let renderInstance = Render.getRenderInstance(this.currentPage.transition.name);
        let transform = renderInstance.doRender(this);
        
        this.activePage.classList.add('active');
        
        this.$container.style.cssText = transform.container;
        this.$swiper.style.cssText = transform.swiper;
        this.currentPage.style.cssText = transform.currentPage;        
        this.activePage.style.cssText = transform.activePage;        

        // 回弹
        if (this.pageChange === false && sideOffset === 0) {
            this.$container.style.cssText = '';
            this.$swiper.style.cssText = '';
            this.currentPage.style.cssText = '';
            this.activePage.style.cssText = '';
            
            this.activePage.classList.remove('active')  
            this.activePage = <$Page>document.createElement('div');

            this.sliding = false;
            
            this.pageChange = false;
            this.lastDirection = undefined;      
        }

        // 正常翻页
        if (this.pageChange === true && sideOffset === this.moveDirection * this.sideLength) {
            this.$container.style.cssText = '';
            this.$swiper.style.cssText = '';
            this.currentPage.style.cssText = '';
            this.activePage.style.cssText = '';
            
            this.currentPage.classList.remove('current');            
            this.activePage.classList.remove('active')            

            this.activePage.classList.add('current');
            
            this.currentPage = this.activePage;
            this.activePage = <$Page>document.createElement('div');

            this.offset.X = 0;
            this.offset.Y = 0;

            this.sliding = false;

            this.pageChange = false;
            this.lastDirection = undefined;
        }
    }
}
