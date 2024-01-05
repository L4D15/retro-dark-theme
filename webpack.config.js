const path = require('path');
const fileSystem = require('fs-extra');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ZipPlugin = require('zip-webpack-plugin');

/**
 * Retrieves info about the Foundry installed in the system in JSON format.
 * @returns JSON with Foundry configuration data.
 */
function getFoundryConfig() {
    const filePath = path.resolve(process.cwd(), 'foundryconfig.json');
    let config;

    if (fileSystem.existsSync(filePath)) {
        config = fileSystem.readJSONSync(filePath);
    } else {
        console.log('Unable to locate configuration file at path.');
    }

    return config;
}

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const foundryConfig = getFoundryConfig();
    const devOutputPath = path.join(
        foundryConfig.data_folder,
        'modules',
        'minimal-dark-theme'
    );

    let config = {
        context: __dirname,
        entry: path.resolve(__dirname, './src/module/minimal-dark-theme.mjs'),
        module: {
            rules: [
                {
                    test: /\.(c|sa|sc)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
            new MiniCssExtractPlugin({
                filename: 'minimal-dark-theme.css',
            }),
            new CopyPlugin({
                patterns: [{ from: 'module.json' }],
            }),
            new ZipPlugin({
                path: '..',
                filename: 'minimal-dark-theme.zip',
            }),
        ],
        output: {
            filename: 'minimal-dark-theme.bundle.mjs',
            path: path.resolve(__dirname, 'dist/minimal-dark-theme'),
        },
    };

    if (isProduction) {
        config.mode = 'production';
    } else {
        console.log(`Dev build detected.`);

        if (foundryConfig !== undefined) {
            config.output.path = path.join(
                foundryConfig.data_folder,
                'modules',
                'minimal-dark-theme'
            );
        }

        config.devtool = 'inline-source-map';
        config.watch = true;
        config.mode = 'none';
    }

    console.log(`Generating files at: ${config.output.path}`);

    return config;
};
