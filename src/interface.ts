
export enum Direction {
    Forward = -1,
    Nonward = 0,
    Backward = 1
}

export type Axis = 'X' | 'Y';

export interface Point {
    X: number,
    Y: number
}

export interface Vector {
    X: number,
    Y: number
}

export interface Transition {
    name: string;
    duration: number;
    direction?: Direction;
}

export interface Page {
    content: HTMLElement | string;
    transition?: Transition;
}

export interface $Page extends HTMLDivElement {
    index: number;
    prev: $Page;
    next: $Page;
    transition: Transition;
}

export interface Options {
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

export interface Listeners {
    [key: string]: Function[];
}