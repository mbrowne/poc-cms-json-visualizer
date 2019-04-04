const path = require('path');

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react-app'],
                        plugins: ['babel-plugin-transform-export-extensions']
                    }
                }
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                    // has separate config, see postcss.config.js
                    'postcss-loader'
                ],
            },
        ]
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            'node_modules'
        ]
    },
    devServer: {
        contentBase: './public',
        port: process.env.PORT || 3000,
        historyApiFallback: {
          index: 'index.html'
        }
    },
};
