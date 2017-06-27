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

## 基本用法
```javascript
var list = [{
    content: '<h1>第 1 页</h1>'
}, {
    content: '<h1>第 2 页</h1>'
}, {
    content: '<h1>第 3 页</h1>'
}]

var swiper = new Swiper({
	container: document.querySelector('body'),
	data: list
});
```

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
keepDefaultClass    | string[]          | []              | 保持默认行为的 class 名，详见[这里](#about-keepdefault)
transition          | [Transition](#transition)        | `{name: 'slide', duration: 800}`  | 翻页过渡动画

## 关于 keepDefaultClass 说明<a name="about-keepdefault"></a>
为防止滑动事件中断，Swiper 默认阻止所有除了 `a`, `input`, `textarea`, `select` 元素的滑动事件(mouseXXX, touchXXX)默认响应行为。但是在实际项目中，可能有一些 App 专有的行为需要排除在外（如微信中，长按图片会有识别二维码的响应）。因此 `keepDefaultClass` 就是一个 **要保持默认响应的元素 class 的白名单**。

