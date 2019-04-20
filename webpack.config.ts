import * as CopyPlugin from "copy-webpack-plugin";
import * as path from "path";
import { Configuration } from "webpack";

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
        filename: "[name].js",
        libraryTarget: "commonjs",
        path: path.resolve(__dirname, "lib"),
    },
    plugins: [new CopyPlugin(["package.json"])],
    resolve: {
        extensions: [".js", ".ts"],
        modules: [path.resolve("./src"), path.resolve("./node_modules")],
    },
};

export default configuration; // tslint:disable-line
