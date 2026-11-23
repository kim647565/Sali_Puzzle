const { transpileModule, ModuleKind, ScriptTarget } = require("typescript");

module.exports = {
  process(source, filename) {
    return {
      code: transpileModule(source, {
        fileName: filename,
        compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 },
      }).outputText,
    };
  },
};
