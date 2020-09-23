import { execSync } from "child_process";
import * as path from "path";
import { Configuration } from "webpack";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import { WebpackCompilerPlugin } from "webpack-compiler-plugin";

const outputPath = path.resolve(__dirname, "lib");
const configuration: Configuration = {
    devtool: "source-map",
    entry: "./src",
    mode: "production",
    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components)/,
                test: /\.tsx?$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: ["@babel/plugin-proposal-class-properties"],
                        presets: ["@babel/preset-typescript"],
                    },
                },
            },
        ],
    },
    output: {
        filename: "index.js",
        libraryTarget: "commonjs",
        path: outputPath,
    },
    plugins: [
        new WebpackCompilerPlugin({
            name: "Compile Types",
            listeners: {
                buildStart: () => {
                    execSync(`npm run clean`);
                },
                compileStart: (): void => {
                    execSync("npm run compile-types");
                },
            },
            stageMessages: null,
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: "./src/types.d.ts", to: outputPath }],
        }),
    ],
    resolve: {
        extensions: [".js", ".ts"],
        modules: [path.resolve("./src"), path.resolve("./node_modules")],
    },
};

export default configuration;
