const critical = require('critical');

const baseOptions = {
  inline: true,
  base: '_site/',
  minify: true,
  ignore: ['@font-face'],
  css: ['assets/dist/css/style.min.css'],
  extract: true,
  dimensions: [
    {
      height: 600,
      width: 800
    },
    {
      height: 1080,
      width: 1920
    }
  ]
};

critical.generate(Object.assign({
  src: 'index.html',
  dest: 'index.html'
}, baseOptions));

critical.generate(Object.assign({
  src: 'quilt/index.html',
  dest: 'quilt/index.html'
}, baseOptions));

critical.generate(Object.assign({
  src: 'updates/index.html',
  dest: 'updates/index.html'
}, baseOptions));

critical.generate(Object.assign({
  src: 'coffee/index.html',
  dest: 'coffee/index.html'
}, baseOptions));
