/**
 * @license RequireJS
 */
var requirejs, require, define;
(function (global) {
    'use strict';
    var version = '2.0.2',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        ostring = Object.prototype.toString,
        ap = Array.prototype,
        aps = ap.slice,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && navigator && document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false,
        req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath;
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }
    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    function hasProp(obj, prop) {
        return obj.hasOwnProperty(prop);
    }
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value !== 'string') {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }
    function scripts() {
        return document.getElementsByTagName('script');
    }
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }
    function makeContextModuleFunc(func, relMap, enableBuildCallback) {
        return function () {
            var args = aps.call(arguments, 0), lastArg;
            if (enableBuildCallback &&
                isFunction((lastArg = args[args.length - 1]))) {
                lastArg.__requireJsBuild = true;
            }
            args.push(relMap);
            return func.apply(null, args);
        };
    }
    function addRequireMethods(req, context, relMap) {
        each([
            ['toUrl'],
            ['undef'],
            ['defined', 'requireDefined'],
            ['specified', 'requireSpecified']
        ], function (item) {
            var prop = item[1] || item[0];
            req[item[0]] = context ? makeContextModuleFunc(context[prop], relMap) :
                function () {
                    var ctx = contexts[defContextName];
                    return ctx[prop].apply(ctx, arguments);
                };
        });
    }
    /**
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }
    if (typeof define !== 'undefined') {
        return;
    }
    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }
    if (typeof require !== 'undefined' && !isFunction(require)) {
        cfg = require;
        require = undefined;
    }
    function newContext(contextName) {
        var config = {
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                pkgs: {},
                shim: {}
            },
            registry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            requireCounter = 1,
            unnormalizedCounter = 1,
            waitAry = [],
            inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId;
        /**
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; ary[i]; i+= 1) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }
        /**
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * @param {Boolean} applyMap apply the map config to the value. Should
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var baseParts = baseName && baseName.split('/'),
                map = config.map,
                starMap = map && map['*'],
                pkgName, pkgConfig, mapValue, nameParts, i, j, nameSegment,
                foundMap;
            if (name && name.charAt(0) === '.') {
                if (baseName) {
                    if (config.pkgs[baseName]) {
                        baseParts = [baseName];
                    } else {
                        baseParts = baseParts.slice(0, baseParts.length - 1);
                    }
                    name = baseParts.concat(name.split('/'));
                    trimDots(name);
                    pkgConfig = config.pkgs[(pkgName = name[0])];
                    name = name.join('/');
                    if (pkgConfig && name === pkgName + '/' + pkgConfig.main) {
                        name = pkgName;
                    }
                } else if (name.indexOf('./') === 0) {
                    name = name.substring(2);
                }
            }
            if (applyMap && (baseParts || starMap) && map) {
                nameParts = name.split('/');
                for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');
                    if (baseParts) {
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = map[baseParts.slice(0, j).join('/')];
                            if (mapValue) {
                                mapValue = mapValue[nameSegment];
                                if (mapValue) {
                                    foundMap = mapValue;
                                    break;
                                }
                            }
                        }
                    }
                    if (!foundMap && starMap && starMap[nameSegment]) {
                        foundMap = starMap[nameSegment];
                    }
                    if (foundMap) {
                        nameParts.splice(0, i, foundMap);
                        name = nameParts.join('/');
                        break;
                    }
                }
            }
            return name;
        }
        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                        scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }
        function hasPathFallback(id) {
            var pathConfig = config.paths[id];
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                removeScript(id);
                pathConfig.shift();
                context.undef(id);
                context.require([id]);
                return true;
            }
        }
        /**
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * @param {Boolean} isNormalized: is the ID already normalized.
         * @param {Boolean} applyMap: apply the map config to the ID.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var index = name ? name.indexOf('!') : -1,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '',
                url, pluginModule, suffix;
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }
            if (index !== -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = defined[prefix];
            }
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        normalizedName = normalize(name, parentName, applyMap);
                    }
                } else {
                    normalizedName = normalize(name, parentName, applyMap);
                    url = context.nameToUrl(name, null, parentModuleMap);
                }
            }
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';
            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                    prefix + '!' + normalizedName :
                    normalizedName) + suffix
            };
        }
        function getModule(depMap) {
            var id = depMap.id,
                mod = registry[id];
            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }
            return mod;
        }
        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = registry[id];
            if (hasProp(defined, id) &&
                (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                getModule(depMap).on(name, fn);
            }
        }
        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;
            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = registry[id];
                    if (mod) {
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });
                if (!notified) {
                    req.onError(err);
                }
            }
        }
        function takeGlobalQueue() {
            if (globalDefQueue.length) {
                apsp.apply(defQueue,
                           [defQueue.length - 1, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }
        function makeRequire(mod, enableBuildCallback, altRequire) {
            var relMap = mod && mod.map,
                modRequire = makeContextModuleFunc(altRequire || context.require,
                                                   relMap,
                                                   enableBuildCallback);
            addRequireMethods(modRequire, context, relMap);
            modRequire.isBrowser = isBrowser;
            return modRequire;
        }
        handlers = {
            'require': function (mod) {
                return makeRequire(mod);
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    return (mod.exports = defined[mod.map.id] = {});
                }
            },
            'module': function (mod) {
                return (mod.module = {
                    id: mod.map.id,
                    uri: mod.map.url,
                    config: function () {
                        return (config.config && config.config[mod.map.id]) || {};
                    },
                    exports: defined[mod.map.id]
                });
            }
        };
        function removeWaiting(id) {
            delete registry[id];
            each(waitAry, function (mod, i) {
                if (mod.map.id === id) {
                    waitAry.splice(i, 1);
                    if (!mod.defined) {
                        context.waitCount -= 1;
                    }
                    return true;
                }
            });
        }
        function findCycle(mod, traced) {
            var id = mod.map.id,
                depArray = mod.depMaps,
                foundModule;
            if (!mod.inited) {
                return;
            }
            if (traced[id]) {
                return mod;
            }
            traced[id] = true;
            each(depArray, function (depMap) {
                var depId = depMap.id,
                    depMod = registry[depId];
                if (!depMod) {
                    return;
                }
                if (!depMod.inited || !depMod.enabled) {
                    foundModule = null;
                    delete traced[id];
                    return true;
                }
                return (foundModule = findCycle(depMod, mixin({}, traced)));
            });
            return foundModule;
        }
        function forceExec(mod, traced, uninited) {
            var id = mod.map.id,
                depArray = mod.depMaps;
            if (!mod.inited || !mod.map.isDefine) {
                return;
            }
            if (traced[id]) {
                return defined[id];
            }
            traced[id] = mod;
            each(depArray, function(depMap) {
                var depId = depMap.id,
                    depMod = registry[depId],
                    value;
                if (handlers[depId]) {
                    return;
                }
                if (depMod) {
                    if (!depMod.inited || !depMod.enabled) {
                        uninited[id] = true;
                        return;
                    }
                    value = forceExec(depMod, traced, uninited);
                    if (!uninited[depId]) {
                        mod.defineDepById(depId, value);
                    }
                }
            });
            mod.check(true);
            return defined[id];
        }
        function modCheck(mod) {
            mod.check();
        }
        function checkLoaded() {
            var waitInterval = config.waitSeconds * 1000,
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                stillLoading = false,
                needCycleCheck = true,
                map, modId, err, usingPathFallback;
            if (inCheckLoaded) {
                return;
            }
            inCheckLoaded = true;
            eachProp(registry, function (mod) {
                map = mod.map;
                modId = map.id;
                if (!mod.enabled) {
                    return;
                }
                if (!mod.error) {
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            return (needCycleCheck = false);
                        }
                    }
                }
            });
            if (expired && noLoads.length) {
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }
            if (needCycleCheck) {
                each(waitAry, function (mod) {
                    if (mod.defined) {
                        return;
                    }
                    var cycleMod = findCycle(mod, {}),
                        traced = {};
                    if (cycleMod) {
                        forceExec(cycleMod, traced, {});
                        eachProp(traced, modCheck);
                    }
                });
                eachProp(registry, modCheck);
            }
            if ((!expired || usingPathFallback) && stillLoading) {
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }
            inCheckLoaded = false;
        }
        Module = function (map) {
            this.events = undefEvents[map.id] || {};
            this.map = map;
            this.shim = config.shim[map.id];
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;
        };
        Module.prototype = {
            init: function(depMaps, factory, errback, options) {
                options = options || {};
                if (this.inited) {
                    return;
                }
                this.factory = factory;
                if (errback) {
                    this.on('error', errback);
                } else if (this.events.error) {
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }
                this.depMaps = depMaps && depMaps.slice(0);
                this.depMaps.rjsSkipMap = depMaps.rjsSkipMap;
                this.errback = errback;
                this.inited = true;
                this.ignore = options.ignore;
                if (options.enabled || this.enabled) {
                    this.enable();
                } else {
                    this.check();
                }
            },
            defineDepById: function (id, depExports) {
                var i;
                each(this.depMaps, function (map, index) {
                    if (map.id === id) {
                        i = index;
                        return true;
                    }
                });
                return this.defineDep(i, depExports);
            },
            defineDep: function (i, depExports) {
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },
            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;
                context.startTime = (new Date()).getTime();
                var map = this.map;
                if (this.shim) {
                    makeRequire(this, true)(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },
            load: function() {
                var url = this.map.url;
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },
            check: function (silent) {
                if (!this.enabled || this.enabling) {
                    return;
                }
                var id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory,
                    err, cjsModule;
                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    this.defining = true;
                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            if (this.events.error) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }
                            if (this.map.isDefine) {
                                cjsModule = this.module;
                                if (cjsModule &&
                                    cjsModule.exports !== undefined &&
                                    cjsModule.exports !== this.exports) {
                                    exports = cjsModule.exports;
                                } else if (exports === undefined && this.usingExports) {
                                    exports = this.exports;
                                }
                            }
                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = [this.map.id];
                                err.requireType = 'define';
                                return onError((this.error = err));
                            }
                        } else {
                            exports = factory;
                        }
                        this.exports = exports;
                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;
                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }
                        delete registry[id];
                        this.defined = true;
                        context.waitCount -= 1;
                        if (context.waitCount === 0) {
                            waitAry = [];
                        }
                    }
                    this.defining = false;
                    if (!silent) {
                        if (this.defined && !this.defineEmitted) {
                            this.defineEmitted = true;
                            this.emit('defined', this.exports);
                            this.defineEmitComplete = true;
                        }
                    }
                }
            },
            callPlugin: function() {
                var map = this.map,
                    id = map.id,
                    pluginMap = makeModuleMap(map.prefix, null, false, true);
                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        load, normalizedMap, normalizedMod;
                    if (this.map.unnormalized) {
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap,
                                                      false,
                                                      true);
                        on(normalizedMap,
                           'defined', bind(this, function (value) {
                            this.init([], function () { return value; }, null, {
                                enabled: true,
                                ignore: true
                            });
                        }));
                        normalizedMod = registry[normalizedMap.id];
                        if (normalizedMod) {
                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }
                        return;
                    }
                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });
                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                removeWaiting(mod.map.id);
                            }
                        });
                        onError(err);
                    });
                    load.fromText = function (moduleName, text) {
                        /*jslint evil: true */
                        var hasInteractive = useInteractive;
                        if (hasInteractive) {
                            useInteractive = false;
                        }
                        getModule(makeModuleMap(moduleName));
                        req.exec(text);
                        if (hasInteractive) {
                            useInteractive = true;
                        }
                        context.completeLoad(moduleName);
                    };
                    plugin.load(map.name, makeRequire(map.parentMap, true, function (deps, cb) {
                        deps.rjsSkipMap = true;
                        return context.require(deps, cb);
                    }), load, config);
                }));
                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },
            enable: function () {
                this.enabled = true;
                if (!this.waitPushed) {
                    waitAry.push(this);
                    context.waitCount += 1;
                    this.waitPushed = true;
                }
                this.enabling = true;
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;
                    if (typeof depMap === 'string') {
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.depMaps.rjsSkipMap);
                        this.depMaps[i] = depMap;
                        handler = handlers[depMap.id];
                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }
                        this.depCount += 1;
                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));
                        if (this.errback) {
                            on(depMap, 'error', this.errback);
                        }
                    }
                    id = depMap.id;
                    mod = registry[id];
                    if (!handlers[id] && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = registry[pluginMap.id];
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));
                this.enabling = false;
                this.check();
            },
            on: function(name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },
            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    delete this.events[name];
                }
            }
        };
        function callGetModule(args) {
            getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
        }
        function removeListener(node, func, name, ieName) {
            if (node.detachEvent && !isOpera) {
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }
        /**
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            var node = evt.currentTarget || evt.srcElement;
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');
            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }
        return (context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            waitCount: 0,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            /**
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }
                var pkgs = config.pkgs,
                    shim = config.shim,
                    paths = config.paths,
                    map = config.map;
                mixin(config, cfg, true);
                config.paths = mixin(paths, cfg.paths, true);
                if (cfg.map) {
                    config.map = mixin(map || {}, cfg.map, true, true);
                }
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if (value.exports && !value.exports.__buildReady) {
                            value.exports = context.makeShimExports(value.exports);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location;
                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        location = pkgObj.location;
                        pkgs[pkgObj.name] = {
                            name: pkgObj.name,
                            location: location || pkgObj.name,
                            main: (pkgObj.main || 'main')
                                  .replace(currDirRegExp, '')
                                  .replace(jsSuffixRegExp, '')
                        };
                    });
                    config.pkgs = pkgs;
                }
                eachProp(registry, function (mod, id) {
                    mod.map = makeModuleMap(id);
                });
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },
            makeShimExports: function (exports) {
                var func;
                if (typeof exports === 'string') {
                    func = function () {
                        return getGlobal(exports);
                    };
                    func.exports = exports;
                    return func;
                } else {
                    return function () {
                        return exports.apply(global, arguments);
                    };
                }
            },
            requireDefined: function (id, relMap) {
                return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
            },
            requireSpecified: function (id, relMap) {
                id = makeModuleMap(id, relMap, false, true).id;
                return hasProp(defined, id) || hasProp(registry, id);
            },
            require: function (deps, callback, errback, relMap) {
                var moduleName, id, map, requireMod, args;
                if (typeof deps === 'string') {
                    if (isFunction(callback)) {
                        return onError(makeError('requireargs', 'Invalid require call'), errback);
                    }
                    if (req.get) {
                        return req.get(context, deps, callback);
                    }
                    moduleName = deps;
                    relMap = callback;
                    map = makeModuleMap(moduleName, relMap, false, true);
                    id = map.id;
                    if (!hasProp(defined, id)) {
                        return onError(makeError('notloaded', 'Module name "' +
                                    id +
                                    '" has not been loaded yet for context: ' +
                                    contextName));
                    }
                    return defined[id];
                }
                if (errback && !isFunction(errback)) {
                    relMap = errback;
                    errback = undefined;
                }
                if (callback && !isFunction(callback)) {
                    relMap = callback;
                    callback = undefined;
                }
                takeGlobalQueue();
                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                    } else {
                        callGetModule(args);
                    }
                }
                requireMod = getModule(makeModuleMap(null, relMap));
                requireMod.init(deps, callback, errback, {
                    enabled: true
                });
                checkLoaded();
                return context.require;
            },
            undef: function (id) {
                var map = makeModuleMap(id, null, true),
                    mod = registry[id];
                delete defined[id];
                delete urlFetched[map.url];
                delete undefEvents[id];
                if (mod) {
                    if (mod.events.defined) {
                        undefEvents[id] = mod.events;
                    }
                    removeWaiting(id);
                }
            },
            enable: function (depMap, parent) {
                var mod = registry[depMap.id];
                if (mod) {
                    getModule(depMap).enable();
                }
            },
            /**
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var shim = config.shim[moduleName] || {},
                shExports = shim.exports && shim.exports.exports,
                found, args, mod;
                takeGlobalQueue();
                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        found = true;
                    }
                    callGetModule(args);
                }
                mod = registry[moduleName];
                if (!found &&
                    !defined[moduleName] &&
                    mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        callGetModule([moduleName, (shim.deps || []), shim.exports]);
                    }
                }
                checkLoaded();
            },
            toUrl: function (moduleNamePlusExt, relModuleMap) {
                var index = moduleNamePlusExt.lastIndexOf('.'),
                    ext = null;
                if (index !== -1) {
                    ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                    moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                }
                return context.nameToUrl(moduleNamePlusExt, ext, relModuleMap);
            },
            nameToUrl: function (moduleName, ext, relModuleMap) {
                var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url,
                    parentPath;
                moduleName = normalize(moduleName, relModuleMap && relModuleMap.id, true);
                if (req.jsExtRegExp.test(moduleName)) {
                    url = moduleName + (ext || '');
                } else {
                    paths = config.paths;
                    pkgs = config.pkgs;
                    syms = moduleName.split('/');
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        pkg = pkgs[parentModule];
                        parentPath = paths[parentModule];
                        if (parentPath) {
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        } else if (pkg) {
                            if (moduleName === pkg.name) {
                                pkgPath = pkg.location + '/' + pkg.main;
                            } else {
                                pkgPath = pkg.location;
                            }
                            syms.splice(0, i, pkgPath);
                            break;
                        }
                    }
                    url = syms.join('/') + (ext || '.js');
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }
                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },
            load: function (id, url) {
                req.load(context, id, url);
            },
            /**
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },
            /**
             * @param {Event} evt the event from the browser for the script
             */
            onScriptLoad: function (evt) {
                if (evt.type === 'load' ||
                    (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    interactiveScript = null;
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error', evt, [data.id]));
                }
            }
        });
    }
    req = requirejs = function (deps, callback, errback, optional) {
        var contextName = defContextName,
            context, config;
        if (!isArray(deps) && typeof deps !== 'string') {
            config = deps;
            if (isArray(callback)) {
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }
        if (config && config.context) {
            contextName = config.context;
        }
        context = contexts[contextName];
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }
        if (config) {
            context.configure(config);
        }
        return context.require(deps, callback, errback);
    };
    req.config = function (config) {
        return req(config);
    };
    if (!require) {
        require = req;
    }
    req.version = version;
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };
    req({});
    addRequireMethods(req);
    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }
    /**
     * @param {Error} err the error object.
     */
    req.onError = function (err) {
        throw err;
    };
    /**
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            node = config.xhtml ?
            document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
            document.createElement('script');
            node.type = config.scriptType || 'text/javascript';
            node.charset = 'utf-8';
            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);
            if (node.attachEvent &&
                !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                !isOpera) {
                useInteractive = true;
                node.attachEvent('onreadystatechange', context.onScriptLoad);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;
            return node;
        } else if (isWebWorker) {
            importScripts(url);
            context.completeLoad(moduleName);
        }
    };
    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }
        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }
    if (isBrowser) {
        eachReverse(scripts(), function (script) {
            if (!head) {
                head = script.parentNode;
            }
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                src = dataMain.split('/');
                mainScript = src.pop();
                subPath = src.length ? src.join('/')  + '/' : './';
                if (!cfg.baseUrl) {
                    cfg.baseUrl = subPath;
                }
                dataMain = mainScript.replace(jsSuffixRegExp, '');
                cfg.deps = cfg.deps ? cfg.deps.concat(dataMain) : [dataMain];
                return true;
            }
        });
    }
    define = function (name, deps, callback) {
        var node, context;
        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }
        if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }
        if (!deps.length && isFunction(callback)) {
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };
    define.amd = {
        jQuery: true
    };
    /**
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        return eval(text);
    };
    req(cfg);
}(this));
