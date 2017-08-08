/**
 * @file swiper.spec.ts 对应 swiper.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

import {Swiper} from '../src/swiper';
import Slide from '../src/renders/slide';
import Flip from '../src/renders/flip';
import Easing from '../src/easing';
import {EMPTY_PAGE} from '../src/constant';

describe('test swiper', () => {
    document.body.innerHTML = '<div class="outer-container" style="width: 400px; height: 650px;"></div>';

    const data = [{
        content: '<img src="//kityminder-img.cdn.bcebos.com/01.png" alt="01" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/02.png" alt="02" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/03.png" alt="03" width="100%" height="100%">'
    }];

    const mockStartPoint = {
        X: 100,
        Y: 100
    };

    const mockUpMovingPoint = {
        X: 100,
        Y: 90
    };

    const mockDownMovingPoint = {
        X: 100,
        Y: 110
    };

    const mockRightMovingPoint = {
        X: 110,
        Y: 100
    }

    let swiper;

    jest.useFakeTimers();    

    beforeEach(() => {
        swiper = new Swiper({
            container: <HTMLElement>document.querySelector('.outer-container'),
            data: data,
            initIndex: 1,
            keepDefaultClasses: ['keep-default']
        });
    });

    describe('test handleEvent', () => {

        test('test mousedown left button event', () => {
            let event = {
                type: 'mousedown',
                button: 0,
                preventDefault: jest.fn()
            };
            swiper.keepDefaultHandler = jest.fn();
            swiper.startHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.keepDefaultHandler).toBeCalled();
            expect(swiper.startHandler).toBeCalled();
        });

        test('test mousedown right button event', () => {
            let event = {
                type: 'mousedown',
                button: 1,
                preventDefault: jest.fn()
            };
            swiper.keepDefaultHandler = jest.fn();
            swiper.startHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.keepDefaultHandler).not.toBeCalled();
            expect(swiper.startHandler).not.toBeCalled();
        });

        test('test touch start event', () => {
            let event = {
                type: 'touchstart',
                preventDefault: jest.fn()
            };
            swiper.keepDefaultHandler = jest.fn();
            swiper.startHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.keepDefaultHandler).toBeCalled();
            expect(swiper.startHandler).toBeCalled();
        });

        test('test touch move event', () => {
            let event = {
                type: Swiper.Device.moveEvent,
                preventDefault: jest.fn()
            };
            swiper.keepDefaultHandler = jest.fn();
            swiper.moveHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.keepDefaultHandler).toBeCalled();
            expect(swiper.moveHandler).toBeCalled();
        });

        test('test touch end event', () => {
            let event = {
                type: Swiper.Device.endEvent,
                preventDefault: jest.fn()
            };
            swiper.endHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.endHandler).toBeCalled();
        });

        test('test resize event', () => {
            let event = {
                type: Swiper.Device.resizeEvent,
                preventDefault: jest.fn()
            };
            swiper.resizeHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.resizeHandler).toBeCalled();
        });

        test('test transition end event', () => {
            let event = {
                type: Swiper.Device.transitionEvent,
                preventDefault: jest.fn()
            };
            swiper.transitionEndHandler = jest.fn();

            swiper.handleEvent(event);

            expect(swiper.transitionEndHandler).toBeCalled();
        });

        test('test keyboard event', () => {
            let event = {
                type: 'keydown',
                preventDefault: jest.fn()
            };

            swiper.handleEvent(event);
        });

    });

    describe('test preventDefaultHandler', () => {

        test('test a device event on a tag', () => {
            const mockDeviceEventOnATag = {
                target: document.createElement('a'),
                preventDefault: jest.fn()
            };

            swiper.keepDefaultHandler(mockDeviceEventOnATag);
            expect(mockDeviceEventOnATag.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a keep default element', () => {
            const $targetElement = document.createElement('div');
            $targetElement.classList.add('keep-default');

            const mockDeviceEventOnKeepDefault = {
                target: $targetElement,
                preventDefault: jest.fn()
            };

            swiper.keepDefaultHandler(mockDeviceEventOnKeepDefault);
            expect(mockDeviceEventOnKeepDefault.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a normal element', () => {
            const mockDeviceEventOnNormal = {
                target: document.createElement('div'),
                preventDefault: jest.fn()
            };

            swiper.keepDefaultHandler(mockDeviceEventOnNormal);
            expect(mockDeviceEventOnNormal.preventDefault).toHaveBeenCalledTimes(1);
        });
    });

    describe('test touchStartHandler', () => {
        test('test a touch start event', () => {
            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);
            expect(swiper.start.X).toBe(100);
            expect(swiper.start.Y).toBe(100);
        });

        test('test prevent touch start when sliding', () => {
            swiper.sliding = true;

            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);

            expect(swiper.moving).toBe(false);
        });
    });

    describe('test moveHandler', () => {
        test('test a up moving event', () => {
            // mock swiper.fire
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);

            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(-10);
            expect(swiper.pageChange).toBe(false);

            expect(swiper.fire).toHaveBeenCalledWith('activePageChanged');
            expect(swiper.fire).toHaveBeenCalledWith('swipeMoving');
            expect(swiper.fire).toHaveBeenCalledWith('swipeStart');
        });

        test('test a down moving event', () => {
            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(10);
        });

        test('test a right moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                isVertical: false,
                initIndex: 1,
                keepDefaultClasses: ['keep-default']
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockRightMovingPoint);
            expect(swiper.offset.X).toBe(10);
            expect(swiper.offset.Y).toBe(0);
        });

        test('test a none moving event', () => {

            const mockNoneMovingPoint = mockStartPoint;

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockNoneMovingPoint);
            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(0);
        });

        test('test a reverse up to down moving event', () => {
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.fire).toHaveBeenCalledWith('activePageChanged');
        });

        test('test moving event when sliding', () => {
            swiper.sliding = true;
            swiper.fire = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            expect(swiper.fire).toHaveBeenCalledTimes(0);
        });

        test('test a near edge moving event', () => {
            swiper.endHandler = jest.fn();

            const mockNearEdgePoint = {
                X: 100,
                Y: 10
            }

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockNearEdgePoint);
            expect(swiper.endHandler).toBeCalled();
        });

        test('test duration 0 in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                transition: {
                    name: 'slide',
                    duration: 0
                }
            });

            swiper.render = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);

            expect(swiper.render).toHaveBeenCalledTimes(0);
        });

        test('test activePage EMPTY in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(10);
            expect(swiper.end).toEqual(mockDownMovingPoint);
            expect(swiper.pageChange).toBe(false);
        });

        test('test page forbidden in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                transition: {
                    name: 'slide',
                    duration: 0,
                    direction: 0
                }
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(0);
            expect(swiper.start).toEqual(mockDownMovingPoint);
        });

        test('test page down forbidden in moving event', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                transition: {
                    name: 'slide',
                    duration: 0,
                    direction: -1
                }
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);

            expect(swiper.offset.Y).toBe(0);
            expect(swiper.start).toEqual(mockDownMovingPoint);
        });

         test('test debug option', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                debug: true,
                initIndex: 1,
                keepDefaultClasses: ['keep-default']
            });

            swiper.log = jest.fn();

            swiper.startHandler(mockStartPoint);
            expect(swiper.log).toBeCalledWith('start');
        });
    });

    describe('test endHandler', () => {
        test('test touchEnd event when sliding', () => {
            swiper.sliding = true;

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockUpMovingPoint);
            swiper.endHandler();

            expect(swiper.endTime).toBeUndefined();
        });

        test('test if rubber band works when activePage is EMPTY', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data
            });

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            swiper.endHandler();

            expect(swiper.offset.Y).toBe(10);
        });

        test('page change in moving greater than threshold', () => {
            const mockLargeDownMovingEvent = {
                X: 100,
                Y: 400
            };

            swiper._swipeTo = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockLargeDownMovingEvent);
            swiper.endHandler();

            expect(swiper.pageChange).toBe(true);
            expect(swiper._swipeTo).toBeCalled();
        });

        test('page change in moving less than threshold', () => {
            swiper._swipeTo = jest.fn();

            swiper.startHandler(mockStartPoint);
            swiper.moveHandler(mockDownMovingPoint);
            swiper.endHandler();

            expect(swiper.pageChange).toBe(false);
            expect(swiper._swipeTo).toBeCalled();
        });
    });

    describe('test resizeHandler', () => {
        test('test normal resize', () => {
            swiper.sliding = false;
            swiper.moving = false;
            swiper.axis = 'Y'
            swiper.$container = {
                clientHeight: 670
            };

            swiper.resizeHandler();

            expect(swiper.sideLength).toBe(670);
        });

        test('test normal resize', () => {
            swiper.sliding = false;
            swiper.moving = false;
            swiper.axis = 'X'
            swiper.$container = {
                clientWidth: 420
            };

            swiper.resizeHandler();

            expect(swiper.sideLength).toBe(420);
        });

        test('test resize when sliding', () => {
            swiper.sliding = true;
            swiper.moving = false;
            swiper.axis = 'X'
            swiper.sideLength = 400;
            swiper.$container = {
                clientWidth: 420
            };

            swiper.resizeHandler();

            expect(swiper.sideLength).toBe(400);
        });

        test('test resize when moving', () => {
            swiper.sliding = false;
            swiper.moving = true;
            swiper.axis = 'X'
            swiper.sideLength = 400;
            swiper.$container = {
                clientWidth: 420
            };

            swiper.resizeHandler();

            expect(swiper.sideLength).toBe(400);
        });
    });

    describe('test transitionEndHandler', () => {
        test('test when transition end target is not currentPage', () => {
            let event = {
                target: EMPTY_PAGE
            };
            swiper.pageChange = true;

            swiper.transitionEndHandler(event);

            // do nothing
            expect(swiper.pageChange).toBeTruthy();
        });

        test('test page change is false', () => {
            swiper.currentPage = swiper.$pages[1];
            swiper.activePage = swiper.$pages[0];
            let event = {
                target: swiper.currentPage
            };
            swiper.pageChange = false;
            swiper.fire = jest.fn();

            swiper.transitionEndHandler(event);

            expect(swiper.fire).toBeCalledWith('swipeRestored');
            expect(swiper.currentPage.classList.contains('current')).toBeTruthy();
            expect(swiper.pageChange).toBeFalsy();
            expect(swiper.activePage).toBe(EMPTY_PAGE);
        });

        test('test page change is true', () => {
            swiper.currentPage = swiper.$pages[1];
            swiper.activePage = swiper.$pages[0];
            let event = {
                target: swiper.currentPage
            };
            swiper.pageChange = true;
            swiper.fire = jest.fn();

            swiper.transitionEndHandler(event);

            expect(swiper.fire).toBeCalledWith('swipeChanged');
            expect(swiper.pageChange).toBeFalsy();
            expect(swiper.activePage).toBe(EMPTY_PAGE);
        });
    });

    describe('test swipeTo', () => {
        
        test('test swipe to next page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(2);

            expect(swiper.moveDirection).toBe(-1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to prev page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(0);

            expect(swiper.moveDirection).toBe(1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to current page', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(1);

            expect(swiper.pageChange).toBeFalsy();
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to a index out of range', () => {
            swiper._swipeTo = jest.fn();

            swiper.swipeTo(-1);

            expect(swiper.pageChange).toBeFalsy();
            expect(swiper.activePage).toBe(EMPTY_PAGE);
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe to a index in a loop swiper', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: data,
                initIndex: 1,
                isLoop: true
            });

            swiper._swipeTo = jest.fn();

            swiper.swipeTo(-1);

            expect(swiper.moveDirection).toBe(1);
            expect(swiper.pageChange).toBeTruthy();
            expect(swiper.activePage).toEqual(swiper.$pages[2])
            expect(swiper._swipeTo).toBeCalled();
        });

        test('test swipe twice', () => {
            swiper.swipeTo(0);
            swiper.swipeTo(2);

            expect(swiper.moveDirection).toBe(1);
            expect(swiper.pageChange).toBeTruthy();
        });
    });

    describe('test swipePrev and swipeNext', () => {
        test('test swipePrev', () => {
            swiper.swipeTo = jest.fn();
            const transition = {
                name: 'flip'
            };

            swiper.swipePrev(transition);
            expect(swiper.swipeTo).toBeCalledWith(0, transition);
        });

        test('test swipeNext', () => {
            swiper.swipeTo = jest.fn();
            const transition = {
                name: 'flip'
            };

            swiper.swipeNext(transition);
            expect(swiper.swipeTo).toBeCalledWith(2, transition);
        });
    });

    describe('test _swipeTo', () => {
        test('test _swipeTo when sliding', () => {
            swiper.sliding = true;
            swiper.render = jest.fn();
            
            swiper._swipeTo();
            expect(swiper.render).not.toBeCalled();
        });

        test('test _swipeTo with transition duration is 0', () => {
            swiper.offset[swiper.axis] = 0;
            swiper.sideLength = 650;
            swiper.transition = {
                duration : 0
            };
            swiper.activePage = swiper.$pages[2];
            swiper.pageChange = true;
            swiper.render = jest.fn();
            swiper.transitionEndHandler = jest.fn();

            swiper._swipeTo();

            expect(swiper.transitionEndHandler).toBeCalled();

            jest.runAllTimers();
            expect(swiper.render).not.toBeCalled();
        });

        test('test up swipe _swipeTo', () => {
            swiper.offset[swiper.axis] = -300;
            swiper.pageChange = true;
            swiper.moveDirection = -1;
            swiper.render = jest.fn();

            swiper._swipeTo();

            expect(swiper.render).not.toBeCalled();

            // due to setTimeout in _swipeTo            
            jest.runAllTimers();
            expect(swiper.render).toBeCalled();
        });
    });

    describe('test swiper listener functions', () => {
        test('swiper.on and fire function', () => {
            const callback = jest.fn();

            swiper.on('swipeStart', callback);
            swiper.on('swipeStart', callback);
            swiper.fire('swipeStart', {offset: {X: 0, Y:100}});
            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toBeCalledWith({name: 'swipeStart', offset: {X: 0, Y:100}});
        });

        test('swiper.off and fire function', () => {
            const callback = jest.fn();

            swiper.on('swipeStart', callback);
            swiper.off('swipeStart', callback);
            swiper.off('anotherEvent', callback);
            swiper.fire('swipeStart');
            expect(callback).not.toBeCalled();
        });
    });

    describe('test swiper destroy', () => {
        test('swiper.on and fire function', () => {
            swiper.$container.removeEventListener = jest.fn();
            swiper.fire = jest.fn();

            swiper.destroy();
            expect(swiper.$container.removeEventListener).toBeCalled();
            expect(swiper._listeners).toEqual({});
            expect(swiper.$container.contains(swiper.$swiper)).toBeFalsy();
            expect(swiper.fire).toHaveBeenCalledWith('destroy');
        });
    });

    describe('test outer API', () => {
        test('test getCurrentIndex', () => {
            let currentIndex = swiper.getCurrentIndex();
            expect(currentIndex).toBe(1);
        });
    })

    describe('test render function', () => {
        test('test normal render', () => {
            swiper.lastActivePage = EMPTY_PAGE;
            swiper.activePage = swiper.$pages[2];
            swiper.offset[swiper.axis] = -10;
            swiper.renderInstance = new Slide();

            swiper.render();

            expect(swiper.lastActivePage.classList.contains('active')).toBeFalsy();
            expect(swiper.activePage.classList.contains('active')).toBeTruthy();
        });

        test('test render with rubber band', () => {
            swiper.lastActivePage = swiper.$pages[2];
            swiper.activePage = EMPTY_PAGE;
            swiper.moveDirection = 1;
            swiper.sideLength = 650;
            swiper.offset[swiper.axis] = 10;
            swiper.renderInstance = new Slide();
            swiper.renderInstance.doRender = jest.fn();

            swiper.render();

            expect(swiper.lastActivePage.classList.contains('active')).toBeFalsy();
            expect(swiper.activePage.classList.contains('active')).toBeFalsy();

            let rubberOffset = Easing.rubberBand(10, 650);
            expect(swiper.renderInstance.doRender).toBeCalledWith({
                axis: 'Y',
                moveDirection: 1,
                sideOffset: rubberOffset,
                sideLength: 650,
                $swiper: swiper.$swiper,
                currentPage: swiper.$pages[1],
                activePage: EMPTY_PAGE
            });
        });
    });

    describe('test initRender', () => {
        test('test with init dom', () => {
            swiper = new Swiper({
                container: <HTMLElement>document.querySelector('.outer-container'),
                data: [{
                    content: EMPTY_PAGE
                }]
            });

            expect(swiper.$pages.length).toBe(1);
        });
    })

});