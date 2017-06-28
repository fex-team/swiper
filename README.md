# Swiper

轻量的移动端 H5 翻页库，提供了必要的配置选项和 API，同时具有高性能的特点。目前百度 H5 运行时页面在使用。
支持的功能：
- 横向或竖向滑动
- 循环翻页
- 总体和页面级别过渡效果
- 页面级别禁止滑动
- 外部 API 调用
- 完善的事件机制
- 可扩展的过渡动画

## 文档
- [基本用法](#基本用法)
- [数据类型](#数据类型)
    - [Transition](#transition)
    - [Page](#page)
- [配置选项](#配置选项)
- [事件](#事件)
- [API](#api)
    - [swipeTo](#swipeto)
    - [on](#on)
    - [off](#off)

## 基本用法
只需三步即可完成：
1. 引入 css 和 js；

2. 创建一个容器 `div`，注意：这个容器必须是有宽度和高度（如 100% 或者 650px）；
```html
<div class="outer-container"></div>
```

3. 准备数据，创建 swiper。
```javascript
var list = [{
    content: '<h1>第 0 页</h1>'
}, {
    content: '<h1>第 1 页</h1>'
}, {
    content: '<h1>第 2 页</h1>'
}];

var swiper = new Swiper({
    container: document.querySelector('.outer-container'),
    data: list
});
```
具体可以参考 [example.html](https://github.com/fex-team/swiper/blob/master/example.html)

## 数据类型
Swiper 定义了两个数据类型: `Transition` 和 `Page`，`Transition` 用于描述翻页过渡动画，`Page` 用于描述页面。

### Transition
```javascript
{
    // 过渡动画名称，目前提供了 5 种过渡动画
    name: 'slide' | 'rotate' | 'flip' | 'card' | 'fade'
    // 过渡动画时长，单位为 ms
    duration: Number
    // 只允许滑动方向 1: 后向，-1: 前向，0:双向禁止滑动，默认为 undefined，即不限制任何方向的滑动
    direction: 1 | -1 | 0
}
```

### Page
```javascript
{
    // 本页面内容，可以是 DOM 或者 string
    content: DOM or string,
    // 本页面翻页过渡动画
    transition: Transition
}
```

## 配置选项
所有的配置项都是可选的

配置项|类型|默认值|说明
----|----|----|---
container           | `DOM` or `string` | document.body                     | swiper 的外层容器 
data                | [Page](#page)[]            | []                                |所有页面的数据    
debug               | boolean           | `false`                           | 是否开启调试模式    
isVertical          | boolean           | `true`                            | 是否是垂直方向滑动
isLoop              | boolean           | `false`                           |是否开启循环翻页 
frr                 | Number            | 10              | Finger Recognition Range, 超过了这个阈值才被认为是有效滑动
keepDefaultClass    | string[]          | []              | 保持默认行为的 class 名，详见[说明](#about-keepdefault)
transition          | [Transition](#transition)           | `{name: 'slide', duration: 800}`  | 翻页过渡动画，按照优先级取值，详见[优先级](#about-transition-priority)

**关于 keepDefaultClass 说明**<a name="about-keepdefault"></a>

为防止滑动事件中断，Swiper 默认阻止所有除了 `a`, `input`, `textarea`, `select` 以外的所有元素的滑动事件(mouseXXX, touchXXX)默认行为。但是在实际项目中，可能还有一些元素需要被排除在外（如微信中，长按图片会有识别二维码的响应，因此就需要将该图片的 className 放入该数组中）。因此 `keepDefaultClass` 就是一个 **要保持默认响应的元素 class 的白名单**。

**过渡效果优先级**<a name="about-transition-priority"></a>

`swipeTo` 函数设定的翻页效果 > 当前页面的翻页效果 > 全局的翻页效果。

若高优先级已经设定，以高优先级的为准，若未设定，采用低一优先级的翻页效果。

## 事件<a name="swiper-events"></a>
Swiper 提供了 8 个事件，按照滑动开始到结束的顺序介绍如下：

事件名|触发时机
----|----
swipeBeforeStart    | 在页面滑动之前触发
swipeStart          | 在页面开始滑动时触发
swipeChange         | 在页面滑动时触发
swipeChanged        | 在翻页完成时触发
swipeRestore        | 在回弹开始时触发
swipeRestored       | 在回弹完成时触发
activePageChanged   | 下一页有变动时触发
destroy             | 销毁实例时触发

其中，页面滑动有两个结果：**回弹**和**翻页**。

回弹即页码没有变化，恢复原状。

翻页即页码产生变化，翻到了下一页。

## API
Swiper 提供了 4 个接口供外部调用：

函数名|作用
----|----
swipeTo | 翻到指定页面
on      | 监听事件
off     | 取消监听事件

### swipeTo
`swipeTo` 函数用于将页面翻到指定页码（从 0 开始计），可以指定翻页过渡动画。不受页面禁止滑动配置选项的限制。

#### 语法
```javascript
swiper.swipeTo(toIndex, transition);
```
#### 参数
- `toIndex`: Number, 翻到的页码，从 0 开始计。
- `transition`: \[可选\][Transition](#transition), 翻页动画，若未指定，则使用[当前翻页效果](#about-transition-priority)。

#### 示例
```javascript
swiper = new Swiper();
// 翻到第 0 页
swiper.swipeTo(0);
// 翻到第 3 页，以 rotate 过渡效果
swiper.swipeTo(3, {name: 'rotate'});
```

### on 
`on` 函数用于监听事件。

#### 语法
```javascript
swiper.on(eventName, listener);
```
#### 参数
- `eventName`: string, swiper [事件](#swiper-events)。
- `listener`: Function, 当所监听事件触发时，就会接收到通知并执行该函数，拥有 1 个参数 `event`。
    - `event`: Object, 默认包含 `name` 属性，表示当前的事件名。

#### 示例
```javascript
swiper = new Swiper();
// 监听 swipeChanged 事件，会在页面完成翻页时触发
swiper.on('swipeChanged', function (e) {
    console.log(e.name + 'fired');
});
```

### off
`off` 函数用于取消监听事件，与 `on` 函数相反。取消监听后，不会接收到事件响应。

#### 语法
```javascript
swiper.off(eventName, listener);
```
#### 参数
- `eventName`: string, swiper [事件](#swiper-events)
- `listener`: Function, 在 `on` 函数中传入的监听函数。
    

#### 示例
```javascript
swiper = new Swiper();
// 取消监听 swipeChanged 事件
swiper.off('swipeChanged', function (e) {
    console.log(e.name + 'fired');
});
```
