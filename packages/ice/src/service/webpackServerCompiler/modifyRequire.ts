import { type Compiler } from 'webpack';

const PLUGIN_NAME = 'modify_require';

class ModifyRequirePlugin {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (assets) => {
          // TODO: make it more universal
          Object.entries(assets).forEach(([pathname, source]) => {
            let sourceCode = source.source().toString();
            if (pathname.includes('vendor')) {
              let code = sourceCode
                .replace(/exports\.id/, 'window.__quickMode = {} \nwindow.__quickMode.id')
                .replace(/exports\.ids/, 'window.__quickMode.ids')
                .replace(/exports\.modules/, 'window.__quickMode.modules');
              compilation.updateAsset(
                pathname,
                new compiler.webpack.sources.SourceMapSource(
                  // require is not work in wormhole, so store the module chunk in window instead
                  code,
                  pathname,
                  source.map(),
                ),
              );
            } else {
              compilation.updateAsset(
                pathname,
                new compiler.webpack.sources.SourceMapSource(
                  // require is not work in wormhole, so store the module chunk in window instead
                  sourceCode.replace(/installChunk\(.+\)/, 'installChunk(window.__quickMode)'),
                  pathname,
                  source.map(),
                ),
              );
            }
          });
        },
      );
    });
  }
}

export default ModifyRequirePlugin;
