import { resolve, join } from "path";
import { existsSync, readJSONSync } from "fs-extra";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin, { loader } from "mini-css-extract-plugin";
import ZipPlugin from "zip-webpack-plugin";

/**
 * Retrieves info about the Foundry installed in the system in JSON format.
 * @returns JSON with Foundry configuration data.
 */
function getFoundryConfig() {
  const filePath = resolve(process.cwd(), "foundryconfig.json");
  let config;

  if (existsSync(filePath)) {
    config = readJSONSync(filePath);
  } else {
    console.log("Unable to locate configuration file at path.");
  }

  return config;
}

export default (env, argv) => {
  let config = {
    context: __dirname,
    entry: resolve(__dirname, "./src/module/death-in-space-dark-theme.mjs"),
    module: {
      rules: [
        {
          test: /\.(c|sa|sc)ss$/,
          use: [loader, "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
      new MiniCssExtractPlugin({
        filename: "death-in-space-dark-theme.css",
      }),
      new CopyPlugin({
        patterns: [
          { from: "system.json" },
          { from: "template.json" },
          { from: "lang", to: "lang" },
          { from: "src/templates", to: "templates" },
          { from: "src/styles", to: "styles" },
        ],
      }),
      new ZipPlugin({
        path: "..",
        filename: "death-in-space-dark-theme.zip",
      }),
    ],
    output: {
      filename: "death-in-space-dark-theme.bundle.mjs",
      path: resolve(__dirname, "dist/death-in-space-dark-theme"),
    },
  };

  const isProduction = argv.mode === "production";
  const foundryConfig = getFoundryConfig();

  if (isProduction) {
    config.mode = "production";
  } else {
    console.log(`Dev build detected.`);

    if (foundryConfig !== undefined) {
      config.output.path = join(
        foundryConfig.data_folder,
        "modules",
        "death-in-space-dark-theme"
      );
    }

    //config.devtool = "inline-source-map";
    config.watch = true;
    config.mode = "none";
  }

  console.log(`Generating files at: ${config.output.path}`);

  return config;
};
