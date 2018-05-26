'use strict';

module.exports = function (data, options) {
  var MdIt = require('markdown-it');
  var cfg = this.config.markdown;
  var opt = (cfg) ? cfg : 'default';
  var parser = (opt === 'default' || opt === 'commonmark' || opt === 'zero') ?
    new MdIt(opt) :
    new MdIt(opt.render);

  if (opt.plugins) {
    parser = opt.plugins.reduce(function (parser, pugs) {
      if (pugs instanceof Object && pugs.name) {
        if (pugs.name === 'markdown-it-container') {
          return parser.use(require(pugs.name), 'placeholder', {
            validate: function(params) {
              let param = params.trim().split(' ', 2)[0];
              let tips = pugs.options.tips || ['warning', 'info'];
              return tips.includes(param);
            },
            render: function (tokens, idx, _options, env, self) {
              if (tokens[idx].nesting === 1) {
                tokens[idx].attrPush(['class', tokens[idx].info.trim()]);
              }
              return self.renderToken(tokens, idx, _options, env, self);
            }
          });
        }
        return parser.use(require(pugs.name), pugs.options);
      } else {
        return parser.use(require(pugs));
      }
    }, parser);
  }

  if (opt.anchors) {
    parser = parser.use(require('./anchors'), opt.anchors);
  }

  return parser.render(data.text);
};
