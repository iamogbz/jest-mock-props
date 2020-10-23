import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
import { Configuration } from "webpack";
import { WebpackCompilerPlugin } from "webpack-compiler-plugin";

const entryPath = path.resolve(__dirname, "src");
const outputPath = path.resolve(__dirname, "lib");
const configuration: Configuration = {
    devtool: "source-map",
    entry: entryPath,
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
                    fs.copySync(entryPath, outputPath, {
                        filter: (src) =>
                            fs.statSync(src).isDirectory() ||
                            src.endsWith(".d.ts"),
                    });
                },
            },
            stageMessages: null,
        }),
    ],
    resolve: {
        extensions: [".js", ".ts"],
        modules: [path.resolve("./src"), path.resolve("./node_modules")],
    },
};

export default configuration;
