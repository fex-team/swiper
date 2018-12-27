const seperateJsAndCss = require('./webpack.config.sep');
const cssInJs = require('./webpack.config.unify');

module.exports = [
    seperateJsAndCss, cssInJs
];
