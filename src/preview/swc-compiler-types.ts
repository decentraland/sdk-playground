// TODO:
export type ParseOptions = ParserConfig & {
  comments?: boolean
  script?: boolean
  /**
   * Defaults to es3.
   */
  target?: JscTarget
}

export type TerserEcmaVersion = 5 | 2015 | 2016 | string | number

export interface JsMinifyOptions {
  compress?: TerserCompressOptions | boolean

  format?: JsFormatOptions & ToSnakeCaseProperties<JsFormatOptions>

  mangle?: TerserMangleOptions | boolean

  ecma?: TerserEcmaVersion

  keep_classnames?: boolean

  keep_fnames?: boolean

  module?: boolean

  safari10?: boolean

  toplevel?: boolean

  sourceMap?: boolean

  outputPath?: string

  inlineSourcesContent?: boolean
}

/**
 * @example ToSnakeCase<'indentLevel'> == 'indent_level'
 */
type ToSnakeCase<T extends string> = T extends `${infer A}${infer B}`
  ? `${A extends Lowercase<A> ? A : `_${Lowercase<A>}`}${ToSnakeCase<B>}`
  : T

/**
 * @example ToSnakeCaseProperties<{indentLevel: 3}> == {indent_level: 3}
 */
type ToSnakeCaseProperties<T> = {
  [K in keyof T as K extends string ? ToSnakeCase<K> : K]: T[K]
}

/**
 * These properties are mostly not implemented yet,
 * but it exists to support passing terser config to swc minify
 * without modification.
 */
export interface JsFormatOptions {
  /**
   * Currently noop.
   * @default false
   * @alias ascii_only
   */
  asciiOnly?: boolean

  /**
   * Currently noop.
   * @default false
   */
  beautify?: boolean

  /**
   * Currently noop.
   * @default false
   */
  braces?: boolean

  /**
   * - `false`: removes all comments
   * - `'some'`: preserves some comments
   * - `'all'`: preserves all comments
   * @default false
   */
  comments?: false | 'some' | 'all'

  /**
   * Currently noop.
   * @default 5
   */
  ecma?: TerserEcmaVersion

  /**
   * Currently noop.
   * @alias indent_level
   */
  indentLevel?: number

  /**
   * Currently noop.
   * @alias indent_start
   */
  indentStart?: number

  /**
   * Currently noop.
   * @alias inline_script
   */
  inlineScript?: number

  /**
   * Currently noop.
   * @alias keep_numbers
   */
  keepNumbers?: number

  /**
   * Currently noop.
   * @alias keep_quoted_props
   */
  keepQuotedProps?: boolean

  /**
   * Currently noop.
   * @alias max_line_len
   */
  maxLineLen?: number | false

  /**
   * Currently noop.
   */
  preamble?: string

  /**
   * Currently noop.
   * @alias quote_keys
   */
  quoteKeys?: boolean

  /**
   * Currently noop.
   * @alias quote_style
   */
  quoteStyle?: boolean

  /**
   * Currently noop.
   * @alias preserve_annotations
   */
  preserveAnnotations?: boolean

  /**
   * Currently noop.
   */
  safari10?: boolean

  /**
   * Currently noop.
   */
  semicolons?: boolean

  /**
   * Currently noop.
   */
  shebang?: boolean

  /**
   * Currently noop.
   */
  webkit?: boolean

  /**
   * Currently noop.
   * @alias wrap_iife
   */
  wrapIife?: boolean

  /**
   * Currently noop.
   * @alias wrap_func_args
   */
  wrapFuncArgs?: boolean
}

export interface TerserCompressOptions {
  arguments?: boolean
  arrows?: boolean

  booleans?: boolean

  booleans_as_integers?: boolean

  collapse_vars?: boolean

  comparisons?: boolean

  computed_props?: boolean

  conditionals?: boolean

  dead_code?: boolean

  defaults?: boolean

  directives?: boolean

  drop_console?: boolean

  drop_debugger?: boolean

  ecma?: TerserEcmaVersion

  evaluate?: boolean

  expression?: boolean

  global_defs?: any

  hoist_funs?: boolean

  hoist_props?: boolean

  hoist_vars?: boolean

  ie8?: boolean

  if_return?: boolean

  inline?: 0 | 1 | 2 | 3

  join_vars?: boolean

  keep_classnames?: boolean

  keep_fargs?: boolean

  keep_fnames?: boolean

  keep_infinity?: boolean

  loops?: boolean
  // module        : false,

  negate_iife?: boolean

  passes?: number

  properties?: boolean

  pure_getters?: any

  pure_funcs?: string[]

  reduce_funcs?: boolean

  reduce_vars?: boolean

  sequences?: any

  side_effects?: boolean

  switches?: boolean

  top_retain?: any

  toplevel?: any

  typeofs?: boolean

  unsafe?: boolean

  unsafe_passes?: boolean

  unsafe_arrows?: boolean

  unsafe_comps?: boolean

  unsafe_function?: boolean

  unsafe_math?: boolean

  unsafe_symbols?: boolean

  unsafe_methods?: boolean

  unsafe_proto?: boolean

  unsafe_regexp?: boolean

  unsafe_undefined?: boolean

  unused?: boolean

  module?: boolean
}

export interface TerserMangleOptions {
  props?: TerserManglePropertiesOptions

  toplevel?: boolean

  keep_classnames?: boolean

  keep_fnames?: boolean

  keep_private_props?: boolean

  ie8?: boolean

  safari10?: boolean

  reserved?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TerserManglePropertiesOptions {}
/**
 * Configuration ported from babel-preset-env
 */
interface EnvConfig {
  mode?: 'usage' | 'entry'
  debug?: boolean
  dynamicImport?: boolean

  loose?: boolean

  /// Skipped es features.
  ///
  /// e.g.)
  ///  - `core-js/modules/foo`
  skip?: string[]

  include?: string[]

  exclude?: string[]

  /**
   * The version of the used core js.
   *
   */
  coreJs?: string

  targets?: any

  path?: string

  shippedProposals?: boolean

  /**
   * Enable all transforms
   */
  forceAllTransforms?: boolean
}

interface JscConfig {
  loose?: boolean

  /**
   * Defaults to EsParserConfig
   */
  parser?: ParserConfig
  transform?: TransformConfig
  /**
   * Use `@swc/helpers` instead of inline helpers.
   */
  externalHelpers?: boolean

  /**
   * Defaults to `es3` (which enabled **all** pass).
   */
  target?: JscTarget

  /**
   * Keep class names.
   */
  keepClassNames?: boolean

  experimental?: {
    optimizeHygiene?: boolean
    keepImportAssertions?: boolean
    /**
     * Specify the location where SWC stores its intermediate cache files.
     * Currently only transform plugin uses this. If not specified, SWC will
     * create `.swc` directories.
     */
    cacheRoot?: string
    /**
     * List of custom transform plugins written in WebAssembly.
     * First parameter of tuple indicates the name of the plugin - it can be either
     * a name of the npm package can be resolved, or absolute path to .wasm binary.
     *
     * Second parameter of tuple is JSON based configuration for the plugin.
     */
    plugins?: Array<[string, Record<string, any>]>
  }

  baseUrl?: string

  paths?: {
    [from: string]: string[]
  }

  minify?: JsMinifyOptions

  preserveAllComments?: boolean
}

type JscTarget = 'es3' | 'es5' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022'

type ParserConfig = TsParserConfig | EsParserConfig
interface TsParserConfig {
  syntax: 'typescript'
  /**
   * Defaults to `false`.
   */
  tsx?: boolean
  /**
   * Defaults to `false`.
   */
  decorators?: boolean
  /**
   * Defaults to `false`
   */
  dynamicImport?: boolean
}

interface EsParserConfig {
  syntax: 'ecmascript'
  /**
   * Defaults to false.
   */
  jsx?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  numericSeparator?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  classPrivateProperty?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  privateMethod?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  classProperty?: boolean
  /**
   * Defaults to `false`
   */
  functionBind?: boolean
  /**
   * Defaults to `false`
   */
  decorators?: boolean
  /**
   * Defaults to `false`
   */
  decoratorsBeforeExport?: boolean
  /**
   * Defaults to `false`
   */
  exportDefaultFrom?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  exportNamespaceFrom?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  dynamicImport?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  nullishCoalescing?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  optionalChaining?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  importMeta?: boolean
  /**
   * @deprecated Always true because it's in ecmascript spec.
   */
  topLevelAwait?: boolean
  /**
   * Defaults to `false`
   */
  importAssertions?: boolean
}

/**
 * Options for transform.
 */
interface TransformConfig {
  /**
   * Effective only if `syntax` supports ƒ.
   */
  react?: ReactConfig

  constModules?: ConstModulesConfig

  /**
   * Defaults to null, which skips optimizer pass.
   */
  optimizer?: OptimizerConfig

  /**
   * https://swc.rs/docs/configuring-swc.html#jsctransformlegacydecorator
   */
  legacyDecorator?: boolean

  /**
   * https://swc.rs/docs/configuring-swc.html#jsctransformdecoratormetadata
   */
  decoratorMetadata?: boolean

  treatConstEnumAsEnum?: boolean

  useDefineForClassFields?: boolean
}

interface ReactConfig {
  /**
   * Replace the function used when compiling JSX expressions.
   *
   * Defaults to `React.createElement`.
   */
  pragma?: string
  /**
   * Replace the component used when compiling JSX fragments.
   *
   * Defaults to `React.Fragment`
   */
  pragmaFrag?: string
  /**
   * Toggles whether or not to throw an error if a XML namespaced tag name is used. For example:
   * `<f:image />`
   *
   * Though the JSX spec allows this, it is disabled by default since React's
   * JSX does not currently have support for it.
   *
   */
  throwIfNamespace?: boolean
  /**
   * Toggles plugins that aid in development, such as @swc/plugin-transform-react-jsx-self
   * and @swc/plugin-transform-react-jsx-source.
   *
   * Defaults to `false`,
   *
   */
  development?: boolean
  /**
   * Use `Object.assign()` instead of `_extends`. Defaults to false.
   */
  useBuiltins?: boolean

  /**
   * Enable fast refresh feature for React app
   */
  refresh?: boolean

  /**
   * jsx runtime
   */
  runtime?: 'automatic' | 'classic'

  /**
   * Declares the module specifier to be used for importing the `jsx` and `jsxs` factory functions when using `runtime` 'automatic'
   */
  importSource?: string
}
/**
 * .swcrc
 */
export interface Config {
  /**
   * Note: The type is string because it follows rust's regex syntax.
   */
  test?: string | string[]
  /**
   * Note: The type is string because it follows rust's regex syntax.
   */
  exclude?: string | string[]
  env?: EnvConfig
  jsc?: JscConfig
  module?: ModuleConfig
  minify?: boolean

  /**
   * - true to generate a sourcemap for the code and include it in the result object.
   * - "inline" to generate a sourcemap and append it as a data URL to the end of the code, but not include it in the result object.
   *
   * `swc-cli` overloads some of these to also affect how maps are written to disk:
   *
   * - true will write the map to a .map file on disk
   * - "inline" will write the file directly, so it will have a data: containing the map
   * - Note: These options are bit weird, so it may make the most sense to just use true
   *  and handle the rest in your own code, depending on your use case.
   */
  sourceMaps?: boolean | 'inline'

  inlineSourcesContent?: boolean
}
/**
 *  - `import { DEBUG } from '@ember/env-flags';`
 *  - `import { FEATURE_A, FEATURE_B } from '@ember/features';`
 *
 * See: https://github.com/swc-project/swc/issues/18#issuecomment-466272558
 */
interface ConstModulesConfig {
  globals?: {
    [module: string]: {
      [name: string]: string
    }
  }
}

/// https://swc.rs/docs/configuring-swc.html#jsctransformoptimizerjsonify
interface OptimizerConfig {
  /// https://swc.rs/docs/configuration/compilation#jsctransformoptimizersimplify
  simplify?: boolean
  /// https://swc.rs/docs/configuring-swc.html#jsctransformoptimizerglobals
  globals?: GlobalPassOption
  /// https://swc.rs/docs/configuring-swc.html#jsctransformoptimizerjsonify
  jsonify?: { minCost: number }
}

/**
 * Options for inline-global pass.
 */
interface GlobalPassOption {
  /**
   * Global variables.
   *
   * e.g. `{ __DEBUG__: true }`
   */
  vars?: { [key: string]: string }

  /**
   * Name of environment variables to inline.
   *
   * Defaults to `["NODE_ENV", "SWC_ENV"]`
   */
  envs?: string[]
}

type ModuleConfig = Es6Config | CommonJsConfig | UmdConfig | AmdConfig | NodeNextConfig | SystemjsConfig

interface BaseModuleConfig {
  /**
   * By default, when using exports with babel a non-enumerable `__esModule`
   * property is exported. In some cases this property is used to determine
   * if the import is the default or if it contains the default export.
   *
   * In order to prevent the __esModule property from being exported, you
   *  can set the strict option to true.
   *
   * Defaults to `false`.
   */
  strict?: boolean

  /**
   * Emits 'use strict' directive.
   *
   * Defaults to `true`.
   */
  strictMode?: boolean

  /**
   * Changes Babel's compiled import statements to be lazily evaluated when their imported bindings are used for the first time.
   *
   * This can improve initial load time of your module because evaluating dependencies up
   *  front is sometimes entirely un-necessary. This is especially the case when implementing
   *  a library module.
   *
   *
   * The value of `lazy` has a few possible effects:
   *
   *  - `false` - No lazy initialization of any imported module.
   *  - `true` - Do not lazy-initialize local `./foo` imports, but lazy-init `foo` dependencies.
   *
   * Local paths are much more likely to have circular dependencies, which may break if loaded lazily,
   * so they are not lazy by default, whereas dependencies between independent modules are rarely cyclical.
   *
   *  - `Array<string>` - Lazy-initialize all imports with source matching one of the given strings.
   *
   * -----
   *
   * The two cases where imports can never be lazy are:
   *
   *  - `import "foo";`
   *
   * Side-effect imports are automatically non-lazy since their very existence means
   *  that there is no binding to later kick off initialization.
   *
   *  - `* from "foo"`
   *
   * Re-exporting all names requires up-front execution because otherwise there is no
   * way to know what names need to be exported.
   *
   * Defaults to `false`.
   */
  lazy?: boolean | string[]
  /**
   * @deprecated  Use the `importInterop` option instead.
   *
   * By default, when using exports with swc a non-enumerable __esModule property is exported.
   * This property is then used to determine if the import is the default or if
   *  it contains the default export.
   *
   * In cases where the auto-unwrapping of default is not needed, you can set the noInterop option
   *  to true to avoid the usage of the interopRequireDefault helper (shown in inline form above).
   *
   * Defaults to `false`.
   */
  noInterop?: boolean
  /**
   * Defaults to `swc`.
   *
   * CommonJS modules and ECMAScript modules are not fully compatible.
   * However, compilers, bundlers and JavaScript runtimes developed different strategies
   * to make them work together as well as possible.
   *
   * - `swc` (alias: `babel`)
   *
   * When using exports with `swc` a non-enumerable `__esModule` property is exported
   * This property is then used to determine if the import is the default export
   * or if it contains the default export.
   *
   * ```javascript
   * import foo from "foo";
   * import { bar } from "bar";
   * foo;
   * bar;
   *
   * // Is compiled to ...
   *
   * "use strict";
   *
   * function _interopRequireDefault(obj) {
   *   return obj && obj.__esModule ? obj : { default: obj };
   * }
   *
   * var _foo = _interopRequireDefault(require("foo"));
   * var _bar = require("bar");
   *
   * _foo.default;
   * _bar.bar;
   * ```
   *
   * When this import interop is used, if both the imported and the importer module are compiled
   * with swc they behave as if none of them was compiled.
   *
   * This is the default behavior.
   *
   * - `node`
   *
   * When importing CommonJS files (either directly written in CommonJS, or generated with a compiler)
   * Node.js always binds the `default` to the value of `module.exports`.
   *
   * ```javascript
   * import foo from "foo";
   * import { bar } from "bar";
   * foo;
   * bar;
   *
   * // Is compiled to ...
   *
   * "use strict";
   *
   * var _foo = require("foo");
   * var _bar = require("bar");
   *
   * _foo;
   * _bar.bar;
   * ```
   * This is not exactly the same as what Node.js does since swc allows accessing any property of `module.exports`
   * as a named export, while Node.js only allows importing statically analyzable properties of `module.exports`.
   * However, any import working in Node.js will also work when compiled with swc using `importInterop: "node"`.
   *
   * - `none`
   *
   * If you know that the imported file has been transformed with a compiler that stores the `default` on
   * `exports.default` (such as swc or Babel), you can safely omit the `_interopRequireDefault` helper.
   *
   * ```javascript
   * import foo from "foo";
   * import { bar } from "bar";
   * foo;
   * bar;
   *
   * // Is compiled to ...
   *
   * "use strict";
   *
   * var _foo = require("foo");
   * var _bar = require("bar");
   *
   * _foo.default;
   * _bar.bar;
   * ```
   */
  importInterop?: 'swc' | 'babel' | 'node' | 'none'
  /**
   * If set to true, dynamic imports will be preserved.
   */
  ignoreDynamic?: boolean
  allowTopLevelThis?: boolean
  preserveImportMeta?: boolean
}

interface Es6Config extends BaseModuleConfig {
  type: 'es6'
}

interface NodeNextConfig extends BaseModuleConfig {
  type: 'nodenext'
}

interface CommonJsConfig extends BaseModuleConfig {
  type: 'commonjs'
}

interface UmdConfig extends BaseModuleConfig {
  type: 'umd'
  globals?: { [key: string]: string }
}

interface AmdConfig extends BaseModuleConfig {
  type: 'amd'
  moduleId?: string
}

interface SystemjsConfig {
  type: 'systemjs'
  allowTopLevelThis?: boolean
}

interface Output {
  /**
   * Transformed code
   */
  code: string
  /**
   * Sourcemap (**not** base64 encoded)
   */
  map?: string
}
