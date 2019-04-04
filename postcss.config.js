module.exports = {
    //we are using this just to allow single-line comments; we're not using SASS
    parser: 'postcss-scss',
    plugins: {
      'postcss-import': {
        root: __dirname,
      },
      'postcss-mixins': {},
      'postcss-each': {},
      'postcss-cssnext': {},
    },
};