//import * as  webpack from "webpack";

/*
if (process.env.WATCH === "TRUE") {
    console.log("WEBPACK SHOULD WATCH");
}
*/
console.log("WEBPACK_MODE", process.env.WEBPACK_MODE);
const rules = [
    {
        test : /\.tsx?$/,
        loader : `ts-loader?configFile=${__dirname}/tsconfig.json`,
        exclude : /node_modules/,
    }
];
/*
//TODO Is this even needed?
if (process.env.WEBPACK_MODE === "development") {
    rules.push({
        enforce : "pre",
        test : /\.js$/,
        loader : "source-map-loader",
    });
}
*/
const config  = {
    cache : true,
    entry : {
        index : `${__dirname}/src/index.ts`
    },
    output : {
        filename : "[name].js",
        chunkFilename: '[name].bundle.js',
        path : `${__dirname}/public/dist`,
    },
    devtool : (process.env.WEBPACK_MODE === "development") ?
        "source-map" :
        undefined,
    resolve : {
        extensions : [".ts", ".tsx", ".js"],
    },
    module : {
        rules : rules,
    },
    externals : {
    },
    watch : (process.env.WATCH === "TRUE"),
    watchOptions : {
        poll : (process.env.WATCH === "TRUE"),
    },
    optimization : {
        splitChunks : {
            chunks : "all",
            cacheGroups : {
                commons : {
                    test : /node_modules/,
                    name : "vendors",
                    chunks : "all"
                }
            }
        },
        usedExports : true,
        sideEffects : true,
    }
};

module.exports = config;
