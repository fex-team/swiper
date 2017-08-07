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

import {EMPTY_FUNCTION, EMPTY_PAGE, OPPSITE} from './constant';
import {Direction, Axis, Point, Vector, Transition, Page, $Page, Options, Listeners} from './interface';

import Easing from './easing';

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

export class Swiper {
    static Events: string[] = [
        'swipeBeforeStart',
        'swipeStart',
        'swipeMoving',
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
        keepDefaultClasses: [],
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
    private currentPage: $Page;
    private activePage: $Page;
    private lastActivePage: $Page;

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
        this.keepDefaultClasses = options.keepDefaultClasses;

        this.sideLength = this.axis === 'X' ? this.$container.clientWidth : this.$container.clientHeight;
        this.transition = options.transition;
        this._listeners = {};

        // runtime variable
        this.sliding = false;
        this.moving = false;
        this.pageChange = false;
        this.moveDirection = Direction.Nonward;
        this.activePage = EMPTY_PAGE;
        this.lastActivePage = EMPTY_PAGE;

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
        this.$container.addEventListener(Swiper.Device.transitionEvent, this, <any>{passive: false});
		window.addEventListener(Swiper.Device.endEvent, this, <any>{passive: false});
        window.addEventListener(Swiper.Device.resizeEvent, this, false);
    }

    private unbindEvents() {
        this.$container.removeEventListener(Swiper.Device.startEvent, this, <any>{passive: false});
		this.$container.removeEventListener(Swiper.Device.moveEvent, this, <any>{passive: false});
        this.$container.removeEventListener(Swiper.Device.transitionEvent, this, <any>{passive: false});
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
             case Swiper.Device.transitionEvent:
                this.transitionEndHandler(deviceEvent);
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

        this.fire('swipeStart');
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
            this.lastActivePage = this.activePage;
            this.activePage = this.currentPage.next;
        }
        else if (this.offset[this.axis] > 0) {
            this.moveDirection = Direction.Backward;
            this.lastActivePage = this.activePage;
            this.activePage = this.currentPage.prev;
        }
        else {
            this.moveDirection = Direction.Nonward;
            this.lastActivePage = this.activePage;
            this.activePage = EMPTY_PAGE;
        }

        this.fire('swipeMoving');

        if (this.activePage !== this.lastActivePage && this.activePage !== EMPTY_PAGE) {
            this.fire('activePageChanged');
        }
        
        // 页面禁止滑动时
        // 防止突然「先上后下」，直接将 this.offset 置为 0
        // 防止需要「等」 offset 归 0 后才能往上走
        if (this.transition.direction === Direction.Nonward
        || (this.transition.direction && this.transition.direction !== this.moveDirection)) {
            this.offset[this.axis] = 0;
            this.start = this.end;
        }

        const GAP = {
            Forward: 20,
            Backward: this.sideLength - 20
        };

        let directionKey = Direction[this.moveDirection];

        if (this.moveDirection * this.end[this.axis] > this.moveDirection * GAP[directionKey]) {
            let logStr = this.moveDirection === Direction.Forward ? '<--- near edge' : 'near edge --->';
            this.log(logStr);
            return this.endHandler();
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

        // 如果禁止滑动
        if (this.transition.direction === Direction.Nonward
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
        
        if (absOffset >= threshold && isSwipeOnTheDir && this.activePage !== EMPTY_PAGE) {
            this.pageChange = true;
            this._swipeTo();
        }
        else {
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

    private transitionEndHandler(event?: DeviceEvent) {
        if (event && event.target !== this.currentPage) {
			return;
        }
        
        this.$swiper.style.cssText = '';
        this.currentPage.style.cssText = '';
        this.activePage.style.cssText = '';

        // 回弹
        if (this.pageChange === false) {
            this.activePage.classList.remove('active')  

            this.fire('swipeRestored');
        }
        // 正常翻页
        else {
            this.currentPage.classList.remove('current');            
            this.activePage.classList.remove('active')            

            this.activePage.classList.add('current');
            
            this.currentPage = this.activePage;

            this.fire('swipeChanged');
        }

        this.activePage = EMPTY_PAGE;    
        this.lastActivePage = EMPTY_PAGE;
        
        this.offset.X = 0;
        this.offset.Y = 0;

        this.sliding = false;
        this.pageChange = false;
    }

    public swipeTo(toIndex: number, transition: Transition) {
        if (this.sliding) {
            return;
        }

        let currentIndex = this.currentPage.index;
        this.moveDirection = Direction.Nonward;
        this.pageChange = true;
        

        if (toIndex > currentIndex) {
            this.moveDirection = Direction.Forward;
        }
        else if (toIndex < currentIndex) {
            this.moveDirection = Direction.Backward;
        }

        let activeIndex = this.isLoop ? (toIndex + this.data.length) % this.data.length : toIndex;
        this.activePage = this.$pages[activeIndex] || EMPTY_PAGE;

        // if the same, do nothing
        if (activeIndex === currentIndex || this.activePage === EMPTY_PAGE) {
            this.pageChange = false;
        }

        this.transition = {...this.transition, ...this.currentPage.transition, ...transition};
        this.renderInstance = Render.getRenderInstance(this.transition.name);

        // 外部调用仍然需要 fire activePageChanged 事件
        this.fire('activePageChanged');
        this.render();

        this._swipeTo();
    }

    public swipePrev(transition: Transition) {
        var currentIndex = this.currentPage.index;
        this.swipeTo(currentIndex - 1, transition);
    }

    public swipeNext(transition: Transition) {
        var currentIndex = this.currentPage.index;
        this.swipeTo(currentIndex + 1, transition);
    }

    public getCurrentIndex(): number {
        return this.currentPage.index;
    }

    private _swipeTo() {
        if (this.sliding) {
            return;
        }

        this.sliding = true;

        let duration = this.activePage === EMPTY_PAGE ? 300 : this.transition.duration;
        let elapsedTime = Math.abs(this.offset[this.axis]) / this.sideLength * duration;
        let remainingTime = duration - elapsedTime;

        let animateTime = this.pageChange ? remainingTime : elapsedTime;
        let endOffset = this.pageChange ? this.moveDirection * this.sideLength : 0;

        if (animateTime === 0) {
            return this.transitionEndHandler();
        }

        // force the animation works
        setTimeout(function () {
            this.currentPage.style.webkitTransition = `ease-out ${animateTime}ms`;
            if (this.activePage !== EMPTY_PAGE) {
                this.activePage.style.webkitTransition = `ease-out ${animateTime}ms`;
            }

            // set final offset
            this.offset[this.axis] = endOffset;

            this.render();       
        }.bind(this), 30);
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

    private fire(eventName: string, event: any = {}) {
        if (this._listeners[eventName]) {
            for (let callback of this._listeners[eventName]) {
                let extendArgs = {...event, ...{name: eventName}};
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
        // 撤销旧样式
        if (this.lastActivePage !== this.activePage) {
            this.lastActivePage.classList.remove('active');
            this.lastActivePage.style.cssText = '';

            if (this.activePage !== EMPTY_PAGE) {
                this.activePage.classList.add('active');            
            }
        }

        this.log('offset : ' + this.offset[this.axis]);

        // 普通渲染：计算
        let easingFn = Easing.easeOutQuad;
        if (this.activePage === EMPTY_PAGE) {
            easingFn = Easing.rubberBand;
        }

        this.renderInstance.doRender({
            axis: this.axis,
            moveDirection: this.moveDirection,
            sideOffset: easingFn(this.offset[this.axis], this.sideLength),
            sideLength: this.sideLength,
            $swiper: this.$swiper,
            currentPage: this.currentPage,
            activePage: this.activePage
        });
    }
}
