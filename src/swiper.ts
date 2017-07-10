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
import { DeviceEvent } from './device';

import Render from './render';
import Slide from './renders/slide';
import Rotate from './renders/rotate';
import Flip from './renders/flip';
import Card from './renders/card';
import Fade from './renders/fade';
import Dumi from './renders/dumi';

Render.register('slide', Slide);
Render.register('rotate', Rotate);
Render.register('flip', Flip);
Render.register('card', Card);
Render.register('fade', Fade);
Render.register('dumi', Dumi);

const EMPTY_FUNCTION: Function = () => {};
const EMPTY_PAGE: $Page = <$Page>document.createElement('div');
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
    keepDefaultClass?: string[];
    transition?: Transition;
}

// type Listener = (...args: any[]) => void;

interface Listeners {
    [key: string]: Function[];
}

export class Swiper {
    static Events: string[] = [
        'swipeBeforeStart',
        'swipeStart',
        'swipeChange',
        'swipeChanged',
        'swipeRestore',
        'swipeRestored',        
        'activePageChanged',
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

    private renderInstance: Render;
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
        this.keepDefaultClasses = options.keepDefaultClass;

        this.sideLength = this.axis === 'X' ? this.$container.clientWidth : this.$container.clientHeight;
        this.transition = options.transition;
        this._listeners = {};

        // runtime variable
        this.sliding = false;
        this.moving = false;
        this.pageChange = false;
        this.moveDirection = Direction.Nonward;
        this.lastDirection = Direction.Nonward;
        this.activePage = EMPTY_PAGE;

        this.start = {X: 0, Y: 0};
        this.end = {X: 0, Y: 0};
        this.offset = {X: 0, Y:0};

        this.log = this.debug ? console.log.bind(window.console) : EMPTY_FUNCTION;
        this.bindEvents();
        this.initRender();
    }

    private bindEvents() {
        this.$container.addEventListener(Swiper.Device.startEvent, this, <any>{passive: false});
		this.$container.addEventListener(Swiper.Device.moveEvent, this, <any>{passive: false});
		window.addEventListener(Swiper.Device.endEvent, this, <any>{passive: false});
        window.addEventListener(Swiper.Device.resizeEvent, this, false);
    }

    private unbindEvents() {
        this.$container.removeEventListener(Swiper.Device.startEvent, this, <any>{passive: false});
		this.$container.removeEventListener(Swiper.Device.moveEvent, this, <any>{passive: false});
		window.removeEventListener(Swiper.Device.endEvent, this, <any>{passive: false});
        window.removeEventListener(Swiper.Device.resizeEvent, this, false);
    }

    handleEvent(event: any) {
        let deviceEvent = Swiper.Device.getDeviceEvent(event);

        switch (deviceEvent.type) {
            case 'mousedown':
                // block mouse buttons except left
                if (deviceEvent.button !== 0) {
                    break;
                }
            case 'touchstart':
                this.keepDefaultHandler(deviceEvent);
                this.startHandler(deviceEvent.position);
                break;
            case Swiper.Device.moveEvent:
                this.keepDefaultHandler(deviceEvent);
                this.moveHandler(deviceEvent.position);
                break;
            case Swiper.Device.endEvent:
            case Swiper.Device.cancelEvent:
                // mouseout, touchcancel event, trigger endEvent
                this.endHandler();
                break;
            case Swiper.Device.resizeEvent:
                this.resizeHandler();
                break;
            default:
                break;
        } 
    }

    private keepDefaultHandler(event: DeviceEvent): void {
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

    private startHandler(startPosition: Point) {
        if (this.sliding) {
    		return;
        }

        this.log('start'); 

        this.moving = true;    
        this.startTime = new Date().getTime();
        this.start = startPosition;

        // 设置翻页动画
        this.transition = {...this.transition, ...this.currentPage.transition};
        this.renderInstance = Render.getRenderInstance(this.transition.name);

        this.fire('swipeBeforeStart');
    }

    private moveHandler(movingPosition: Point) {
        if (this.sliding || !this.moving) {
    		return;
    	}

        this.log('moving');

        this.end = movingPosition;

        this.offset = {
            X: this.end.X - this.start.X,
            Y: this.end.Y - this.start.Y
        };

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
            this.activePage = EMPTY_PAGE;
        }

        this.fire('swipeChange');

        // 第一次进入 moving 时触发 swipeStart 
        if (this.lastDirection === Direction.Nonward) {
            this.fire('swipeStart');
        }

        // moveDirection 反向，activePage 发生变化
        if (this.lastDirection === Direction.Nonward || this.moveDirection * this.lastDirection < 0) {
            this.fire('activePageChanged');
        }

        this.lastDirection = this.moveDirection;
        
        // 1. 如果页码到底了或者到顶了，
        // 2. 页面禁止滑动
        // 防止突然「先上后下」，直接将 this.offset 置为 0
        // 防止需要「等」 offset 归 0 后才能往上走
        if (this.activePage === EMPTY_PAGE
        || this.transition.direction === Direction.Nonward
        || (this.transition.direction && this.transition.direction !== this.moveDirection)) {
            this.offset[this.axis] = 0;
            this.start = this.end;
        }

        this.pageChange = (this.activePage !== EMPTY_PAGE);

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

        // activePage 为 EMPTY_PAGE 需要渲染，比如快速滑动最后一帧            
        // 翻页时长为 0 时不渲染，但是需要在上面判断是否在边界附近
        if (this.transition.duration !== 0) {
            this.render();                
        }
    }

    private endHandler() {
        if (this.sliding || !this.moving) {
    		return;
    	}
        
        this.moving = false;
        this.log('end');

        // 如果是首页或尾页，或者禁止滑动
        if (this.activePage === EMPTY_PAGE
        || this.transition.direction === Direction.Nonward
        || (this.transition.direction && this.transition.direction !== this.moveDirection)) {
            this.offset[this.axis] = 0;
        }

        this.endTime = new Date().getTime();     
        
        let moveTime: number = this.endTime - this.startTime;
        let threshold: number = moveTime > 300 ? this.sideLength / 3 : 14;

        let sideOffset: number  = this.offset[this.axis];
        let absOffset: number  = Math.abs(this.offset[this.axis]);
        let absReverseOffset: number  = Math.abs(this.offset[OPPSITE[this.axis]]);

        // 是在沿着 axis 滑动
        let isSwipeOnTheDir: boolean = absReverseOffset < absOffset; 
        
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

    private resizeHandler() {
        if (!this.sliding && !this.moving) {
            this.sideLength = this.axis === 'X' ? this.$container.clientWidth : this.$container.clientHeight;
        }
    }

    public swipeTo(toIndex: number, transition: Transition) {
        let currentIndex = this.currentPage.index;
        this.moveDirection = Direction.Nonward;
        this.pageChange = true;
        

        if (toIndex > currentIndex) {
            this.moveDirection = Direction.Forward;
        }
        else if (toIndex < currentIndex) {
            this.moveDirection = Direction.Backward;
        }

        this.offset[this.axis] = 1 * this.moveDirection;

        let activeIndex = this.isLoop ? (toIndex + this.data.length) % this.data.length : toIndex;
        this.activePage = this.$pages[activeIndex] || EMPTY_PAGE;

        // if the same, do nothing
        if (activeIndex === currentIndex || this.activePage === EMPTY_PAGE) {
            this.moveDirection = Direction.Nonward;
            this.offset[this.axis] = 0;            
            this.pageChange = false;
        }

        this.transition = {...this.transition, ...transition};
        this.renderInstance = Render.getRenderInstance(this.transition.name);

        // 外部调用仍然需要 fire activePageChanged 事件
        this.fire('activePageChanged');

        this._swipeTo();
    }

    private _swipeTo() {
        if (this.sliding) {
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

            $page.prev = this.$pages[prevIndex] || EMPTY_PAGE;
            $page.next = this.$pages[nextIndex] || EMPTY_PAGE;
        });
        
        this.$container.style.overflow = 'hidden';
		this.$container.appendChild(this.$swiper);
    }

    public on(eventName: string, callback: Function): Swiper {
        let eventNames = eventName.split(' ');

        for (let eventName of eventNames) {
            if (!this._listeners[eventName]) {
                this._listeners[eventName] = [];
            }
            
            this._listeners[eventName].push(callback);
        }

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

    private fire(eventName: string, ...args) {
        if (this._listeners[eventName]) {
            for (let callback of this._listeners[eventName]) {
                let extendArgs = {...args, ...{name: eventName}};
                callback.call(this, extendArgs);
            }
        }

        return this;
    }

    public destroy() {
        this.unbindEvents();
        this._listeners = {};
        this.$container.style.overflow = '';
        this.$swiper.parentElement.removeChild(this.$swiper);

        this.fire('destroy');
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


        let transform = this.renderInstance.doRender(this);
        
        this.$swiper.style.cssText = transform.swiper;
        this.currentPage.style.cssText = transform.currentPage;  

        // no one could add class or cssText to EMPTY_PAGE
        if (this.activePage !== EMPTY_PAGE) {
            this.activePage.classList.add('active');
            this.activePage.style.cssText = transform.activePage;                            
        }      

        // 回弹
        if (this.pageChange === false && sideOffset === 0) {
            this.$swiper.style.cssText = '';
            this.currentPage.style.cssText = '';
            this.activePage.style.cssText = '';
            
            this.activePage.classList.remove('active')  
            this.activePage = EMPTY_PAGE;         

            this.sliding = false;
            
            this.pageChange = false;
            this.lastDirection = Direction.Nonward;

            this.fire('swipeRestored');            
        }

        // 正常翻页
        else if (this.pageChange === true && sideOffset === this.moveDirection * this.sideLength) {
            this.$swiper.style.cssText = '';
            this.currentPage.style.cssText = '';
            this.activePage.style.cssText = '';
            
            this.currentPage.classList.remove('current');            
            this.activePage.classList.remove('active')            

            this.activePage.classList.add('current');
            
            this.currentPage = this.activePage;
            this.activePage = EMPTY_PAGE;

            this.offset.X = 0;
            this.offset.Y = 0;

            this.sliding = false;

            this.pageChange = false;
            this.lastDirection = Direction.Nonward;

            this.fire('swipeChanged');
        }
    }
}
