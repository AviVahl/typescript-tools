import { join, dirname } from 'path';
import webpack from 'webpack';
import { ITypeScriptLoaderOptions } from '../src';

export interface IBundleWithLoaderOptions {
    entry: string;
    options?: ITypeScriptLoaderOptions;
    context?: string;
}

// direct path to loader's source
const loaderPath = require.resolve('../src/index.ts');

export async function bundleWithLoader({
    entry,
    options,
    context = dirname(entry),
}: IBundleWithLoaderOptions): Promise<{ stats: webpack.Stats; statsText: string }> {
    const compiler = webpack({
        entry,
        context,
        mode: 'development',
        resolve: { extensions: ['.ts', '.tsx', '.js'] },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: loaderPath,
                    options,
                },
            ],
        },
    });

    // so test output isn't saved on local hard drive
    compiler.outputFileSystem = noopOutputFileSystem;

    const stats = await new Promise<webpack.Stats>((res, rej) => {
        compiler.run((e, s) => (e ? rej(e) : res(s)));
    });

    return { stats, statsText: stats.toString() };
}

const noopOutputFileSystem: webpack.OutputFileSystem = {
    join,
    mkdir(_path, callback) {
        callback(null);
    },
    mkdirp(_path, callback) {
        callback(null);
    },
    rmdir(_path, callback) {
        callback(null);
    },
    unlink(_path, callback) {
        callback(null);
    },
    writeFile(_path, _data, callback) {
        callback(null);
    },
};
