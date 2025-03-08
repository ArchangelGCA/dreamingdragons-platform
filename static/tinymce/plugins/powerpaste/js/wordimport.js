/* !
 * Tiny PowerPaste plugin
 *
 * Copyright (c) 2023 Ephox Corporation DBA Tiny Technologies, Inc.
 * Licensed under the Tiny commercial license. See https://www.tiny.cloud/legal/
 *
 * Version: 7.7.1-150
 */

"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name42 in all)
      __defProp(target, name42, { get: all[name42], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/base64.js
  var require_base64 = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/base64.js"(exports) {
      var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
      exports.encode = function(number2) {
        if (0 <= number2 && number2 < intToCharMap.length) {
          return intToCharMap[number2];
        }
        throw new TypeError("Must be between 0 and 63: " + number2);
      };
      exports.decode = function(charCode) {
        var bigA = 65;
        var bigZ = 90;
        var littleA = 97;
        var littleZ = 122;
        var zero3 = 48;
        var nine = 57;
        var plus = 43;
        var slash = 47;
        var littleOffset = 26;
        var numberOffset = 52;
        if (bigA <= charCode && charCode <= bigZ) {
          return charCode - bigA;
        }
        if (littleA <= charCode && charCode <= littleZ) {
          return charCode - littleA + littleOffset;
        }
        if (zero3 <= charCode && charCode <= nine) {
          return charCode - zero3 + numberOffset;
        }
        if (charCode == plus) {
          return 62;
        }
        if (charCode == slash) {
          return 63;
        }
        return -1;
      };
    }
  });

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/base64-vlq.js
  var require_base64_vlq = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/base64-vlq.js"(exports) {
      var base64 = require_base64();
      var VLQ_BASE_SHIFT = 5;
      var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
      var VLQ_BASE_MASK = VLQ_BASE - 1;
      var VLQ_CONTINUATION_BIT = VLQ_BASE;
      function toVLQSigned(aValue) {
        return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
      }
      function fromVLQSigned(aValue) {
        var isNegative = (aValue & 1) === 1;
        var shifted = aValue >> 1;
        return isNegative ? -shifted : shifted;
      }
      exports.encode = function base64VLQ_encode(aValue) {
        var encoded = "";
        var digit;
        var vlq = toVLQSigned(aValue);
        do {
          digit = vlq & VLQ_BASE_MASK;
          vlq >>>= VLQ_BASE_SHIFT;
          if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
          }
          encoded += base64.encode(digit);
        } while (vlq > 0);
        return encoded;
      };
      exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
        var strLen = aStr.length;
        var result = 0;
        var shift = 0;
        var continuation, digit;
        do {
          if (aIndex >= strLen) {
            throw new Error("Expected more digits in base 64 VLQ value.");
          }
          digit = base64.decode(aStr.charCodeAt(aIndex++));
          if (digit === -1) {
            throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
          }
          continuation = !!(digit & VLQ_CONTINUATION_BIT);
          digit &= VLQ_BASE_MASK;
          result = result + (digit << shift);
          shift += VLQ_BASE_SHIFT;
        } while (continuation);
        aOutParam.value = fromVLQSigned(result);
        aOutParam.rest = aIndex;
      };
    }
  });

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/util.js
  var require_util = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/util.js"(exports) {
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        } else {
          throw new Error('"' + aName + '" is a required argument.');
        }
      }
      exports.getArg = getArg;
      var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
      var dataUrlRegexp = /^data:.+\,.+$/;
      function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports.urlParse = urlParse;
      function urlGenerate(aParsedUrl) {
        var url = "";
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ":";
        }
        url += "//";
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + "@";
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ":" + aParsedUrl.port;
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports.urlGenerate = urlGenerate;
      var MAX_CACHED_INPUTS = 32;
      function lruMemoize(f2) {
        var cache = [];
        return function(input) {
          for (var i2 = 0; i2 < cache.length; i2++) {
            if (cache[i2].input === input) {
              var temp = cache[0];
              cache[0] = cache[i2];
              cache[i2] = temp;
              return cache[0].result;
            }
          }
          var result = f2(input);
          cache.unshift({
            input,
            result
          });
          if (cache.length > MAX_CACHED_INPUTS) {
            cache.pop();
          }
          return result;
        };
      }
      var normalize = lruMemoize(function normalize2(aPath) {
        var path = aPath;
        var url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        var isAbsolute = exports.isAbsolute(path);
        var parts = [];
        var start = 0;
        var i2 = 0;
        while (true) {
          start = i2;
          i2 = path.indexOf("/", start);
          if (i2 === -1) {
            parts.push(path.slice(start));
            break;
          } else {
            parts.push(path.slice(start, i2));
            while (i2 < path.length && path[i2] === "/") {
              i2++;
            }
          }
        }
        for (var part, up = 0, i2 = parts.length - 1; i2 >= 0; i2--) {
          part = parts[i2];
          if (part === ".") {
            parts.splice(i2, 1);
          } else if (part === "..") {
            up++;
          } else if (up > 0) {
            if (part === "") {
              parts.splice(i2 + 1, up);
              up = 0;
            } else {
              parts.splice(i2, 2);
              up--;
            }
          }
        }
        path = parts.join("/");
        if (path === "") {
          path = isAbsolute ? "/" : ".";
        }
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      });
      exports.normalize = normalize;
      function join(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        if (aPath === "") {
          aPath = ".";
        }
        var aPathUrl = urlParse(aPath);
        var aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || "/";
        }
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
        var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports.join = join;
      exports.isAbsolute = function(aPath) {
        return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
      };
      function relative(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        aRoot = aRoot.replace(/\/$/, "");
        var level = 0;
        while (aPath.indexOf(aRoot + "/") !== 0) {
          var index2 = aRoot.lastIndexOf("/");
          if (index2 < 0) {
            return aPath;
          }
          aRoot = aRoot.slice(0, index2);
          if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
            return aPath;
          }
          ++level;
        }
        return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
      }
      exports.relative = relative;
      var supportsNullProto = function() {
        var obj = /* @__PURE__ */ Object.create(null);
        return !("__proto__" in obj);
      }();
      function identity(s) {
        return s;
      }
      function toSetString(aStr) {
        if (isProtoString(aStr)) {
          return "$" + aStr;
        }
        return aStr;
      }
      exports.toSetString = supportsNullProto ? identity : toSetString;
      function fromSetString(aStr) {
        if (isProtoString(aStr)) {
          return aStr.slice(1);
        }
        return aStr;
      }
      exports.fromSetString = supportsNullProto ? identity : fromSetString;
      function isProtoString(s) {
        if (!s) {
          return false;
        }
        var length6 = s.length;
        if (length6 < 9) {
          return false;
        }
        if (s.charCodeAt(length6 - 1) !== 95 || s.charCodeAt(length6 - 2) !== 95 || s.charCodeAt(length6 - 3) !== 111 || s.charCodeAt(length6 - 4) !== 116 || s.charCodeAt(length6 - 5) !== 111 || s.charCodeAt(length6 - 6) !== 114 || s.charCodeAt(length6 - 7) !== 112 || s.charCodeAt(length6 - 8) !== 95 || s.charCodeAt(length6 - 9) !== 95) {
          return false;
        }
        for (var i2 = length6 - 10; i2 >= 0; i2--) {
          if (s.charCodeAt(i2) !== 36) {
            return false;
          }
        }
        return true;
      }
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0 || onlyCompareOriginal) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByOriginalPositions = compareByOriginalPositions;
      function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
        var cmp;
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0 || onlyCompareOriginal) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;
      function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0 || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
      function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
        var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0 || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;
      function strcmp(aStr1, aStr2) {
        if (aStr1 === aStr2) {
          return 0;
        }
        if (aStr1 === null) {
          return 1;
        }
        if (aStr2 === null) {
          return -1;
        }
        if (aStr1 > aStr2) {
          return 1;
        }
        return -1;
      }
      function compareByGeneratedPositionsInflated(mappingA, mappingB) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
      function parseSourceMapInput(str) {
        return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
      }
      exports.parseSourceMapInput = parseSourceMapInput;
      function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
        sourceURL = sourceURL || "";
        if (sourceRoot) {
          if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
            sourceRoot += "/";
          }
          sourceURL = sourceRoot + sourceURL;
        }
        if (sourceMapURL) {
          var parsed = urlParse(sourceMapURL);
          if (!parsed) {
            throw new Error("sourceMapURL could not be parsed");
          }
          if (parsed.path) {
            var index2 = parsed.path.lastIndexOf("/");
            if (index2 >= 0) {
              parsed.path = parsed.path.substring(0, index2 + 1);
            }
          }
          sourceURL = join(urlGenerate(parsed), sourceURL);
        }
        return normalize(sourceURL);
      }
      exports.computeSourceURL = computeSourceURL;
    }
  });

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/array-set.js
  var require_array_set = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/array-set.js"(exports) {
      var util = require_util();
      var has = Object.prototype.hasOwnProperty;
      var hasNativeMap = typeof Map !== "undefined";
      function ArraySet() {
        this._array = [];
        this._set = hasNativeMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
      }
      ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
        var set3 = new ArraySet();
        for (var i2 = 0, len = aArray.length; i2 < len; i2++) {
          set3.add(aArray[i2], aAllowDuplicates);
        }
        return set3;
      };
      ArraySet.prototype.size = function ArraySet_size() {
        return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
      };
      ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
        var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
        var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
        var idx = this._array.length;
        if (!isDuplicate || aAllowDuplicates) {
          this._array.push(aStr);
        }
        if (!isDuplicate) {
          if (hasNativeMap) {
            this._set.set(aStr, idx);
          } else {
            this._set[sStr] = idx;
          }
        }
      };
      ArraySet.prototype.has = function ArraySet_has(aStr) {
        if (hasNativeMap) {
          return this._set.has(aStr);
        } else {
          var sStr = util.toSetString(aStr);
          return has.call(this._set, sStr);
        }
      };
      ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
        if (hasNativeMap) {
          var idx = this._set.get(aStr);
          if (idx >= 0) {
            return idx;
          }
        } else {
          var sStr = util.toSetString(aStr);
          if (has.call(this._set, sStr)) {
            return this._set[sStr];
          }
        }
        throw new Error('"' + aStr + '" is not in the set.');
      };
      ArraySet.prototype.at = function ArraySet_at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
          return this._array[aIdx];
        }
        throw new Error("No element indexed by " + aIdx);
      };
      ArraySet.prototype.toArray = function ArraySet_toArray() {
        return this._array.slice();
      };
      exports.ArraySet = ArraySet;
    }
  });

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/mapping-list.js
  var require_mapping_list = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/mapping-list.js"(exports) {
      var util = require_util();
      function generatedPositionAfter(mappingA, mappingB) {
        var lineA = mappingA.generatedLine;
        var lineB = mappingB.generatedLine;
        var columnA = mappingA.generatedColumn;
        var columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
      }
      function MappingList() {
        this._array = [];
        this._sorted = true;
        this._last = { generatedLine: -1, generatedColumn: 0 };
      }
      MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      };
      MappingList.prototype.add = function MappingList_add(aMapping) {
        if (generatedPositionAfter(this._last, aMapping)) {
          this._last = aMapping;
          this._array.push(aMapping);
        } else {
          this._sorted = false;
          this._array.push(aMapping);
        }
      };
      MappingList.prototype.toArray = function MappingList_toArray() {
        if (!this._sorted) {
          this._array.sort(util.compareByGeneratedPositionsInflated);
          this._sorted = true;
        }
        return this._array;
      };
      exports.MappingList = MappingList;
    }
  });

  // ../../node_modules/css-tree/node_modules/source-map-js/lib/source-map-generator.js
  var require_source_map_generator = __commonJS({
    "../../node_modules/css-tree/node_modules/source-map-js/lib/source-map-generator.js"(exports) {
      var base64VLQ = require_base64_vlq();
      var util = require_util();
      var ArraySet = require_array_set().ArraySet;
      var MappingList = require_mapping_list().MappingList;
      function SourceMapGenerator2(aArgs) {
        if (!aArgs) {
          aArgs = {};
        }
        this._file = util.getArg(aArgs, "file", null);
        this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
        this._skipValidation = util.getArg(aArgs, "skipValidation", false);
        this._sources = new ArraySet();
        this._names = new ArraySet();
        this._mappings = new MappingList();
        this._sourcesContents = null;
      }
      SourceMapGenerator2.prototype._version = 3;
      SourceMapGenerator2.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot;
        var generator = new SourceMapGenerator2({
          file: aSourceMapConsumer.file,
          sourceRoot
        });
        aSourceMapConsumer.eachMapping(function(mapping) {
          var newMapping = {
            generated: {
              line: mapping.generatedLine,
              column: mapping.generatedColumn
            }
          };
          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util.relative(sourceRoot, newMapping.source);
            }
            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };
            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }
          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function(sourceFile) {
          var sourceRelative = sourceFile;
          if (sourceRoot !== null) {
            sourceRelative = util.relative(sourceRoot, sourceFile);
          }
          if (!generator._sources.has(sourceRelative)) {
            generator._sources.add(sourceRelative);
          }
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      };
      SourceMapGenerator2.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
        var generated = util.getArg(aArgs, "generated");
        var original = util.getArg(aArgs, "original", null);
        var source = util.getArg(aArgs, "source", null);
        var name42 = util.getArg(aArgs, "name", null);
        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name42);
        }
        if (source != null) {
          source = String(source);
          if (!this._sources.has(source)) {
            this._sources.add(source);
          }
        }
        if (name42 != null) {
          name42 = String(name42);
          if (!this._names.has(name42)) {
            this._names.add(name42);
          }
        }
        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original != null && original.line,
          originalColumn: original != null && original.column,
          source,
          name: name42
        });
      };
      SourceMapGenerator2.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util.relative(this._sourceRoot, source);
        }
        if (aSourceContent != null) {
          if (!this._sourcesContents) {
            this._sourcesContents = /* @__PURE__ */ Object.create(null);
          }
          this._sourcesContents[util.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          delete this._sourcesContents[util.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      };
      SourceMapGenerator2.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error(
              `SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`
            );
          }
          sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        var newSources = new ArraySet();
        var newNames = new ArraySet();
        this._mappings.unsortedForEach(function(mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            var original = aSourceMapConsumer.originalPositionFor({
              line: mapping.originalLine,
              column: mapping.originalColumn
            });
            if (original.source != null) {
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }
          var source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }
          var name42 = mapping.name;
          if (name42 != null && !newNames.has(name42)) {
            newNames.add(name42);
          }
        }, this);
        this._sources = newSources;
        this._names = newNames;
        aSourceMapConsumer.sources.forEach(function(sourceFile2) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile2);
          if (content != null) {
            if (aSourceMapPath != null) {
              sourceFile2 = util.join(aSourceMapPath, sourceFile2);
            }
            if (sourceRoot != null) {
              sourceFile2 = util.relative(sourceRoot, sourceFile2);
            }
            this.setSourceContent(sourceFile2, content);
          }
        }, this);
      };
      SourceMapGenerator2.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
        if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
          throw new Error(
            "original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values."
          );
        }
        if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
          return;
        } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
          return;
        } else {
          throw new Error("Invalid mapping: " + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
          }));
        }
      };
      SourceMapGenerator2.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
        var previousGeneratedColumn = 0;
        var previousGeneratedLine = 1;
        var previousOriginalColumn = 0;
        var previousOriginalLine = 0;
        var previousName = 0;
        var previousSource = 0;
        var result = "";
        var next;
        var mapping;
        var nameIdx;
        var sourceIdx;
        var mappings = this._mappings.toArray();
        for (var i2 = 0, len = mappings.length; i2 < len; i2++) {
          mapping = mappings[i2];
          next = "";
          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              next += ";";
              previousGeneratedLine++;
            }
          } else {
            if (i2 > 0) {
              if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i2 - 1])) {
                continue;
              }
              next += ",";
            }
          }
          next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
          previousGeneratedColumn = mapping.generatedColumn;
          if (mapping.source != null) {
            sourceIdx = this._sources.indexOf(mapping.source);
            next += base64VLQ.encode(sourceIdx - previousSource);
            previousSource = sourceIdx;
            next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
            previousOriginalLine = mapping.originalLine - 1;
            next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
            previousOriginalColumn = mapping.originalColumn;
            if (mapping.name != null) {
              nameIdx = this._names.indexOf(mapping.name);
              next += base64VLQ.encode(nameIdx - previousName);
              previousName = nameIdx;
            }
          }
          result += next;
        }
        return result;
      };
      SourceMapGenerator2.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function(source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util.relative(aSourceRoot, source);
          }
          var key = util.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
        }, this);
      };
      SourceMapGenerator2.prototype.toJSON = function SourceMapGenerator_toJSON() {
        var map11 = {
          version: this._version,
          sources: this._sources.toArray(),
          names: this._names.toArray(),
          mappings: this._serializeMappings()
        };
        if (this._file != null) {
          map11.file = this._file;
        }
        if (this._sourceRoot != null) {
          map11.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map11.sourcesContent = this._generateSourcesContent(map11.sources, map11.sourceRoot);
        }
        return map11;
      };
      SourceMapGenerator2.prototype.toString = function SourceMapGenerator_toString() {
        return JSON.stringify(this.toJSON());
      };
      exports.SourceMapGenerator = SourceMapGenerator2;
    }
  });

  // ../../node_modules/rescript/lib/es6/caml_array.js
  function sub(x, offset, len) {
    var result = new Array(len);
    var j = 0;
    var i2 = offset;
    while (j < len) {
      result[j] = x[i2];
      j = j + 1 | 0;
      i2 = i2 + 1 | 0;
    }
    ;
    return result;
  }
  function set(xs, index2, newval) {
    if (index2 < 0 || index2 >= xs.length) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "index out of bounds",
        Error: new Error()
      };
    }
    xs[index2] = newval;
  }
  function get(xs, index2) {
    if (index2 < 0 || index2 >= xs.length) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "index out of bounds",
        Error: new Error()
      };
    }
    return xs[index2];
  }
  function make(len, init4) {
    var b = new Array(len);
    for (var i2 = 0; i2 < len; ++i2) {
      b[i2] = init4;
    }
    return b;
  }
  function blit(a1, i1, a2, i2, len) {
    if (i2 <= i1) {
      for (var j = 0; j < len; ++j) {
        a2[j + i2 | 0] = a1[j + i1 | 0];
      }
      return;
    }
    for (var j$1 = len - 1 | 0; j$1 >= 0; --j$1) {
      a2[j$1 + i2 | 0] = a1[j$1 + i1 | 0];
    }
  }

  // ../../node_modules/rescript/lib/es6/curry.js
  function app(_f, _args) {
    while (true) {
      var args = _args;
      var f2 = _f;
      var init_arity = f2.length;
      var arity = init_arity === 0 ? 1 : init_arity;
      var len = args.length;
      var d = arity - len | 0;
      if (d === 0) {
        return f2.apply(null, args);
      }
      if (d >= 0) {
        return /* @__PURE__ */ function(f3, args2) {
          return function(x) {
            return app(f3, args2.concat([x]));
          };
        }(f2, args);
      }
      _args = sub(args, arity, -d | 0);
      _f = f2.apply(null, sub(args, 0, arity));
      continue;
    }
    ;
  }
  function _1(o, a0) {
    var arity = o.length;
    if (arity === 1) {
      return o(a0);
    } else {
      switch (arity) {
        case 1:
          return o(a0);
        case 2:
          return function(param) {
            return o(a0, param);
          };
        case 3:
          return function(param, param$1) {
            return o(a0, param, param$1);
          };
        case 4:
          return function(param, param$1, param$2) {
            return o(a0, param, param$1, param$2);
          };
        case 5:
          return function(param, param$1, param$2, param$3) {
            return o(a0, param, param$1, param$2, param$3);
          };
        case 6:
          return function(param, param$1, param$2, param$3, param$4) {
            return o(a0, param, param$1, param$2, param$3, param$4);
          };
        case 7:
          return function(param, param$1, param$2, param$3, param$4, param$5) {
            return o(a0, param, param$1, param$2, param$3, param$4, param$5);
          };
        default:
          return app(o, [a0]);
      }
    }
  }
  function __1(o) {
    var arity = o.length;
    if (arity === 1) {
      return o;
    } else {
      return function(a0) {
        return _1(o, a0);
      };
    }
  }
  function _2(o, a0, a1) {
    var arity = o.length;
    if (arity === 2) {
      return o(a0, a1);
    } else {
      switch (arity) {
        case 1:
          return app(o(a0), [a1]);
        case 2:
          return o(a0, a1);
        case 3:
          return function(param) {
            return o(a0, a1, param);
          };
        case 4:
          return function(param, param$1) {
            return o(a0, a1, param, param$1);
          };
        case 5:
          return function(param, param$1, param$2) {
            return o(a0, a1, param, param$1, param$2);
          };
        case 6:
          return function(param, param$1, param$2, param$3) {
            return o(a0, a1, param, param$1, param$2, param$3);
          };
        case 7:
          return function(param, param$1, param$2, param$3, param$4) {
            return o(a0, a1, param, param$1, param$2, param$3, param$4);
          };
        default:
          return app(o, [
            a0,
            a1
          ]);
      }
    }
  }
  function _3(o, a0, a1, a2) {
    var arity = o.length;
    if (arity === 3) {
      return o(a0, a1, a2);
    } else {
      switch (arity) {
        case 1:
          return app(o(a0), [
            a1,
            a2
          ]);
        case 2:
          return app(o(a0, a1), [a2]);
        case 3:
          return o(a0, a1, a2);
        case 4:
          return function(param) {
            return o(a0, a1, a2, param);
          };
        case 5:
          return function(param, param$1) {
            return o(a0, a1, a2, param, param$1);
          };
        case 6:
          return function(param, param$1, param$2) {
            return o(a0, a1, a2, param, param$1, param$2);
          };
        case 7:
          return function(param, param$1, param$2, param$3) {
            return o(a0, a1, a2, param, param$1, param$2, param$3);
          };
        default:
          return app(o, [
            a0,
            a1,
            a2
          ]);
      }
    }
  }
  function _4(o, a0, a1, a2, a3) {
    var arity = o.length;
    if (arity === 4) {
      return o(a0, a1, a2, a3);
    } else {
      switch (arity) {
        case 1:
          return app(o(a0), [
            a1,
            a2,
            a3
          ]);
        case 2:
          return app(o(a0, a1), [
            a2,
            a3
          ]);
        case 3:
          return app(o(a0, a1, a2), [a3]);
        case 4:
          return o(a0, a1, a2, a3);
        case 5:
          return function(param) {
            return o(a0, a1, a2, a3, param);
          };
        case 6:
          return function(param, param$1) {
            return o(a0, a1, a2, a3, param, param$1);
          };
        case 7:
          return function(param, param$1, param$2) {
            return o(a0, a1, a2, a3, param, param$1, param$2);
          };
        default:
          return app(o, [
            a0,
            a1,
            a2,
            a3
          ]);
      }
    }
  }
  function _5(o, a0, a1, a2, a3, a4) {
    var arity = o.length;
    if (arity === 5) {
      return o(a0, a1, a2, a3, a4);
    } else {
      switch (arity) {
        case 1:
          return app(o(a0), [
            a1,
            a2,
            a3,
            a4
          ]);
        case 2:
          return app(o(a0, a1), [
            a2,
            a3,
            a4
          ]);
        case 3:
          return app(o(a0, a1, a2), [
            a3,
            a4
          ]);
        case 4:
          return app(o(a0, a1, a2, a3), [a4]);
        case 5:
          return o(a0, a1, a2, a3, a4);
        case 6:
          return function(param) {
            return o(a0, a1, a2, a3, a4, param);
          };
        case 7:
          return function(param, param$1) {
            return o(a0, a1, a2, a3, a4, param, param$1);
          };
        default:
          return app(o, [
            a0,
            a1,
            a2,
            a3,
            a4
          ]);
      }
    }
  }

  // ../../node_modules/rescript/lib/es6/caml.js
  function string_compare(s1, s2) {
    if (s1 === s2) {
      return 0;
    } else if (s1 < s2) {
      return -1;
    } else {
      return 1;
    }
  }
  function i64_eq(x, y) {
    if (x[1] === y[1]) {
      return x[0] === y[0];
    } else {
      return false;
    }
  }
  function i64_ge(param, param$1) {
    var other_hi = param$1[0];
    var hi = param[0];
    if (hi > other_hi) {
      return true;
    } else if (hi < other_hi) {
      return false;
    } else {
      return param[1] >= param$1[1];
    }
  }
  function i64_gt(x, y) {
    if (x[0] > y[0]) {
      return true;
    } else if (x[0] < y[0]) {
      return false;
    } else {
      return x[1] > y[1];
    }
  }
  function i64_le(x, y) {
    return !i64_gt(x, y);
  }

  // ../../node_modules/rescript/lib/es6/caml_obj.js
  var for_in = function(o, foo) {
    for (var x in o) {
      foo(x);
    }
  };
  function equal(a, b) {
    if (a === b) {
      return true;
    }
    var a_type = typeof a;
    if (a_type === "string" || a_type === "number" || a_type === "bigint" || a_type === "boolean" || a_type === "undefined" || a === null) {
      return false;
    }
    var b_type = typeof b;
    if (a_type === "function" || b_type === "function") {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "equal: functional value",
        Error: new Error()
      };
    }
    if (b_type === "number" || b_type === "bigint" || b_type === "undefined" || b === null) {
      return false;
    }
    var tag_a = a.TAG;
    var tag_b = b.TAG;
    if (tag_a === 248) {
      return a[1] === b[1];
    }
    if (tag_a === 251) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "equal: abstract value",
        Error: new Error()
      };
    }
    if (tag_a !== tag_b) {
      return false;
    }
    var len_a = a.length | 0;
    var len_b = b.length | 0;
    if (len_a === len_b) {
      if (Array.isArray(a)) {
        var _i = 0;
        while (true) {
          var i2 = _i;
          if (i2 === len_a) {
            return true;
          }
          if (!equal(a[i2], b[i2])) {
            return false;
          }
          _i = i2 + 1 | 0;
          continue;
        }
        ;
      } else if (a instanceof Date && b instanceof Date) {
        return !(a > b || a < b);
      } else {
        var result = {
          contents: true
        };
        var do_key_a = function(key) {
          if (!Object.prototype.hasOwnProperty.call(b, key)) {
            result.contents = false;
            return;
          }
        };
        var do_key_b = function(key) {
          if (!Object.prototype.hasOwnProperty.call(a, key) || !equal(b[key], a[key])) {
            result.contents = false;
            return;
          }
        };
        for_in(a, do_key_a);
        if (result.contents) {
          for_in(b, do_key_b);
        }
        return result.contents;
      }
    } else {
      return false;
    }
  }
  function notequal(a, b) {
    if ((typeof a === "number" || typeof a === "bigint") && (typeof b === "number" || typeof b === "bigint")) {
      return a !== b;
    } else {
      return !equal(a, b);
    }
  }

  // ../../node_modules/rescript/lib/es6/caml_int64.js
  var min_int = [
    -2147483648,
    0
  ];
  var max_int = [
    2147483647,
    4294967295
  ];
  var one = [
    0,
    1
  ];
  var zero = [
    0,
    0
  ];
  var neg_one = [
    -1,
    4294967295
  ];
  function neg_signed(x) {
    return (x & -2147483648) !== 0;
  }
  function non_neg_signed(x) {
    return (x & -2147483648) === 0;
  }
  function neg(param) {
    var other_lo = (param[1] ^ -1) + 1 | 0;
    return [
      (param[0] ^ -1) + (other_lo === 0 ? 1 : 0) | 0,
      other_lo >>> 0
    ];
  }
  function add_aux(param, y_lo, y_hi) {
    var x_lo = param[1];
    var lo = x_lo + y_lo | 0;
    var overflow = neg_signed(x_lo) && (neg_signed(y_lo) || non_neg_signed(lo)) || neg_signed(y_lo) && non_neg_signed(lo) ? 1 : 0;
    return [
      param[0] + y_hi + overflow | 0,
      lo >>> 0
    ];
  }
  function add(self, param) {
    return add_aux(self, param[1], param[0]);
  }
  function sub_aux(x, lo, hi) {
    var y_lo = (lo ^ -1) + 1 >>> 0;
    var y_hi = (hi ^ -1) + (y_lo === 0 ? 1 : 0) | 0;
    return add_aux(x, y_lo, y_hi);
  }
  function sub2(self, param) {
    return sub_aux(self, param[1], param[0]);
  }
  function lsl_(x, numBits) {
    if (numBits === 0) {
      return x;
    }
    var lo = x[1];
    if (numBits >= 32) {
      return [
        lo << (numBits - 32 | 0),
        0
      ];
    } else {
      return [
        lo >>> (32 - numBits | 0) | x[0] << numBits,
        lo << numBits >>> 0
      ];
    }
  }
  function asr_(x, numBits) {
    if (numBits === 0) {
      return x;
    }
    var hi = x[0];
    if (numBits < 32) {
      return [
        hi >> numBits,
        (hi << (32 - numBits | 0) | x[1] >>> numBits) >>> 0
      ];
    } else {
      return [
        hi >= 0 ? 0 : -1,
        hi >> (numBits - 32 | 0) >>> 0
      ];
    }
  }
  function is_zero(x) {
    if (x[0] !== 0) {
      return false;
    } else {
      return x[1] === 0;
    }
  }
  function mul(_this, _other) {
    while (true) {
      var other = _other;
      var $$this = _this;
      var lo;
      var this_hi = $$this[0];
      var exit = 0;
      var exit$1 = 0;
      var exit$2 = 0;
      if (this_hi !== 0) {
        exit$2 = 4;
      } else {
        if ($$this[1] === 0) {
          return zero;
        }
        exit$2 = 4;
      }
      if (exit$2 === 4) {
        if (other[0] !== 0) {
          exit$1 = 3;
        } else {
          if (other[1] === 0) {
            return zero;
          }
          exit$1 = 3;
        }
      }
      if (exit$1 === 3) {
        if (this_hi !== -2147483648 || $$this[1] !== 0) {
          exit = 2;
        } else {
          lo = other[1];
        }
      }
      if (exit === 2) {
        var other_hi = other[0];
        var lo$1 = $$this[1];
        var exit$3 = 0;
        if (other_hi !== -2147483648 || other[1] !== 0) {
          exit$3 = 3;
        } else {
          lo = lo$1;
        }
        if (exit$3 === 3) {
          var other_lo = other[1];
          if (this_hi < 0) {
            if (other_hi >= 0) {
              return neg(mul(neg($$this), other));
            }
            _other = neg(other);
            _this = neg($$this);
            continue;
          }
          if (other_hi < 0) {
            return neg(mul($$this, neg(other)));
          }
          var a48 = this_hi >>> 16;
          var a32 = this_hi & 65535;
          var a16 = lo$1 >>> 16;
          var a00 = lo$1 & 65535;
          var b48 = other_hi >>> 16;
          var b32 = other_hi & 65535;
          var b16 = other_lo >>> 16;
          var b00 = other_lo & 65535;
          var c48 = 0;
          var c32 = 0;
          var c16 = 0;
          var c00 = a00 * b00;
          c16 = (c00 >>> 16) + a16 * b00;
          c32 = c16 >>> 16;
          c16 = (c16 & 65535) + a00 * b16;
          c32 = c32 + (c16 >>> 16) + a32 * b00;
          c48 = c32 >>> 16;
          c32 = (c32 & 65535) + a16 * b16;
          c48 = c48 + (c32 >>> 16);
          c32 = (c32 & 65535) + a00 * b32;
          c48 = c48 + (c32 >>> 16);
          c32 = c32 & 65535;
          c48 = c48 + (a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48) & 65535;
          return [
            c32 | c48 << 16,
            (c00 & 65535 | (c16 & 65535) << 16) >>> 0
          ];
        }
      }
      if ((lo & 1) === 0) {
        return zero;
      } else {
        return min_int;
      }
    }
    ;
  }
  function or_(param, param$1) {
    return [
      param[0] | param$1[0],
      (param[1] | param$1[1]) >>> 0
    ];
  }
  function to_float(param) {
    return param[0] * 4294967296 + param[1];
  }
  function of_float(x) {
    if (isNaN(x) || !isFinite(x)) {
      return zero;
    }
    if (x <= -9223372036854776e3) {
      return min_int;
    }
    if (x + 1 >= 9223372036854776e3) {
      return max_int;
    }
    if (x < 0) {
      return neg(of_float(-x));
    }
    var hi = x / 4294967296 | 0;
    var lo = x % 4294967296 | 0;
    return [
      hi,
      lo >>> 0
    ];
  }
  function div(_self, _other) {
    while (true) {
      var other = _other;
      var self = _self;
      var self_hi = self[0];
      var exit = 0;
      var exit$1 = 0;
      if (other[0] !== 0 || other[1] !== 0) {
        exit$1 = 2;
      } else {
        throw {
          RE_EXN_ID: "Division_by_zero",
          Error: new Error()
        };
      }
      if (exit$1 === 2) {
        if (self_hi !== -2147483648) {
          if (self_hi !== 0) {
            exit = 1;
          } else {
            if (self[1] === 0) {
              return zero;
            }
            exit = 1;
          }
        } else if (self[1] !== 0) {
          exit = 1;
        } else {
          if (i64_eq(other, one) || i64_eq(other, neg_one)) {
            return self;
          }
          if (i64_eq(other, min_int)) {
            return one;
          }
          var half_this = asr_(self, 1);
          var approx = lsl_(div(half_this, other), 1);
          var exit$2 = 0;
          if (approx[0] !== 0) {
            exit$2 = 3;
          } else {
            if (approx[1] === 0) {
              if (other[0] < 0) {
                return one;
              } else {
                return neg(one);
              }
            }
            exit$2 = 3;
          }
          if (exit$2 === 3) {
            var rem = sub2(self, mul(other, approx));
            return add(approx, div(rem, other));
          }
        }
      }
      if (exit === 1) {
        var other_hi = other[0];
        var exit$3 = 0;
        if (other_hi !== -2147483648) {
          exit$3 = 2;
        } else {
          if (other[1] === 0) {
            return zero;
          }
          exit$3 = 2;
        }
        if (exit$3 === 2) {
          if (self_hi < 0) {
            if (other_hi >= 0) {
              return neg(div(neg(self), other));
            }
            _other = neg(other);
            _self = neg(self);
            continue;
          }
          if (other_hi < 0) {
            return neg(div(self, neg(other)));
          }
          var res = zero;
          var rem$1 = self;
          while (i64_ge(rem$1, other)) {
            var b = Math.floor(to_float(rem$1) / to_float(other));
            var approx$1 = 1 > b ? 1 : b;
            var log2 = Math.ceil(Math.log(approx$1) / Math.LN2);
            var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
            var approxRes = of_float(approx$1);
            var approxRem = mul(approxRes, other);
            while (approxRem[0] < 0 || i64_gt(approxRem, rem$1)) {
              approx$1 = approx$1 - delta;
              approxRes = of_float(approx$1);
              approxRem = mul(approxRes, other);
            }
            ;
            if (is_zero(approxRes)) {
              approxRes = one;
            }
            res = add(res, approxRes);
            rem$1 = sub2(rem$1, approxRem);
          }
          ;
          return res;
        }
      }
    }
    ;
  }
  function mod_(self, other) {
    return sub2(self, mul(div(self, other), other));
  }
  function of_int32(lo) {
    return [
      lo < 0 ? -1 : 0,
      lo >>> 0
    ];
  }

  // ../../node_modules/rescript/lib/es6/caml_format.js
  function parse_digit(c) {
    if (c >= 65) {
      if (c >= 97) {
        if (c >= 123) {
          return -1;
        } else {
          return c - 87 | 0;
        }
      } else if (c >= 91) {
        return -1;
      } else {
        return c - 55 | 0;
      }
    } else if (c > 57 || c < 48) {
      return -1;
    } else {
      return c - /* '0' */
      48 | 0;
    }
  }
  function int_of_string_base(param) {
    switch (param) {
      case "Oct":
        return 8;
      case "Hex":
        return 16;
      case "Dec":
        return 10;
      case "Bin":
        return 2;
    }
  }
  function parse_sign_and_base(s) {
    var sign = 1;
    var base = "Dec";
    var i2 = 0;
    var match = s.codePointAt(i2);
    switch (match) {
      case 43:
        i2 = i2 + 1 | 0;
        break;
      case 45:
        sign = -1;
        i2 = i2 + 1 | 0;
        break;
      default:
    }
    if (s.codePointAt(i2) === /* '0' */
    48) {
      var match$1 = s.codePointAt(i2 + 1 | 0);
      if (match$1 >= 89) {
        if (match$1 >= 111) {
          if (match$1 < 121) {
            switch (match$1) {
              case 111:
                base = "Oct";
                i2 = i2 + 2 | 0;
                break;
              case 117:
                i2 = i2 + 2 | 0;
                break;
              case 112:
              case 113:
              case 114:
              case 115:
              case 116:
              case 118:
              case 119:
                break;
              case 120:
                base = "Hex";
                i2 = i2 + 2 | 0;
                break;
            }
          }
        } else if (match$1 === 98) {
          base = "Bin";
          i2 = i2 + 2 | 0;
        }
      } else if (match$1 !== 66) {
        if (match$1 >= 79) {
          switch (match$1) {
            case 79:
              base = "Oct";
              i2 = i2 + 2 | 0;
              break;
            case 85:
              i2 = i2 + 2 | 0;
              break;
            case 80:
            case 81:
            case 82:
            case 83:
            case 84:
            case 86:
            case 87:
              break;
            case 88:
              base = "Hex";
              i2 = i2 + 2 | 0;
              break;
          }
        }
      } else {
        base = "Bin";
        i2 = i2 + 2 | 0;
      }
    }
    return [
      i2,
      sign,
      base
    ];
  }
  function int_of_string(s) {
    var match = parse_sign_and_base(s);
    var i2 = match[0];
    var base = int_of_string_base(match[2]);
    var threshold = 4294967295;
    var len = s.length;
    var c = i2 < len ? s.codePointAt(i2) : (
      /* '\000' */
      0
    );
    var d = parse_digit(c);
    if (d < 0 || d >= base) {
      throw {
        RE_EXN_ID: "Failure",
        _1: "int_of_string",
        Error: new Error()
      };
    }
    var aux = function(_acc, _k) {
      while (true) {
        var k = _k;
        var acc = _acc;
        if (k === len) {
          return acc;
        }
        var a = s.codePointAt(k);
        if (a === /* '_' */
        95) {
          _k = k + 1 | 0;
          continue;
        }
        var v = parse_digit(a);
        if (v < 0 || v >= base) {
          throw {
            RE_EXN_ID: "Failure",
            _1: "int_of_string",
            Error: new Error()
          };
        }
        var acc$1 = base * acc + v;
        if (acc$1 > threshold) {
          throw {
            RE_EXN_ID: "Failure",
            _1: "int_of_string",
            Error: new Error()
          };
        }
        _k = k + 1 | 0;
        _acc = acc$1;
        continue;
      }
      ;
    };
    var res = match[1] * aux(d, i2 + 1 | 0);
    var or_res = res | 0;
    if (base === 10 && res !== or_res) {
      throw {
        RE_EXN_ID: "Failure",
        _1: "int_of_string",
        Error: new Error()
      };
    }
    return or_res;
  }

  // ../../node_modules/rescript/lib/es6/caml_string.js
  function get2(s, i2) {
    if (i2 >= s.length || i2 < 0) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "index out of bounds",
        Error: new Error()
      };
    }
    return s.codePointAt(i2);
  }
  function make2(n, ch) {
    return String.fromCharCode(ch).repeat(n);
  }

  // ../../node_modules/rescript/lib/es6/caml_exceptions.js
  var idMap = /* @__PURE__ */ new Map();
  function create(str) {
    var v = idMap.get(str);
    var id;
    if (v !== void 0) {
      var id$1 = v + 1 | 0;
      idMap.set(str, id$1);
      id = id$1;
    } else {
      idMap.set(str, 1);
      id = 1;
    }
    return str + ("/" + id);
  }
  function is_extension(e) {
    if (e == null) {
      return false;
    } else {
      return typeof e.RE_EXN_ID === "string";
    }
  }

  // ../../node_modules/rescript/lib/es6/caml_option.js
  function some(x) {
    if (x === void 0) {
      return {
        BS_PRIVATE_NESTED_SOME_NONE: 0
      };
    } else if (x !== null && x.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
      return {
        BS_PRIVATE_NESTED_SOME_NONE: x.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0
      };
    } else {
      return x;
    }
  }
  function nullable_to_opt(x) {
    if (x == null) {
      return;
    } else {
      return some(x);
    }
  }
  function valFromOption(x) {
    if (!(x !== null && x.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) {
      return x;
    }
    var depth = x.BS_PRIVATE_NESTED_SOME_NONE;
    if (depth === 0) {
      return;
    } else {
      return {
        BS_PRIVATE_NESTED_SOME_NONE: depth - 1 | 0
      };
    }
  }

  // ../../node_modules/rescript/lib/es6/caml_js_exceptions.js
  function internalToOCamlException(e) {
    if (is_extension(e)) {
      return e;
    } else {
      return {
        RE_EXN_ID: "JsError",
        _1: e
      };
    }
  }

  // ../../node_modules/rescript/lib/es6/pervasives.js
  function failwith(s) {
    throw {
      RE_EXN_ID: "Failure",
      _1: s,
      Error: new Error()
    };
  }
  function int_of_string_opt(s) {
    try {
      return int_of_string(s);
    } catch (raw_exn) {
      var exn = internalToOCamlException(raw_exn);
      if (exn.RE_EXN_ID === "Failure") {
        return;
      }
      throw exn;
    }
  }
  function $at(l1, l2) {
    if (l1) {
      return {
        hd: l1.hd,
        tl: $at(l1.tl, l2)
      };
    } else {
      return l2;
    }
  }

  // ../../node_modules/rescript/lib/es6/list.js
  function length(l) {
    var _len = 0;
    var _param = l;
    while (true) {
      var param = _param;
      var len = _len;
      if (!param) {
        return len;
      }
      _param = param.tl;
      _len = len + 1 | 0;
      continue;
    }
    ;
  }
  function rev_append(_l1, _l2) {
    while (true) {
      var l2 = _l2;
      var l1 = _l1;
      if (!l1) {
        return l2;
      }
      _l2 = {
        hd: l1.hd,
        tl: l2
      };
      _l1 = l1.tl;
      continue;
    }
    ;
  }
  function rev(l) {
    return rev_append(
      l,
      /* [] */
      0
    );
  }
  function map(f2, param) {
    if (!param) {
      return (
        /* [] */
        0
      );
    }
    var r = _1(f2, param.hd);
    return {
      hd: r,
      tl: map(f2, param.tl)
    };
  }
  function iter(f2, _param) {
    while (true) {
      var param = _param;
      if (!param) {
        return;
      }
      _1(f2, param.hd);
      _param = param.tl;
      continue;
    }
    ;
  }
  function fold_left(f2, _accu, _l) {
    while (true) {
      var l = _l;
      var accu = _accu;
      if (!l) {
        return accu;
      }
      _l = l.tl;
      _accu = _2(f2, accu, l.hd);
      continue;
    }
    ;
  }
  function mem(x, _param) {
    while (true) {
      var param = _param;
      if (!param) {
        return false;
      }
      if (equal(param.hd, x)) {
        return true;
      }
      _param = param.tl;
      continue;
    }
    ;
  }
  function assoc(x, _param) {
    while (true) {
      var param = _param;
      if (param) {
        var match = param.hd;
        if (equal(match[0], x)) {
          return match[1];
        }
        _param = param.tl;
        continue;
      }
      throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
    }
    ;
  }
  function find_opt(p, _param) {
    while (true) {
      var param = _param;
      if (!param) {
        return;
      }
      var x = param.hd;
      if (_1(p, x)) {
        return some(x);
      }
      _param = param.tl;
      continue;
    }
    ;
  }
  function chop(_k, _l) {
    while (true) {
      var l = _l;
      var k = _k;
      if (k === 0) {
        return l;
      }
      if (l) {
        _l = l.tl;
        _k = k - 1 | 0;
        continue;
      }
      throw {
        RE_EXN_ID: "Assert_failure",
        _1: [
          "list.res",
          420,
          11
        ],
        Error: new Error()
      };
    }
    ;
  }
  function sort_uniq(cmp, l) {
    var sort2 = function(n, l2) {
      if (n !== 2) {
        if (n === 3 && l2) {
          var match = l2.tl;
          if (match) {
            var match$1 = match.tl;
            if (match$1) {
              var x3 = match$1.hd;
              var x2 = match.hd;
              var x1 = l2.hd;
              var c = _2(cmp, x1, x2);
              if (c === 0) {
                var c$1 = _2(cmp, x2, x3);
                if (c$1 === 0) {
                  return {
                    hd: x2,
                    tl: (
                      /* [] */
                      0
                    )
                  };
                } else if (c$1 < 0) {
                  return {
                    hd: x2,
                    tl: {
                      hd: x3,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                } else {
                  return {
                    hd: x3,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                }
              }
              if (c < 0) {
                var c$2 = _2(cmp, x2, x3);
                if (c$2 === 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                }
                if (c$2 < 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: {
                        hd: x3,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                }
                var c$3 = _2(cmp, x1, x3);
                if (c$3 === 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                } else if (c$3 < 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x3,
                      tl: {
                        hd: x2,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                } else {
                  return {
                    hd: x3,
                    tl: {
                      hd: x1,
                      tl: {
                        hd: x2,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                }
              }
              var c$4 = _2(cmp, x1, x3);
              if (c$4 === 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: (
                      /* [] */
                      0
                    )
                  }
                };
              }
              if (c$4 < 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: {
                      hd: x3,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              }
              var c$5 = _2(cmp, x2, x3);
              if (c$5 === 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: (
                      /* [] */
                      0
                    )
                  }
                };
              } else if (c$5 < 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x3,
                    tl: {
                      hd: x1,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              } else {
                return {
                  hd: x3,
                  tl: {
                    hd: x2,
                    tl: {
                      hd: x1,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              }
            }
          }
        }
      } else if (l2) {
        var match$2 = l2.tl;
        if (match$2) {
          var x2$1 = match$2.hd;
          var x1$1 = l2.hd;
          var c$6 = _2(cmp, x1$1, x2$1);
          if (c$6 === 0) {
            return {
              hd: x1$1,
              tl: (
                /* [] */
                0
              )
            };
          } else if (c$6 < 0) {
            return {
              hd: x1$1,
              tl: {
                hd: x2$1,
                tl: (
                  /* [] */
                  0
                )
              }
            };
          } else {
            return {
              hd: x2$1,
              tl: {
                hd: x1$1,
                tl: (
                  /* [] */
                  0
                )
              }
            };
          }
        }
      }
      var n1 = n >> 1;
      var n2 = n - n1 | 0;
      var l22 = chop(n1, l2);
      var s1 = rev_sort(n1, l2);
      var s2 = rev_sort(n2, l22);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = (
        /* [] */
        0
      );
      while (true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (!l1) {
          return rev_append(l2$1, accu);
        }
        if (!l2$1) {
          return rev_append(l1, accu);
        }
        var t2 = l2$1.tl;
        var h2 = l2$1.hd;
        var t1 = l1.tl;
        var h1 = l1.hd;
        var c$7 = _2(cmp, h1, h2);
        if (c$7 === 0) {
          _accu = {
            hd: h1,
            tl: accu
          };
          _l2 = t2;
          _l1 = t1;
          continue;
        }
        if (c$7 > 0) {
          _accu = {
            hd: h1,
            tl: accu
          };
          _l1 = t1;
          continue;
        }
        _accu = {
          hd: h2,
          tl: accu
        };
        _l2 = t2;
        continue;
      }
      ;
    };
    var rev_sort = function(n, l2) {
      if (n !== 2) {
        if (n === 3 && l2) {
          var match = l2.tl;
          if (match) {
            var match$1 = match.tl;
            if (match$1) {
              var x3 = match$1.hd;
              var x2 = match.hd;
              var x1 = l2.hd;
              var c = _2(cmp, x1, x2);
              if (c === 0) {
                var c$1 = _2(cmp, x2, x3);
                if (c$1 === 0) {
                  return {
                    hd: x2,
                    tl: (
                      /* [] */
                      0
                    )
                  };
                } else if (c$1 > 0) {
                  return {
                    hd: x2,
                    tl: {
                      hd: x3,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                } else {
                  return {
                    hd: x3,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                }
              }
              if (c > 0) {
                var c$2 = _2(cmp, x2, x3);
                if (c$2 === 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                }
                if (c$2 > 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: {
                        hd: x3,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                }
                var c$3 = _2(cmp, x1, x3);
                if (c$3 === 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x2,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  };
                } else if (c$3 > 0) {
                  return {
                    hd: x1,
                    tl: {
                      hd: x3,
                      tl: {
                        hd: x2,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                } else {
                  return {
                    hd: x3,
                    tl: {
                      hd: x1,
                      tl: {
                        hd: x2,
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    }
                  };
                }
              }
              var c$4 = _2(cmp, x1, x3);
              if (c$4 === 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: (
                      /* [] */
                      0
                    )
                  }
                };
              }
              if (c$4 > 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: {
                      hd: x3,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              }
              var c$5 = _2(cmp, x2, x3);
              if (c$5 === 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x1,
                    tl: (
                      /* [] */
                      0
                    )
                  }
                };
              } else if (c$5 > 0) {
                return {
                  hd: x2,
                  tl: {
                    hd: x3,
                    tl: {
                      hd: x1,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              } else {
                return {
                  hd: x3,
                  tl: {
                    hd: x2,
                    tl: {
                      hd: x1,
                      tl: (
                        /* [] */
                        0
                      )
                    }
                  }
                };
              }
            }
          }
        }
      } else if (l2) {
        var match$2 = l2.tl;
        if (match$2) {
          var x2$1 = match$2.hd;
          var x1$1 = l2.hd;
          var c$6 = _2(cmp, x1$1, x2$1);
          if (c$6 === 0) {
            return {
              hd: x1$1,
              tl: (
                /* [] */
                0
              )
            };
          } else if (c$6 > 0) {
            return {
              hd: x1$1,
              tl: {
                hd: x2$1,
                tl: (
                  /* [] */
                  0
                )
              }
            };
          } else {
            return {
              hd: x2$1,
              tl: {
                hd: x1$1,
                tl: (
                  /* [] */
                  0
                )
              }
            };
          }
        }
      }
      var n1 = n >> 1;
      var n2 = n - n1 | 0;
      var l22 = chop(n1, l2);
      var s1 = sort2(n1, l2);
      var s2 = sort2(n2, l22);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = (
        /* [] */
        0
      );
      while (true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (!l1) {
          return rev_append(l2$1, accu);
        }
        if (!l2$1) {
          return rev_append(l1, accu);
        }
        var t2 = l2$1.tl;
        var h2 = l2$1.hd;
        var t1 = l1.tl;
        var h1 = l1.hd;
        var c$7 = _2(cmp, h1, h2);
        if (c$7 === 0) {
          _accu = {
            hd: h1,
            tl: accu
          };
          _l2 = t2;
          _l1 = t1;
          continue;
        }
        if (c$7 < 0) {
          _accu = {
            hd: h1,
            tl: accu
          };
          _l1 = t1;
          continue;
        }
        _accu = {
          hd: h2,
          tl: accu
        };
        _l2 = t2;
        continue;
      }
      ;
    };
    var len = length(l);
    if (len < 2) {
      return l;
    } else {
      return sort2(len, l);
    }
  }
  var append = $at;

  // ../../node_modules/rescript/lib/es6/listLabels.js
  function length2(l) {
    var _len = 0;
    var _param = l;
    while (true) {
      var param = _param;
      var len = _len;
      if (!param) {
        return len;
      }
      _param = param.tl;
      _len = len + 1 | 0;
      continue;
    }
    ;
  }
  function tl(param) {
    if (param) {
      return param.tl;
    }
    throw {
      RE_EXN_ID: "Failure",
      _1: "tl",
      Error: new Error()
    };
  }
  function nth(l, n) {
    if (n < 0) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "List.nth",
        Error: new Error()
      };
    }
    var _l = l;
    var _n = n;
    while (true) {
      var n$1 = _n;
      var l$1 = _l;
      if (l$1) {
        if (n$1 === 0) {
          return l$1.hd;
        }
        _n = n$1 - 1 | 0;
        _l = l$1.tl;
        continue;
      }
      throw {
        RE_EXN_ID: "Failure",
        _1: "nth",
        Error: new Error()
      };
    }
    ;
  }
  function rev_append2(_l1, _l2) {
    while (true) {
      var l2 = _l2;
      var l1 = _l1;
      if (!l1) {
        return l2;
      }
      _l2 = {
        hd: l1.hd,
        tl: l2
      };
      _l1 = l1.tl;
      continue;
    }
    ;
  }
  function rev2(l) {
    return rev_append2(
      l,
      /* [] */
      0
    );
  }
  function map2(f2, param) {
    if (!param) {
      return (
        /* [] */
        0
      );
    }
    var r = _1(f2, param.hd);
    return {
      hd: r,
      tl: map2(f2, param.tl)
    };
  }
  function fold_left2(f2, _accu, _l) {
    while (true) {
      var l = _l;
      var accu = _accu;
      if (!l) {
        return accu;
      }
      _l = l.tl;
      _accu = _2(f2, accu, l.hd);
      continue;
    }
    ;
  }
  function fold_right(f2, l, accu) {
    if (l) {
      return _2(f2, l.hd, fold_right(f2, l.tl, accu));
    } else {
      return accu;
    }
  }
  function for_all(p, _param) {
    while (true) {
      var param = _param;
      if (!param) {
        return true;
      }
      if (!_1(p, param.hd)) {
        return false;
      }
      _param = param.tl;
      continue;
    }
    ;
  }
  function exists(p, _param) {
    while (true) {
      var param = _param;
      if (!param) {
        return false;
      }
      if (_1(p, param.hd)) {
        return true;
      }
      _param = param.tl;
      continue;
    }
    ;
  }
  function assoc2(x, _param) {
    while (true) {
      var param = _param;
      if (param) {
        var match = param.hd;
        if (equal(match[0], x)) {
          return match[1];
        }
        _param = param.tl;
        continue;
      }
      throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
    }
    ;
  }
  var append2 = $at;

  // lib/es6/src/main/re/stdlib/jscore/jslist.mjs
  function update(f2, lst) {
    if (!lst) {
      return lst;
    }
    var xs = lst.tl;
    var x = lst.hd;
    var y = _1(f2, x);
    var ys = update(f2, xs);
    if (x === y && xs === ys) {
      return lst;
    } else {
      return {
        hd: y,
        tl: ys
      };
    }
  }
  function filter(f2, lst) {
    if (!lst) {
      return lst;
    }
    var xs = lst.tl;
    var x = lst.hd;
    var y = _1(f2, x);
    var ys = filter(f2, xs);
    if (y) {
      if (xs === ys) {
        return lst;
      } else {
        return {
          hd: x,
          tl: ys
        };
      }
    } else {
      return ys;
    }
  }
  function fold_right_tailrec(f2, l, init4) {
    return fold_left2(function(a, b) {
      return _2(f2, b, a);
    }, init4, rev2(l));
  }
  function flatten(xs) {
    return fold_left2(
      append,
      /* [] */
      0,
      xs
    );
  }
  function hd(x) {
    if (x) {
      return some(x.hd);
    }
  }
  function find_map(f2, _xs) {
    while (true) {
      var xs = _xs;
      if (!xs) {
        return;
      }
      var s = _1(f2, xs.hd);
      if (s !== void 0) {
        return s;
      }
      _xs = xs.tl;
      continue;
    }
    ;
  }
  function filter_map(f2, xs) {
    return fold_right_tailrec(
      function(x, acc) {
        var v = _1(f2, x);
        if (v !== void 0) {
          return {
            hd: valFromOption(v),
            tl: acc
          };
        } else {
          return acc;
        }
      },
      xs,
      /* [] */
      0
    );
  }
  function find(f2, _x) {
    while (true) {
      var x = _x;
      if (!x) {
        return;
      }
      var y = x.hd;
      if (_1(f2, y)) {
        return some(y);
      }
      _x = x.tl;
      continue;
    }
    ;
  }
  function drop(_count, _xs) {
    while (true) {
      var xs = _xs;
      var count = _count;
      if (count === 0) {
        return xs;
      }
      if (!xs) {
        return (
          /* [] */
          0
        );
      }
      _xs = xs.tl;
      _count = count - 1 | 0;
      continue;
    }
    ;
  }
  function drop_while(predicate, _xs) {
    while (true) {
      var xs = _xs;
      if (!xs) {
        return xs;
      }
      if (!_1(predicate, xs.hd)) {
        return xs;
      }
      _xs = xs.tl;
      continue;
    }
    ;
  }
  function drop_while_end(predicate) {
    return function(param) {
      var param$1 = (
        /* [] */
        0
      );
      return fold_right_tailrec(function(x, xs) {
        if (_1(predicate, x) && xs === /* [] */
        0) {
          return xs;
        } else {
          return {
            hd: x,
            tl: xs
          };
        }
      }, param, param$1);
    };
  }
  function partition(predicate) {
    return function(param) {
      var param$1 = [
        /* [] */
        0,
        /* [] */
        0
      ];
      return fold_right_tailrec(function(x, param2) {
        var rs = param2[1];
        var ls = param2[0];
        if (_1(predicate, x)) {
          return [
            {
              hd: x,
              tl: ls
            },
            rs
          ];
        } else {
          return [
            ls,
            {
              hd: x,
              tl: rs
            }
          ];
        }
      }, param, param$1);
    };
  }
  function bind(f2, lst) {
    return fold_right_tailrec(
      function(x, acc) {
        return append(_1(f2, x), acc);
      },
      lst,
      /* [] */
      0
    );
  }
  function span(predicate, lst) {
    if (!lst) {
      return [
        /* [] */
        0,
        lst
      ];
    }
    var x = lst.hd;
    if (!_1(predicate, x)) {
      return [
        /* [] */
        0,
        lst
      ];
    }
    var match = span(predicate, lst.tl);
    return [
      {
        hd: x,
        tl: match[0]
      },
      match[1]
    ];
  }
  function $$break(predicate, lst) {
    return span(function(x) {
      return !_1(predicate, x);
    }, lst);
  }
  function partition_list_by_last_child(lst) {
    var match = rev(lst);
    if (match) {
      return {
        TAG: "NonEmptyListWithLastChild",
        _0: match.hd,
        _1: rev(match.tl)
      };
    } else {
      return "EmptyList";
    }
  }
  var length3 = length2;
  var tl2 = tl;
  var nth2 = nth;
  var rev3 = rev2;
  var append3 = append2;
  var map3 = map2;
  var fold_left3 = fold_left2;
  var fold_right3 = fold_right;
  var for_all3 = for_all;
  var exists3 = exists;
  var assoc3 = assoc2;

  // ../../node_modules/rescript/lib/es6/camlinternalLazy.js
  var Undefined = /* @__PURE__ */ create("CamlinternalLazy.Undefined");
  function forward_with_closure(blk, closure) {
    var result = closure();
    blk.VAL = result;
    blk.LAZY_DONE = true;
    return result;
  }
  function raise_undefined() {
    throw {
      RE_EXN_ID: Undefined,
      Error: new Error()
    };
  }
  function force(lzv) {
    if (lzv.LAZY_DONE) {
      return lzv.VAL;
    } else {
      var closure = lzv.VAL;
      lzv.VAL = raise_undefined;
      try {
        return forward_with_closure(lzv, closure);
      } catch (e) {
        lzv.VAL = function() {
          throw e;
        };
        throw e;
      }
    }
  }

  // lib/es6/src/main/re/stdlib/jscore/jsoption.mjs
  function isSome(x) {
    return x !== void 0;
  }
  function isNone(o) {
    return !isSome(o);
  }
  function value($$default, x) {
    if (x !== void 0) {
      return valFromOption(x);
    } else {
      return $$default;
    }
  }
  function selfOr($$default, x) {
    if (x !== void 0) {
      return x;
    } else {
      return force($$default);
    }
  }
  function map4(f2, x) {
    if (x !== void 0) {
      return some(_1(f2, valFromOption(x)));
    }
  }
  function filter2(f2, opt) {
    if (opt !== void 0 && _1(f2, valFromOption(opt))) {
      return opt;
    }
  }
  function bind2(f2, x) {
    if (x !== void 0) {
      return _1(f2, valFromOption(x));
    }
  }
  function orLazy(v, x) {
    if (x !== void 0) {
      return valFromOption(x);
    } else {
      return force(v);
    }
  }
  function toList(x) {
    if (x !== void 0) {
      return {
        hd: valFromOption(x),
        tl: (
          /* [] */
          0
        )
      };
    } else {
      return (
        /* [] */
        0
      );
    }
  }
  function is(opt, x) {
    if (x !== void 0) {
      if (opt !== void 0) {
        return equal(valFromOption(x), valFromOption(opt));
      } else {
        return false;
      }
    } else {
      return opt === void 0;
    }
  }
  function bind22(op1, op2, f2) {
    if (op1 !== void 0 && op2 !== void 0) {
      return _2(f2, valFromOption(op1), valFromOption(op2));
    }
  }

  // lib/es6/src/main/re/wimp/traverse.mjs
  function traverse(bidirectionalOpt, processElement, nodes) {
    var bidirectional = bidirectionalOpt !== void 0 ? bidirectionalOpt : false;
    var _acc = (
      /* [] */
      0
    );
    var _nodes = nodes;
    while (true) {
      var nodes$1 = _nodes;
      var acc = _acc;
      if (!nodes$1) {
        return rev3(acc);
      }
      var d = nodes$1.hd;
      if (d.TAG === "Data") {
        _nodes = nodes$1.tl;
        _acc = {
          hd: d,
          tl: acc
        };
        continue;
      }
      var xs = nodes$1.tl;
      var children = d._3;
      var styles = d._2;
      var attrs = d._1;
      var name42 = d._0;
      var node = _5(processElement, name42, attrs, styles, children, xs);
      if (typeof node !== "object") {
        if (node === "RemoveNode") {
          _nodes = xs;
          continue;
        }
        var updated = traverse(bidirectional, processElement, children);
        var updatedNode = {
          TAG: "Element",
          _0: name42,
          _1: attrs,
          _2: styles,
          _3: updated
        };
        if (bidirectional && notequal(updated, children)) {
          _nodes = {
            hd: updatedNode,
            tl: xs
          };
          continue;
        }
        _nodes = xs;
        _acc = {
          hd: updatedNode,
          tl: acc
        };
        continue;
      } else {
        if (node.TAG === "UpdateNode") {
          _nodes = {
            hd: node._0,
            tl: xs
          };
          continue;
        }
        _nodes = node._0;
        continue;
      }
    }
    ;
  }
  function processNode(nodeRules, name42, attrs, styles, children) {
    return value("Noop", find_map(function(rule) {
      if (!_4(rule.elementApplies, name42, attrs, styles, children)) {
        return;
      }
      var a = _4(rule.process, name42, attrs, styles, children);
      if (typeof a !== "object" && a === "Noop") {
        return;
      } else {
        return a;
      }
    }, nodeRules));
  }
  function processSiblings(siblingRules, name42, attrs, styles, children, siblings) {
    return find_map(function(rule) {
      if (_4(rule.siblingApplies, name42, attrs, styles, children)) {
        return _5(rule.process, name42, attrs, styles, children, siblings);
      }
    }, siblingRules);
  }
  function cleanNode(nodeRules, name42, attrs, styles, children) {
    var node = processNode(nodeRules, name42, attrs, styles, children);
    if (typeof node === "object") {
      if (node.TAG === "ReplaceSingle") {
        return {
          hd: node._0,
          tl: (
            /* [] */
            0
          )
        };
      } else {
        return node._0;
      }
    }
    switch (node) {
      case "Noop":
        return;
      case "Unwrap":
        return children;
      case "Remove":
        return (
          /* [] */
          0
        );
    }
  }
  function $$process(bidirectionalOpt, nodeRules, siblingRules, nodes) {
    var bidirectional = bidirectionalOpt !== void 0 ? bidirectionalOpt : false;
    return traverse(bidirectional, function(name42, attrs, styles, children, siblings) {
      var node = processNode(nodeRules, name42, attrs, styles, children);
      if (typeof node === "object") {
        if (node.TAG === "ReplaceSingle") {
          return {
            TAG: "UpdateNode",
            _0: node._0
          };
        } else {
          return {
            TAG: "UpdateSiblings",
            _0: append3(node._0, siblings)
          };
        }
      }
      switch (node) {
        case "Noop":
          var docs = processSiblings(siblingRules, name42, attrs, styles, children, siblings);
          if (docs !== void 0) {
            return {
              TAG: "UpdateSiblings",
              _0: docs
            };
          } else {
            return "Continue";
          }
        case "Unwrap":
          return {
            TAG: "UpdateSiblings",
            _0: append3(children, siblings)
          };
        case "Remove":
          return "RemoveNode";
      }
    }, nodes);
  }

  // ../../node_modules/rescript/lib/es6/array.js
  function blit2(a1, ofs1, a2, ofs2, len) {
    if (len < 0 || ofs1 < 0 || ofs1 > (a1.length - len | 0) || ofs2 < 0 || ofs2 > (a2.length - len | 0)) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Array.blit",
        Error: new Error()
      };
    }
    blit(a1, ofs1, a2, ofs2, len);
  }
  function to_list(a) {
    var _i = a.length - 1 | 0;
    var _res = (
      /* [] */
      0
    );
    while (true) {
      var res = _res;
      var i2 = _i;
      if (i2 < 0) {
        return res;
      }
      _res = {
        hd: a[i2],
        tl: res
      };
      _i = i2 - 1 | 0;
      continue;
    }
    ;
  }
  function list_length(_accu, _param) {
    while (true) {
      var param = _param;
      var accu = _accu;
      if (!param) {
        return accu;
      }
      _param = param.tl;
      _accu = accu + 1 | 0;
      continue;
    }
    ;
  }
  function of_list(param) {
    if (!param) {
      return [];
    }
    var a = make(list_length(0, param), param.hd);
    var _i = 1;
    var _param = param.tl;
    while (true) {
      var param$1 = _param;
      var i2 = _i;
      if (!param$1) {
        return a;
      }
      a[i2] = param$1.hd;
      _param = param$1.tl;
      _i = i2 + 1 | 0;
      continue;
    }
    ;
  }

  // ../../node_modules/rescript/lib/es6/char.js
  function lowercase_ascii(c) {
    if (c >= /* 'A' */
    65 && c <= /* 'Z' */
    90) {
      return c + 32 | 0;
    } else {
      return c;
    }
  }

  // ../../node_modules/rescript/lib/es6/caml_bytes.js
  function create2(len) {
    if (len < 0) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "String.create",
        Error: new Error()
      };
    }
    var result = new Array(len);
    for (var i2 = 0; i2 < len; ++i2) {
      result[i2] = /* '\000' */
      0;
    }
    return result;
  }

  // ../../node_modules/rescript/lib/es6/bytes.js
  function unsafe_blit(s1, i1, s2, i2, len) {
    if (len <= 0) {
      return;
    }
    if (s1 === s2) {
      if (i1 < i2) {
        var range_a = (s1.length - i2 | 0) - 1 | 0;
        var range_b = len - 1 | 0;
        var range = range_a > range_b ? range_b : range_a;
        for (var j = range; j >= 0; --j) {
          s1[i2 + j | 0] = s1[i1 + j | 0];
        }
        return;
      }
      if (i1 <= i2) {
        return;
      }
      var range_a$1 = (s1.length - i1 | 0) - 1 | 0;
      var range_b$1 = len - 1 | 0;
      var range$1 = range_a$1 > range_b$1 ? range_b$1 : range_a$1;
      for (var k = 0; k <= range$1; ++k) {
        s1[i2 + k | 0] = s1[i1 + k | 0];
      }
      return;
    }
    var off1 = s1.length - i1 | 0;
    if (len <= off1) {
      for (var i3 = 0; i3 < len; ++i3) {
        s2[i2 + i3 | 0] = s1[i1 + i3 | 0];
      }
      return;
    }
    for (var i$1 = 0; i$1 < off1; ++i$1) {
      s2[i2 + i$1 | 0] = s1[i1 + i$1 | 0];
    }
    for (var i$2 = off1; i$2 < len; ++i$2) {
      s2[i2 + i$2 | 0] = /* '\000' */
      0;
    }
  }
  var empty = [];
  function to_string2(a) {
    var i2 = 0;
    var len = a.length;
    var s = "";
    var s_len = len;
    if (i2 === 0 && len <= 4096 && len === a.length) {
      return String.fromCharCode.apply(null, a);
    }
    var offset = 0;
    while (s_len > 0) {
      var next = s_len < 1024 ? s_len : 1024;
      var tmp_bytes = new Array(next);
      for (var k = 0; k < next; ++k) {
        tmp_bytes[k] = a[k + offset | 0];
      }
      s = s + String.fromCharCode.apply(null, tmp_bytes);
      s_len = s_len - next | 0;
      offset = offset + next | 0;
    }
    ;
    return s;
  }
  function of_string(s) {
    var len = s.length;
    var res = new Array(len);
    for (var i2 = 0; i2 < len; ++i2) {
      res[i2] = s.codePointAt(i2);
    }
    return res;
  }
  function sub3(s, ofs, len) {
    if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "String.sub / Bytes.sub",
        Error: new Error()
      };
    }
    var r = create2(len);
    unsafe_blit(s, ofs, r, 0, len);
    return r;
  }
  function sub_string(b, ofs, len) {
    return to_string2(sub3(b, ofs, len));
  }
  function blit3(s1, ofs1, s2, ofs2, len) {
    if (len < 0 || ofs1 < 0 || ofs1 > (s1.length - len | 0) || ofs2 < 0 || ofs2 > (s2.length - len | 0)) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Bytes.blit",
        Error: new Error()
      };
    }
    unsafe_blit(s1, ofs1, s2, ofs2, len);
  }
  function blit_string(s1, ofs1, s2, ofs2, len) {
    if (len < 0 || ofs1 < 0 || ofs1 > (s1.length - len | 0) || ofs2 < 0 || ofs2 > (s2.length - len | 0)) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "String.blit / Bytes.blit_string",
        Error: new Error()
      };
    }
    if (len <= 0) {
      return;
    }
    var off1 = s1.length - ofs1 | 0;
    if (len <= off1) {
      for (var i2 = 0; i2 < len; ++i2) {
        s2[ofs2 + i2 | 0] = s1.codePointAt(ofs1 + i2 | 0);
      }
      return;
    }
    for (var i$1 = 0; i$1 < off1; ++i$1) {
      s2[ofs2 + i$1 | 0] = s1.codePointAt(ofs1 + i$1 | 0);
    }
    for (var i$2 = off1; i$2 < len; ++i$2) {
      s2[ofs2 + i$2 | 0] = /* '\000' */
      0;
    }
  }
  function is_space(param) {
    if (param > 13 || param < 9) {
      return param === 32;
    } else {
      return param !== 11;
    }
  }
  function trim(s) {
    var len = s.length;
    var i2 = 0;
    while (i2 < len && is_space(s[i2])) {
      i2 = i2 + 1 | 0;
    }
    ;
    var j = len - 1 | 0;
    while (j >= i2 && is_space(s[j])) {
      j = j - 1 | 0;
    }
    ;
    if (j >= i2) {
      return sub3(s, i2, (j - i2 | 0) + 1 | 0);
    } else {
      return empty;
    }
  }
  function map5(f2, s) {
    var l = s.length;
    if (l === 0) {
      return s;
    }
    var r = create2(l);
    for (var i2 = 0; i2 < l; ++i2) {
      r[i2] = _1(f2, s[i2]);
    }
    return r;
  }
  function lowercase_ascii2(s) {
    return map5(lowercase_ascii, s);
  }
  var unsafe_to_string = to_string2;
  var unsafe_of_string = of_string;

  // ../../node_modules/rescript/lib/es6/string.js
  function sub4(s, ofs, len) {
    return unsafe_to_string(sub3(unsafe_of_string(s), ofs, len));
  }
  function concat3(sep, xs) {
    return of_list(xs).join(sep);
  }
  function is_space2(param) {
    if (param > 13 || param < 9) {
      return param === 32;
    } else {
      return param !== 11;
    }
  }
  function trim2(s) {
    if (s === "" || !(is_space2(s.codePointAt(0)) || is_space2(s.codePointAt(s.length - 1 | 0)))) {
      return s;
    } else {
      return unsafe_to_string(trim(unsafe_of_string(s)));
    }
  }
  function lowercase_ascii3(s) {
    return unsafe_to_string(lowercase_ascii2(unsafe_of_string(s)));
  }
  var compare = string_compare;

  // ../../node_modules/rescript/lib/es6/stringLabels.js
  function sub5(s, ofs, len) {
    return unsafe_to_string(sub3(unsafe_of_string(s), ofs, len));
  }
  function concat4(sep, xs) {
    return of_list(xs).join(sep);
  }
  function index_rec(s, lim, _i, c) {
    while (true) {
      var i2 = _i;
      if (i2 >= lim) {
        throw {
          RE_EXN_ID: "Not_found",
          Error: new Error()
        };
      }
      if (s.codePointAt(i2) === c) {
        return i2;
      }
      _i = i2 + 1 | 0;
      continue;
    }
    ;
  }
  function index(s, c) {
    return index_rec(s, s.length, 0, c);
  }
  function contains_from(s, i2, c) {
    var l = s.length;
    if (i2 < 0 || i2 > l) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "String.contains_from / Bytes.contains_from",
        Error: new Error()
      };
    }
    try {
      index_rec(s, l, i2, c);
      return true;
    } catch (raw_exn) {
      var exn = internalToOCamlException(raw_exn);
      if (exn.RE_EXN_ID === "Not_found") {
        return false;
      }
      throw exn;
    }
  }
  function contains(s, c) {
    return contains_from(s, 0, c);
  }
  function lowercase_ascii4(s) {
    return unsafe_to_string(lowercase_ascii2(unsafe_of_string(s)));
  }
  var make3 = make2;

  // lib/es6/src/main/re/stdlib/jscore/jsstring.mjs
  function equal2(a, b) {
    return a === b;
  }
  function is_whitespace(s) {
    return trim2(s) === "";
  }
  function starts_with(s, search) {
    var input_length = s.length;
    var search_length = search.length;
    if (input_length < search_length) {
      return false;
    } else {
      return sub5(s, 0, search_length) === search;
    }
  }
  function ends_with(s, search) {
    var input_length = s.length;
    var search_length = search.length;
    if (input_length < search_length) {
      return false;
    } else {
      return sub5(s, input_length - search_length | 0, search_length) === search;
    }
  }
  function from_index(s, pos) {
    var len = s.length;
    if (pos > len) {
      return "";
    } else {
      return sub5(s, pos, len - pos | 0);
    }
  }
  function split2(input, sep) {
    var helper = function(acc, s) {
      try {
        var loc = index(s, sep);
        var found = sub5(s, 0, loc);
        var rest = from_index(s, loc + 1 | 0);
        if (found === "") {
          return helper(acc, rest);
        } else {
          return helper({
            hd: found,
            tl: acc
          }, rest);
        }
      } catch (raw_exn) {
        var exn = internalToOCamlException(raw_exn);
        if (exn.RE_EXN_ID === "Not_found") {
          if (s === "") {
            return acc;
          } else {
            return {
              hd: s,
              tl: acc
            };
          }
        }
        throw exn;
      }
    };
    return rev(helper(
      /* [] */
      0,
      input
    ));
  }
  function contains_substring(str, sub7) {
    return str.toLocaleLowerCase().includes(sub7.toLocaleLowerCase());
  }
  var make4 = make3;
  var sub6 = sub5;
  var concat5 = concat4;
  var contains2 = contains;
  var lowercase_ascii5 = lowercase_ascii4;

  // lib/es6/src/main/re/wimp/attrRules.mjs
  function adjustImageSrc_elementApplies(tagname, attrs, param, param$1) {
    if (tagname === "img") {
      return attrs !== /* [] */
      0;
    } else {
      return false;
    }
  }
  function adjustImageSrc_process(tagname, attrs, styles, children) {
    var match = partition(function(param) {
      return param[0] === "src";
    })(attrs);
    var srcAttr = match[0];
    if (!srcAttr) {
      return "Noop";
    }
    var match$1 = srcAttr.hd;
    if (match$1[0] !== "src") {
      return "Noop";
    }
    if (srcAttr.tl) {
      return "Noop";
    }
    var value2 = match$1[1];
    if (starts_with(value2, "file:")) {
      return {
        TAG: "ReplaceSingle",
        _0: {
          TAG: "Element",
          _0: tagname,
          _1: append3(match[1], {
            hd: [
              "data-image-src",
              value2
            ],
            tl: (
              /* [] */
              0
            )
          }),
          _2: styles,
          _3: children
        }
      };
    } else {
      return "Noop";
    }
  }
  var adjustImageSrc = {
    elementApplies: adjustImageSrc_elementApplies,
    process: adjustImageSrc_process
  };
  function checkAttrIsAlign(param) {
    return param[0] === "align";
  }
  function adjustParagraphAlignment_elementApplies(tagname, attrs, param, param$1) {
    if (tagname === "p") {
      return exists3(checkAttrIsAlign, attrs);
    } else {
      return false;
    }
  }
  function adjustParagraphAlignment_process(tagname, attrs, styles, children) {
    var alignAttr = find(checkAttrIsAlign, attrs);
    if (alignAttr === void 0) {
      return "Noop";
    }
    var nuAttrs = filter(function(param) {
      return param[0] !== "align";
    }, attrs);
    var alignStyle = exists3(function(param) {
      return param._0._0 === "text-align";
    }, styles);
    var nuStyles = alignStyle ? styles : {
      hd: {
        TAG: "Declaration",
        _0: {
          TAG: "Property",
          _0: "text-align"
        },
        _1: {
          TAG: "Value",
          _0: {
            hd: alignAttr[1],
            tl: (
              /* [] */
              0
            )
          }
        }
      },
      tl: styles
    };
    return {
      TAG: "ReplaceSingle",
      _0: {
        TAG: "Element",
        _0: tagname,
        _1: nuAttrs,
        _2: nuStyles,
        _3: children
      }
    };
  }
  var adjustParagraphAlignment = {
    elementApplies: adjustParagraphAlignment_elementApplies,
    process: adjustParagraphAlignment_process
  };

  // lib/es6/src/main/re/stdlib/jscore/jsint.mjs
  function toString(i2) {
    return String(i2);
  }

  // ../../node_modules/rescript/lib/es6/js_exn.js
  var $$Error$1 = "JsError";

  // ../../node_modules/rescript/lib/es6/js_dict.js
  function values(dict) {
    var keys = Object.keys(dict);
    var l = keys.length;
    var values$1 = new Array(l);
    for (var i2 = 0; i2 < l; ++i2) {
      values$1[i2] = dict[keys[i2]];
    }
    return values$1;
  }
  function fromList(entries) {
    var dict = {};
    var _x = entries;
    while (true) {
      var x = _x;
      if (!x) {
        return dict;
      }
      var match = x.hd;
      dict[match[0]] = match[1];
      _x = x.tl;
      continue;
    }
    ;
  }

  // lib/es6/src/main/re/css/cssTypes.mjs
  var Bullets = {
    standard: "\uF0B7",
    square: "\uF0A7",
    circle: "o"
  };
  function parseLevel(level) {
    var numb = sub6(level, 5, level.length - 5 | 0);
    try {
      return int_of_string(numb);
    } catch (raw_exn) {
      var exn = internalToOCamlException(raw_exn);
      if (exn.RE_EXN_ID === "Failure") {
        throw {
          RE_EXN_ID: "Invalid_argument",
          _1: "document list level '" + (level + "' is invalid"),
          Error: new Error()
        };
      }
      throw exn;
    }
  }
  function parseLfo(x) {
    if (x) {
      return concat5(" ", x);
    }
  }

  // ../../node_modules/css-tree/lib/tokenizer/types.js
  var EOF = 0;
  var Ident = 1;
  var Function2 = 2;
  var AtKeyword = 3;
  var Hash = 4;
  var String2 = 5;
  var BadString = 6;
  var Url = 7;
  var BadUrl = 8;
  var Delim = 9;
  var Number2 = 10;
  var Percentage = 11;
  var Dimension = 12;
  var WhiteSpace = 13;
  var CDO = 14;
  var CDC = 15;
  var Colon = 16;
  var Semicolon = 17;
  var Comma = 18;
  var LeftSquareBracket = 19;
  var RightSquareBracket = 20;
  var LeftParenthesis = 21;
  var RightParenthesis = 22;
  var LeftCurlyBracket = 23;
  var RightCurlyBracket = 24;
  var Comment = 25;

  // ../../node_modules/css-tree/lib/tokenizer/char-code-definitions.js
  var EOF2 = 0;
  function isDigit(code2) {
    return code2 >= 48 && code2 <= 57;
  }
  function isHexDigit(code2) {
    return isDigit(code2) || // 0 .. 9
    code2 >= 65 && code2 <= 70 || // A .. F
    code2 >= 97 && code2 <= 102;
  }
  function isUppercaseLetter(code2) {
    return code2 >= 65 && code2 <= 90;
  }
  function isLowercaseLetter(code2) {
    return code2 >= 97 && code2 <= 122;
  }
  function isLetter(code2) {
    return isUppercaseLetter(code2) || isLowercaseLetter(code2);
  }
  function isNonAscii(code2) {
    return code2 >= 128;
  }
  function isNameStart(code2) {
    return isLetter(code2) || isNonAscii(code2) || code2 === 95;
  }
  function isName(code2) {
    return isNameStart(code2) || isDigit(code2) || code2 === 45;
  }
  function isNonPrintable(code2) {
    return code2 >= 0 && code2 <= 8 || code2 === 11 || code2 >= 14 && code2 <= 31 || code2 === 127;
  }
  function isNewline(code2) {
    return code2 === 10 || code2 === 13 || code2 === 12;
  }
  function isWhiteSpace(code2) {
    return isNewline(code2) || code2 === 32 || code2 === 9;
  }
  function isValidEscape(first, second) {
    if (first !== 92) {
      return false;
    }
    if (isNewline(second) || second === EOF2) {
      return false;
    }
    return true;
  }
  function isIdentifierStart(first, second, third) {
    if (first === 45) {
      return isNameStart(second) || second === 45 || isValidEscape(second, third);
    }
    if (isNameStart(first)) {
      return true;
    }
    if (first === 92) {
      return isValidEscape(first, second);
    }
    return false;
  }
  function isNumberStart(first, second, third) {
    if (first === 43 || first === 45) {
      if (isDigit(second)) {
        return 2;
      }
      return second === 46 && isDigit(third) ? 3 : 0;
    }
    if (first === 46) {
      return isDigit(second) ? 2 : 0;
    }
    if (isDigit(first)) {
      return 1;
    }
    return 0;
  }
  function isBOM(code2) {
    if (code2 === 65279) {
      return 1;
    }
    if (code2 === 65534) {
      return 1;
    }
    return 0;
  }
  var CATEGORY = new Array(128);
  var EofCategory = 128;
  var WhiteSpaceCategory = 130;
  var DigitCategory = 131;
  var NameStartCategory = 132;
  var NonPrintableCategory = 133;
  for (let i2 = 0; i2 < CATEGORY.length; i2++) {
    CATEGORY[i2] = isWhiteSpace(i2) && WhiteSpaceCategory || isDigit(i2) && DigitCategory || isNameStart(i2) && NameStartCategory || isNonPrintable(i2) && NonPrintableCategory || i2 || EofCategory;
  }
  function charCodeCategory(code2) {
    return code2 < 128 ? CATEGORY[code2] : NameStartCategory;
  }

  // ../../node_modules/css-tree/lib/tokenizer/utils.js
  function getCharCode(source, offset) {
    return offset < source.length ? source.charCodeAt(offset) : 0;
  }
  function getNewlineLength(source, offset, code2) {
    if (code2 === 13 && getCharCode(source, offset + 1) === 10) {
      return 2;
    }
    return 1;
  }
  function cmpChar(testStr, offset, referenceCode) {
    let code2 = testStr.charCodeAt(offset);
    if (isUppercaseLetter(code2)) {
      code2 = code2 | 32;
    }
    return code2 === referenceCode;
  }
  function cmpStr(testStr, start, end, referenceStr) {
    if (end - start !== referenceStr.length) {
      return false;
    }
    if (start < 0 || end > testStr.length) {
      return false;
    }
    for (let i2 = start; i2 < end; i2++) {
      const referenceCode = referenceStr.charCodeAt(i2 - start);
      let testCode = testStr.charCodeAt(i2);
      if (isUppercaseLetter(testCode)) {
        testCode = testCode | 32;
      }
      if (testCode !== referenceCode) {
        return false;
      }
    }
    return true;
  }
  function findWhiteSpaceStart(source, offset) {
    for (; offset >= 0; offset--) {
      if (!isWhiteSpace(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset + 1;
  }
  function findWhiteSpaceEnd(source, offset) {
    for (; offset < source.length; offset++) {
      if (!isWhiteSpace(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset;
  }
  function findDecimalNumberEnd(source, offset) {
    for (; offset < source.length; offset++) {
      if (!isDigit(source.charCodeAt(offset))) {
        break;
      }
    }
    return offset;
  }
  function consumeEscaped(source, offset) {
    offset += 2;
    if (isHexDigit(getCharCode(source, offset - 1))) {
      for (const maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
        if (!isHexDigit(getCharCode(source, offset))) {
          break;
        }
      }
      const code2 = getCharCode(source, offset);
      if (isWhiteSpace(code2)) {
        offset += getNewlineLength(source, offset, code2);
      }
    }
    return offset;
  }
  function consumeName(source, offset) {
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      if (isName(code2)) {
        continue;
      }
      if (isValidEscape(code2, getCharCode(source, offset + 1))) {
        offset = consumeEscaped(source, offset) - 1;
        continue;
      }
      break;
    }
    return offset;
  }
  function consumeNumber(source, offset) {
    let code2 = source.charCodeAt(offset);
    if (code2 === 43 || code2 === 45) {
      code2 = source.charCodeAt(offset += 1);
    }
    if (isDigit(code2)) {
      offset = findDecimalNumberEnd(source, offset + 1);
      code2 = source.charCodeAt(offset);
    }
    if (code2 === 46 && isDigit(source.charCodeAt(offset + 1))) {
      offset += 2;
      offset = findDecimalNumberEnd(source, offset);
    }
    if (cmpChar(
      source,
      offset,
      101
      /* e */
    )) {
      let sign = 0;
      code2 = source.charCodeAt(offset + 1);
      if (code2 === 45 || code2 === 43) {
        sign = 1;
        code2 = source.charCodeAt(offset + 2);
      }
      if (isDigit(code2)) {
        offset = findDecimalNumberEnd(source, offset + 1 + sign + 1);
      }
    }
    return offset;
  }
  function consumeBadUrlRemnants(source, offset) {
    for (; offset < source.length; offset++) {
      const code2 = source.charCodeAt(offset);
      if (code2 === 41) {
        offset++;
        break;
      }
      if (isValidEscape(code2, getCharCode(source, offset + 1))) {
        offset = consumeEscaped(source, offset);
      }
    }
    return offset;
  }
  function decodeEscaped(escaped4) {
    if (escaped4.length === 1 && !isHexDigit(escaped4.charCodeAt(0))) {
      return escaped4[0];
    }
    let code2 = parseInt(escaped4, 16);
    if (code2 === 0 || // If this number is zero,
    code2 >= 55296 && code2 <= 57343 || // or is for a surrogate,
    code2 > 1114111) {
      code2 = 65533;
    }
    return String.fromCodePoint(code2);
  }

  // ../../node_modules/css-tree/lib/tokenizer/names.js
  var names_default = [
    "EOF-token",
    "ident-token",
    "function-token",
    "at-keyword-token",
    "hash-token",
    "string-token",
    "bad-string-token",
    "url-token",
    "bad-url-token",
    "delim-token",
    "number-token",
    "percentage-token",
    "dimension-token",
    "whitespace-token",
    "CDO-token",
    "CDC-token",
    "colon-token",
    "semicolon-token",
    "comma-token",
    "[-token",
    "]-token",
    "(-token",
    ")-token",
    "{-token",
    "}-token"
  ];

  // ../../node_modules/css-tree/lib/tokenizer/adopt-buffer.js
  var MIN_SIZE = 16 * 1024;
  function adoptBuffer(buffer = null, size) {
    if (buffer === null || buffer.length < size) {
      return new Uint32Array(Math.max(size + 1024, MIN_SIZE));
    }
    return buffer;
  }

  // ../../node_modules/css-tree/lib/tokenizer/OffsetToLocation.js
  var N = 10;
  var F = 12;
  var R = 13;
  function computeLinesAndColumns(host) {
    const source = host.source;
    const sourceLength = source.length;
    const startOffset = source.length > 0 ? isBOM(source.charCodeAt(0)) : 0;
    const lines = adoptBuffer(host.lines, sourceLength);
    const columns = adoptBuffer(host.columns, sourceLength);
    let line = host.startLine;
    let column = host.startColumn;
    for (let i2 = startOffset; i2 < sourceLength; i2++) {
      const code2 = source.charCodeAt(i2);
      lines[i2] = line;
      columns[i2] = column++;
      if (code2 === N || code2 === R || code2 === F) {
        if (code2 === R && i2 + 1 < sourceLength && source.charCodeAt(i2 + 1) === N) {
          i2++;
          lines[i2] = line;
          columns[i2] = column;
        }
        line++;
        column = 1;
      }
    }
    lines[sourceLength] = line;
    columns[sourceLength] = column;
    host.lines = lines;
    host.columns = columns;
    host.computed = true;
  }
  var OffsetToLocation = class {
    constructor() {
      this.lines = null;
      this.columns = null;
      this.computed = false;
    }
    setSource(source, startOffset = 0, startLine = 1, startColumn = 1) {
      this.source = source;
      this.startOffset = startOffset;
      this.startLine = startLine;
      this.startColumn = startColumn;
      this.computed = false;
    }
    getLocation(offset, filename) {
      if (!this.computed) {
        computeLinesAndColumns(this);
      }
      return {
        source: filename,
        offset: this.startOffset + offset,
        line: this.lines[offset],
        column: this.columns[offset]
      };
    }
    getLocationRange(start, end, filename) {
      if (!this.computed) {
        computeLinesAndColumns(this);
      }
      return {
        source: filename,
        start: {
          offset: this.startOffset + start,
          line: this.lines[start],
          column: this.columns[start]
        },
        end: {
          offset: this.startOffset + end,
          line: this.lines[end],
          column: this.columns[end]
        }
      };
    }
  };

  // ../../node_modules/css-tree/lib/tokenizer/TokenStream.js
  var OFFSET_MASK = 16777215;
  var TYPE_SHIFT = 24;
  var balancePair = /* @__PURE__ */ new Map([
    [Function2, RightParenthesis],
    [LeftParenthesis, RightParenthesis],
    [LeftSquareBracket, RightSquareBracket],
    [LeftCurlyBracket, RightCurlyBracket]
  ]);
  var TokenStream = class {
    constructor(source, tokenize3) {
      this.setSource(source, tokenize3);
    }
    reset() {
      this.eof = false;
      this.tokenIndex = -1;
      this.tokenType = 0;
      this.tokenStart = this.firstCharOffset;
      this.tokenEnd = this.firstCharOffset;
    }
    setSource(source = "", tokenize3 = () => {
    }) {
      source = String(source || "");
      const sourceLength = source.length;
      const offsetAndType = adoptBuffer(this.offsetAndType, source.length + 1);
      const balance = adoptBuffer(this.balance, source.length + 1);
      let tokenCount = 0;
      let balanceCloseType = 0;
      let balanceStart = 0;
      let firstCharOffset = -1;
      this.offsetAndType = null;
      this.balance = null;
      tokenize3(source, (type, start, end) => {
        switch (type) {
          default:
            balance[tokenCount] = sourceLength;
            break;
          case balanceCloseType: {
            let balancePrev = balanceStart & OFFSET_MASK;
            balanceStart = balance[balancePrev];
            balanceCloseType = balanceStart >> TYPE_SHIFT;
            balance[tokenCount] = balancePrev;
            balance[balancePrev++] = tokenCount;
            for (; balancePrev < tokenCount; balancePrev++) {
              if (balance[balancePrev] === sourceLength) {
                balance[balancePrev] = tokenCount;
              }
            }
            break;
          }
          case LeftParenthesis:
          case Function2:
          case LeftSquareBracket:
          case LeftCurlyBracket:
            balance[tokenCount] = balanceStart;
            balanceCloseType = balancePair.get(type);
            balanceStart = balanceCloseType << TYPE_SHIFT | tokenCount;
            break;
        }
        offsetAndType[tokenCount++] = type << TYPE_SHIFT | end;
        if (firstCharOffset === -1) {
          firstCharOffset = start;
        }
      });
      offsetAndType[tokenCount] = EOF << TYPE_SHIFT | sourceLength;
      balance[tokenCount] = sourceLength;
      balance[sourceLength] = sourceLength;
      while (balanceStart !== 0) {
        const balancePrev = balanceStart & OFFSET_MASK;
        balanceStart = balance[balancePrev];
        balance[balancePrev] = sourceLength;
      }
      this.source = source;
      this.firstCharOffset = firstCharOffset === -1 ? 0 : firstCharOffset;
      this.tokenCount = tokenCount;
      this.offsetAndType = offsetAndType;
      this.balance = balance;
      this.reset();
      this.next();
    }
    lookupType(offset) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return this.offsetAndType[offset] >> TYPE_SHIFT;
      }
      return EOF;
    }
    lookupOffset(offset) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return this.offsetAndType[offset - 1] & OFFSET_MASK;
      }
      return this.source.length;
    }
    lookupValue(offset, referenceStr) {
      offset += this.tokenIndex;
      if (offset < this.tokenCount) {
        return cmpStr(
          this.source,
          this.offsetAndType[offset - 1] & OFFSET_MASK,
          this.offsetAndType[offset] & OFFSET_MASK,
          referenceStr
        );
      }
      return false;
    }
    getTokenStart(tokenIndex) {
      if (tokenIndex === this.tokenIndex) {
        return this.tokenStart;
      }
      if (tokenIndex > 0) {
        return tokenIndex < this.tokenCount ? this.offsetAndType[tokenIndex - 1] & OFFSET_MASK : this.offsetAndType[this.tokenCount] & OFFSET_MASK;
      }
      return this.firstCharOffset;
    }
    substrToCursor(start) {
      return this.source.substring(start, this.tokenStart);
    }
    isBalanceEdge(pos) {
      return this.balance[this.tokenIndex] < pos;
    }
    isDelim(code2, offset) {
      if (offset) {
        return this.lookupType(offset) === Delim && this.source.charCodeAt(this.lookupOffset(offset)) === code2;
      }
      return this.tokenType === Delim && this.source.charCodeAt(this.tokenStart) === code2;
    }
    skip(tokenCount) {
      let next = this.tokenIndex + tokenCount;
      if (next < this.tokenCount) {
        this.tokenIndex = next;
        this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
        next = this.offsetAndType[next];
        this.tokenType = next >> TYPE_SHIFT;
        this.tokenEnd = next & OFFSET_MASK;
      } else {
        this.tokenIndex = this.tokenCount;
        this.next();
      }
    }
    next() {
      let next = this.tokenIndex + 1;
      if (next < this.tokenCount) {
        this.tokenIndex = next;
        this.tokenStart = this.tokenEnd;
        next = this.offsetAndType[next];
        this.tokenType = next >> TYPE_SHIFT;
        this.tokenEnd = next & OFFSET_MASK;
      } else {
        this.eof = true;
        this.tokenIndex = this.tokenCount;
        this.tokenType = EOF;
        this.tokenStart = this.tokenEnd = this.source.length;
      }
    }
    skipSC() {
      while (this.tokenType === WhiteSpace || this.tokenType === Comment) {
        this.next();
      }
    }
    skipUntilBalanced(startToken, stopConsume) {
      let cursor = startToken;
      let balanceEnd;
      let offset;
      loop:
        for (; cursor < this.tokenCount; cursor++) {
          balanceEnd = this.balance[cursor];
          if (balanceEnd < startToken) {
            break loop;
          }
          offset = cursor > 0 ? this.offsetAndType[cursor - 1] & OFFSET_MASK : this.firstCharOffset;
          switch (stopConsume(this.source.charCodeAt(offset))) {
            case 1:
              break loop;
            case 2:
              cursor++;
              break loop;
            default:
              if (this.balance[balanceEnd] === cursor) {
                cursor = balanceEnd;
              }
          }
        }
      this.skip(cursor - this.tokenIndex);
    }
    forEachToken(fn) {
      for (let i2 = 0, offset = this.firstCharOffset; i2 < this.tokenCount; i2++) {
        const start = offset;
        const item = this.offsetAndType[i2];
        const end = item & OFFSET_MASK;
        const type = item >> TYPE_SHIFT;
        offset = end;
        fn(type, start, end, i2);
      }
    }
    dump() {
      const tokens = new Array(this.tokenCount);
      this.forEachToken((type, start, end, index2) => {
        tokens[index2] = {
          idx: index2,
          type: names_default[type],
          chunk: this.source.substring(start, end),
          balance: this.balance[index2]
        };
      });
      return tokens;
    }
  };

  // ../../node_modules/css-tree/lib/tokenizer/index.js
  function tokenize(source, onToken) {
    function getCharCode2(offset2) {
      return offset2 < sourceLength ? source.charCodeAt(offset2) : 0;
    }
    function consumeNumericToken() {
      offset = consumeNumber(source, offset);
      if (isIdentifierStart(getCharCode2(offset), getCharCode2(offset + 1), getCharCode2(offset + 2))) {
        type = Dimension;
        offset = consumeName(source, offset);
        return;
      }
      if (getCharCode2(offset) === 37) {
        type = Percentage;
        offset++;
        return;
      }
      type = Number2;
    }
    function consumeIdentLikeToken() {
      const nameStartOffset = offset;
      offset = consumeName(source, offset);
      if (cmpStr(source, nameStartOffset, offset, "url") && getCharCode2(offset) === 40) {
        offset = findWhiteSpaceEnd(source, offset + 1);
        if (getCharCode2(offset) === 34 || getCharCode2(offset) === 39) {
          type = Function2;
          offset = nameStartOffset + 4;
          return;
        }
        consumeUrlToken();
        return;
      }
      if (getCharCode2(offset) === 40) {
        type = Function2;
        offset++;
        return;
      }
      type = Ident;
    }
    function consumeStringToken(endingCodePoint) {
      if (!endingCodePoint) {
        endingCodePoint = getCharCode2(offset++);
      }
      type = String2;
      for (; offset < source.length; offset++) {
        const code2 = source.charCodeAt(offset);
        switch (charCodeCategory(code2)) {
          case endingCodePoint:
            offset++;
            return;
          case WhiteSpaceCategory:
            if (isNewline(code2)) {
              offset += getNewlineLength(source, offset, code2);
              type = BadString;
              return;
            }
            break;
          case 92:
            if (offset === source.length - 1) {
              break;
            }
            const nextCode = getCharCode2(offset + 1);
            if (isNewline(nextCode)) {
              offset += getNewlineLength(source, offset + 1, nextCode);
            } else if (isValidEscape(code2, nextCode)) {
              offset = consumeEscaped(source, offset) - 1;
            }
            break;
        }
      }
    }
    function consumeUrlToken() {
      type = Url;
      offset = findWhiteSpaceEnd(source, offset);
      for (; offset < source.length; offset++) {
        const code2 = source.charCodeAt(offset);
        switch (charCodeCategory(code2)) {
          case 41:
            offset++;
            return;
          case WhiteSpaceCategory:
            offset = findWhiteSpaceEnd(source, offset);
            if (getCharCode2(offset) === 41 || offset >= source.length) {
              if (offset < source.length) {
                offset++;
              }
              return;
            }
            offset = consumeBadUrlRemnants(source, offset);
            type = BadUrl;
            return;
          case 34:
          case 39:
          case 40:
          case NonPrintableCategory:
            offset = consumeBadUrlRemnants(source, offset);
            type = BadUrl;
            return;
          case 92:
            if (isValidEscape(code2, getCharCode2(offset + 1))) {
              offset = consumeEscaped(source, offset) - 1;
              break;
            }
            offset = consumeBadUrlRemnants(source, offset);
            type = BadUrl;
            return;
        }
      }
    }
    source = String(source || "");
    const sourceLength = source.length;
    let start = isBOM(getCharCode2(0));
    let offset = start;
    let type;
    while (offset < sourceLength) {
      const code2 = source.charCodeAt(offset);
      switch (charCodeCategory(code2)) {
        case WhiteSpaceCategory:
          type = WhiteSpace;
          offset = findWhiteSpaceEnd(source, offset + 1);
          break;
        case 34:
          consumeStringToken();
          break;
        case 35:
          if (isName(getCharCode2(offset + 1)) || isValidEscape(getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            type = Hash;
            offset = consumeName(source, offset + 1);
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 39:
          consumeStringToken();
          break;
        case 40:
          type = LeftParenthesis;
          offset++;
          break;
        case 41:
          type = RightParenthesis;
          offset++;
          break;
        case 43:
          if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 44:
          type = Comma;
          offset++;
          break;
        case 45:
          if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            if (getCharCode2(offset + 1) === 45 && getCharCode2(offset + 2) === 62) {
              type = CDC;
              offset = offset + 3;
            } else {
              if (isIdentifierStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
                consumeIdentLikeToken();
              } else {
                type = Delim;
                offset++;
              }
            }
          }
          break;
        case 46:
          if (isNumberStart(code2, getCharCode2(offset + 1), getCharCode2(offset + 2))) {
            consumeNumericToken();
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 47:
          if (getCharCode2(offset + 1) === 42) {
            type = Comment;
            offset = source.indexOf("*/", offset + 2);
            offset = offset === -1 ? source.length : offset + 2;
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 58:
          type = Colon;
          offset++;
          break;
        case 59:
          type = Semicolon;
          offset++;
          break;
        case 60:
          if (getCharCode2(offset + 1) === 33 && getCharCode2(offset + 2) === 45 && getCharCode2(offset + 3) === 45) {
            type = CDO;
            offset = offset + 4;
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 64:
          if (isIdentifierStart(getCharCode2(offset + 1), getCharCode2(offset + 2), getCharCode2(offset + 3))) {
            type = AtKeyword;
            offset = consumeName(source, offset + 1);
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 91:
          type = LeftSquareBracket;
          offset++;
          break;
        case 92:
          if (isValidEscape(code2, getCharCode2(offset + 1))) {
            consumeIdentLikeToken();
          } else {
            type = Delim;
            offset++;
          }
          break;
        case 93:
          type = RightSquareBracket;
          offset++;
          break;
        case 123:
          type = LeftCurlyBracket;
          offset++;
          break;
        case 125:
          type = RightCurlyBracket;
          offset++;
          break;
        case DigitCategory:
          consumeNumericToken();
          break;
        case NameStartCategory:
          consumeIdentLikeToken();
          break;
        default:
          type = Delim;
          offset++;
      }
      onToken(type, start, start = offset);
    }
  }

  // ../../node_modules/css-tree/lib/utils/List.js
  var releasedCursors = null;
  var List = class _List {
    static createItem(data) {
      return {
        prev: null,
        next: null,
        data
      };
    }
    constructor() {
      this.head = null;
      this.tail = null;
      this.cursor = null;
    }
    createItem(data) {
      return _List.createItem(data);
    }
    // cursor helpers
    allocateCursor(prev, next) {
      let cursor;
      if (releasedCursors !== null) {
        cursor = releasedCursors;
        releasedCursors = releasedCursors.cursor;
        cursor.prev = prev;
        cursor.next = next;
        cursor.cursor = this.cursor;
      } else {
        cursor = {
          prev,
          next,
          cursor: this.cursor
        };
      }
      this.cursor = cursor;
      return cursor;
    }
    releaseCursor() {
      const { cursor } = this;
      this.cursor = cursor.cursor;
      cursor.prev = null;
      cursor.next = null;
      cursor.cursor = releasedCursors;
      releasedCursors = cursor;
    }
    updateCursors(prevOld, prevNew, nextOld, nextNew) {
      let { cursor } = this;
      while (cursor !== null) {
        if (cursor.prev === prevOld) {
          cursor.prev = prevNew;
        }
        if (cursor.next === nextOld) {
          cursor.next = nextNew;
        }
        cursor = cursor.cursor;
      }
    }
    *[Symbol.iterator]() {
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        yield cursor.data;
      }
    }
    // getters
    get size() {
      let size = 0;
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        size++;
      }
      return size;
    }
    get isEmpty() {
      return this.head === null;
    }
    get first() {
      return this.head && this.head.data;
    }
    get last() {
      return this.tail && this.tail.data;
    }
    // convertors
    fromArray(array) {
      let cursor = null;
      this.head = null;
      for (let data of array) {
        const item = _List.createItem(data);
        if (cursor !== null) {
          cursor.next = item;
        } else {
          this.head = item;
        }
        item.prev = cursor;
        cursor = item;
      }
      this.tail = cursor;
      return this;
    }
    toArray() {
      return [...this];
    }
    toJSON() {
      return [...this];
    }
    // array-like methods
    forEach(fn, thisArg = this) {
      const cursor = this.allocateCursor(null, this.head);
      while (cursor.next !== null) {
        const item = cursor.next;
        cursor.next = item.next;
        fn.call(thisArg, item.data, item, this);
      }
      this.releaseCursor();
    }
    forEachRight(fn, thisArg = this) {
      const cursor = this.allocateCursor(this.tail, null);
      while (cursor.prev !== null) {
        const item = cursor.prev;
        cursor.prev = item.prev;
        fn.call(thisArg, item.data, item, this);
      }
      this.releaseCursor();
    }
    reduce(fn, initialValue, thisArg = this) {
      let cursor = this.allocateCursor(null, this.head);
      let acc = initialValue;
      let item;
      while (cursor.next !== null) {
        item = cursor.next;
        cursor.next = item.next;
        acc = fn.call(thisArg, acc, item.data, item, this);
      }
      this.releaseCursor();
      return acc;
    }
    reduceRight(fn, initialValue, thisArg = this) {
      let cursor = this.allocateCursor(this.tail, null);
      let acc = initialValue;
      let item;
      while (cursor.prev !== null) {
        item = cursor.prev;
        cursor.prev = item.prev;
        acc = fn.call(thisArg, acc, item.data, item, this);
      }
      this.releaseCursor();
      return acc;
    }
    some(fn, thisArg = this) {
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        if (fn.call(thisArg, cursor.data, cursor, this)) {
          return true;
        }
      }
      return false;
    }
    map(fn, thisArg = this) {
      const result = new _List();
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        result.appendData(fn.call(thisArg, cursor.data, cursor, this));
      }
      return result;
    }
    filter(fn, thisArg = this) {
      const result = new _List();
      for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
        if (fn.call(thisArg, cursor.data, cursor, this)) {
          result.appendData(cursor.data);
        }
      }
      return result;
    }
    nextUntil(start, fn, thisArg = this) {
      if (start === null) {
        return;
      }
      const cursor = this.allocateCursor(null, start);
      while (cursor.next !== null) {
        const item = cursor.next;
        cursor.next = item.next;
        if (fn.call(thisArg, item.data, item, this)) {
          break;
        }
      }
      this.releaseCursor();
    }
    prevUntil(start, fn, thisArg = this) {
      if (start === null) {
        return;
      }
      const cursor = this.allocateCursor(start, null);
      while (cursor.prev !== null) {
        const item = cursor.prev;
        cursor.prev = item.prev;
        if (fn.call(thisArg, item.data, item, this)) {
          break;
        }
      }
      this.releaseCursor();
    }
    // mutation
    clear() {
      this.head = null;
      this.tail = null;
    }
    copy() {
      const result = new _List();
      for (let data of this) {
        result.appendData(data);
      }
      return result;
    }
    prepend(item) {
      this.updateCursors(null, item, this.head, item);
      if (this.head !== null) {
        this.head.prev = item;
        item.next = this.head;
      } else {
        this.tail = item;
      }
      this.head = item;
      return this;
    }
    prependData(data) {
      return this.prepend(_List.createItem(data));
    }
    append(item) {
      return this.insert(item);
    }
    appendData(data) {
      return this.insert(_List.createItem(data));
    }
    insert(item, before = null) {
      if (before !== null) {
        this.updateCursors(before.prev, item, before, item);
        if (before.prev === null) {
          if (this.head !== before) {
            throw new Error("before doesn't belong to list");
          }
          this.head = item;
          before.prev = item;
          item.next = before;
          this.updateCursors(null, item);
        } else {
          before.prev.next = item;
          item.prev = before.prev;
          before.prev = item;
          item.next = before;
        }
      } else {
        this.updateCursors(this.tail, item, null, item);
        if (this.tail !== null) {
          this.tail.next = item;
          item.prev = this.tail;
        } else {
          this.head = item;
        }
        this.tail = item;
      }
      return this;
    }
    insertData(data, before) {
      return this.insert(_List.createItem(data), before);
    }
    remove(item) {
      this.updateCursors(item, item.prev, item, item.next);
      if (item.prev !== null) {
        item.prev.next = item.next;
      } else {
        if (this.head !== item) {
          throw new Error("item doesn't belong to list");
        }
        this.head = item.next;
      }
      if (item.next !== null) {
        item.next.prev = item.prev;
      } else {
        if (this.tail !== item) {
          throw new Error("item doesn't belong to list");
        }
        this.tail = item.prev;
      }
      item.prev = null;
      item.next = null;
      return item;
    }
    push(data) {
      this.insert(_List.createItem(data));
    }
    pop() {
      return this.tail !== null ? this.remove(this.tail) : null;
    }
    unshift(data) {
      this.prepend(_List.createItem(data));
    }
    shift() {
      return this.head !== null ? this.remove(this.head) : null;
    }
    prependList(list) {
      return this.insertList(list, this.head);
    }
    appendList(list) {
      return this.insertList(list);
    }
    insertList(list, before) {
      if (list.head === null) {
        return this;
      }
      if (before !== void 0 && before !== null) {
        this.updateCursors(before.prev, list.tail, before, list.head);
        if (before.prev !== null) {
          before.prev.next = list.head;
          list.head.prev = before.prev;
        } else {
          this.head = list.head;
        }
        before.prev = list.tail;
        list.tail.next = before;
      } else {
        this.updateCursors(this.tail, list.tail, null, list.head);
        if (this.tail !== null) {
          this.tail.next = list.head;
          list.head.prev = this.tail;
        } else {
          this.head = list.head;
        }
        this.tail = list.tail;
      }
      list.head = null;
      list.tail = null;
      return this;
    }
    replace(oldItem, newItemOrList) {
      if ("head" in newItemOrList) {
        this.insertList(newItemOrList, oldItem);
      } else {
        this.insert(newItemOrList, oldItem);
      }
      this.remove(oldItem);
    }
  };

  // ../../node_modules/css-tree/lib/utils/create-custom-error.js
  function createCustomError(name42, message) {
    const error = Object.create(SyntaxError.prototype);
    const errorStack = new Error();
    return Object.assign(error, {
      name: name42,
      message,
      get stack() {
        return (errorStack.stack || "").replace(/^(.+\n){1,3}/, `${name42}: ${message}
`);
      }
    });
  }

  // ../../node_modules/css-tree/lib/parser/SyntaxError.js
  var MAX_LINE_LENGTH = 100;
  var OFFSET_CORRECTION = 60;
  var TAB_REPLACEMENT = "    ";
  function sourceFragment({ source, line, column }, extraLines) {
    function processLines(start, end) {
      return lines.slice(start, end).map(
        (line2, idx) => String(start + idx + 1).padStart(maxNumLength) + " |" + line2
      ).join("\n");
    }
    const lines = source.split(/\r\n?|\n|\f/);
    const startLine = Math.max(1, line - extraLines) - 1;
    const endLine = Math.min(line + extraLines, lines.length + 1);
    const maxNumLength = Math.max(4, String(endLine).length) + 1;
    let cutLeft = 0;
    column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;
    if (column > MAX_LINE_LENGTH) {
      cutLeft = column - OFFSET_CORRECTION + 3;
      column = OFFSET_CORRECTION - 2;
    }
    for (let i2 = startLine; i2 <= endLine; i2++) {
      if (i2 >= 0 && i2 < lines.length) {
        lines[i2] = lines[i2].replace(/\t/g, TAB_REPLACEMENT);
        lines[i2] = (cutLeft > 0 && lines[i2].length > cutLeft ? "\u2026" : "") + lines[i2].substr(cutLeft, MAX_LINE_LENGTH - 2) + (lines[i2].length > cutLeft + MAX_LINE_LENGTH - 1 ? "\u2026" : "");
      }
    }
    return [
      processLines(startLine, line),
      new Array(column + maxNumLength + 2).join("-") + "^",
      processLines(line, endLine)
    ].filter(Boolean).join("\n");
  }
  function SyntaxError2(message, source, offset, line, column) {
    const error = Object.assign(createCustomError("SyntaxError", message), {
      source,
      offset,
      line,
      column,
      sourceFragment(extraLines) {
        return sourceFragment({ source, line, column }, isNaN(extraLines) ? 0 : extraLines);
      },
      get formattedMessage() {
        return `Parse error: ${message}
` + sourceFragment({ source, line, column }, 2);
      }
    });
    return error;
  }

  // ../../node_modules/css-tree/lib/parser/sequence.js
  function readSequence(recognizer) {
    const children = this.createList();
    let space = false;
    const context = {
      recognizer
    };
    while (!this.eof) {
      switch (this.tokenType) {
        case Comment:
          this.next();
          continue;
        case WhiteSpace:
          space = true;
          this.next();
          continue;
      }
      let child = recognizer.getNode.call(this, context);
      if (child === void 0) {
        break;
      }
      if (space) {
        if (recognizer.onWhiteSpace) {
          recognizer.onWhiteSpace.call(this, child, children, context);
        }
        space = false;
      }
      children.push(child);
    }
    if (space && recognizer.onWhiteSpace) {
      recognizer.onWhiteSpace.call(this, null, children, context);
    }
    return children;
  }

  // ../../node_modules/css-tree/lib/parser/create.js
  var NOOP = () => {
  };
  var EXCLAMATIONMARK = 33;
  var NUMBERSIGN = 35;
  var SEMICOLON = 59;
  var LEFTCURLYBRACKET = 123;
  var NULL = 0;
  function createParseContext(name42) {
    return function() {
      return this[name42]();
    };
  }
  function fetchParseValues(dict) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const name42 in dict) {
      const item = dict[name42];
      const fn = item.parse || item;
      if (fn) {
        result[name42] = fn;
      }
    }
    return result;
  }
  function processConfig(config) {
    const parseConfig = {
      context: /* @__PURE__ */ Object.create(null),
      scope: Object.assign(/* @__PURE__ */ Object.create(null), config.scope),
      atrule: fetchParseValues(config.atrule),
      pseudo: fetchParseValues(config.pseudo),
      node: fetchParseValues(config.node)
    };
    for (const name42 in config.parseContext) {
      switch (typeof config.parseContext[name42]) {
        case "function":
          parseConfig.context[name42] = config.parseContext[name42];
          break;
        case "string":
          parseConfig.context[name42] = createParseContext(config.parseContext[name42]);
          break;
      }
    }
    return {
      config: parseConfig,
      ...parseConfig,
      ...parseConfig.node
    };
  }
  function createParser(config) {
    let source = "";
    let filename = "<unknown>";
    let needPositions = false;
    let onParseError = NOOP;
    let onParseErrorThrow = false;
    const locationMap = new OffsetToLocation();
    const parser = Object.assign(new TokenStream(), processConfig(config || {}), {
      parseAtrulePrelude: true,
      parseRulePrelude: true,
      parseValue: true,
      parseCustomProperty: false,
      readSequence,
      consumeUntilBalanceEnd: () => 0,
      consumeUntilLeftCurlyBracket(code2) {
        return code2 === LEFTCURLYBRACKET ? 1 : 0;
      },
      consumeUntilLeftCurlyBracketOrSemicolon(code2) {
        return code2 === LEFTCURLYBRACKET || code2 === SEMICOLON ? 1 : 0;
      },
      consumeUntilExclamationMarkOrSemicolon(code2) {
        return code2 === EXCLAMATIONMARK || code2 === SEMICOLON ? 1 : 0;
      },
      consumeUntilSemicolonIncluded(code2) {
        return code2 === SEMICOLON ? 2 : 0;
      },
      createList() {
        return new List();
      },
      createSingleNodeList(node) {
        return new List().appendData(node);
      },
      getFirstListNode(list) {
        return list && list.first;
      },
      getLastListNode(list) {
        return list && list.last;
      },
      parseWithFallback(consumer, fallback) {
        const startToken = this.tokenIndex;
        try {
          return consumer.call(this);
        } catch (e) {
          if (onParseErrorThrow) {
            throw e;
          }
          const fallbackNode = fallback.call(this, startToken);
          onParseErrorThrow = true;
          onParseError(e, fallbackNode);
          onParseErrorThrow = false;
          return fallbackNode;
        }
      },
      lookupNonWSType(offset) {
        let type;
        do {
          type = this.lookupType(offset++);
          if (type !== WhiteSpace) {
            return type;
          }
        } while (type !== NULL);
        return NULL;
      },
      charCodeAt(offset) {
        return offset >= 0 && offset < source.length ? source.charCodeAt(offset) : 0;
      },
      substring(offsetStart, offsetEnd) {
        return source.substring(offsetStart, offsetEnd);
      },
      substrToCursor(start) {
        return this.source.substring(start, this.tokenStart);
      },
      cmpChar(offset, charCode) {
        return cmpChar(source, offset, charCode);
      },
      cmpStr(offsetStart, offsetEnd, str) {
        return cmpStr(source, offsetStart, offsetEnd, str);
      },
      consume(tokenType2) {
        const start = this.tokenStart;
        this.eat(tokenType2);
        return this.substrToCursor(start);
      },
      consumeFunctionName() {
        const name42 = source.substring(this.tokenStart, this.tokenEnd - 1);
        this.eat(Function2);
        return name42;
      },
      consumeNumber(type) {
        const number2 = source.substring(this.tokenStart, consumeNumber(source, this.tokenStart));
        this.eat(type);
        return number2;
      },
      eat(tokenType2) {
        if (this.tokenType !== tokenType2) {
          const tokenName = names_default[tokenType2].slice(0, -6).replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase());
          let message = `${/[[\](){}]/.test(tokenName) ? `"${tokenName}"` : tokenName} is expected`;
          let offset = this.tokenStart;
          switch (tokenType2) {
            case Ident:
              if (this.tokenType === Function2 || this.tokenType === Url) {
                offset = this.tokenEnd - 1;
                message = "Identifier is expected but function found";
              } else {
                message = "Identifier is expected";
              }
              break;
            case Hash:
              if (this.isDelim(NUMBERSIGN)) {
                this.next();
                offset++;
                message = "Name is expected";
              }
              break;
            case Percentage:
              if (this.tokenType === Number2) {
                offset = this.tokenEnd;
                message = "Percent sign is expected";
              }
              break;
          }
          this.error(message, offset);
        }
        this.next();
      },
      eatIdent(name42) {
        if (this.tokenType !== Ident || this.lookupValue(0, name42) === false) {
          this.error(`Identifier "${name42}" is expected`);
        }
        this.next();
      },
      eatDelim(code2) {
        if (!this.isDelim(code2)) {
          this.error(`Delim "${String.fromCharCode(code2)}" is expected`);
        }
        this.next();
      },
      getLocation(start, end) {
        if (needPositions) {
          return locationMap.getLocationRange(
            start,
            end,
            filename
          );
        }
        return null;
      },
      getLocationFromList(list) {
        if (needPositions) {
          const head2 = this.getFirstListNode(list);
          const tail2 = this.getLastListNode(list);
          return locationMap.getLocationRange(
            head2 !== null ? head2.loc.start.offset - locationMap.startOffset : this.tokenStart,
            tail2 !== null ? tail2.loc.end.offset - locationMap.startOffset : this.tokenStart,
            filename
          );
        }
        return null;
      },
      error(message, offset) {
        const location = typeof offset !== "undefined" && offset < source.length ? locationMap.getLocation(offset) : this.eof ? locationMap.getLocation(findWhiteSpaceStart(source, source.length - 1)) : locationMap.getLocation(this.tokenStart);
        throw new SyntaxError2(
          message || "Unexpected input",
          source,
          location.offset,
          location.line,
          location.column
        );
      }
    });
    const parse44 = function(source_, options) {
      source = source_;
      options = options || {};
      parser.setSource(source, tokenize);
      locationMap.setSource(
        source,
        options.offset,
        options.line,
        options.column
      );
      filename = options.filename || "<unknown>";
      needPositions = Boolean(options.positions);
      onParseError = typeof options.onParseError === "function" ? options.onParseError : NOOP;
      onParseErrorThrow = false;
      parser.parseAtrulePrelude = "parseAtrulePrelude" in options ? Boolean(options.parseAtrulePrelude) : true;
      parser.parseRulePrelude = "parseRulePrelude" in options ? Boolean(options.parseRulePrelude) : true;
      parser.parseValue = "parseValue" in options ? Boolean(options.parseValue) : true;
      parser.parseCustomProperty = "parseCustomProperty" in options ? Boolean(options.parseCustomProperty) : false;
      const { context = "default", onComment } = options;
      if (context in parser.context === false) {
        throw new Error("Unknown context `" + context + "`");
      }
      if (typeof onComment === "function") {
        parser.forEachToken((type, start, end) => {
          if (type === Comment) {
            const loc = parser.getLocation(start, end);
            const value2 = cmpStr(source, end - 2, end, "*/") ? source.slice(start + 2, end - 2) : source.slice(start + 2, end);
            onComment(value2, loc);
          }
        });
      }
      const ast = parser.context[context].call(parser, options);
      if (!parser.eof) {
        parser.error();
      }
      return ast;
    };
    return Object.assign(parse44, {
      SyntaxError: SyntaxError2,
      config: parser.config
    });
  }

  // ../../node_modules/css-tree/lib/generator/sourceMap.js
  var import_source_map_generator = __toESM(require_source_map_generator(), 1);
  var trackNodes = /* @__PURE__ */ new Set(["Atrule", "Selector", "Declaration"]);
  function generateSourceMap(handlers) {
    const map11 = new import_source_map_generator.SourceMapGenerator();
    const generated = {
      line: 1,
      column: 0
    };
    const original = {
      line: 0,
      // should be zero to add first mapping
      column: 0
    };
    const activatedGenerated = {
      line: 1,
      column: 0
    };
    const activatedMapping = {
      generated: activatedGenerated
    };
    let line = 1;
    let column = 0;
    let sourceMappingActive = false;
    const origHandlersNode = handlers.node;
    handlers.node = function(node) {
      if (node.loc && node.loc.start && trackNodes.has(node.type)) {
        const nodeLine = node.loc.start.line;
        const nodeColumn = node.loc.start.column - 1;
        if (original.line !== nodeLine || original.column !== nodeColumn) {
          original.line = nodeLine;
          original.column = nodeColumn;
          generated.line = line;
          generated.column = column;
          if (sourceMappingActive) {
            sourceMappingActive = false;
            if (generated.line !== activatedGenerated.line || generated.column !== activatedGenerated.column) {
              map11.addMapping(activatedMapping);
            }
          }
          sourceMappingActive = true;
          map11.addMapping({
            source: node.loc.source,
            original,
            generated
          });
        }
      }
      origHandlersNode.call(this, node);
      if (sourceMappingActive && trackNodes.has(node.type)) {
        activatedGenerated.line = line;
        activatedGenerated.column = column;
      }
    };
    const origHandlersEmit = handlers.emit;
    handlers.emit = function(value2, type, auto) {
      for (let i2 = 0; i2 < value2.length; i2++) {
        if (value2.charCodeAt(i2) === 10) {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      origHandlersEmit(value2, type, auto);
    };
    const origHandlersResult = handlers.result;
    handlers.result = function() {
      if (sourceMappingActive) {
        map11.addMapping(activatedMapping);
      }
      return {
        css: origHandlersResult(),
        map: map11
      };
    };
    return handlers;
  }

  // ../../node_modules/css-tree/lib/generator/token-before.js
  var token_before_exports = {};
  __export(token_before_exports, {
    safe: () => safe,
    spec: () => spec
  });
  var PLUSSIGN = 43;
  var HYPHENMINUS = 45;
  var code = (type, value2) => {
    if (type === Delim) {
      type = value2;
    }
    if (typeof type === "string") {
      const charCode = type.charCodeAt(0);
      return charCode > 127 ? 32768 : charCode << 8;
    }
    return type;
  };
  var specPairs = [
    [Ident, Ident],
    [Ident, Function2],
    [Ident, Url],
    [Ident, BadUrl],
    [Ident, "-"],
    [Ident, Number2],
    [Ident, Percentage],
    [Ident, Dimension],
    [Ident, CDC],
    [Ident, LeftParenthesis],
    [AtKeyword, Ident],
    [AtKeyword, Function2],
    [AtKeyword, Url],
    [AtKeyword, BadUrl],
    [AtKeyword, "-"],
    [AtKeyword, Number2],
    [AtKeyword, Percentage],
    [AtKeyword, Dimension],
    [AtKeyword, CDC],
    [Hash, Ident],
    [Hash, Function2],
    [Hash, Url],
    [Hash, BadUrl],
    [Hash, "-"],
    [Hash, Number2],
    [Hash, Percentage],
    [Hash, Dimension],
    [Hash, CDC],
    [Dimension, Ident],
    [Dimension, Function2],
    [Dimension, Url],
    [Dimension, BadUrl],
    [Dimension, "-"],
    [Dimension, Number2],
    [Dimension, Percentage],
    [Dimension, Dimension],
    [Dimension, CDC],
    ["#", Ident],
    ["#", Function2],
    ["#", Url],
    ["#", BadUrl],
    ["#", "-"],
    ["#", Number2],
    ["#", Percentage],
    ["#", Dimension],
    ["#", CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    ["-", Ident],
    ["-", Function2],
    ["-", Url],
    ["-", BadUrl],
    ["-", "-"],
    ["-", Number2],
    ["-", Percentage],
    ["-", Dimension],
    ["-", CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    [Number2, Ident],
    [Number2, Function2],
    [Number2, Url],
    [Number2, BadUrl],
    [Number2, Number2],
    [Number2, Percentage],
    [Number2, Dimension],
    [Number2, "%"],
    [Number2, CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    ["@", Ident],
    ["@", Function2],
    ["@", Url],
    ["@", BadUrl],
    ["@", "-"],
    ["@", CDC],
    // https://github.com/w3c/csswg-drafts/pull/6874
    [".", Number2],
    [".", Percentage],
    [".", Dimension],
    ["+", Number2],
    ["+", Percentage],
    ["+", Dimension],
    ["/", "*"]
  ];
  var safePairs = specPairs.concat([
    [Ident, Hash],
    [Dimension, Hash],
    [Hash, Hash],
    [AtKeyword, LeftParenthesis],
    [AtKeyword, String2],
    [AtKeyword, Colon],
    [Percentage, Percentage],
    [Percentage, Dimension],
    [Percentage, Function2],
    [Percentage, "-"],
    [RightParenthesis, Ident],
    [RightParenthesis, Function2],
    [RightParenthesis, Percentage],
    [RightParenthesis, Dimension],
    [RightParenthesis, Hash],
    [RightParenthesis, "-"]
  ]);
  function createMap(pairs) {
    const isWhiteSpaceRequired = new Set(
      pairs.map(([prev, next]) => code(prev) << 16 | code(next))
    );
    return function(prevCode, type, value2) {
      const nextCode = code(type, value2);
      const nextCharCode = value2.charCodeAt(0);
      const emitWs = nextCharCode === HYPHENMINUS && type !== Ident && type !== Function2 && type !== CDC || nextCharCode === PLUSSIGN ? isWhiteSpaceRequired.has(prevCode << 16 | nextCharCode << 8) : isWhiteSpaceRequired.has(prevCode << 16 | nextCode);
      if (emitWs) {
        this.emit(" ", WhiteSpace, true);
      }
      return nextCode;
    };
  }
  var spec = createMap(specPairs);
  var safe = createMap(safePairs);

  // ../../node_modules/css-tree/lib/generator/create.js
  var REVERSESOLIDUS = 92;
  function processChildren(node, delimeter) {
    if (typeof delimeter === "function") {
      let prev = null;
      node.children.forEach((node2) => {
        if (prev !== null) {
          delimeter.call(this, prev);
        }
        this.node(node2);
        prev = node2;
      });
      return;
    }
    node.children.forEach(this.node, this);
  }
  function processChunk(chunk) {
    tokenize(chunk, (type, start, end) => {
      this.token(type, chunk.slice(start, end));
    });
  }
  function createGenerator(config) {
    const types = /* @__PURE__ */ new Map();
    for (let name42 in config.node) {
      const item = config.node[name42];
      const fn = item.generate || item;
      if (typeof fn === "function") {
        types.set(name42, item.generate || item);
      }
    }
    return function(node, options) {
      let buffer = "";
      let prevCode = 0;
      let handlers = {
        node(node2) {
          if (types.has(node2.type)) {
            types.get(node2.type).call(publicApi, node2);
          } else {
            throw new Error("Unknown node type: " + node2.type);
          }
        },
        tokenBefore: safe,
        token(type, value2) {
          prevCode = this.tokenBefore(prevCode, type, value2);
          this.emit(value2, type, false);
          if (type === Delim && value2.charCodeAt(0) === REVERSESOLIDUS) {
            this.emit("\n", WhiteSpace, true);
          }
        },
        emit(value2) {
          buffer += value2;
        },
        result() {
          return buffer;
        }
      };
      if (options) {
        if (typeof options.decorator === "function") {
          handlers = options.decorator(handlers);
        }
        if (options.sourceMap) {
          handlers = generateSourceMap(handlers);
        }
        if (options.mode in token_before_exports) {
          handlers.tokenBefore = token_before_exports[options.mode];
        }
      }
      const publicApi = {
        node: (node2) => handlers.node(node2),
        children: processChildren,
        token: (type, value2) => handlers.token(type, value2),
        tokenize: processChunk
      };
      handlers.node(node);
      return handlers.result();
    };
  }

  // ../../node_modules/css-tree/lib/convertor/create.js
  function createConvertor(walk3) {
    return {
      fromPlainObject(ast) {
        walk3(ast, {
          enter(node) {
            if (node.children && node.children instanceof List === false) {
              node.children = new List().fromArray(node.children);
            }
          }
        });
        return ast;
      },
      toPlainObject(ast) {
        walk3(ast, {
          leave(node) {
            if (node.children && node.children instanceof List) {
              node.children = node.children.toArray();
            }
          }
        });
        return ast;
      }
    };
  }

  // ../../node_modules/css-tree/lib/walker/create.js
  var { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  var noop = function() {
  };
  function ensureFunction(value2) {
    return typeof value2 === "function" ? value2 : noop;
  }
  function invokeForType(fn, type) {
    return function(node, item, list) {
      if (node.type === type) {
        fn.call(this, node, item, list);
      }
    };
  }
  function getWalkersFromStructure(name42, nodeType) {
    const structure42 = nodeType.structure;
    const walkers = [];
    for (const key in structure42) {
      if (hasOwnProperty2.call(structure42, key) === false) {
        continue;
      }
      let fieldTypes = structure42[key];
      const walker = {
        name: key,
        type: false,
        nullable: false
      };
      if (!Array.isArray(fieldTypes)) {
        fieldTypes = [fieldTypes];
      }
      for (const fieldType of fieldTypes) {
        if (fieldType === null) {
          walker.nullable = true;
        } else if (typeof fieldType === "string") {
          walker.type = "node";
        } else if (Array.isArray(fieldType)) {
          walker.type = "list";
        }
      }
      if (walker.type) {
        walkers.push(walker);
      }
    }
    if (walkers.length) {
      return {
        context: nodeType.walkContext,
        fields: walkers
      };
    }
    return null;
  }
  function getTypesFromConfig(config) {
    const types = {};
    for (const name42 in config.node) {
      if (hasOwnProperty2.call(config.node, name42)) {
        const nodeType = config.node[name42];
        if (!nodeType.structure) {
          throw new Error("Missed `structure` field in `" + name42 + "` node type definition");
        }
        types[name42] = getWalkersFromStructure(name42, nodeType);
      }
    }
    return types;
  }
  function createTypeIterator(config, reverse) {
    const fields = config.fields.slice();
    const contextName = config.context;
    const useContext = typeof contextName === "string";
    if (reverse) {
      fields.reverse();
    }
    return function(node, context, walk3, walkReducer) {
      let prevContextValue;
      if (useContext) {
        prevContextValue = context[contextName];
        context[contextName] = node;
      }
      for (const field of fields) {
        const ref = node[field.name];
        if (!field.nullable || ref) {
          if (field.type === "list") {
            const breakWalk = reverse ? ref.reduceRight(walkReducer, false) : ref.reduce(walkReducer, false);
            if (breakWalk) {
              return true;
            }
          } else if (walk3(ref)) {
            return true;
          }
        }
      }
      if (useContext) {
        context[contextName] = prevContextValue;
      }
    };
  }
  function createFastTraveralMap({
    StyleSheet,
    Atrule,
    Rule,
    Block,
    DeclarationList
  }) {
    return {
      Atrule: {
        StyleSheet,
        Atrule,
        Rule,
        Block
      },
      Rule: {
        StyleSheet,
        Atrule,
        Rule,
        Block
      },
      Declaration: {
        StyleSheet,
        Atrule,
        Rule,
        Block,
        DeclarationList
      }
    };
  }
  function createWalker(config) {
    const types = getTypesFromConfig(config);
    const iteratorsNatural = {};
    const iteratorsReverse = {};
    const breakWalk = Symbol("break-walk");
    const skipNode = Symbol("skip-node");
    for (const name42 in types) {
      if (hasOwnProperty2.call(types, name42) && types[name42] !== null) {
        iteratorsNatural[name42] = createTypeIterator(types[name42], false);
        iteratorsReverse[name42] = createTypeIterator(types[name42], true);
      }
    }
    const fastTraversalIteratorsNatural = createFastTraveralMap(iteratorsNatural);
    const fastTraversalIteratorsReverse = createFastTraveralMap(iteratorsReverse);
    const walk3 = function(root, options) {
      function walkNode(node, item, list) {
        const enterRet = enter.call(context, node, item, list);
        if (enterRet === breakWalk) {
          return true;
        }
        if (enterRet === skipNode) {
          return false;
        }
        if (iterators.hasOwnProperty(node.type)) {
          if (iterators[node.type](node, context, walkNode, walkReducer)) {
            return true;
          }
        }
        if (leave.call(context, node, item, list) === breakWalk) {
          return true;
        }
        return false;
      }
      let enter = noop;
      let leave = noop;
      let iterators = iteratorsNatural;
      let walkReducer = (ret, data, item, list) => ret || walkNode(data, item, list);
      const context = {
        break: breakWalk,
        skip: skipNode,
        root,
        stylesheet: null,
        atrule: null,
        atrulePrelude: null,
        rule: null,
        selector: null,
        block: null,
        declaration: null,
        function: null
      };
      if (typeof options === "function") {
        enter = options;
      } else if (options) {
        enter = ensureFunction(options.enter);
        leave = ensureFunction(options.leave);
        if (options.reverse) {
          iterators = iteratorsReverse;
        }
        if (options.visit) {
          if (fastTraversalIteratorsNatural.hasOwnProperty(options.visit)) {
            iterators = options.reverse ? fastTraversalIteratorsReverse[options.visit] : fastTraversalIteratorsNatural[options.visit];
          } else if (!types.hasOwnProperty(options.visit)) {
            throw new Error("Bad value `" + options.visit + "` for `visit` option (should be: " + Object.keys(types).sort().join(", ") + ")");
          }
          enter = invokeForType(enter, options.visit);
          leave = invokeForType(leave, options.visit);
        }
      }
      if (enter === noop && leave === noop) {
        throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
      }
      walkNode(root);
    };
    walk3.break = breakWalk;
    walk3.skip = skipNode;
    walk3.find = function(ast, fn) {
      let found = null;
      walk3(ast, function(node, item, list) {
        if (fn.call(this, node, item, list)) {
          found = node;
          return breakWalk;
        }
      });
      return found;
    };
    walk3.findLast = function(ast, fn) {
      let found = null;
      walk3(ast, {
        reverse: true,
        enter(node, item, list) {
          if (fn.call(this, node, item, list)) {
            found = node;
            return breakWalk;
          }
        }
      });
      return found;
    };
    walk3.findAll = function(ast, fn) {
      const found = [];
      walk3(ast, function(node, item, list) {
        if (fn.call(this, node, item, list)) {
          found.push(node);
        }
      });
      return found;
    };
    return walk3;
  }

  // ../../node_modules/css-tree/lib/definition-syntax/generate.js
  function noop2(value2) {
    return value2;
  }
  function generateMultiplier(multiplier) {
    const { min: min2, max: max2, comma } = multiplier;
    if (min2 === 0 && max2 === 0) {
      return comma ? "#?" : "*";
    }
    if (min2 === 0 && max2 === 1) {
      return "?";
    }
    if (min2 === 1 && max2 === 0) {
      return comma ? "#" : "+";
    }
    if (min2 === 1 && max2 === 1) {
      return "";
    }
    return (comma ? "#" : "") + (min2 === max2 ? "{" + min2 + "}" : "{" + min2 + "," + (max2 !== 0 ? max2 : "") + "}");
  }
  function generateTypeOpts(node) {
    switch (node.type) {
      case "Range":
        return " [" + (node.min === null ? "-\u221E" : node.min) + "," + (node.max === null ? "\u221E" : node.max) + "]";
      default:
        throw new Error("Unknown node type `" + node.type + "`");
    }
  }
  function generateSequence(node, decorate, forceBraces, compact) {
    const combinator = node.combinator === " " || compact ? node.combinator : " " + node.combinator + " ";
    const result = node.terms.map((term) => internalGenerate(term, decorate, forceBraces, compact)).join(combinator);
    if (node.explicit || forceBraces) {
      return (compact || result[0] === "," ? "[" : "[ ") + result + (compact ? "]" : " ]");
    }
    return result;
  }
  function internalGenerate(node, decorate, forceBraces, compact) {
    let result;
    switch (node.type) {
      case "Group":
        result = generateSequence(node, decorate, forceBraces, compact) + (node.disallowEmpty ? "!" : "");
        break;
      case "Multiplier":
        return internalGenerate(node.term, decorate, forceBraces, compact) + decorate(generateMultiplier(node), node);
      case "Type":
        result = "<" + node.name + (node.opts ? decorate(generateTypeOpts(node.opts), node.opts) : "") + ">";
        break;
      case "Property":
        result = "<'" + node.name + "'>";
        break;
      case "Keyword":
        result = node.name;
        break;
      case "AtKeyword":
        result = "@" + node.name;
        break;
      case "Function":
        result = node.name + "(";
        break;
      case "String":
      case "Token":
        result = node.value;
        break;
      case "Comma":
        result = ",";
        break;
      default:
        throw new Error("Unknown node type `" + node.type + "`");
    }
    return decorate(result, node);
  }
  function generate(node, options) {
    let decorate = noop2;
    let forceBraces = false;
    let compact = false;
    if (typeof options === "function") {
      decorate = options;
    } else if (options) {
      forceBraces = Boolean(options.forceBraces);
      compact = Boolean(options.compact);
      if (typeof options.decorate === "function") {
        decorate = options.decorate;
      }
    }
    return internalGenerate(node, decorate, forceBraces, compact);
  }

  // ../../node_modules/css-tree/lib/lexer/error.js
  var defaultLoc = { offset: 0, line: 1, column: 1 };
  function locateMismatch(matchResult, node) {
    const tokens = matchResult.tokens;
    const longestMatch = matchResult.longestMatch;
    const mismatchNode = longestMatch < tokens.length ? tokens[longestMatch].node || null : null;
    const badNode = mismatchNode !== node ? mismatchNode : null;
    let mismatchOffset = 0;
    let mismatchLength = 0;
    let entries = 0;
    let css = "";
    let start;
    let end;
    for (let i2 = 0; i2 < tokens.length; i2++) {
      const token = tokens[i2].value;
      if (i2 === longestMatch) {
        mismatchLength = token.length;
        mismatchOffset = css.length;
      }
      if (badNode !== null && tokens[i2].node === badNode) {
        if (i2 <= longestMatch) {
          entries++;
        } else {
          entries = 0;
        }
      }
      css += token;
    }
    if (longestMatch === tokens.length || entries > 1) {
      start = fromLoc(badNode || node, "end") || buildLoc(defaultLoc, css);
      end = buildLoc(start);
    } else {
      start = fromLoc(badNode, "start") || buildLoc(fromLoc(node, "start") || defaultLoc, css.slice(0, mismatchOffset));
      end = fromLoc(badNode, "end") || buildLoc(start, css.substr(mismatchOffset, mismatchLength));
    }
    return {
      css,
      mismatchOffset,
      mismatchLength,
      start,
      end
    };
  }
  function fromLoc(node, point) {
    const value2 = node && node.loc && node.loc[point];
    if (value2) {
      return "line" in value2 ? buildLoc(value2) : value2;
    }
    return null;
  }
  function buildLoc({ offset, line, column }, extra) {
    const loc = {
      offset,
      line,
      column
    };
    if (extra) {
      const lines = extra.split(/\n|\r\n?|\f/);
      loc.offset += extra.length;
      loc.line += lines.length - 1;
      loc.column = lines.length === 1 ? loc.column + extra.length : lines.pop().length + 1;
    }
    return loc;
  }
  var SyntaxReferenceError = function(type, referenceName) {
    const error = createCustomError(
      "SyntaxReferenceError",
      type + (referenceName ? " `" + referenceName + "`" : "")
    );
    error.reference = referenceName;
    return error;
  };
  var SyntaxMatchError = function(message, syntax, node, matchResult) {
    const error = createCustomError("SyntaxMatchError", message);
    const {
      css,
      mismatchOffset,
      mismatchLength,
      start,
      end
    } = locateMismatch(matchResult, node);
    error.rawMessage = message;
    error.syntax = syntax ? generate(syntax) : "<generic>";
    error.css = css;
    error.mismatchOffset = mismatchOffset;
    error.mismatchLength = mismatchLength;
    error.message = message + "\n  syntax: " + error.syntax + "\n   value: " + (css || "<empty string>") + "\n  --------" + new Array(error.mismatchOffset + 1).join("-") + "^";
    Object.assign(error, start);
    error.loc = {
      source: node && node.loc && node.loc.source || "<unknown>",
      start,
      end
    };
    return error;
  };

  // ../../node_modules/css-tree/lib/utils/names.js
  var keywords = /* @__PURE__ */ new Map();
  var properties = /* @__PURE__ */ new Map();
  var HYPHENMINUS2 = 45;
  var keyword = getKeywordDescriptor;
  var property = getPropertyDescriptor;
  function isCustomProperty(str, offset) {
    offset = offset || 0;
    return str.length - offset >= 2 && str.charCodeAt(offset) === HYPHENMINUS2 && str.charCodeAt(offset + 1) === HYPHENMINUS2;
  }
  function getVendorPrefix(str, offset) {
    offset = offset || 0;
    if (str.length - offset >= 3) {
      if (str.charCodeAt(offset) === HYPHENMINUS2 && str.charCodeAt(offset + 1) !== HYPHENMINUS2) {
        const secondDashIndex = str.indexOf("-", offset + 2);
        if (secondDashIndex !== -1) {
          return str.substring(offset, secondDashIndex + 1);
        }
      }
    }
    return "";
  }
  function getKeywordDescriptor(keyword2) {
    if (keywords.has(keyword2)) {
      return keywords.get(keyword2);
    }
    const name42 = keyword2.toLowerCase();
    let descriptor = keywords.get(name42);
    if (descriptor === void 0) {
      const custom = isCustomProperty(name42, 0);
      const vendor = !custom ? getVendorPrefix(name42, 0) : "";
      descriptor = Object.freeze({
        basename: name42.substr(vendor.length),
        name: name42,
        prefix: vendor,
        vendor,
        custom
      });
    }
    keywords.set(keyword2, descriptor);
    return descriptor;
  }
  function getPropertyDescriptor(property2) {
    if (properties.has(property2)) {
      return properties.get(property2);
    }
    let name42 = property2;
    let hack = property2[0];
    if (hack === "/") {
      hack = property2[1] === "/" ? "//" : "/";
    } else if (hack !== "_" && hack !== "*" && hack !== "$" && hack !== "#" && hack !== "+" && hack !== "&") {
      hack = "";
    }
    const custom = isCustomProperty(name42, hack.length);
    if (!custom) {
      name42 = name42.toLowerCase();
      if (properties.has(name42)) {
        const descriptor2 = properties.get(name42);
        properties.set(property2, descriptor2);
        return descriptor2;
      }
    }
    const vendor = !custom ? getVendorPrefix(name42, hack.length) : "";
    const prefix = name42.substr(0, hack.length + vendor.length);
    const descriptor = Object.freeze({
      basename: name42.substr(prefix.length),
      name: name42.substr(hack.length),
      hack,
      vendor,
      prefix,
      custom
    });
    properties.set(property2, descriptor);
    return descriptor;
  }

  // ../../node_modules/css-tree/lib/lexer/generic-const.js
  var cssWideKeywords = [
    "initial",
    "inherit",
    "unset",
    "revert",
    "revert-layer"
  ];

  // ../../node_modules/css-tree/lib/lexer/generic-an-plus-b.js
  var PLUSSIGN2 = 43;
  var HYPHENMINUS3 = 45;
  var N2 = 110;
  var DISALLOW_SIGN = true;
  var ALLOW_SIGN = false;
  function isDelim(token, code2) {
    return token !== null && token.type === Delim && token.value.charCodeAt(0) === code2;
  }
  function skipSC(token, offset, getNextToken) {
    while (token !== null && (token.type === WhiteSpace || token.type === Comment)) {
      token = getNextToken(++offset);
    }
    return offset;
  }
  function checkInteger(token, valueOffset, disallowSign, offset) {
    if (!token) {
      return 0;
    }
    const code2 = token.value.charCodeAt(valueOffset);
    if (code2 === PLUSSIGN2 || code2 === HYPHENMINUS3) {
      if (disallowSign) {
        return 0;
      }
      valueOffset++;
    }
    for (; valueOffset < token.value.length; valueOffset++) {
      if (!isDigit(token.value.charCodeAt(valueOffset))) {
        return 0;
      }
    }
    return offset + 1;
  }
  function consumeB(token, offset_, getNextToken) {
    let sign = false;
    let offset = skipSC(token, offset_, getNextToken);
    token = getNextToken(offset);
    if (token === null) {
      return offset_;
    }
    if (token.type !== Number2) {
      if (isDelim(token, PLUSSIGN2) || isDelim(token, HYPHENMINUS3)) {
        sign = true;
        offset = skipSC(getNextToken(++offset), offset, getNextToken);
        token = getNextToken(offset);
        if (token === null || token.type !== Number2) {
          return 0;
        }
      } else {
        return offset_;
      }
    }
    if (!sign) {
      const code2 = token.value.charCodeAt(0);
      if (code2 !== PLUSSIGN2 && code2 !== HYPHENMINUS3) {
        return 0;
      }
    }
    return checkInteger(token, sign ? 0 : 1, sign, offset);
  }
  function anPlusB(token, getNextToken) {
    let offset = 0;
    if (!token) {
      return 0;
    }
    if (token.type === Number2) {
      return checkInteger(token, 0, ALLOW_SIGN, offset);
    } else if (token.type === Ident && token.value.charCodeAt(0) === HYPHENMINUS3) {
      if (!cmpChar(token.value, 1, N2)) {
        return 0;
      }
      switch (token.value.length) {
        case 2:
          return consumeB(getNextToken(++offset), offset, getNextToken);
        case 3:
          if (token.value.charCodeAt(2) !== HYPHENMINUS3) {
            return 0;
          }
          offset = skipSC(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger(token, 0, DISALLOW_SIGN, offset);
        default:
          if (token.value.charCodeAt(2) !== HYPHENMINUS3) {
            return 0;
          }
          return checkInteger(token, 3, DISALLOW_SIGN, offset);
      }
    } else if (token.type === Ident || isDelim(token, PLUSSIGN2) && getNextToken(offset + 1).type === Ident) {
      if (token.type !== Ident) {
        token = getNextToken(++offset);
      }
      if (token === null || !cmpChar(token.value, 0, N2)) {
        return 0;
      }
      switch (token.value.length) {
        case 1:
          return consumeB(getNextToken(++offset), offset, getNextToken);
        case 2:
          if (token.value.charCodeAt(1) !== HYPHENMINUS3) {
            return 0;
          }
          offset = skipSC(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger(token, 0, DISALLOW_SIGN, offset);
        default:
          if (token.value.charCodeAt(1) !== HYPHENMINUS3) {
            return 0;
          }
          return checkInteger(token, 2, DISALLOW_SIGN, offset);
      }
    } else if (token.type === Dimension) {
      let code2 = token.value.charCodeAt(0);
      let sign = code2 === PLUSSIGN2 || code2 === HYPHENMINUS3 ? 1 : 0;
      let i2 = sign;
      for (; i2 < token.value.length; i2++) {
        if (!isDigit(token.value.charCodeAt(i2))) {
          break;
        }
      }
      if (i2 === sign) {
        return 0;
      }
      if (!cmpChar(token.value, i2, N2)) {
        return 0;
      }
      if (i2 + 1 === token.value.length) {
        return consumeB(getNextToken(++offset), offset, getNextToken);
      } else {
        if (token.value.charCodeAt(i2 + 1) !== HYPHENMINUS3) {
          return 0;
        }
        if (i2 + 2 === token.value.length) {
          offset = skipSC(getNextToken(++offset), offset, getNextToken);
          token = getNextToken(offset);
          return checkInteger(token, 0, DISALLOW_SIGN, offset);
        } else {
          return checkInteger(token, i2 + 2, DISALLOW_SIGN, offset);
        }
      }
    }
    return 0;
  }

  // ../../node_modules/css-tree/lib/lexer/generic-urange.js
  var PLUSSIGN3 = 43;
  var HYPHENMINUS4 = 45;
  var QUESTIONMARK = 63;
  var U = 117;
  function isDelim2(token, code2) {
    return token !== null && token.type === Delim && token.value.charCodeAt(0) === code2;
  }
  function startsWith(token, code2) {
    return token.value.charCodeAt(0) === code2;
  }
  function hexSequence(token, offset, allowDash) {
    let hexlen = 0;
    for (let pos = offset; pos < token.value.length; pos++) {
      const code2 = token.value.charCodeAt(pos);
      if (code2 === HYPHENMINUS4 && allowDash && hexlen !== 0) {
        hexSequence(token, offset + hexlen + 1, false);
        return 6;
      }
      if (!isHexDigit(code2)) {
        return 0;
      }
      if (++hexlen > 6) {
        return 0;
      }
      ;
    }
    return hexlen;
  }
  function withQuestionMarkSequence(consumed, length6, getNextToken) {
    if (!consumed) {
      return 0;
    }
    while (isDelim2(getNextToken(length6), QUESTIONMARK)) {
      if (++consumed > 6) {
        return 0;
      }
      length6++;
    }
    return length6;
  }
  function urange(token, getNextToken) {
    let length6 = 0;
    if (token === null || token.type !== Ident || !cmpChar(token.value, 0, U)) {
      return 0;
    }
    token = getNextToken(++length6);
    if (token === null) {
      return 0;
    }
    if (isDelim2(token, PLUSSIGN3)) {
      token = getNextToken(++length6);
      if (token === null) {
        return 0;
      }
      if (token.type === Ident) {
        return withQuestionMarkSequence(hexSequence(token, 0, true), ++length6, getNextToken);
      }
      if (isDelim2(token, QUESTIONMARK)) {
        return withQuestionMarkSequence(1, ++length6, getNextToken);
      }
      return 0;
    }
    if (token.type === Number2) {
      const consumedHexLength = hexSequence(token, 1, true);
      if (consumedHexLength === 0) {
        return 0;
      }
      token = getNextToken(++length6);
      if (token === null) {
        return length6;
      }
      if (token.type === Dimension || token.type === Number2) {
        if (!startsWith(token, HYPHENMINUS4) || !hexSequence(token, 1, false)) {
          return 0;
        }
        return length6 + 1;
      }
      return withQuestionMarkSequence(consumedHexLength, length6, getNextToken);
    }
    if (token.type === Dimension) {
      return withQuestionMarkSequence(hexSequence(token, 1, true), ++length6, getNextToken);
    }
    return 0;
  }

  // ../../node_modules/css-tree/lib/lexer/generic.js
  var calcFunctionNames = ["calc(", "-moz-calc(", "-webkit-calc("];
  var balancePair2 = /* @__PURE__ */ new Map([
    [Function2, RightParenthesis],
    [LeftParenthesis, RightParenthesis],
    [LeftSquareBracket, RightSquareBracket],
    [LeftCurlyBracket, RightCurlyBracket]
  ]);
  function charCodeAt(str, index2) {
    return index2 < str.length ? str.charCodeAt(index2) : 0;
  }
  function eqStr(actual, expected) {
    return cmpStr(actual, 0, actual.length, expected);
  }
  function eqStrAny(actual, expected) {
    for (let i2 = 0; i2 < expected.length; i2++) {
      if (eqStr(actual, expected[i2])) {
        return true;
      }
    }
    return false;
  }
  function isPostfixIeHack(str, offset) {
    if (offset !== str.length - 2) {
      return false;
    }
    return charCodeAt(str, offset) === 92 && // U+005C REVERSE SOLIDUS (\)
    isDigit(charCodeAt(str, offset + 1));
  }
  function outOfRange(opts, value2, numEnd) {
    if (opts && opts.type === "Range") {
      const num = Number(
        numEnd !== void 0 && numEnd !== value2.length ? value2.substr(0, numEnd) : value2
      );
      if (isNaN(num)) {
        return true;
      }
      if (opts.min !== null && num < opts.min && typeof opts.min !== "string") {
        return true;
      }
      if (opts.max !== null && num > opts.max && typeof opts.max !== "string") {
        return true;
      }
    }
    return false;
  }
  function consumeFunction(token, getNextToken) {
    let balanceCloseType = 0;
    let balanceStash = [];
    let length6 = 0;
    scan:
      do {
        switch (token.type) {
          case RightCurlyBracket:
          case RightParenthesis:
          case RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            if (balanceStash.length === 0) {
              length6++;
              break scan;
            }
            break;
          case Function2:
          case LeftParenthesis:
          case LeftSquareBracket:
          case LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length6++;
      } while (token = getNextToken(length6));
    return length6;
  }
  function calc(next) {
    return function(token, getNextToken, opts) {
      if (token === null) {
        return 0;
      }
      if (token.type === Function2 && eqStrAny(token.value, calcFunctionNames)) {
        return consumeFunction(token, getNextToken);
      }
      return next(token, getNextToken, opts);
    };
  }
  function tokenType(expectedTokenType) {
    return function(token) {
      if (token === null || token.type !== expectedTokenType) {
        return 0;
      }
      return 1;
    };
  }
  function customIdent(token) {
    if (token === null || token.type !== Ident) {
      return 0;
    }
    const name42 = token.value.toLowerCase();
    if (eqStrAny(name42, cssWideKeywords)) {
      return 0;
    }
    if (eqStr(name42, "default")) {
      return 0;
    }
    return 1;
  }
  function customPropertyName(token) {
    if (token === null || token.type !== Ident) {
      return 0;
    }
    if (charCodeAt(token.value, 0) !== 45 || charCodeAt(token.value, 1) !== 45) {
      return 0;
    }
    return 1;
  }
  function hexColor(token) {
    if (token === null || token.type !== Hash) {
      return 0;
    }
    const length6 = token.value.length;
    if (length6 !== 4 && length6 !== 5 && length6 !== 7 && length6 !== 9) {
      return 0;
    }
    for (let i2 = 1; i2 < length6; i2++) {
      if (!isHexDigit(charCodeAt(token.value, i2))) {
        return 0;
      }
    }
    return 1;
  }
  function idSelector(token) {
    if (token === null || token.type !== Hash) {
      return 0;
    }
    if (!isIdentifierStart(charCodeAt(token.value, 1), charCodeAt(token.value, 2), charCodeAt(token.value, 3))) {
      return 0;
    }
    return 1;
  }
  function declarationValue(token, getNextToken) {
    if (!token) {
      return 0;
    }
    let balanceCloseType = 0;
    let balanceStash = [];
    let length6 = 0;
    scan:
      do {
        switch (token.type) {
          case BadString:
          case BadUrl:
            break scan;
          case RightCurlyBracket:
          case RightParenthesis:
          case RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            break;
          case Semicolon:
            if (balanceCloseType === 0) {
              break scan;
            }
            break;
          case Delim:
            if (balanceCloseType === 0 && token.value === "!") {
              break scan;
            }
            break;
          case Function2:
          case LeftParenthesis:
          case LeftSquareBracket:
          case LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length6++;
      } while (token = getNextToken(length6));
    return length6;
  }
  function anyValue(token, getNextToken) {
    if (!token) {
      return 0;
    }
    let balanceCloseType = 0;
    let balanceStash = [];
    let length6 = 0;
    scan:
      do {
        switch (token.type) {
          case BadString:
          case BadUrl:
            break scan;
          case RightCurlyBracket:
          case RightParenthesis:
          case RightSquareBracket:
            if (token.type !== balanceCloseType) {
              break scan;
            }
            balanceCloseType = balanceStash.pop();
            break;
          case Function2:
          case LeftParenthesis:
          case LeftSquareBracket:
          case LeftCurlyBracket:
            balanceStash.push(balanceCloseType);
            balanceCloseType = balancePair2.get(token.type);
            break;
        }
        length6++;
      } while (token = getNextToken(length6));
    return length6;
  }
  function dimension(type) {
    if (type) {
      type = new Set(type);
    }
    return function(token, getNextToken, opts) {
      if (token === null || token.type !== Dimension) {
        return 0;
      }
      const numberEnd = consumeNumber(token.value, 0);
      if (type !== null) {
        const reverseSolidusOffset = token.value.indexOf("\\", numberEnd);
        const unit = reverseSolidusOffset === -1 || !isPostfixIeHack(token.value, reverseSolidusOffset) ? token.value.substr(numberEnd) : token.value.substring(numberEnd, reverseSolidusOffset);
        if (type.has(unit.toLowerCase()) === false) {
          return 0;
        }
      }
      if (outOfRange(opts, token.value, numberEnd)) {
        return 0;
      }
      return 1;
    };
  }
  function percentage(token, getNextToken, opts) {
    if (token === null || token.type !== Percentage) {
      return 0;
    }
    if (outOfRange(opts, token.value, token.value.length - 1)) {
      return 0;
    }
    return 1;
  }
  function zero2(next) {
    if (typeof next !== "function") {
      next = function() {
        return 0;
      };
    }
    return function(token, getNextToken, opts) {
      if (token !== null && token.type === Number2) {
        if (Number(token.value) === 0) {
          return 1;
        }
      }
      return next(token, getNextToken, opts);
    };
  }
  function number(token, getNextToken, opts) {
    if (token === null) {
      return 0;
    }
    const numberEnd = consumeNumber(token.value, 0);
    const isNumber = numberEnd === token.value.length;
    if (!isNumber && !isPostfixIeHack(token.value, numberEnd)) {
      return 0;
    }
    if (outOfRange(opts, token.value, numberEnd)) {
      return 0;
    }
    return 1;
  }
  function integer(token, getNextToken, opts) {
    if (token === null || token.type !== Number2) {
      return 0;
    }
    let i2 = charCodeAt(token.value, 0) === 43 || // U+002B PLUS SIGN (+)
    charCodeAt(token.value, 0) === 45 ? 1 : 0;
    for (; i2 < token.value.length; i2++) {
      if (!isDigit(charCodeAt(token.value, i2))) {
        return 0;
      }
    }
    if (outOfRange(opts, token.value, i2)) {
      return 0;
    }
    return 1;
  }
  var tokenTypes = {
    "ident-token": tokenType(Ident),
    "function-token": tokenType(Function2),
    "at-keyword-token": tokenType(AtKeyword),
    "hash-token": tokenType(Hash),
    "string-token": tokenType(String2),
    "bad-string-token": tokenType(BadString),
    "url-token": tokenType(Url),
    "bad-url-token": tokenType(BadUrl),
    "delim-token": tokenType(Delim),
    "number-token": tokenType(Number2),
    "percentage-token": tokenType(Percentage),
    "dimension-token": tokenType(Dimension),
    "whitespace-token": tokenType(WhiteSpace),
    "CDO-token": tokenType(CDO),
    "CDC-token": tokenType(CDC),
    "colon-token": tokenType(Colon),
    "semicolon-token": tokenType(Semicolon),
    "comma-token": tokenType(Comma),
    "[-token": tokenType(LeftSquareBracket),
    "]-token": tokenType(RightSquareBracket),
    "(-token": tokenType(LeftParenthesis),
    ")-token": tokenType(RightParenthesis),
    "{-token": tokenType(LeftCurlyBracket),
    "}-token": tokenType(RightCurlyBracket)
  };
  var productionTypes = {
    // token type aliases
    "string": tokenType(String2),
    "ident": tokenType(Ident),
    // percentage
    "percentage": calc(percentage),
    // numeric
    "zero": zero2(),
    "number": calc(number),
    "integer": calc(integer),
    // complex types
    "custom-ident": customIdent,
    "custom-property-name": customPropertyName,
    "hex-color": hexColor,
    "id-selector": idSelector,
    // element( <id-selector> )
    "an-plus-b": anPlusB,
    "urange": urange,
    "declaration-value": declarationValue,
    "any-value": anyValue
  };
  function createDemensionTypes(units) {
    const {
      angle: angle2,
      decibel: decibel2,
      frequency: frequency2,
      flex: flex2,
      length: length6,
      resolution: resolution2,
      semitones: semitones2,
      time: time2
    } = units || {};
    return {
      "dimension": calc(dimension(null)),
      "angle": calc(dimension(angle2)),
      "decibel": calc(dimension(decibel2)),
      "frequency": calc(dimension(frequency2)),
      "flex": calc(dimension(flex2)),
      "length": calc(zero2(dimension(length6))),
      "resolution": calc(dimension(resolution2)),
      "semitones": calc(dimension(semitones2)),
      "time": calc(dimension(time2))
    };
  }
  function createGenericTypes(units) {
    return {
      ...tokenTypes,
      ...productionTypes,
      ...createDemensionTypes(units)
    };
  }

  // ../../node_modules/css-tree/lib/lexer/units.js
  var units_exports = {};
  __export(units_exports, {
    angle: () => angle,
    decibel: () => decibel,
    flex: () => flex,
    frequency: () => frequency,
    length: () => length4,
    resolution: () => resolution,
    semitones: () => semitones,
    time: () => time
  });
  var length4 = [
    // absolute length units https://www.w3.org/TR/css-values-3/#lengths
    "cm",
    "mm",
    "q",
    "in",
    "pt",
    "pc",
    "px",
    // font-relative length units https://drafts.csswg.org/css-values-4/#font-relative-lengths
    "em",
    "rem",
    "ex",
    "rex",
    "cap",
    "rcap",
    "ch",
    "rch",
    "ic",
    "ric",
    "lh",
    "rlh",
    // viewport-percentage lengths https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
    "vw",
    "svw",
    "lvw",
    "dvw",
    "vh",
    "svh",
    "lvh",
    "dvh",
    "vi",
    "svi",
    "lvi",
    "dvi",
    "vb",
    "svb",
    "lvb",
    "dvb",
    "vmin",
    "svmin",
    "lvmin",
    "dvmin",
    "vmax",
    "svmax",
    "lvmax",
    "dvmax",
    // container relative lengths https://drafts.csswg.org/css-contain-3/#container-lengths
    "cqw",
    "cqh",
    "cqi",
    "cqb",
    "cqmin",
    "cqmax"
  ];
  var angle = ["deg", "grad", "rad", "turn"];
  var time = ["s", "ms"];
  var frequency = ["hz", "khz"];
  var resolution = ["dpi", "dpcm", "dppx", "x"];
  var flex = ["fr"];
  var decibel = ["db"];
  var semitones = ["st"];

  // ../../node_modules/css-tree/lib/definition-syntax/SyntaxError.js
  function SyntaxError3(message, input, offset) {
    return Object.assign(createCustomError("SyntaxError", message), {
      input,
      offset,
      rawMessage: message,
      message: message + "\n  " + input + "\n--" + new Array((offset || input.length) + 1).join("-") + "^"
    });
  }

  // ../../node_modules/css-tree/lib/definition-syntax/tokenizer.js
  var TAB = 9;
  var N3 = 10;
  var F2 = 12;
  var R2 = 13;
  var SPACE = 32;
  var Tokenizer = class {
    constructor(str) {
      this.str = str;
      this.pos = 0;
    }
    charCodeAt(pos) {
      return pos < this.str.length ? this.str.charCodeAt(pos) : 0;
    }
    charCode() {
      return this.charCodeAt(this.pos);
    }
    nextCharCode() {
      return this.charCodeAt(this.pos + 1);
    }
    nextNonWsCode(pos) {
      return this.charCodeAt(this.findWsEnd(pos));
    }
    findWsEnd(pos) {
      for (; pos < this.str.length; pos++) {
        const code2 = this.str.charCodeAt(pos);
        if (code2 !== R2 && code2 !== N3 && code2 !== F2 && code2 !== SPACE && code2 !== TAB) {
          break;
        }
      }
      return pos;
    }
    substringToPos(end) {
      return this.str.substring(this.pos, this.pos = end);
    }
    eat(code2) {
      if (this.charCode() !== code2) {
        this.error("Expect `" + String.fromCharCode(code2) + "`");
      }
      this.pos++;
    }
    peek() {
      return this.pos < this.str.length ? this.str.charAt(this.pos++) : "";
    }
    error(message) {
      throw new SyntaxError3(message, this.str, this.pos);
    }
  };

  // ../../node_modules/css-tree/lib/definition-syntax/parse.js
  var TAB2 = 9;
  var N4 = 10;
  var F3 = 12;
  var R3 = 13;
  var SPACE2 = 32;
  var EXCLAMATIONMARK2 = 33;
  var NUMBERSIGN2 = 35;
  var AMPERSAND = 38;
  var APOSTROPHE = 39;
  var LEFTPARENTHESIS = 40;
  var RIGHTPARENTHESIS = 41;
  var ASTERISK = 42;
  var PLUSSIGN4 = 43;
  var COMMA = 44;
  var HYPERMINUS = 45;
  var LESSTHANSIGN = 60;
  var GREATERTHANSIGN = 62;
  var QUESTIONMARK2 = 63;
  var COMMERCIALAT = 64;
  var LEFTSQUAREBRACKET = 91;
  var RIGHTSQUAREBRACKET = 93;
  var LEFTCURLYBRACKET2 = 123;
  var VERTICALLINE = 124;
  var RIGHTCURLYBRACKET = 125;
  var INFINITY = 8734;
  var NAME_CHAR = new Uint8Array(128).map(
    (_, idx) => /[a-zA-Z0-9\-]/.test(String.fromCharCode(idx)) ? 1 : 0
  );
  var COMBINATOR_PRECEDENCE = {
    " ": 1,
    "&&": 2,
    "||": 3,
    "|": 4
  };
  function scanSpaces(tokenizer) {
    return tokenizer.substringToPos(
      tokenizer.findWsEnd(tokenizer.pos)
    );
  }
  function scanWord(tokenizer) {
    let end = tokenizer.pos;
    for (; end < tokenizer.str.length; end++) {
      const code2 = tokenizer.str.charCodeAt(end);
      if (code2 >= 128 || NAME_CHAR[code2] === 0) {
        break;
      }
    }
    if (tokenizer.pos === end) {
      tokenizer.error("Expect a keyword");
    }
    return tokenizer.substringToPos(end);
  }
  function scanNumber(tokenizer) {
    let end = tokenizer.pos;
    for (; end < tokenizer.str.length; end++) {
      const code2 = tokenizer.str.charCodeAt(end);
      if (code2 < 48 || code2 > 57) {
        break;
      }
    }
    if (tokenizer.pos === end) {
      tokenizer.error("Expect a number");
    }
    return tokenizer.substringToPos(end);
  }
  function scanString(tokenizer) {
    const end = tokenizer.str.indexOf("'", tokenizer.pos + 1);
    if (end === -1) {
      tokenizer.pos = tokenizer.str.length;
      tokenizer.error("Expect an apostrophe");
    }
    return tokenizer.substringToPos(end + 1);
  }
  function readMultiplierRange(tokenizer) {
    let min2 = null;
    let max2 = null;
    tokenizer.eat(LEFTCURLYBRACKET2);
    min2 = scanNumber(tokenizer);
    if (tokenizer.charCode() === COMMA) {
      tokenizer.pos++;
      if (tokenizer.charCode() !== RIGHTCURLYBRACKET) {
        max2 = scanNumber(tokenizer);
      }
    } else {
      max2 = min2;
    }
    tokenizer.eat(RIGHTCURLYBRACKET);
    return {
      min: Number(min2),
      max: max2 ? Number(max2) : 0
    };
  }
  function readMultiplier(tokenizer) {
    let range = null;
    let comma = false;
    switch (tokenizer.charCode()) {
      case ASTERISK:
        tokenizer.pos++;
        range = {
          min: 0,
          max: 0
        };
        break;
      case PLUSSIGN4:
        tokenizer.pos++;
        range = {
          min: 1,
          max: 0
        };
        break;
      case QUESTIONMARK2:
        tokenizer.pos++;
        range = {
          min: 0,
          max: 1
        };
        break;
      case NUMBERSIGN2:
        tokenizer.pos++;
        comma = true;
        if (tokenizer.charCode() === LEFTCURLYBRACKET2) {
          range = readMultiplierRange(tokenizer);
        } else if (tokenizer.charCode() === QUESTIONMARK2) {
          tokenizer.pos++;
          range = {
            min: 0,
            max: 0
          };
        } else {
          range = {
            min: 1,
            max: 0
          };
        }
        break;
      case LEFTCURLYBRACKET2:
        range = readMultiplierRange(tokenizer);
        break;
      default:
        return null;
    }
    return {
      type: "Multiplier",
      comma,
      min: range.min,
      max: range.max,
      term: null
    };
  }
  function maybeMultiplied(tokenizer, node) {
    const multiplier = readMultiplier(tokenizer);
    if (multiplier !== null) {
      multiplier.term = node;
      if (tokenizer.charCode() === NUMBERSIGN2 && tokenizer.charCodeAt(tokenizer.pos - 1) === PLUSSIGN4) {
        return maybeMultiplied(tokenizer, multiplier);
      }
      return multiplier;
    }
    return node;
  }
  function maybeToken(tokenizer) {
    const ch = tokenizer.peek();
    if (ch === "") {
      return null;
    }
    return {
      type: "Token",
      value: ch
    };
  }
  function readProperty(tokenizer) {
    let name42;
    tokenizer.eat(LESSTHANSIGN);
    tokenizer.eat(APOSTROPHE);
    name42 = scanWord(tokenizer);
    tokenizer.eat(APOSTROPHE);
    tokenizer.eat(GREATERTHANSIGN);
    return maybeMultiplied(tokenizer, {
      type: "Property",
      name: name42
    });
  }
  function readTypeRange(tokenizer) {
    let min2 = null;
    let max2 = null;
    let sign = 1;
    tokenizer.eat(LEFTSQUAREBRACKET);
    if (tokenizer.charCode() === HYPERMINUS) {
      tokenizer.peek();
      sign = -1;
    }
    if (sign == -1 && tokenizer.charCode() === INFINITY) {
      tokenizer.peek();
    } else {
      min2 = sign * Number(scanNumber(tokenizer));
      if (NAME_CHAR[tokenizer.charCode()] !== 0) {
        min2 += scanWord(tokenizer);
      }
    }
    scanSpaces(tokenizer);
    tokenizer.eat(COMMA);
    scanSpaces(tokenizer);
    if (tokenizer.charCode() === INFINITY) {
      tokenizer.peek();
    } else {
      sign = 1;
      if (tokenizer.charCode() === HYPERMINUS) {
        tokenizer.peek();
        sign = -1;
      }
      max2 = sign * Number(scanNumber(tokenizer));
      if (NAME_CHAR[tokenizer.charCode()] !== 0) {
        max2 += scanWord(tokenizer);
      }
    }
    tokenizer.eat(RIGHTSQUAREBRACKET);
    return {
      type: "Range",
      min: min2,
      max: max2
    };
  }
  function readType(tokenizer) {
    let name42;
    let opts = null;
    tokenizer.eat(LESSTHANSIGN);
    name42 = scanWord(tokenizer);
    if (tokenizer.charCode() === LEFTPARENTHESIS && tokenizer.nextCharCode() === RIGHTPARENTHESIS) {
      tokenizer.pos += 2;
      name42 += "()";
    }
    if (tokenizer.charCodeAt(tokenizer.findWsEnd(tokenizer.pos)) === LEFTSQUAREBRACKET) {
      scanSpaces(tokenizer);
      opts = readTypeRange(tokenizer);
    }
    tokenizer.eat(GREATERTHANSIGN);
    return maybeMultiplied(tokenizer, {
      type: "Type",
      name: name42,
      opts
    });
  }
  function readKeywordOrFunction(tokenizer) {
    const name42 = scanWord(tokenizer);
    if (tokenizer.charCode() === LEFTPARENTHESIS) {
      tokenizer.pos++;
      return {
        type: "Function",
        name: name42
      };
    }
    return maybeMultiplied(tokenizer, {
      type: "Keyword",
      name: name42
    });
  }
  function regroupTerms(terms, combinators) {
    function createGroup(terms2, combinator2) {
      return {
        type: "Group",
        terms: terms2,
        combinator: combinator2,
        disallowEmpty: false,
        explicit: false
      };
    }
    let combinator;
    combinators = Object.keys(combinators).sort((a, b) => COMBINATOR_PRECEDENCE[a] - COMBINATOR_PRECEDENCE[b]);
    while (combinators.length > 0) {
      combinator = combinators.shift();
      let i2 = 0;
      let subgroupStart = 0;
      for (; i2 < terms.length; i2++) {
        const term = terms[i2];
        if (term.type === "Combinator") {
          if (term.value === combinator) {
            if (subgroupStart === -1) {
              subgroupStart = i2 - 1;
            }
            terms.splice(i2, 1);
            i2--;
          } else {
            if (subgroupStart !== -1 && i2 - subgroupStart > 1) {
              terms.splice(
                subgroupStart,
                i2 - subgroupStart,
                createGroup(terms.slice(subgroupStart, i2), combinator)
              );
              i2 = subgroupStart + 1;
            }
            subgroupStart = -1;
          }
        }
      }
      if (subgroupStart !== -1 && combinators.length) {
        terms.splice(
          subgroupStart,
          i2 - subgroupStart,
          createGroup(terms.slice(subgroupStart, i2), combinator)
        );
      }
    }
    return combinator;
  }
  function readImplicitGroup(tokenizer) {
    const terms = [];
    const combinators = {};
    let token;
    let prevToken = null;
    let prevTokenPos = tokenizer.pos;
    while (token = peek(tokenizer)) {
      if (token.type !== "Spaces") {
        if (token.type === "Combinator") {
          if (prevToken === null || prevToken.type === "Combinator") {
            tokenizer.pos = prevTokenPos;
            tokenizer.error("Unexpected combinator");
          }
          combinators[token.value] = true;
        } else if (prevToken !== null && prevToken.type !== "Combinator") {
          combinators[" "] = true;
          terms.push({
            type: "Combinator",
            value: " "
          });
        }
        terms.push(token);
        prevToken = token;
        prevTokenPos = tokenizer.pos;
      }
    }
    if (prevToken !== null && prevToken.type === "Combinator") {
      tokenizer.pos -= prevTokenPos;
      tokenizer.error("Unexpected combinator");
    }
    return {
      type: "Group",
      terms,
      combinator: regroupTerms(terms, combinators) || " ",
      disallowEmpty: false,
      explicit: false
    };
  }
  function readGroup(tokenizer) {
    let result;
    tokenizer.eat(LEFTSQUAREBRACKET);
    result = readImplicitGroup(tokenizer);
    tokenizer.eat(RIGHTSQUAREBRACKET);
    result.explicit = true;
    if (tokenizer.charCode() === EXCLAMATIONMARK2) {
      tokenizer.pos++;
      result.disallowEmpty = true;
    }
    return result;
  }
  function peek(tokenizer) {
    let code2 = tokenizer.charCode();
    if (code2 < 128 && NAME_CHAR[code2] === 1) {
      return readKeywordOrFunction(tokenizer);
    }
    switch (code2) {
      case RIGHTSQUAREBRACKET:
        break;
      case LEFTSQUAREBRACKET:
        return maybeMultiplied(tokenizer, readGroup(tokenizer));
      case LESSTHANSIGN:
        return tokenizer.nextCharCode() === APOSTROPHE ? readProperty(tokenizer) : readType(tokenizer);
      case VERTICALLINE:
        return {
          type: "Combinator",
          value: tokenizer.substringToPos(
            tokenizer.pos + (tokenizer.nextCharCode() === VERTICALLINE ? 2 : 1)
          )
        };
      case AMPERSAND:
        tokenizer.pos++;
        tokenizer.eat(AMPERSAND);
        return {
          type: "Combinator",
          value: "&&"
        };
      case COMMA:
        tokenizer.pos++;
        return {
          type: "Comma"
        };
      case APOSTROPHE:
        return maybeMultiplied(tokenizer, {
          type: "String",
          value: scanString(tokenizer)
        });
      case SPACE2:
      case TAB2:
      case N4:
      case R3:
      case F3:
        return {
          type: "Spaces",
          value: scanSpaces(tokenizer)
        };
      case COMMERCIALAT:
        code2 = tokenizer.nextCharCode();
        if (code2 < 128 && NAME_CHAR[code2] === 1) {
          tokenizer.pos++;
          return {
            type: "AtKeyword",
            name: scanWord(tokenizer)
          };
        }
        return maybeToken(tokenizer);
      case ASTERISK:
      case PLUSSIGN4:
      case QUESTIONMARK2:
      case NUMBERSIGN2:
      case EXCLAMATIONMARK2:
        break;
      case LEFTCURLYBRACKET2:
        code2 = tokenizer.nextCharCode();
        if (code2 < 48 || code2 > 57) {
          return maybeToken(tokenizer);
        }
        break;
      default:
        return maybeToken(tokenizer);
    }
  }
  function parse(source) {
    const tokenizer = new Tokenizer(source);
    const result = readImplicitGroup(tokenizer);
    if (tokenizer.pos !== source.length) {
      tokenizer.error("Unexpected input");
    }
    if (result.terms.length === 1 && result.terms[0].type === "Group") {
      return result.terms[0];
    }
    return result;
  }

  // ../../node_modules/css-tree/lib/definition-syntax/walk.js
  var noop3 = function() {
  };
  function ensureFunction2(value2) {
    return typeof value2 === "function" ? value2 : noop3;
  }
  function walk(node, options, context) {
    function walk3(node2) {
      enter.call(context, node2);
      switch (node2.type) {
        case "Group":
          node2.terms.forEach(walk3);
          break;
        case "Multiplier":
          walk3(node2.term);
          break;
        case "Type":
        case "Property":
        case "Keyword":
        case "AtKeyword":
        case "Function":
        case "String":
        case "Token":
        case "Comma":
          break;
        default:
          throw new Error("Unknown type: " + node2.type);
      }
      leave.call(context, node2);
    }
    let enter = noop3;
    let leave = noop3;
    if (typeof options === "function") {
      enter = options;
    } else if (options) {
      enter = ensureFunction2(options.enter);
      leave = ensureFunction2(options.leave);
    }
    if (enter === noop3 && leave === noop3) {
      throw new Error("Neither `enter` nor `leave` walker handler is set or both aren't a function");
    }
    walk3(node, context);
  }

  // ../../node_modules/css-tree/lib/lexer/prepare-tokens.js
  var astToTokens = {
    decorator(handlers) {
      const tokens = [];
      let curNode = null;
      return {
        ...handlers,
        node(node) {
          const tmp = curNode;
          curNode = node;
          handlers.node.call(this, node);
          curNode = tmp;
        },
        emit(value2, type, auto) {
          tokens.push({
            type,
            value: value2,
            node: auto ? null : curNode
          });
        },
        result() {
          return tokens;
        }
      };
    }
  };
  function stringToTokens(str) {
    const tokens = [];
    tokenize(
      str,
      (type, start, end) => tokens.push({
        type,
        value: str.slice(start, end),
        node: null
      })
    );
    return tokens;
  }
  function prepare_tokens_default(value2, syntax) {
    if (typeof value2 === "string") {
      return stringToTokens(value2);
    }
    return syntax.generate(value2, astToTokens);
  }

  // ../../node_modules/css-tree/lib/lexer/match-graph.js
  var MATCH = { type: "Match" };
  var MISMATCH = { type: "Mismatch" };
  var DISALLOW_EMPTY = { type: "DisallowEmpty" };
  var LEFTPARENTHESIS2 = 40;
  var RIGHTPARENTHESIS2 = 41;
  function createCondition(match, thenBranch, elseBranch) {
    if (thenBranch === MATCH && elseBranch === MISMATCH) {
      return match;
    }
    if (match === MATCH && thenBranch === MATCH && elseBranch === MATCH) {
      return match;
    }
    if (match.type === "If" && match.else === MISMATCH && thenBranch === MATCH) {
      thenBranch = match.then;
      match = match.match;
    }
    return {
      type: "If",
      match,
      then: thenBranch,
      else: elseBranch
    };
  }
  function isFunctionType(name42) {
    return name42.length > 2 && name42.charCodeAt(name42.length - 2) === LEFTPARENTHESIS2 && name42.charCodeAt(name42.length - 1) === RIGHTPARENTHESIS2;
  }
  function isEnumCapatible(term) {
    return term.type === "Keyword" || term.type === "AtKeyword" || term.type === "Function" || term.type === "Type" && isFunctionType(term.name);
  }
  function buildGroupMatchGraph(combinator, terms, atLeastOneTermMatched) {
    switch (combinator) {
      case " ": {
        let result = MATCH;
        for (let i2 = terms.length - 1; i2 >= 0; i2--) {
          const term = terms[i2];
          result = createCondition(
            term,
            result,
            MISMATCH
          );
        }
        ;
        return result;
      }
      case "|": {
        let result = MISMATCH;
        let map11 = null;
        for (let i2 = terms.length - 1; i2 >= 0; i2--) {
          let term = terms[i2];
          if (isEnumCapatible(term)) {
            if (map11 === null && i2 > 0 && isEnumCapatible(terms[i2 - 1])) {
              map11 = /* @__PURE__ */ Object.create(null);
              result = createCondition(
                {
                  type: "Enum",
                  map: map11
                },
                MATCH,
                result
              );
            }
            if (map11 !== null) {
              const key = (isFunctionType(term.name) ? term.name.slice(0, -1) : term.name).toLowerCase();
              if (key in map11 === false) {
                map11[key] = term;
                continue;
              }
            }
          }
          map11 = null;
          result = createCondition(
            term,
            MATCH,
            result
          );
        }
        ;
        return result;
      }
      case "&&": {
        if (terms.length > 5) {
          return {
            type: "MatchOnce",
            terms,
            all: true
          };
        }
        let result = MISMATCH;
        for (let i2 = terms.length - 1; i2 >= 0; i2--) {
          const term = terms[i2];
          let thenClause;
          if (terms.length > 1) {
            thenClause = buildGroupMatchGraph(
              combinator,
              terms.filter(function(newGroupTerm) {
                return newGroupTerm !== term;
              }),
              false
            );
          } else {
            thenClause = MATCH;
          }
          result = createCondition(
            term,
            thenClause,
            result
          );
        }
        ;
        return result;
      }
      case "||": {
        if (terms.length > 5) {
          return {
            type: "MatchOnce",
            terms,
            all: false
          };
        }
        let result = atLeastOneTermMatched ? MATCH : MISMATCH;
        for (let i2 = terms.length - 1; i2 >= 0; i2--) {
          const term = terms[i2];
          let thenClause;
          if (terms.length > 1) {
            thenClause = buildGroupMatchGraph(
              combinator,
              terms.filter(function(newGroupTerm) {
                return newGroupTerm !== term;
              }),
              true
            );
          } else {
            thenClause = MATCH;
          }
          result = createCondition(
            term,
            thenClause,
            result
          );
        }
        ;
        return result;
      }
    }
  }
  function buildMultiplierMatchGraph(node) {
    let result = MATCH;
    let matchTerm = buildMatchGraphInternal(node.term);
    if (node.max === 0) {
      matchTerm = createCondition(
        matchTerm,
        DISALLOW_EMPTY,
        MISMATCH
      );
      result = createCondition(
        matchTerm,
        null,
        // will be a loop
        MISMATCH
      );
      result.then = createCondition(
        MATCH,
        MATCH,
        result
        // make a loop
      );
      if (node.comma) {
        result.then.else = createCondition(
          { type: "Comma", syntax: node },
          result,
          MISMATCH
        );
      }
    } else {
      for (let i2 = node.min || 1; i2 <= node.max; i2++) {
        if (node.comma && result !== MATCH) {
          result = createCondition(
            { type: "Comma", syntax: node },
            result,
            MISMATCH
          );
        }
        result = createCondition(
          matchTerm,
          createCondition(
            MATCH,
            MATCH,
            result
          ),
          MISMATCH
        );
      }
    }
    if (node.min === 0) {
      result = createCondition(
        MATCH,
        MATCH,
        result
      );
    } else {
      for (let i2 = 0; i2 < node.min - 1; i2++) {
        if (node.comma && result !== MATCH) {
          result = createCondition(
            { type: "Comma", syntax: node },
            result,
            MISMATCH
          );
        }
        result = createCondition(
          matchTerm,
          result,
          MISMATCH
        );
      }
    }
    return result;
  }
  function buildMatchGraphInternal(node) {
    if (typeof node === "function") {
      return {
        type: "Generic",
        fn: node
      };
    }
    switch (node.type) {
      case "Group": {
        let result = buildGroupMatchGraph(
          node.combinator,
          node.terms.map(buildMatchGraphInternal),
          false
        );
        if (node.disallowEmpty) {
          result = createCondition(
            result,
            DISALLOW_EMPTY,
            MISMATCH
          );
        }
        return result;
      }
      case "Multiplier":
        return buildMultiplierMatchGraph(node);
      case "Type":
      case "Property":
        return {
          type: node.type,
          name: node.name,
          syntax: node
        };
      case "Keyword":
        return {
          type: node.type,
          name: node.name.toLowerCase(),
          syntax: node
        };
      case "AtKeyword":
        return {
          type: node.type,
          name: "@" + node.name.toLowerCase(),
          syntax: node
        };
      case "Function":
        return {
          type: node.type,
          name: node.name.toLowerCase() + "(",
          syntax: node
        };
      case "String":
        if (node.value.length === 3) {
          return {
            type: "Token",
            value: node.value.charAt(1),
            syntax: node
          };
        }
        return {
          type: node.type,
          value: node.value.substr(1, node.value.length - 2).replace(/\\'/g, "'"),
          syntax: node
        };
      case "Token":
        return {
          type: node.type,
          value: node.value,
          syntax: node
        };
      case "Comma":
        return {
          type: node.type,
          syntax: node
        };
      default:
        throw new Error("Unknown node type:", node.type);
    }
  }
  function buildMatchGraph(syntaxTree, ref) {
    if (typeof syntaxTree === "string") {
      syntaxTree = parse(syntaxTree);
    }
    return {
      type: "MatchGraph",
      match: buildMatchGraphInternal(syntaxTree),
      syntax: ref || null,
      source: syntaxTree
    };
  }

  // ../../node_modules/css-tree/lib/lexer/match.js
  var { hasOwnProperty: hasOwnProperty3 } = Object.prototype;
  var STUB = 0;
  var TOKEN = 1;
  var OPEN_SYNTAX = 2;
  var CLOSE_SYNTAX = 3;
  var EXIT_REASON_MATCH = "Match";
  var EXIT_REASON_MISMATCH = "Mismatch";
  var EXIT_REASON_ITERATION_LIMIT = "Maximum iteration number exceeded (please fill an issue on https://github.com/csstree/csstree/issues)";
  var ITERATION_LIMIT = 15e3;
  var totalIterationCount = 0;
  function reverseList(list) {
    let prev = null;
    let next = null;
    let item = list;
    while (item !== null) {
      next = item.prev;
      item.prev = prev;
      prev = item;
      item = next;
    }
    return prev;
  }
  function areStringsEqualCaseInsensitive(testStr, referenceStr) {
    if (testStr.length !== referenceStr.length) {
      return false;
    }
    for (let i2 = 0; i2 < testStr.length; i2++) {
      const referenceCode = referenceStr.charCodeAt(i2);
      let testCode = testStr.charCodeAt(i2);
      if (testCode >= 65 && testCode <= 90) {
        testCode = testCode | 32;
      }
      if (testCode !== referenceCode) {
        return false;
      }
    }
    return true;
  }
  function isContextEdgeDelim(token) {
    if (token.type !== Delim) {
      return false;
    }
    return token.value !== "?";
  }
  function isCommaContextStart(token) {
    if (token === null) {
      return true;
    }
    return token.type === Comma || token.type === Function2 || token.type === LeftParenthesis || token.type === LeftSquareBracket || token.type === LeftCurlyBracket || isContextEdgeDelim(token);
  }
  function isCommaContextEnd(token) {
    if (token === null) {
      return true;
    }
    return token.type === RightParenthesis || token.type === RightSquareBracket || token.type === RightCurlyBracket || token.type === Delim && token.value === "/";
  }
  function internalMatch(tokens, state2, syntaxes) {
    function moveToNextToken() {
      do {
        tokenIndex++;
        token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
      } while (token !== null && (token.type === WhiteSpace || token.type === Comment));
    }
    function getNextToken(offset) {
      const nextIndex = tokenIndex + offset;
      return nextIndex < tokens.length ? tokens[nextIndex] : null;
    }
    function stateSnapshotFromSyntax(nextState, prev) {
      return {
        nextState,
        matchStack,
        syntaxStack,
        thenStack,
        tokenIndex,
        prev
      };
    }
    function pushThenStack(nextState) {
      thenStack = {
        nextState,
        matchStack,
        syntaxStack,
        prev: thenStack
      };
    }
    function pushElseStack(nextState) {
      elseStack = stateSnapshotFromSyntax(nextState, elseStack);
    }
    function addTokenToMatch() {
      matchStack = {
        type: TOKEN,
        syntax: state2.syntax,
        token,
        prev: matchStack
      };
      moveToNextToken();
      syntaxStash = null;
      if (tokenIndex > longestMatch) {
        longestMatch = tokenIndex;
      }
    }
    function openSyntax() {
      syntaxStack = {
        syntax: state2.syntax,
        opts: state2.syntax.opts || syntaxStack !== null && syntaxStack.opts || null,
        prev: syntaxStack
      };
      matchStack = {
        type: OPEN_SYNTAX,
        syntax: state2.syntax,
        token: matchStack.token,
        prev: matchStack
      };
    }
    function closeSyntax() {
      if (matchStack.type === OPEN_SYNTAX) {
        matchStack = matchStack.prev;
      } else {
        matchStack = {
          type: CLOSE_SYNTAX,
          syntax: syntaxStack.syntax,
          token: matchStack.token,
          prev: matchStack
        };
      }
      syntaxStack = syntaxStack.prev;
    }
    let syntaxStack = null;
    let thenStack = null;
    let elseStack = null;
    let syntaxStash = null;
    let iterationCount = 0;
    let exitReason = null;
    let token = null;
    let tokenIndex = -1;
    let longestMatch = 0;
    let matchStack = {
      type: STUB,
      syntax: null,
      token: null,
      prev: null
    };
    moveToNextToken();
    while (exitReason === null && ++iterationCount < ITERATION_LIMIT) {
      switch (state2.type) {
        case "Match":
          if (thenStack === null) {
            if (token !== null) {
              if (tokenIndex !== tokens.length - 1 || token.value !== "\\0" && token.value !== "\\9") {
                state2 = MISMATCH;
                break;
              }
            }
            exitReason = EXIT_REASON_MATCH;
            break;
          }
          state2 = thenStack.nextState;
          if (state2 === DISALLOW_EMPTY) {
            if (thenStack.matchStack === matchStack) {
              state2 = MISMATCH;
              break;
            } else {
              state2 = MATCH;
            }
          }
          while (thenStack.syntaxStack !== syntaxStack) {
            closeSyntax();
          }
          thenStack = thenStack.prev;
          break;
        case "Mismatch":
          if (syntaxStash !== null && syntaxStash !== false) {
            if (elseStack === null || tokenIndex > elseStack.tokenIndex) {
              elseStack = syntaxStash;
              syntaxStash = false;
            }
          } else if (elseStack === null) {
            exitReason = EXIT_REASON_MISMATCH;
            break;
          }
          state2 = elseStack.nextState;
          thenStack = elseStack.thenStack;
          syntaxStack = elseStack.syntaxStack;
          matchStack = elseStack.matchStack;
          tokenIndex = elseStack.tokenIndex;
          token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
          elseStack = elseStack.prev;
          break;
        case "MatchGraph":
          state2 = state2.match;
          break;
        case "If":
          if (state2.else !== MISMATCH) {
            pushElseStack(state2.else);
          }
          if (state2.then !== MATCH) {
            pushThenStack(state2.then);
          }
          state2 = state2.match;
          break;
        case "MatchOnce":
          state2 = {
            type: "MatchOnceBuffer",
            syntax: state2,
            index: 0,
            mask: 0
          };
          break;
        case "MatchOnceBuffer": {
          const terms = state2.syntax.terms;
          if (state2.index === terms.length) {
            if (state2.mask === 0 || state2.syntax.all) {
              state2 = MISMATCH;
              break;
            }
            state2 = MATCH;
            break;
          }
          if (state2.mask === (1 << terms.length) - 1) {
            state2 = MATCH;
            break;
          }
          for (; state2.index < terms.length; state2.index++) {
            const matchFlag = 1 << state2.index;
            if ((state2.mask & matchFlag) === 0) {
              pushElseStack(state2);
              pushThenStack({
                type: "AddMatchOnce",
                syntax: state2.syntax,
                mask: state2.mask | matchFlag
              });
              state2 = terms[state2.index++];
              break;
            }
          }
          break;
        }
        case "AddMatchOnce":
          state2 = {
            type: "MatchOnceBuffer",
            syntax: state2.syntax,
            index: 0,
            mask: state2.mask
          };
          break;
        case "Enum":
          if (token !== null) {
            let name42 = token.value.toLowerCase();
            if (name42.indexOf("\\") !== -1) {
              name42 = name42.replace(/\\[09].*$/, "");
            }
            if (hasOwnProperty3.call(state2.map, name42)) {
              state2 = state2.map[name42];
              break;
            }
          }
          state2 = MISMATCH;
          break;
        case "Generic": {
          const opts = syntaxStack !== null ? syntaxStack.opts : null;
          const lastTokenIndex2 = tokenIndex + Math.floor(state2.fn(token, getNextToken, opts));
          if (!isNaN(lastTokenIndex2) && lastTokenIndex2 > tokenIndex) {
            while (tokenIndex < lastTokenIndex2) {
              addTokenToMatch();
            }
            state2 = MATCH;
          } else {
            state2 = MISMATCH;
          }
          break;
        }
        case "Type":
        case "Property": {
          const syntaxDict = state2.type === "Type" ? "types" : "properties";
          const dictSyntax = hasOwnProperty3.call(syntaxes, syntaxDict) ? syntaxes[syntaxDict][state2.name] : null;
          if (!dictSyntax || !dictSyntax.match) {
            throw new Error(
              "Bad syntax reference: " + (state2.type === "Type" ? "<" + state2.name + ">" : "<'" + state2.name + "'>")
            );
          }
          if (syntaxStash !== false && token !== null && state2.type === "Type") {
            const lowPriorityMatching = (
              // https://drafts.csswg.org/css-values-4/#custom-idents
              // When parsing positionally-ambiguous keywords in a property value, a <custom-ident> production
              // can only claim the keyword if no other unfulfilled production can claim it.
              state2.name === "custom-ident" && token.type === Ident || // https://drafts.csswg.org/css-values-4/#lengths
              // ... if a `0` could be parsed as either a <number> or a <length> in a property (such as line-height),
              // it must parse as a <number>
              state2.name === "length" && token.value === "0"
            );
            if (lowPriorityMatching) {
              if (syntaxStash === null) {
                syntaxStash = stateSnapshotFromSyntax(state2, elseStack);
              }
              state2 = MISMATCH;
              break;
            }
          }
          openSyntax();
          state2 = dictSyntax.match;
          break;
        }
        case "Keyword": {
          const name42 = state2.name;
          if (token !== null) {
            let keywordName = token.value;
            if (keywordName.indexOf("\\") !== -1) {
              keywordName = keywordName.replace(/\\[09].*$/, "");
            }
            if (areStringsEqualCaseInsensitive(keywordName, name42)) {
              addTokenToMatch();
              state2 = MATCH;
              break;
            }
          }
          state2 = MISMATCH;
          break;
        }
        case "AtKeyword":
        case "Function":
          if (token !== null && areStringsEqualCaseInsensitive(token.value, state2.name)) {
            addTokenToMatch();
            state2 = MATCH;
            break;
          }
          state2 = MISMATCH;
          break;
        case "Token":
          if (token !== null && token.value === state2.value) {
            addTokenToMatch();
            state2 = MATCH;
            break;
          }
          state2 = MISMATCH;
          break;
        case "Comma":
          if (token !== null && token.type === Comma) {
            if (isCommaContextStart(matchStack.token)) {
              state2 = MISMATCH;
            } else {
              addTokenToMatch();
              state2 = isCommaContextEnd(token) ? MISMATCH : MATCH;
            }
          } else {
            state2 = isCommaContextStart(matchStack.token) || isCommaContextEnd(token) ? MATCH : MISMATCH;
          }
          break;
        case "String":
          let string2 = "";
          let lastTokenIndex = tokenIndex;
          for (; lastTokenIndex < tokens.length && string2.length < state2.value.length; lastTokenIndex++) {
            string2 += tokens[lastTokenIndex].value;
          }
          if (areStringsEqualCaseInsensitive(string2, state2.value)) {
            while (tokenIndex < lastTokenIndex) {
              addTokenToMatch();
            }
            state2 = MATCH;
          } else {
            state2 = MISMATCH;
          }
          break;
        default:
          throw new Error("Unknown node type: " + state2.type);
      }
    }
    totalIterationCount += iterationCount;
    switch (exitReason) {
      case null:
        console.warn("[csstree-match] BREAK after " + ITERATION_LIMIT + " iterations");
        exitReason = EXIT_REASON_ITERATION_LIMIT;
        matchStack = null;
        break;
      case EXIT_REASON_MATCH:
        while (syntaxStack !== null) {
          closeSyntax();
        }
        break;
      default:
        matchStack = null;
    }
    return {
      tokens,
      reason: exitReason,
      iterations: iterationCount,
      match: matchStack,
      longestMatch
    };
  }
  function matchAsTree(tokens, matchGraph, syntaxes) {
    const matchResult = internalMatch(tokens, matchGraph, syntaxes || {});
    if (matchResult.match === null) {
      return matchResult;
    }
    let item = matchResult.match;
    let host = matchResult.match = {
      syntax: matchGraph.syntax || null,
      match: []
    };
    const hostStack = [host];
    item = reverseList(item).prev;
    while (item !== null) {
      switch (item.type) {
        case OPEN_SYNTAX:
          host.match.push(host = {
            syntax: item.syntax,
            match: []
          });
          hostStack.push(host);
          break;
        case CLOSE_SYNTAX:
          hostStack.pop();
          host = hostStack[hostStack.length - 1];
          break;
        default:
          host.match.push({
            syntax: item.syntax || null,
            token: item.token.value,
            node: item.token.node
          });
      }
      item = item.prev;
    }
    return matchResult;
  }

  // ../../node_modules/css-tree/lib/lexer/trace.js
  var trace_exports = {};
  __export(trace_exports, {
    getTrace: () => getTrace,
    isKeyword: () => isKeyword,
    isProperty: () => isProperty,
    isType: () => isType
  });
  function getTrace(node) {
    function shouldPutToTrace(syntax) {
      if (syntax === null) {
        return false;
      }
      return syntax.type === "Type" || syntax.type === "Property" || syntax.type === "Keyword";
    }
    function hasMatch(matchNode) {
      if (Array.isArray(matchNode.match)) {
        for (let i2 = 0; i2 < matchNode.match.length; i2++) {
          if (hasMatch(matchNode.match[i2])) {
            if (shouldPutToTrace(matchNode.syntax)) {
              result.unshift(matchNode.syntax);
            }
            return true;
          }
        }
      } else if (matchNode.node === node) {
        result = shouldPutToTrace(matchNode.syntax) ? [matchNode.syntax] : [];
        return true;
      }
      return false;
    }
    let result = null;
    if (this.matched !== null) {
      hasMatch(this.matched);
    }
    return result;
  }
  function isType(node, type) {
    return testNode(this, node, (match) => match.type === "Type" && match.name === type);
  }
  function isProperty(node, property2) {
    return testNode(this, node, (match) => match.type === "Property" && match.name === property2);
  }
  function isKeyword(node) {
    return testNode(this, node, (match) => match.type === "Keyword");
  }
  function testNode(match, node, fn) {
    const trace = getTrace.call(match, node);
    if (trace === null) {
      return false;
    }
    return trace.some(fn);
  }

  // ../../node_modules/css-tree/lib/lexer/search.js
  function getFirstMatchNode(matchNode) {
    if ("node" in matchNode) {
      return matchNode.node;
    }
    return getFirstMatchNode(matchNode.match[0]);
  }
  function getLastMatchNode(matchNode) {
    if ("node" in matchNode) {
      return matchNode.node;
    }
    return getLastMatchNode(matchNode.match[matchNode.match.length - 1]);
  }
  function matchFragments(lexer2, ast, match, type, name42) {
    function findFragments(matchNode) {
      if (matchNode.syntax !== null && matchNode.syntax.type === type && matchNode.syntax.name === name42) {
        const start = getFirstMatchNode(matchNode);
        const end = getLastMatchNode(matchNode);
        lexer2.syntax.walk(ast, function(node, item, list) {
          if (node === start) {
            const nodes = new List();
            do {
              nodes.appendData(item.data);
              if (item.data === end) {
                break;
              }
              item = item.next;
            } while (item !== null);
            fragments.push({
              parent: list,
              nodes
            });
          }
        });
      }
      if (Array.isArray(matchNode.match)) {
        matchNode.match.forEach(findFragments);
      }
    }
    const fragments = [];
    if (match.matched !== null) {
      findFragments(match.matched);
    }
    return fragments;
  }

  // ../../node_modules/css-tree/lib/lexer/structure.js
  var { hasOwnProperty: hasOwnProperty4 } = Object.prototype;
  function isValidNumber(value2) {
    return typeof value2 === "number" && isFinite(value2) && Math.floor(value2) === value2 && value2 >= 0;
  }
  function isValidLocation(loc) {
    return Boolean(loc) && isValidNumber(loc.offset) && isValidNumber(loc.line) && isValidNumber(loc.column);
  }
  function createNodeStructureChecker(type, fields) {
    return function checkNode(node, warn) {
      if (!node || node.constructor !== Object) {
        return warn(node, "Type of node should be an Object");
      }
      for (let key in node) {
        let valid = true;
        if (hasOwnProperty4.call(node, key) === false) {
          continue;
        }
        if (key === "type") {
          if (node.type !== type) {
            warn(node, "Wrong node type `" + node.type + "`, expected `" + type + "`");
          }
        } else if (key === "loc") {
          if (node.loc === null) {
            continue;
          } else if (node.loc && node.loc.constructor === Object) {
            if (typeof node.loc.source !== "string") {
              key += ".source";
            } else if (!isValidLocation(node.loc.start)) {
              key += ".start";
            } else if (!isValidLocation(node.loc.end)) {
              key += ".end";
            } else {
              continue;
            }
          }
          valid = false;
        } else if (fields.hasOwnProperty(key)) {
          valid = false;
          for (let i2 = 0; !valid && i2 < fields[key].length; i2++) {
            const fieldType = fields[key][i2];
            switch (fieldType) {
              case String:
                valid = typeof node[key] === "string";
                break;
              case Boolean:
                valid = typeof node[key] === "boolean";
                break;
              case null:
                valid = node[key] === null;
                break;
              default:
                if (typeof fieldType === "string") {
                  valid = node[key] && node[key].type === fieldType;
                } else if (Array.isArray(fieldType)) {
                  valid = node[key] instanceof List;
                }
            }
          }
        } else {
          warn(node, "Unknown field `" + key + "` for " + type + " node type");
        }
        if (!valid) {
          warn(node, "Bad value for `" + type + "." + key + "`");
        }
      }
      for (const key in fields) {
        if (hasOwnProperty4.call(fields, key) && hasOwnProperty4.call(node, key) === false) {
          warn(node, "Field `" + type + "." + key + "` is missed");
        }
      }
    };
  }
  function processStructure(name42, nodeType) {
    const structure42 = nodeType.structure;
    const fields = {
      type: String,
      loc: true
    };
    const docs = {
      type: '"' + name42 + '"'
    };
    for (const key in structure42) {
      if (hasOwnProperty4.call(structure42, key) === false) {
        continue;
      }
      const docsTypes = [];
      const fieldTypes = fields[key] = Array.isArray(structure42[key]) ? structure42[key].slice() : [structure42[key]];
      for (let i2 = 0; i2 < fieldTypes.length; i2++) {
        const fieldType = fieldTypes[i2];
        if (fieldType === String || fieldType === Boolean) {
          docsTypes.push(fieldType.name);
        } else if (fieldType === null) {
          docsTypes.push("null");
        } else if (typeof fieldType === "string") {
          docsTypes.push("<" + fieldType + ">");
        } else if (Array.isArray(fieldType)) {
          docsTypes.push("List");
        } else {
          throw new Error("Wrong value `" + fieldType + "` in `" + name42 + "." + key + "` structure definition");
        }
      }
      docs[key] = docsTypes.join(" | ");
    }
    return {
      docs,
      check: createNodeStructureChecker(name42, fields)
    };
  }
  function getStructureFromConfig(config) {
    const structure42 = {};
    if (config.node) {
      for (const name42 in config.node) {
        if (hasOwnProperty4.call(config.node, name42)) {
          const nodeType = config.node[name42];
          if (nodeType.structure) {
            structure42[name42] = processStructure(name42, nodeType);
          } else {
            throw new Error("Missed `structure` field in `" + name42 + "` node type definition");
          }
        }
      }
    }
    return structure42;
  }

  // ../../node_modules/css-tree/lib/lexer/Lexer.js
  var cssWideKeywordsSyntax = buildMatchGraph(cssWideKeywords.join(" | "));
  function dumpMapSyntax(map11, compact, syntaxAsAst) {
    const result = {};
    for (const name42 in map11) {
      if (map11[name42].syntax) {
        result[name42] = syntaxAsAst ? map11[name42].syntax : generate(map11[name42].syntax, { compact });
      }
    }
    return result;
  }
  function dumpAtruleMapSyntax(map11, compact, syntaxAsAst) {
    const result = {};
    for (const [name42, atrule] of Object.entries(map11)) {
      result[name42] = {
        prelude: atrule.prelude && (syntaxAsAst ? atrule.prelude.syntax : generate(atrule.prelude.syntax, { compact })),
        descriptors: atrule.descriptors && dumpMapSyntax(atrule.descriptors, compact, syntaxAsAst)
      };
    }
    return result;
  }
  function valueHasVar(tokens) {
    for (let i2 = 0; i2 < tokens.length; i2++) {
      if (tokens[i2].value.toLowerCase() === "var(") {
        return true;
      }
    }
    return false;
  }
  function buildMatchResult(matched, error, iterations) {
    return {
      matched,
      iterations,
      error,
      ...trace_exports
    };
  }
  function matchSyntax(lexer2, syntax, value2, useCssWideKeywords) {
    const tokens = prepare_tokens_default(value2, lexer2.syntax);
    let result;
    if (valueHasVar(tokens)) {
      return buildMatchResult(null, new Error("Matching for a tree with var() is not supported"));
    }
    if (useCssWideKeywords) {
      result = matchAsTree(tokens, lexer2.cssWideKeywordsSyntax, lexer2);
    }
    if (!useCssWideKeywords || !result.match) {
      result = matchAsTree(tokens, syntax.match, lexer2);
      if (!result.match) {
        return buildMatchResult(
          null,
          new SyntaxMatchError(result.reason, syntax.syntax, value2, result),
          result.iterations
        );
      }
    }
    return buildMatchResult(result.match, null, result.iterations);
  }
  var Lexer = class {
    constructor(config, syntax, structure42) {
      this.cssWideKeywordsSyntax = cssWideKeywordsSyntax;
      this.syntax = syntax;
      this.generic = false;
      this.units = { ...units_exports };
      this.atrules = /* @__PURE__ */ Object.create(null);
      this.properties = /* @__PURE__ */ Object.create(null);
      this.types = /* @__PURE__ */ Object.create(null);
      this.structure = structure42 || getStructureFromConfig(config);
      if (config) {
        if (config.units) {
          for (const group of Object.keys(units_exports)) {
            if (Array.isArray(config.units[group])) {
              this.units[group] = config.units[group];
            }
          }
        }
        if (config.types) {
          for (const name42 in config.types) {
            this.addType_(name42, config.types[name42]);
          }
        }
        if (config.generic) {
          this.generic = true;
          for (const [name42, value2] of Object.entries(createGenericTypes(this.units))) {
            this.addType_(name42, value2);
          }
        }
        if (config.atrules) {
          for (const name42 in config.atrules) {
            this.addAtrule_(name42, config.atrules[name42]);
          }
        }
        if (config.properties) {
          for (const name42 in config.properties) {
            this.addProperty_(name42, config.properties[name42]);
          }
        }
      }
    }
    checkStructure(ast) {
      function collectWarning(node, message) {
        warns.push({ node, message });
      }
      const structure42 = this.structure;
      const warns = [];
      this.syntax.walk(ast, function(node) {
        if (structure42.hasOwnProperty(node.type)) {
          structure42[node.type].check(node, collectWarning);
        } else {
          collectWarning(node, "Unknown node type `" + node.type + "`");
        }
      });
      return warns.length ? warns : false;
    }
    createDescriptor(syntax, type, name42, parent = null) {
      const ref = {
        type,
        name: name42
      };
      const descriptor = {
        type,
        name: name42,
        parent,
        serializable: typeof syntax === "string" || syntax && typeof syntax.type === "string",
        syntax: null,
        match: null
      };
      if (typeof syntax === "function") {
        descriptor.match = buildMatchGraph(syntax, ref);
      } else {
        if (typeof syntax === "string") {
          Object.defineProperty(descriptor, "syntax", {
            get() {
              Object.defineProperty(descriptor, "syntax", {
                value: parse(syntax)
              });
              return descriptor.syntax;
            }
          });
        } else {
          descriptor.syntax = syntax;
        }
        Object.defineProperty(descriptor, "match", {
          get() {
            Object.defineProperty(descriptor, "match", {
              value: buildMatchGraph(descriptor.syntax, ref)
            });
            return descriptor.match;
          }
        });
      }
      return descriptor;
    }
    addAtrule_(name42, syntax) {
      if (!syntax) {
        return;
      }
      this.atrules[name42] = {
        type: "Atrule",
        name: name42,
        prelude: syntax.prelude ? this.createDescriptor(syntax.prelude, "AtrulePrelude", name42) : null,
        descriptors: syntax.descriptors ? Object.keys(syntax.descriptors).reduce(
          (map11, descName) => {
            map11[descName] = this.createDescriptor(syntax.descriptors[descName], "AtruleDescriptor", descName, name42);
            return map11;
          },
          /* @__PURE__ */ Object.create(null)
        ) : null
      };
    }
    addProperty_(name42, syntax) {
      if (!syntax) {
        return;
      }
      this.properties[name42] = this.createDescriptor(syntax, "Property", name42);
    }
    addType_(name42, syntax) {
      if (!syntax) {
        return;
      }
      this.types[name42] = this.createDescriptor(syntax, "Type", name42);
    }
    checkAtruleName(atruleName) {
      if (!this.getAtrule(atruleName)) {
        return new SyntaxReferenceError("Unknown at-rule", "@" + atruleName);
      }
    }
    checkAtrulePrelude(atruleName, prelude) {
      const error = this.checkAtruleName(atruleName);
      if (error) {
        return error;
      }
      const atrule = this.getAtrule(atruleName);
      if (!atrule.prelude && prelude) {
        return new SyntaxError("At-rule `@" + atruleName + "` should not contain a prelude");
      }
      if (atrule.prelude && !prelude) {
        if (!matchSyntax(this, atrule.prelude, "", false).matched) {
          return new SyntaxError("At-rule `@" + atruleName + "` should contain a prelude");
        }
      }
    }
    checkAtruleDescriptorName(atruleName, descriptorName) {
      const error = this.checkAtruleName(atruleName);
      if (error) {
        return error;
      }
      const atrule = this.getAtrule(atruleName);
      const descriptor = keyword(descriptorName);
      if (!atrule.descriptors) {
        return new SyntaxError("At-rule `@" + atruleName + "` has no known descriptors");
      }
      if (!atrule.descriptors[descriptor.name] && !atrule.descriptors[descriptor.basename]) {
        return new SyntaxReferenceError("Unknown at-rule descriptor", descriptorName);
      }
    }
    checkPropertyName(propertyName) {
      if (!this.getProperty(propertyName)) {
        return new SyntaxReferenceError("Unknown property", propertyName);
      }
    }
    matchAtrulePrelude(atruleName, prelude) {
      const error = this.checkAtrulePrelude(atruleName, prelude);
      if (error) {
        return buildMatchResult(null, error);
      }
      const atrule = this.getAtrule(atruleName);
      if (!atrule.prelude) {
        return buildMatchResult(null, null);
      }
      return matchSyntax(this, atrule.prelude, prelude || "", false);
    }
    matchAtruleDescriptor(atruleName, descriptorName, value2) {
      const error = this.checkAtruleDescriptorName(atruleName, descriptorName);
      if (error) {
        return buildMatchResult(null, error);
      }
      const atrule = this.getAtrule(atruleName);
      const descriptor = keyword(descriptorName);
      return matchSyntax(this, atrule.descriptors[descriptor.name] || atrule.descriptors[descriptor.basename], value2, false);
    }
    matchDeclaration(node) {
      if (node.type !== "Declaration") {
        return buildMatchResult(null, new Error("Not a Declaration node"));
      }
      return this.matchProperty(node.property, node.value);
    }
    matchProperty(propertyName, value2) {
      if (property(propertyName).custom) {
        return buildMatchResult(null, new Error("Lexer matching doesn't applicable for custom properties"));
      }
      const error = this.checkPropertyName(propertyName);
      if (error) {
        return buildMatchResult(null, error);
      }
      return matchSyntax(this, this.getProperty(propertyName), value2, true);
    }
    matchType(typeName, value2) {
      const typeSyntax = this.getType(typeName);
      if (!typeSyntax) {
        return buildMatchResult(null, new SyntaxReferenceError("Unknown type", typeName));
      }
      return matchSyntax(this, typeSyntax, value2, false);
    }
    match(syntax, value2) {
      if (typeof syntax !== "string" && (!syntax || !syntax.type)) {
        return buildMatchResult(null, new SyntaxReferenceError("Bad syntax"));
      }
      if (typeof syntax === "string" || !syntax.match) {
        syntax = this.createDescriptor(syntax, "Type", "anonymous");
      }
      return matchSyntax(this, syntax, value2, false);
    }
    findValueFragments(propertyName, value2, type, name42) {
      return matchFragments(this, value2, this.matchProperty(propertyName, value2), type, name42);
    }
    findDeclarationValueFragments(declaration, type, name42) {
      return matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name42);
    }
    findAllFragments(ast, type, name42) {
      const result = [];
      this.syntax.walk(ast, {
        visit: "Declaration",
        enter: (declaration) => {
          result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name42));
        }
      });
      return result;
    }
    getAtrule(atruleName, fallbackBasename = true) {
      const atrule = keyword(atruleName);
      const atruleEntry = atrule.vendor && fallbackBasename ? this.atrules[atrule.name] || this.atrules[atrule.basename] : this.atrules[atrule.name];
      return atruleEntry || null;
    }
    getAtrulePrelude(atruleName, fallbackBasename = true) {
      const atrule = this.getAtrule(atruleName, fallbackBasename);
      return atrule && atrule.prelude || null;
    }
    getAtruleDescriptor(atruleName, name42) {
      return this.atrules.hasOwnProperty(atruleName) && this.atrules.declarators ? this.atrules[atruleName].declarators[name42] || null : null;
    }
    getProperty(propertyName, fallbackBasename = true) {
      const property2 = property(propertyName);
      const propertyEntry = property2.vendor && fallbackBasename ? this.properties[property2.name] || this.properties[property2.basename] : this.properties[property2.name];
      return propertyEntry || null;
    }
    getType(name42) {
      return hasOwnProperty.call(this.types, name42) ? this.types[name42] : null;
    }
    validate() {
      function validate(syntax, name42, broken, descriptor) {
        if (broken.has(name42)) {
          return broken.get(name42);
        }
        broken.set(name42, false);
        if (descriptor.syntax !== null) {
          walk(descriptor.syntax, function(node) {
            if (node.type !== "Type" && node.type !== "Property") {
              return;
            }
            const map11 = node.type === "Type" ? syntax.types : syntax.properties;
            const brokenMap = node.type === "Type" ? brokenTypes : brokenProperties;
            if (!hasOwnProperty.call(map11, node.name) || validate(syntax, node.name, brokenMap, map11[node.name])) {
              broken.set(name42, true);
            }
          }, this);
        }
      }
      let brokenTypes = /* @__PURE__ */ new Map();
      let brokenProperties = /* @__PURE__ */ new Map();
      for (const key in this.types) {
        validate(this, key, brokenTypes, this.types[key]);
      }
      for (const key in this.properties) {
        validate(this, key, brokenProperties, this.properties[key]);
      }
      brokenTypes = [...brokenTypes.keys()].filter((name42) => brokenTypes.get(name42));
      brokenProperties = [...brokenProperties.keys()].filter((name42) => brokenProperties.get(name42));
      if (brokenTypes.length || brokenProperties.length) {
        return {
          types: brokenTypes,
          properties: brokenProperties
        };
      }
      return null;
    }
    dump(syntaxAsAst, pretty) {
      return {
        generic: this.generic,
        units: this.units,
        types: dumpMapSyntax(this.types, !pretty, syntaxAsAst),
        properties: dumpMapSyntax(this.properties, !pretty, syntaxAsAst),
        atrules: dumpAtruleMapSyntax(this.atrules, !pretty, syntaxAsAst)
      };
    }
    toString() {
      return JSON.stringify(this.dump());
    }
  };

  // ../../node_modules/css-tree/lib/syntax/config/mix.js
  function appendOrSet(a, b) {
    if (typeof b === "string" && /^\s*\|/.test(b)) {
      return typeof a === "string" ? a + b : b.replace(/^\s*\|\s*/, "");
    }
    return b || null;
  }
  function sliceProps(obj, props) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [key, value2] of Object.entries(obj)) {
      if (value2) {
        result[key] = {};
        for (const prop of Object.keys(value2)) {
          if (props.includes(prop)) {
            result[key][prop] = value2[prop];
          }
        }
      }
    }
    return result;
  }
  function mix(dest, src) {
    const result = { ...dest };
    for (const [prop, value2] of Object.entries(src)) {
      switch (prop) {
        case "generic":
          result[prop] = Boolean(value2);
          break;
        case "units":
          result[prop] = { ...dest[prop] };
          for (const [name42, patch] of Object.entries(value2)) {
            result[prop][name42] = Array.isArray(patch) ? patch : [];
          }
          break;
        case "atrules":
          result[prop] = { ...dest[prop] };
          for (const [name42, atrule] of Object.entries(value2)) {
            const exists4 = result[prop][name42] || {};
            const current = result[prop][name42] = {
              prelude: exists4.prelude || null,
              descriptors: {
                ...exists4.descriptors
              }
            };
            if (!atrule) {
              continue;
            }
            current.prelude = atrule.prelude ? appendOrSet(current.prelude, atrule.prelude) : current.prelude || null;
            for (const [descriptorName, descriptorValue] of Object.entries(atrule.descriptors || {})) {
              current.descriptors[descriptorName] = descriptorValue ? appendOrSet(current.descriptors[descriptorName], descriptorValue) : null;
            }
            if (!Object.keys(current.descriptors).length) {
              current.descriptors = null;
            }
          }
          break;
        case "types":
        case "properties":
          result[prop] = { ...dest[prop] };
          for (const [name42, syntax] of Object.entries(value2)) {
            result[prop][name42] = appendOrSet(result[prop][name42], syntax);
          }
          break;
        case "scope":
          result[prop] = { ...dest[prop] };
          for (const [name42, props] of Object.entries(value2)) {
            result[prop][name42] = { ...result[prop][name42], ...props };
          }
          break;
        case "parseContext":
          result[prop] = {
            ...dest[prop],
            ...value2
          };
          break;
        case "atrule":
        case "pseudo":
          result[prop] = {
            ...dest[prop],
            ...sliceProps(value2, ["parse"])
          };
          break;
        case "node":
          result[prop] = {
            ...dest[prop],
            ...sliceProps(value2, ["name", "structure", "parse", "generate", "walkContext"])
          };
          break;
      }
    }
    return result;
  }

  // ../../node_modules/css-tree/lib/syntax/create.js
  function createSyntax(config) {
    const parse44 = createParser(config);
    const walk3 = createWalker(config);
    const generate44 = createGenerator(config);
    const { fromPlainObject: fromPlainObject2, toPlainObject: toPlainObject2 } = createConvertor(walk3);
    const syntax = {
      lexer: null,
      createLexer: (config2) => new Lexer(config2, syntax, syntax.lexer.structure),
      tokenize,
      parse: parse44,
      generate: generate44,
      walk: walk3,
      find: walk3.find,
      findLast: walk3.findLast,
      findAll: walk3.findAll,
      fromPlainObject: fromPlainObject2,
      toPlainObject: toPlainObject2,
      fork(extension) {
        const base = mix({}, config);
        return createSyntax(
          typeof extension === "function" ? extension(base, Object.assign) : mix(base, extension)
        );
      }
    };
    syntax.lexer = new Lexer({
      generic: true,
      units: config.units,
      types: config.types,
      atrules: config.atrules,
      properties: config.properties,
      node: config.node
    }, syntax);
    return syntax;
  }
  var create_default = (config) => createSyntax(mix({}, config));

  // ../../node_modules/css-tree/dist/data.js
  var data_default = {
    "generic": true,
    "units": {
      "angle": [
        "deg",
        "grad",
        "rad",
        "turn"
      ],
      "decibel": [
        "db"
      ],
      "flex": [
        "fr"
      ],
      "frequency": [
        "hz",
        "khz"
      ],
      "length": [
        "cm",
        "mm",
        "q",
        "in",
        "pt",
        "pc",
        "px",
        "em",
        "rem",
        "ex",
        "rex",
        "cap",
        "rcap",
        "ch",
        "rch",
        "ic",
        "ric",
        "lh",
        "rlh",
        "vw",
        "svw",
        "lvw",
        "dvw",
        "vh",
        "svh",
        "lvh",
        "dvh",
        "vi",
        "svi",
        "lvi",
        "dvi",
        "vb",
        "svb",
        "lvb",
        "dvb",
        "vmin",
        "svmin",
        "lvmin",
        "dvmin",
        "vmax",
        "svmax",
        "lvmax",
        "dvmax",
        "cqw",
        "cqh",
        "cqi",
        "cqb",
        "cqmin",
        "cqmax"
      ],
      "resolution": [
        "dpi",
        "dpcm",
        "dppx",
        "x"
      ],
      "semitones": [
        "st"
      ],
      "time": [
        "s",
        "ms"
      ]
    },
    "types": {
      "abs()": "abs( <calc-sum> )",
      "absolute-size": "xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large",
      "acos()": "acos( <calc-sum> )",
      "alpha-value": "<number>|<percentage>",
      "angle-percentage": "<angle>|<percentage>",
      "angular-color-hint": "<angle-percentage>",
      "angular-color-stop": "<color>&&<color-stop-angle>?",
      "angular-color-stop-list": "[<angular-color-stop> [, <angular-color-hint>]?]# , <angular-color-stop>",
      "animateable-feature": "scroll-position|contents|<custom-ident>",
      "asin()": "asin( <calc-sum> )",
      "atan()": "atan( <calc-sum> )",
      "atan2()": "atan2( <calc-sum> , <calc-sum> )",
      "attachment": "scroll|fixed|local",
      "attr()": "attr( <attr-name> <type-or-unit>? [, <attr-fallback>]? )",
      "attr-matcher": "['~'|'|'|'^'|'$'|'*']? '='",
      "attr-modifier": "i|s",
      "attribute-selector": "'[' <wq-name> ']'|'[' <wq-name> <attr-matcher> [<string-token>|<ident-token>] <attr-modifier>? ']'",
      "auto-repeat": "repeat( [auto-fill|auto-fit] , [<line-names>? <fixed-size>]+ <line-names>? )",
      "auto-track-list": "[<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>? <auto-repeat> [<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>?",
      "axis": "block|inline|vertical|horizontal",
      "baseline-position": "[first|last]? baseline",
      "basic-shape": "<inset()>|<circle()>|<ellipse()>|<polygon()>|<path()>",
      "bg-image": "none|<image>",
      "bg-layer": "<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<box>||<box>",
      "bg-position": "[[left|center|right|top|bottom|<length-percentage>]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]|[center|[left|right] <length-percentage>?]&&[center|[top|bottom] <length-percentage>?]]",
      "bg-size": "[<length-percentage>|auto]{1,2}|cover|contain",
      "blur()": "blur( <length> )",
      "blend-mode": "normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity",
      "box": "border-box|padding-box|content-box",
      "brightness()": "brightness( <number-percentage> )",
      "calc()": "calc( <calc-sum> )",
      "calc-sum": "<calc-product> [['+'|'-'] <calc-product>]*",
      "calc-product": "<calc-value> ['*' <calc-value>|'/' <number>]*",
      "calc-value": "<number>|<dimension>|<percentage>|<calc-constant>|( <calc-sum> )",
      "calc-constant": "e|pi|infinity|-infinity|NaN",
      "cf-final-image": "<image>|<color>",
      "cf-mixing-image": "<percentage>?&&<image>",
      "circle()": "circle( [<shape-radius>]? [at <position>]? )",
      "clamp()": "clamp( <calc-sum>#{3} )",
      "class-selector": "'.' <ident-token>",
      "clip-source": "<url>",
      "color": "<rgb()>|<rgba()>|<hsl()>|<hsla()>|<hwb()>|<lab()>|<lch()>|<hex-color>|<named-color>|currentcolor|<deprecated-system-color>",
      "color-stop": "<color-stop-length>|<color-stop-angle>",
      "color-stop-angle": "<angle-percentage>{1,2}",
      "color-stop-length": "<length-percentage>{1,2}",
      "color-stop-list": "[<linear-color-stop> [, <linear-color-hint>]?]# , <linear-color-stop>",
      "combinator": "'>'|'+'|'~'|['||']",
      "common-lig-values": "[common-ligatures|no-common-ligatures]",
      "compat-auto": "searchfield|textarea|push-button|slider-horizontal|checkbox|radio|square-button|menulist|listbox|meter|progress-bar|button",
      "composite-style": "clear|copy|source-over|source-in|source-out|source-atop|destination-over|destination-in|destination-out|destination-atop|xor",
      "compositing-operator": "add|subtract|intersect|exclude",
      "compound-selector": "[<type-selector>? <subclass-selector>* [<pseudo-element-selector> <pseudo-class-selector>*]*]!",
      "compound-selector-list": "<compound-selector>#",
      "complex-selector": "<compound-selector> [<combinator>? <compound-selector>]*",
      "complex-selector-list": "<complex-selector>#",
      "conic-gradient()": "conic-gradient( [from <angle>]? [at <position>]? , <angular-color-stop-list> )",
      "contextual-alt-values": "[contextual|no-contextual]",
      "content-distribution": "space-between|space-around|space-evenly|stretch",
      "content-list": "[<string>|contents|<image>|<counter>|<quote>|<target>|<leader()>|<attr()>]+",
      "content-position": "center|start|end|flex-start|flex-end",
      "content-replacement": "<image>",
      "contrast()": "contrast( [<number-percentage>] )",
      "cos()": "cos( <calc-sum> )",
      "counter": "<counter()>|<counters()>",
      "counter()": "counter( <counter-name> , <counter-style>? )",
      "counter-name": "<custom-ident>",
      "counter-style": "<counter-style-name>|symbols( )",
      "counter-style-name": "<custom-ident>",
      "counters()": "counters( <counter-name> , <string> , <counter-style>? )",
      "cross-fade()": "cross-fade( <cf-mixing-image> , <cf-final-image>? )",
      "cubic-bezier-timing-function": "ease|ease-in|ease-out|ease-in-out|cubic-bezier( <number [0,1]> , <number> , <number [0,1]> , <number> )",
      "deprecated-system-color": "ActiveBorder|ActiveCaption|AppWorkspace|Background|ButtonFace|ButtonHighlight|ButtonShadow|ButtonText|CaptionText|GrayText|Highlight|HighlightText|InactiveBorder|InactiveCaption|InactiveCaptionText|InfoBackground|InfoText|Menu|MenuText|Scrollbar|ThreeDDarkShadow|ThreeDFace|ThreeDHighlight|ThreeDLightShadow|ThreeDShadow|Window|WindowFrame|WindowText",
      "discretionary-lig-values": "[discretionary-ligatures|no-discretionary-ligatures]",
      "display-box": "contents|none",
      "display-inside": "flow|flow-root|table|flex|grid|ruby",
      "display-internal": "table-row-group|table-header-group|table-footer-group|table-row|table-cell|table-column-group|table-column|table-caption|ruby-base|ruby-text|ruby-base-container|ruby-text-container",
      "display-legacy": "inline-block|inline-list-item|inline-table|inline-flex|inline-grid",
      "display-listitem": "<display-outside>?&&[flow|flow-root]?&&list-item",
      "display-outside": "block|inline|run-in",
      "drop-shadow()": "drop-shadow( <length>{2,3} <color>? )",
      "east-asian-variant-values": "[jis78|jis83|jis90|jis04|simplified|traditional]",
      "east-asian-width-values": "[full-width|proportional-width]",
      "element()": "element( <custom-ident> , [first|start|last|first-except]? )|element( <id-selector> )",
      "ellipse()": "ellipse( [<shape-radius>{2}]? [at <position>]? )",
      "ending-shape": "circle|ellipse",
      "env()": "env( <custom-ident> , <declaration-value>? )",
      "exp()": "exp( <calc-sum> )",
      "explicit-track-list": "[<line-names>? <track-size>]+ <line-names>?",
      "family-name": "<string>|<custom-ident>+",
      "feature-tag-value": "<string> [<integer>|on|off]?",
      "feature-type": "@stylistic|@historical-forms|@styleset|@character-variant|@swash|@ornaments|@annotation",
      "feature-value-block": "<feature-type> '{' <feature-value-declaration-list> '}'",
      "feature-value-block-list": "<feature-value-block>+",
      "feature-value-declaration": "<custom-ident> : <integer>+ ;",
      "feature-value-declaration-list": "<feature-value-declaration>",
      "feature-value-name": "<custom-ident>",
      "fill-rule": "nonzero|evenodd",
      "filter-function": "<blur()>|<brightness()>|<contrast()>|<drop-shadow()>|<grayscale()>|<hue-rotate()>|<invert()>|<opacity()>|<saturate()>|<sepia()>",
      "filter-function-list": "[<filter-function>|<url>]+",
      "final-bg-layer": "<'background-color'>||<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<box>||<box>",
      "fixed-breadth": "<length-percentage>",
      "fixed-repeat": "repeat( [<integer [1,\u221E]>] , [<line-names>? <fixed-size>]+ <line-names>? )",
      "fixed-size": "<fixed-breadth>|minmax( <fixed-breadth> , <track-breadth> )|minmax( <inflexible-breadth> , <fixed-breadth> )",
      "font-stretch-absolute": "normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded|<percentage>",
      "font-variant-css21": "[normal|small-caps]",
      "font-weight-absolute": "normal|bold|<number [1,1000]>",
      "frequency-percentage": "<frequency>|<percentage>",
      "general-enclosed": "[<function-token> <any-value> )]|( <ident> <any-value> )",
      "generic-family": "serif|sans-serif|cursive|fantasy|monospace|-apple-system",
      "generic-name": "serif|sans-serif|cursive|fantasy|monospace",
      "geometry-box": "<shape-box>|fill-box|stroke-box|view-box",
      "gradient": "<linear-gradient()>|<repeating-linear-gradient()>|<radial-gradient()>|<repeating-radial-gradient()>|<conic-gradient()>|<repeating-conic-gradient()>|<-legacy-gradient>",
      "grayscale()": "grayscale( <number-percentage> )",
      "grid-line": "auto|<custom-ident>|[<integer>&&<custom-ident>?]|[span&&[<integer>||<custom-ident>]]",
      "historical-lig-values": "[historical-ligatures|no-historical-ligatures]",
      "hsl()": "hsl( <hue> <percentage> <percentage> [/ <alpha-value>]? )|hsl( <hue> , <percentage> , <percentage> , <alpha-value>? )",
      "hsla()": "hsla( <hue> <percentage> <percentage> [/ <alpha-value>]? )|hsla( <hue> , <percentage> , <percentage> , <alpha-value>? )",
      "hue": "<number>|<angle>",
      "hue-rotate()": "hue-rotate( <angle> )",
      "hwb()": "hwb( [<hue>|none] [<percentage>|none] [<percentage>|none] [/ [<alpha-value>|none]]? )",
      "hypot()": "hypot( <calc-sum># )",
      "image": "<url>|<image()>|<image-set()>|<element()>|<paint()>|<cross-fade()>|<gradient>",
      "image()": "image( <image-tags>? [<image-src>? , <color>?]! )",
      "image-set()": "image-set( <image-set-option># )",
      "image-set-option": "[<image>|<string>] [<resolution>||type( <string> )]",
      "image-src": "<url>|<string>",
      "image-tags": "ltr|rtl",
      "inflexible-breadth": "<length-percentage>|min-content|max-content|auto",
      "inset()": "inset( <length-percentage>{1,4} [round <'border-radius'>]? )",
      "invert()": "invert( <number-percentage> )",
      "keyframes-name": "<custom-ident>|<string>",
      "keyframe-block": "<keyframe-selector># { <declaration-list> }",
      "keyframe-block-list": "<keyframe-block>+",
      "keyframe-selector": "from|to|<percentage>",
      "lab()": "lab( [<percentage>|<number>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
      "layer()": "layer( <layer-name> )",
      "layer-name": "<ident> ['.' <ident>]*",
      "lch()": "lch( [<percentage>|<number>|none] [<percentage>|<number>|none] [<hue>|none] [/ [<alpha-value>|none]]? )",
      "leader()": "leader( <leader-type> )",
      "leader-type": "dotted|solid|space|<string>",
      "length-percentage": "<length>|<percentage>",
      "line-names": "'[' <custom-ident>* ']'",
      "line-name-list": "[<line-names>|<name-repeat>]+",
      "line-style": "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset",
      "line-width": "<length>|thin|medium|thick",
      "linear-color-hint": "<length-percentage>",
      "linear-color-stop": "<color> <color-stop-length>?",
      "linear-gradient()": "linear-gradient( [<angle>|to <side-or-corner>]? , <color-stop-list> )",
      "log()": "log( <calc-sum> , <calc-sum>? )",
      "mask-layer": "<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||<geometry-box>||[<geometry-box>|no-clip]||<compositing-operator>||<masking-mode>",
      "mask-position": "[<length-percentage>|left|center|right] [<length-percentage>|top|center|bottom]?",
      "mask-reference": "none|<image>|<mask-source>",
      "mask-source": "<url>",
      "masking-mode": "alpha|luminance|match-source",
      "matrix()": "matrix( <number>#{6} )",
      "matrix3d()": "matrix3d( <number>#{16} )",
      "max()": "max( <calc-sum># )",
      "media-and": "<media-in-parens> [and <media-in-parens>]+",
      "media-condition": "<media-not>|<media-and>|<media-or>|<media-in-parens>",
      "media-condition-without-or": "<media-not>|<media-and>|<media-in-parens>",
      "media-feature": "( [<mf-plain>|<mf-boolean>|<mf-range>] )",
      "media-in-parens": "( <media-condition> )|<media-feature>|<general-enclosed>",
      "media-not": "not <media-in-parens>",
      "media-or": "<media-in-parens> [or <media-in-parens>]+",
      "media-query": "<media-condition>|[not|only]? <media-type> [and <media-condition-without-or>]?",
      "media-query-list": "<media-query>#",
      "media-type": "<ident>",
      "mf-boolean": "<mf-name>",
      "mf-name": "<ident>",
      "mf-plain": "<mf-name> : <mf-value>",
      "mf-range": "<mf-name> ['<'|'>']? '='? <mf-value>|<mf-value> ['<'|'>']? '='? <mf-name>|<mf-value> '<' '='? <mf-name> '<' '='? <mf-value>|<mf-value> '>' '='? <mf-name> '>' '='? <mf-value>",
      "mf-value": "<number>|<dimension>|<ident>|<ratio>",
      "min()": "min( <calc-sum># )",
      "minmax()": "minmax( [<length-percentage>|min-content|max-content|auto] , [<length-percentage>|<flex>|min-content|max-content|auto] )",
      "mod()": "mod( <calc-sum> , <calc-sum> )",
      "name-repeat": "repeat( [<integer [1,\u221E]>|auto-fill] , <line-names>+ )",
      "named-color": "transparent|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|<-non-standard-color>",
      "namespace-prefix": "<ident>",
      "ns-prefix": "[<ident-token>|'*']? '|'",
      "number-percentage": "<number>|<percentage>",
      "numeric-figure-values": "[lining-nums|oldstyle-nums]",
      "numeric-fraction-values": "[diagonal-fractions|stacked-fractions]",
      "numeric-spacing-values": "[proportional-nums|tabular-nums]",
      "nth": "<an-plus-b>|even|odd",
      "opacity()": "opacity( [<number-percentage>] )",
      "overflow-position": "unsafe|safe",
      "outline-radius": "<length>|<percentage>",
      "page-body": "<declaration>? [; <page-body>]?|<page-margin-box> <page-body>",
      "page-margin-box": "<page-margin-box-type> '{' <declaration-list> '}'",
      "page-margin-box-type": "@top-left-corner|@top-left|@top-center|@top-right|@top-right-corner|@bottom-left-corner|@bottom-left|@bottom-center|@bottom-right|@bottom-right-corner|@left-top|@left-middle|@left-bottom|@right-top|@right-middle|@right-bottom",
      "page-selector-list": "[<page-selector>#]?",
      "page-selector": "<pseudo-page>+|<ident> <pseudo-page>*",
      "page-size": "A5|A4|A3|B5|B4|JIS-B5|JIS-B4|letter|legal|ledger",
      "path()": "path( [<fill-rule> ,]? <string> )",
      "paint()": "paint( <ident> , <declaration-value>? )",
      "perspective()": "perspective( [<length [0,\u221E]>|none] )",
      "polygon()": "polygon( <fill-rule>? , [<length-percentage> <length-percentage>]# )",
      "position": "[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]?|[[left|right] <length-percentage>]&&[[top|bottom] <length-percentage>]]",
      "pow()": "pow( <calc-sum> , <calc-sum> )",
      "pseudo-class-selector": "':' <ident-token>|':' <function-token> <any-value> ')'",
      "pseudo-element-selector": "':' <pseudo-class-selector>",
      "pseudo-page": ": [left|right|first|blank]",
      "quote": "open-quote|close-quote|no-open-quote|no-close-quote",
      "radial-gradient()": "radial-gradient( [<ending-shape>||<size>]? [at <position>]? , <color-stop-list> )",
      "ratio": "<number [0,\u221E]> [/ <number [0,\u221E]>]?",
      "relative-selector": "<combinator>? <complex-selector>",
      "relative-selector-list": "<relative-selector>#",
      "relative-size": "larger|smaller",
      "rem()": "rem( <calc-sum> , <calc-sum> )",
      "repeat-style": "repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}",
      "repeating-conic-gradient()": "repeating-conic-gradient( [from <angle>]? [at <position>]? , <angular-color-stop-list> )",
      "repeating-linear-gradient()": "repeating-linear-gradient( [<angle>|to <side-or-corner>]? , <color-stop-list> )",
      "repeating-radial-gradient()": "repeating-radial-gradient( [<ending-shape>||<size>]? [at <position>]? , <color-stop-list> )",
      "reversed-counter-name": "reversed( <counter-name> )",
      "rgb()": "rgb( <percentage>{3} [/ <alpha-value>]? )|rgb( <number>{3} [/ <alpha-value>]? )|rgb( <percentage>#{3} , <alpha-value>? )|rgb( <number>#{3} , <alpha-value>? )",
      "rgba()": "rgba( <percentage>{3} [/ <alpha-value>]? )|rgba( <number>{3} [/ <alpha-value>]? )|rgba( <percentage>#{3} , <alpha-value>? )|rgba( <number>#{3} , <alpha-value>? )",
      "rotate()": "rotate( [<angle>|<zero>] )",
      "rotate3d()": "rotate3d( <number> , <number> , <number> , [<angle>|<zero>] )",
      "rotateX()": "rotateX( [<angle>|<zero>] )",
      "rotateY()": "rotateY( [<angle>|<zero>] )",
      "rotateZ()": "rotateZ( [<angle>|<zero>] )",
      "round()": "round( <rounding-strategy>? , <calc-sum> , <calc-sum> )",
      "rounding-strategy": "nearest|up|down|to-zero",
      "saturate()": "saturate( <number-percentage> )",
      "scale()": "scale( [<number>|<percentage>]#{1,2} )",
      "scale3d()": "scale3d( [<number>|<percentage>]#{3} )",
      "scaleX()": "scaleX( [<number>|<percentage>] )",
      "scaleY()": "scaleY( [<number>|<percentage>] )",
      "scaleZ()": "scaleZ( [<number>|<percentage>] )",
      "scroller": "root|nearest",
      "self-position": "center|start|end|self-start|self-end|flex-start|flex-end",
      "shape-radius": "<length-percentage>|closest-side|farthest-side",
      "sign()": "sign( <calc-sum> )",
      "skew()": "skew( [<angle>|<zero>] , [<angle>|<zero>]? )",
      "skewX()": "skewX( [<angle>|<zero>] )",
      "skewY()": "skewY( [<angle>|<zero>] )",
      "sepia()": "sepia( <number-percentage> )",
      "shadow": "inset?&&<length>{2,4}&&<color>?",
      "shadow-t": "[<length>{2,3}&&<color>?]",
      "shape": "rect( <top> , <right> , <bottom> , <left> )|rect( <top> <right> <bottom> <left> )",
      "shape-box": "<box>|margin-box",
      "side-or-corner": "[left|right]||[top|bottom]",
      "sin()": "sin( <calc-sum> )",
      "single-animation": "<time>||<easing-function>||<time>||<single-animation-iteration-count>||<single-animation-direction>||<single-animation-fill-mode>||<single-animation-play-state>||[none|<keyframes-name>]",
      "single-animation-direction": "normal|reverse|alternate|alternate-reverse",
      "single-animation-fill-mode": "none|forwards|backwards|both",
      "single-animation-iteration-count": "infinite|<number>",
      "single-animation-play-state": "running|paused",
      "single-animation-timeline": "auto|none|<timeline-name>|scroll( <axis>? <scroller>? )",
      "single-transition": "[none|<single-transition-property>]||<time>||<easing-function>||<time>",
      "single-transition-property": "all|<custom-ident>",
      "size": "closest-side|farthest-side|closest-corner|farthest-corner|<length>|<length-percentage>{2}",
      "sqrt()": "sqrt( <calc-sum> )",
      "step-position": "jump-start|jump-end|jump-none|jump-both|start|end",
      "step-timing-function": "step-start|step-end|steps( <integer> [, <step-position>]? )",
      "subclass-selector": "<id-selector>|<class-selector>|<attribute-selector>|<pseudo-class-selector>",
      "supports-condition": "not <supports-in-parens>|<supports-in-parens> [and <supports-in-parens>]*|<supports-in-parens> [or <supports-in-parens>]*",
      "supports-in-parens": "( <supports-condition> )|<supports-feature>|<general-enclosed>",
      "supports-feature": "<supports-decl>|<supports-selector-fn>",
      "supports-decl": "( <declaration> )",
      "supports-selector-fn": "selector( <complex-selector> )",
      "symbol": "<string>|<image>|<custom-ident>",
      "tan()": "tan( <calc-sum> )",
      "target": "<target-counter()>|<target-counters()>|<target-text()>",
      "target-counter()": "target-counter( [<string>|<url>] , <custom-ident> , <counter-style>? )",
      "target-counters()": "target-counters( [<string>|<url>] , <custom-ident> , <string> , <counter-style>? )",
      "target-text()": "target-text( [<string>|<url>] , [content|before|after|first-letter]? )",
      "time-percentage": "<time>|<percentage>",
      "timeline-name": "<custom-ident>|<string>",
      "easing-function": "linear|<cubic-bezier-timing-function>|<step-timing-function>",
      "track-breadth": "<length-percentage>|<flex>|min-content|max-content|auto",
      "track-list": "[<line-names>? [<track-size>|<track-repeat>]]+ <line-names>?",
      "track-repeat": "repeat( [<integer [1,\u221E]>] , [<line-names>? <track-size>]+ <line-names>? )",
      "track-size": "<track-breadth>|minmax( <inflexible-breadth> , <track-breadth> )|fit-content( <length-percentage> )",
      "transform-function": "<matrix()>|<translate()>|<translateX()>|<translateY()>|<scale()>|<scaleX()>|<scaleY()>|<rotate()>|<skew()>|<skewX()>|<skewY()>|<matrix3d()>|<translate3d()>|<translateZ()>|<scale3d()>|<scaleZ()>|<rotate3d()>|<rotateX()>|<rotateY()>|<rotateZ()>|<perspective()>",
      "transform-list": "<transform-function>+",
      "translate()": "translate( <length-percentage> , <length-percentage>? )",
      "translate3d()": "translate3d( <length-percentage> , <length-percentage> , <length> )",
      "translateX()": "translateX( <length-percentage> )",
      "translateY()": "translateY( <length-percentage> )",
      "translateZ()": "translateZ( <length> )",
      "type-or-unit": "string|color|url|integer|number|length|angle|time|frequency|cap|ch|em|ex|ic|lh|rlh|rem|vb|vi|vw|vh|vmin|vmax|mm|Q|cm|in|pt|pc|px|deg|grad|rad|turn|ms|s|Hz|kHz|%",
      "type-selector": "<wq-name>|<ns-prefix>? '*'",
      "var()": "var( <custom-property-name> , <declaration-value>? )",
      "viewport-length": "auto|<length-percentage>",
      "visual-box": "content-box|padding-box|border-box",
      "wq-name": "<ns-prefix>? <ident-token>",
      "-legacy-gradient": "<-webkit-gradient()>|<-legacy-linear-gradient>|<-legacy-repeating-linear-gradient>|<-legacy-radial-gradient>|<-legacy-repeating-radial-gradient>",
      "-legacy-linear-gradient": "-moz-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-linear-gradient( <-legacy-linear-gradient-arguments> )",
      "-legacy-repeating-linear-gradient": "-moz-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )",
      "-legacy-linear-gradient-arguments": "[<angle>|<side-or-corner>]? , <color-stop-list>",
      "-legacy-radial-gradient": "-moz-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-radial-gradient( <-legacy-radial-gradient-arguments> )",
      "-legacy-repeating-radial-gradient": "-moz-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )",
      "-legacy-radial-gradient-arguments": "[<position> ,]? [[[<-legacy-radial-gradient-shape>||<-legacy-radial-gradient-size>]|[<length>|<percentage>]{2}] ,]? <color-stop-list>",
      "-legacy-radial-gradient-size": "closest-side|closest-corner|farthest-side|farthest-corner|contain|cover",
      "-legacy-radial-gradient-shape": "circle|ellipse",
      "-non-standard-font": "-apple-system-body|-apple-system-headline|-apple-system-subheadline|-apple-system-caption1|-apple-system-caption2|-apple-system-footnote|-apple-system-short-body|-apple-system-short-headline|-apple-system-short-subheadline|-apple-system-short-caption1|-apple-system-short-footnote|-apple-system-tall-body",
      "-non-standard-color": "-moz-ButtonDefault|-moz-ButtonHoverFace|-moz-ButtonHoverText|-moz-CellHighlight|-moz-CellHighlightText|-moz-Combobox|-moz-ComboboxText|-moz-Dialog|-moz-DialogText|-moz-dragtargetzone|-moz-EvenTreeRow|-moz-Field|-moz-FieldText|-moz-html-CellHighlight|-moz-html-CellHighlightText|-moz-mac-accentdarkestshadow|-moz-mac-accentdarkshadow|-moz-mac-accentface|-moz-mac-accentlightesthighlight|-moz-mac-accentlightshadow|-moz-mac-accentregularhighlight|-moz-mac-accentregularshadow|-moz-mac-chrome-active|-moz-mac-chrome-inactive|-moz-mac-focusring|-moz-mac-menuselect|-moz-mac-menushadow|-moz-mac-menutextselect|-moz-MenuHover|-moz-MenuHoverText|-moz-MenuBarText|-moz-MenuBarHoverText|-moz-nativehyperlinktext|-moz-OddTreeRow|-moz-win-communicationstext|-moz-win-mediatext|-moz-activehyperlinktext|-moz-default-background-color|-moz-default-color|-moz-hyperlinktext|-moz-visitedhyperlinktext|-webkit-activelink|-webkit-focus-ring-color|-webkit-link|-webkit-text",
      "-non-standard-image-rendering": "optimize-contrast|-moz-crisp-edges|-o-crisp-edges|-webkit-optimize-contrast",
      "-non-standard-overflow": "-moz-scrollbars-none|-moz-scrollbars-horizontal|-moz-scrollbars-vertical|-moz-hidden-unscrollable",
      "-non-standard-width": "fill-available|min-intrinsic|intrinsic|-moz-available|-moz-fit-content|-moz-min-content|-moz-max-content|-webkit-min-content|-webkit-max-content",
      "-webkit-gradient()": "-webkit-gradient( <-webkit-gradient-type> , <-webkit-gradient-point> [, <-webkit-gradient-point>|, <-webkit-gradient-radius> , <-webkit-gradient-point>] [, <-webkit-gradient-radius>]? [, <-webkit-gradient-color-stop>]* )",
      "-webkit-gradient-color-stop": "from( <color> )|color-stop( [<number-zero-one>|<percentage>] , <color> )|to( <color> )",
      "-webkit-gradient-point": "[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]",
      "-webkit-gradient-radius": "<length>|<percentage>",
      "-webkit-gradient-type": "linear|radial",
      "-webkit-mask-box-repeat": "repeat|stretch|round",
      "-webkit-mask-clip-style": "border|border-box|padding|padding-box|content|content-box|text",
      "-ms-filter-function-list": "<-ms-filter-function>+",
      "-ms-filter-function": "<-ms-filter-function-progid>|<-ms-filter-function-legacy>",
      "-ms-filter-function-progid": "'progid:' [<ident-token> '.']* [<ident-token>|<function-token> <any-value>? )]",
      "-ms-filter-function-legacy": "<ident-token>|<function-token> <any-value>? )",
      "-ms-filter": "<string>",
      "age": "child|young|old",
      "attr-name": "<wq-name>",
      "attr-fallback": "<any-value>",
      "bg-clip": "<box>|border|text",
      "bottom": "<length>|auto",
      "generic-voice": "[<age>? <gender> <integer>?]",
      "gender": "male|female|neutral",
      "left": "<length>|auto",
      "mask-image": "<mask-reference>#",
      "paint": "none|<color>|<url> [none|<color>]?|context-fill|context-stroke",
      "right": "<length>|auto",
      "scroll-timeline-axis": "block|inline|vertical|horizontal",
      "scroll-timeline-name": "none|<custom-ident>",
      "single-animation-composition": "replace|add|accumulate",
      "svg-length": "<percentage>|<length>|<number>",
      "svg-writing-mode": "lr-tb|rl-tb|tb-rl|lr|rl|tb",
      "top": "<length>|auto",
      "x": "<number>",
      "y": "<number>",
      "declaration": "<ident-token> : <declaration-value>? ['!' important]?",
      "declaration-list": "[<declaration>? ';']* <declaration>?",
      "url": "url( <string> <url-modifier>* )|<url-token>",
      "url-modifier": "<ident>|<function-token> <any-value> )",
      "number-zero-one": "<number [0,1]>",
      "number-one-or-greater": "<number [1,\u221E]>",
      "-non-standard-display": "-ms-inline-flexbox|-ms-grid|-ms-inline-grid|-webkit-flex|-webkit-inline-flex|-webkit-box|-webkit-inline-box|-moz-inline-stack|-moz-box|-moz-inline-box"
    },
    "properties": {
      "--*": "<declaration-value>",
      "-ms-accelerator": "false|true",
      "-ms-block-progression": "tb|rl|bt|lr",
      "-ms-content-zoom-chaining": "none|chained",
      "-ms-content-zooming": "none|zoom",
      "-ms-content-zoom-limit": "<'-ms-content-zoom-limit-min'> <'-ms-content-zoom-limit-max'>",
      "-ms-content-zoom-limit-max": "<percentage>",
      "-ms-content-zoom-limit-min": "<percentage>",
      "-ms-content-zoom-snap": "<'-ms-content-zoom-snap-type'>||<'-ms-content-zoom-snap-points'>",
      "-ms-content-zoom-snap-points": "snapInterval( <percentage> , <percentage> )|snapList( <percentage># )",
      "-ms-content-zoom-snap-type": "none|proximity|mandatory",
      "-ms-filter": "<string>",
      "-ms-flow-from": "[none|<custom-ident>]#",
      "-ms-flow-into": "[none|<custom-ident>]#",
      "-ms-grid-columns": "none|<track-list>|<auto-track-list>",
      "-ms-grid-rows": "none|<track-list>|<auto-track-list>",
      "-ms-high-contrast-adjust": "auto|none",
      "-ms-hyphenate-limit-chars": "auto|<integer>{1,3}",
      "-ms-hyphenate-limit-lines": "no-limit|<integer>",
      "-ms-hyphenate-limit-zone": "<percentage>|<length>",
      "-ms-ime-align": "auto|after",
      "-ms-overflow-style": "auto|none|scrollbar|-ms-autohiding-scrollbar",
      "-ms-scrollbar-3dlight-color": "<color>",
      "-ms-scrollbar-arrow-color": "<color>",
      "-ms-scrollbar-base-color": "<color>",
      "-ms-scrollbar-darkshadow-color": "<color>",
      "-ms-scrollbar-face-color": "<color>",
      "-ms-scrollbar-highlight-color": "<color>",
      "-ms-scrollbar-shadow-color": "<color>",
      "-ms-scrollbar-track-color": "<color>",
      "-ms-scroll-chaining": "chained|none",
      "-ms-scroll-limit": "<'-ms-scroll-limit-x-min'> <'-ms-scroll-limit-y-min'> <'-ms-scroll-limit-x-max'> <'-ms-scroll-limit-y-max'>",
      "-ms-scroll-limit-x-max": "auto|<length>",
      "-ms-scroll-limit-x-min": "<length>",
      "-ms-scroll-limit-y-max": "auto|<length>",
      "-ms-scroll-limit-y-min": "<length>",
      "-ms-scroll-rails": "none|railed",
      "-ms-scroll-snap-points-x": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
      "-ms-scroll-snap-points-y": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
      "-ms-scroll-snap-type": "none|proximity|mandatory",
      "-ms-scroll-snap-x": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-x'>",
      "-ms-scroll-snap-y": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-y'>",
      "-ms-scroll-translation": "none|vertical-to-horizontal",
      "-ms-text-autospace": "none|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space",
      "-ms-touch-select": "grippers|none",
      "-ms-user-select": "none|element|text",
      "-ms-wrap-flow": "auto|both|start|end|maximum|clear",
      "-ms-wrap-margin": "<length>",
      "-ms-wrap-through": "wrap|none",
      "-moz-appearance": "none|button|button-arrow-down|button-arrow-next|button-arrow-previous|button-arrow-up|button-bevel|button-focus|caret|checkbox|checkbox-container|checkbox-label|checkmenuitem|dualbutton|groupbox|listbox|listitem|menuarrow|menubar|menucheckbox|menuimage|menuitem|menuitemtext|menulist|menulist-button|menulist-text|menulist-textfield|menupopup|menuradio|menuseparator|meterbar|meterchunk|progressbar|progressbar-vertical|progresschunk|progresschunk-vertical|radio|radio-container|radio-label|radiomenuitem|range|range-thumb|resizer|resizerpanel|scale-horizontal|scalethumbend|scalethumb-horizontal|scalethumbstart|scalethumbtick|scalethumb-vertical|scale-vertical|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|separator|sheet|spinner|spinner-downbutton|spinner-textfield|spinner-upbutton|splitter|statusbar|statusbarpanel|tab|tabpanel|tabpanels|tab-scroll-arrow-back|tab-scroll-arrow-forward|textfield|textfield-multiline|toolbar|toolbarbutton|toolbarbutton-dropdown|toolbargripper|toolbox|tooltip|treeheader|treeheadercell|treeheadersortarrow|treeitem|treeline|treetwisty|treetwistyopen|treeview|-moz-mac-unified-toolbar|-moz-win-borderless-glass|-moz-win-browsertabbar-toolbox|-moz-win-communicationstext|-moz-win-communications-toolbox|-moz-win-exclude-glass|-moz-win-glass|-moz-win-mediatext|-moz-win-media-toolbox|-moz-window-button-box|-moz-window-button-box-maximized|-moz-window-button-close|-moz-window-button-maximize|-moz-window-button-minimize|-moz-window-button-restore|-moz-window-frame-bottom|-moz-window-frame-left|-moz-window-frame-right|-moz-window-titlebar|-moz-window-titlebar-maximized",
      "-moz-binding": "<url>|none",
      "-moz-border-bottom-colors": "<color>+|none",
      "-moz-border-left-colors": "<color>+|none",
      "-moz-border-right-colors": "<color>+|none",
      "-moz-border-top-colors": "<color>+|none",
      "-moz-context-properties": "none|[fill|fill-opacity|stroke|stroke-opacity]#",
      "-moz-float-edge": "border-box|content-box|margin-box|padding-box",
      "-moz-force-broken-image-icon": "0|1",
      "-moz-image-region": "<shape>|auto",
      "-moz-orient": "inline|block|horizontal|vertical",
      "-moz-outline-radius": "<outline-radius>{1,4} [/ <outline-radius>{1,4}]?",
      "-moz-outline-radius-bottomleft": "<outline-radius>",
      "-moz-outline-radius-bottomright": "<outline-radius>",
      "-moz-outline-radius-topleft": "<outline-radius>",
      "-moz-outline-radius-topright": "<outline-radius>",
      "-moz-stack-sizing": "ignore|stretch-to-fit",
      "-moz-text-blink": "none|blink",
      "-moz-user-focus": "ignore|normal|select-after|select-before|select-menu|select-same|select-all|none",
      "-moz-user-input": "auto|none|enabled|disabled",
      "-moz-user-modify": "read-only|read-write|write-only",
      "-moz-window-dragging": "drag|no-drag",
      "-moz-window-shadow": "default|menu|tooltip|sheet|none",
      "-webkit-appearance": "none|button|button-bevel|caps-lock-indicator|caret|checkbox|default-button|inner-spin-button|listbox|listitem|media-controls-background|media-controls-fullscreen-background|media-current-time-display|media-enter-fullscreen-button|media-exit-fullscreen-button|media-fullscreen-button|media-mute-button|media-overlay-play-button|media-play-button|media-seek-back-button|media-seek-forward-button|media-slider|media-sliderthumb|media-time-remaining-display|media-toggle-closed-captions-button|media-volume-slider|media-volume-slider-container|media-volume-sliderthumb|menulist|menulist-button|menulist-text|menulist-textfield|meter|progress-bar|progress-bar-value|push-button|radio|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbargripper-horizontal|scrollbargripper-vertical|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|searchfield-cancel-button|searchfield-decoration|searchfield-results-button|searchfield-results-decoration|slider-horizontal|slider-vertical|sliderthumb-horizontal|sliderthumb-vertical|square-button|textarea|textfield|-apple-pay-button",
      "-webkit-border-before": "<'border-width'>||<'border-style'>||<color>",
      "-webkit-border-before-color": "<color>",
      "-webkit-border-before-style": "<'border-style'>",
      "-webkit-border-before-width": "<'border-width'>",
      "-webkit-box-reflect": "[above|below|right|left]? <length>? <image>?",
      "-webkit-line-clamp": "none|<integer>",
      "-webkit-mask": "[<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||[<box>|border|padding|content|text]||[<box>|border|padding|content]]#",
      "-webkit-mask-attachment": "<attachment>#",
      "-webkit-mask-clip": "[<box>|border|padding|content|text]#",
      "-webkit-mask-composite": "<composite-style>#",
      "-webkit-mask-image": "<mask-reference>#",
      "-webkit-mask-origin": "[<box>|border|padding|content]#",
      "-webkit-mask-position": "<position>#",
      "-webkit-mask-position-x": "[<length-percentage>|left|center|right]#",
      "-webkit-mask-position-y": "[<length-percentage>|top|center|bottom]#",
      "-webkit-mask-repeat": "<repeat-style>#",
      "-webkit-mask-repeat-x": "repeat|no-repeat|space|round",
      "-webkit-mask-repeat-y": "repeat|no-repeat|space|round",
      "-webkit-mask-size": "<bg-size>#",
      "-webkit-overflow-scrolling": "auto|touch",
      "-webkit-tap-highlight-color": "<color>",
      "-webkit-text-fill-color": "<color>",
      "-webkit-text-stroke": "<length>||<color>",
      "-webkit-text-stroke-color": "<color>",
      "-webkit-text-stroke-width": "<length>",
      "-webkit-touch-callout": "default|none",
      "-webkit-user-modify": "read-only|read-write|read-write-plaintext-only",
      "accent-color": "auto|<color>",
      "align-content": "normal|<baseline-position>|<content-distribution>|<overflow-position>? <content-position>",
      "align-items": "normal|stretch|<baseline-position>|[<overflow-position>? <self-position>]",
      "align-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? <self-position>",
      "align-tracks": "[normal|<baseline-position>|<content-distribution>|<overflow-position>? <content-position>]#",
      "all": "initial|inherit|unset|revert|revert-layer",
      "animation": "<single-animation>#",
      "animation-composition": "<single-animation-composition>#",
      "animation-delay": "<time>#",
      "animation-direction": "<single-animation-direction>#",
      "animation-duration": "<time>#",
      "animation-fill-mode": "<single-animation-fill-mode>#",
      "animation-iteration-count": "<single-animation-iteration-count>#",
      "animation-name": "[none|<keyframes-name>]#",
      "animation-play-state": "<single-animation-play-state>#",
      "animation-timing-function": "<easing-function>#",
      "animation-timeline": "<single-animation-timeline>#",
      "appearance": "none|auto|textfield|menulist-button|<compat-auto>",
      "aspect-ratio": "auto|<ratio>",
      "azimuth": "<angle>|[[left-side|far-left|left|center-left|center|center-right|right|far-right|right-side]||behind]|leftwards|rightwards",
      "backdrop-filter": "none|<filter-function-list>",
      "backface-visibility": "visible|hidden",
      "background": "[<bg-layer> ,]* <final-bg-layer>",
      "background-attachment": "<attachment>#",
      "background-blend-mode": "<blend-mode>#",
      "background-clip": "<bg-clip>#",
      "background-color": "<color>",
      "background-image": "<bg-image>#",
      "background-origin": "<box>#",
      "background-position": "<bg-position>#",
      "background-position-x": "[center|[[left|right|x-start|x-end]? <length-percentage>?]!]#",
      "background-position-y": "[center|[[top|bottom|y-start|y-end]? <length-percentage>?]!]#",
      "background-repeat": "<repeat-style>#",
      "background-size": "<bg-size>#",
      "block-overflow": "clip|ellipsis|<string>",
      "block-size": "<'width'>",
      "border": "<line-width>||<line-style>||<color>",
      "border-block": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-block-color": "<'border-top-color'>{1,2}",
      "border-block-style": "<'border-top-style'>",
      "border-block-width": "<'border-top-width'>",
      "border-block-end": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-block-end-color": "<'border-top-color'>",
      "border-block-end-style": "<'border-top-style'>",
      "border-block-end-width": "<'border-top-width'>",
      "border-block-start": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-block-start-color": "<'border-top-color'>",
      "border-block-start-style": "<'border-top-style'>",
      "border-block-start-width": "<'border-top-width'>",
      "border-bottom": "<line-width>||<line-style>||<color>",
      "border-bottom-color": "<'border-top-color'>",
      "border-bottom-left-radius": "<length-percentage>{1,2}",
      "border-bottom-right-radius": "<length-percentage>{1,2}",
      "border-bottom-style": "<line-style>",
      "border-bottom-width": "<line-width>",
      "border-collapse": "collapse|separate",
      "border-color": "<color>{1,4}",
      "border-end-end-radius": "<length-percentage>{1,2}",
      "border-end-start-radius": "<length-percentage>{1,2}",
      "border-image": "<'border-image-source'>||<'border-image-slice'> [/ <'border-image-width'>|/ <'border-image-width'>? / <'border-image-outset'>]?||<'border-image-repeat'>",
      "border-image-outset": "[<length>|<number>]{1,4}",
      "border-image-repeat": "[stretch|repeat|round|space]{1,2}",
      "border-image-slice": "<number-percentage>{1,4}&&fill?",
      "border-image-source": "none|<image>",
      "border-image-width": "[<length-percentage>|<number>|auto]{1,4}",
      "border-inline": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-inline-end": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-inline-color": "<'border-top-color'>{1,2}",
      "border-inline-style": "<'border-top-style'>",
      "border-inline-width": "<'border-top-width'>",
      "border-inline-end-color": "<'border-top-color'>",
      "border-inline-end-style": "<'border-top-style'>",
      "border-inline-end-width": "<'border-top-width'>",
      "border-inline-start": "<'border-top-width'>||<'border-top-style'>||<color>",
      "border-inline-start-color": "<'border-top-color'>",
      "border-inline-start-style": "<'border-top-style'>",
      "border-inline-start-width": "<'border-top-width'>",
      "border-left": "<line-width>||<line-style>||<color>",
      "border-left-color": "<color>",
      "border-left-style": "<line-style>",
      "border-left-width": "<line-width>",
      "border-radius": "<length-percentage>{1,4} [/ <length-percentage>{1,4}]?",
      "border-right": "<line-width>||<line-style>||<color>",
      "border-right-color": "<color>",
      "border-right-style": "<line-style>",
      "border-right-width": "<line-width>",
      "border-spacing": "<length> <length>?",
      "border-start-end-radius": "<length-percentage>{1,2}",
      "border-start-start-radius": "<length-percentage>{1,2}",
      "border-style": "<line-style>{1,4}",
      "border-top": "<line-width>||<line-style>||<color>",
      "border-top-color": "<color>",
      "border-top-left-radius": "<length-percentage>{1,2}",
      "border-top-right-radius": "<length-percentage>{1,2}",
      "border-top-style": "<line-style>",
      "border-top-width": "<line-width>",
      "border-width": "<line-width>{1,4}",
      "bottom": "<length>|<percentage>|auto",
      "box-align": "start|center|end|baseline|stretch",
      "box-decoration-break": "slice|clone",
      "box-direction": "normal|reverse|inherit",
      "box-flex": "<number>",
      "box-flex-group": "<integer>",
      "box-lines": "single|multiple",
      "box-ordinal-group": "<integer>",
      "box-orient": "horizontal|vertical|inline-axis|block-axis|inherit",
      "box-pack": "start|center|end|justify",
      "box-shadow": "none|<shadow>#",
      "box-sizing": "content-box|border-box",
      "break-after": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
      "break-before": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
      "break-inside": "auto|avoid|avoid-page|avoid-column|avoid-region",
      "caption-side": "top|bottom|block-start|block-end|inline-start|inline-end",
      "caret": "<'caret-color'>||<'caret-shape'>",
      "caret-color": "auto|<color>",
      "caret-shape": "auto|bar|block|underscore",
      "clear": "none|left|right|both|inline-start|inline-end",
      "clip": "<shape>|auto",
      "clip-path": "<clip-source>|[<basic-shape>||<geometry-box>]|none",
      "color": "<color>",
      "print-color-adjust": "economy|exact",
      "color-scheme": "normal|[light|dark|<custom-ident>]+&&only?",
      "column-count": "<integer>|auto",
      "column-fill": "auto|balance|balance-all",
      "column-gap": "normal|<length-percentage>",
      "column-rule": "<'column-rule-width'>||<'column-rule-style'>||<'column-rule-color'>",
      "column-rule-color": "<color>",
      "column-rule-style": "<'border-style'>",
      "column-rule-width": "<'border-width'>",
      "column-span": "none|all",
      "column-width": "<length>|auto",
      "columns": "<'column-width'>||<'column-count'>",
      "contain": "none|strict|content|[[size||inline-size]||layout||style||paint]",
      "contain-intrinsic-size": "[none|<length>|auto <length>]{1,2}",
      "contain-intrinsic-block-size": "none|<length>|auto <length>",
      "contain-intrinsic-height": "none|<length>|auto <length>",
      "contain-intrinsic-inline-size": "none|<length>|auto <length>",
      "contain-intrinsic-width": "none|<length>|auto <length>",
      "content": "normal|none|[<content-replacement>|<content-list>] [/ [<string>|<counter>]+]?",
      "content-visibility": "visible|auto|hidden",
      "counter-increment": "[<counter-name> <integer>?]+|none",
      "counter-reset": "[<counter-name> <integer>?|<reversed-counter-name> <integer>?]+|none",
      "counter-set": "[<counter-name> <integer>?]+|none",
      "cursor": "[[<url> [<x> <y>]? ,]* [auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out|grab|grabbing|hand|-webkit-grab|-webkit-grabbing|-webkit-zoom-in|-webkit-zoom-out|-moz-grab|-moz-grabbing|-moz-zoom-in|-moz-zoom-out]]",
      "direction": "ltr|rtl",
      "display": "[<display-outside>||<display-inside>]|<display-listitem>|<display-internal>|<display-box>|<display-legacy>|<-non-standard-display>",
      "empty-cells": "show|hide",
      "filter": "none|<filter-function-list>|<-ms-filter-function-list>",
      "flex": "none|[<'flex-grow'> <'flex-shrink'>?||<'flex-basis'>]",
      "flex-basis": "content|<'width'>",
      "flex-direction": "row|row-reverse|column|column-reverse",
      "flex-flow": "<'flex-direction'>||<'flex-wrap'>",
      "flex-grow": "<number>",
      "flex-shrink": "<number>",
      "flex-wrap": "nowrap|wrap|wrap-reverse",
      "float": "left|right|none|inline-start|inline-end",
      "font": "[[<'font-style'>||<font-variant-css21>||<'font-weight'>||<'font-stretch'>]? <'font-size'> [/ <'line-height'>]? <'font-family'>]|caption|icon|menu|message-box|small-caption|status-bar",
      "font-family": "[<family-name>|<generic-family>]#",
      "font-feature-settings": "normal|<feature-tag-value>#",
      "font-kerning": "auto|normal|none",
      "font-language-override": "normal|<string>",
      "font-optical-sizing": "auto|none",
      "font-variation-settings": "normal|[<string> <number>]#",
      "font-size": "<absolute-size>|<relative-size>|<length-percentage>",
      "font-size-adjust": "none|[ex-height|cap-height|ch-width|ic-width|ic-height]? [from-font|<number>]",
      "font-smooth": "auto|never|always|<absolute-size>|<length>",
      "font-stretch": "<font-stretch-absolute>",
      "font-style": "normal|italic|oblique <angle>?",
      "font-synthesis": "none|[weight||style||small-caps]",
      "font-variant": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby]",
      "font-variant-alternates": "normal|[stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )]",
      "font-variant-caps": "normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps",
      "font-variant-east-asian": "normal|[<east-asian-variant-values>||<east-asian-width-values>||ruby]",
      "font-variant-ligatures": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>]",
      "font-variant-numeric": "normal|[<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero]",
      "font-variant-position": "normal|sub|super",
      "font-weight": "<font-weight-absolute>|bolder|lighter",
      "forced-color-adjust": "auto|none",
      "gap": "<'row-gap'> <'column-gap'>?",
      "grid": "<'grid-template'>|<'grid-template-rows'> / [auto-flow&&dense?] <'grid-auto-columns'>?|[auto-flow&&dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
      "grid-area": "<grid-line> [/ <grid-line>]{0,3}",
      "grid-auto-columns": "<track-size>+",
      "grid-auto-flow": "[row|column]||dense",
      "grid-auto-rows": "<track-size>+",
      "grid-column": "<grid-line> [/ <grid-line>]?",
      "grid-column-end": "<grid-line>",
      "grid-column-gap": "<length-percentage>",
      "grid-column-start": "<grid-line>",
      "grid-gap": "<'grid-row-gap'> <'grid-column-gap'>?",
      "grid-row": "<grid-line> [/ <grid-line>]?",
      "grid-row-end": "<grid-line>",
      "grid-row-gap": "<length-percentage>",
      "grid-row-start": "<grid-line>",
      "grid-template": "none|[<'grid-template-rows'> / <'grid-template-columns'>]|[<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
      "grid-template-areas": "none|<string>+",
      "grid-template-columns": "none|<track-list>|<auto-track-list>|subgrid <line-name-list>?",
      "grid-template-rows": "none|<track-list>|<auto-track-list>|subgrid <line-name-list>?",
      "hanging-punctuation": "none|[first||[force-end|allow-end]||last]",
      "height": "auto|<length>|<percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )",
      "hyphenate-character": "auto|<string>",
      "hyphens": "none|manual|auto",
      "image-orientation": "from-image|<angle>|[<angle>? flip]",
      "image-rendering": "auto|crisp-edges|pixelated|optimizeSpeed|optimizeQuality|<-non-standard-image-rendering>",
      "image-resolution": "[from-image||<resolution>]&&snap?",
      "ime-mode": "auto|normal|active|inactive|disabled",
      "initial-letter": "normal|[<number> <integer>?]",
      "initial-letter-align": "[auto|alphabetic|hanging|ideographic]",
      "inline-size": "<'width'>",
      "input-security": "auto|none",
      "inset": "<'top'>{1,4}",
      "inset-block": "<'top'>{1,2}",
      "inset-block-end": "<'top'>",
      "inset-block-start": "<'top'>",
      "inset-inline": "<'top'>{1,2}",
      "inset-inline-end": "<'top'>",
      "inset-inline-start": "<'top'>",
      "isolation": "auto|isolate",
      "justify-content": "normal|<content-distribution>|<overflow-position>? [<content-position>|left|right]",
      "justify-items": "normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]|legacy|legacy&&[left|right|center]",
      "justify-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]",
      "justify-tracks": "[normal|<content-distribution>|<overflow-position>? [<content-position>|left|right]]#",
      "left": "<length>|<percentage>|auto",
      "letter-spacing": "normal|<length-percentage>",
      "line-break": "auto|loose|normal|strict|anywhere",
      "line-clamp": "none|<integer>",
      "line-height": "normal|<number>|<length>|<percentage>",
      "line-height-step": "<length>",
      "list-style": "<'list-style-type'>||<'list-style-position'>||<'list-style-image'>",
      "list-style-image": "<image>|none",
      "list-style-position": "inside|outside",
      "list-style-type": "<counter-style>|<string>|none",
      "margin": "[<length>|<percentage>|auto]{1,4}",
      "margin-block": "<'margin-left'>{1,2}",
      "margin-block-end": "<'margin-left'>",
      "margin-block-start": "<'margin-left'>",
      "margin-bottom": "<length>|<percentage>|auto",
      "margin-inline": "<'margin-left'>{1,2}",
      "margin-inline-end": "<'margin-left'>",
      "margin-inline-start": "<'margin-left'>",
      "margin-left": "<length>|<percentage>|auto",
      "margin-right": "<length>|<percentage>|auto",
      "margin-top": "<length>|<percentage>|auto",
      "margin-trim": "none|in-flow|all",
      "mask": "<mask-layer>#",
      "mask-border": "<'mask-border-source'>||<'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]?||<'mask-border-repeat'>||<'mask-border-mode'>",
      "mask-border-mode": "luminance|alpha",
      "mask-border-outset": "[<length>|<number>]{1,4}",
      "mask-border-repeat": "[stretch|repeat|round|space]{1,2}",
      "mask-border-slice": "<number-percentage>{1,4} fill?",
      "mask-border-source": "none|<image>",
      "mask-border-width": "[<length-percentage>|<number>|auto]{1,4}",
      "mask-clip": "[<geometry-box>|no-clip]#",
      "mask-composite": "<compositing-operator>#",
      "mask-image": "<mask-reference>#",
      "mask-mode": "<masking-mode>#",
      "mask-origin": "<geometry-box>#",
      "mask-position": "<position>#",
      "mask-repeat": "<repeat-style>#",
      "mask-size": "<bg-size>#",
      "mask-type": "luminance|alpha",
      "masonry-auto-flow": "[pack|next]||[definite-first|ordered]",
      "math-depth": "auto-add|add( <integer> )|<integer>",
      "math-shift": "normal|compact",
      "math-style": "normal|compact",
      "max-block-size": "<'max-width'>",
      "max-height": "none|<length-percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )",
      "max-inline-size": "<'max-width'>",
      "max-lines": "none|<integer>",
      "max-width": "none|<length-percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )|<-non-standard-width>",
      "min-block-size": "<'min-width'>",
      "min-height": "auto|<length>|<percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )",
      "min-inline-size": "<'min-width'>",
      "min-width": "auto|<length>|<percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )|<-non-standard-width>",
      "mix-blend-mode": "<blend-mode>|plus-lighter",
      "object-fit": "fill|contain|cover|none|scale-down",
      "object-position": "<position>",
      "offset": "[<'offset-position'>? [<'offset-path'> [<'offset-distance'>||<'offset-rotate'>]?]?]! [/ <'offset-anchor'>]?",
      "offset-anchor": "auto|<position>",
      "offset-distance": "<length-percentage>",
      "offset-path": "none|ray( [<angle>&&<size>&&contain?] )|<path()>|<url>|[<basic-shape>||<geometry-box>]",
      "offset-position": "auto|<position>",
      "offset-rotate": "[auto|reverse]||<angle>",
      "opacity": "<alpha-value>",
      "order": "<integer>",
      "orphans": "<integer>",
      "outline": "[<'outline-color'>||<'outline-style'>||<'outline-width'>]",
      "outline-color": "<color>|invert",
      "outline-offset": "<length>",
      "outline-style": "auto|<'border-style'>",
      "outline-width": "<line-width>",
      "overflow": "[visible|hidden|clip|scroll|auto]{1,2}|<-non-standard-overflow>",
      "overflow-anchor": "auto|none",
      "overflow-block": "visible|hidden|clip|scroll|auto",
      "overflow-clip-box": "padding-box|content-box",
      "overflow-clip-margin": "<visual-box>||<length [0,\u221E]>",
      "overflow-inline": "visible|hidden|clip|scroll|auto",
      "overflow-wrap": "normal|break-word|anywhere",
      "overflow-x": "visible|hidden|clip|scroll|auto",
      "overflow-y": "visible|hidden|clip|scroll|auto",
      "overscroll-behavior": "[contain|none|auto]{1,2}",
      "overscroll-behavior-block": "contain|none|auto",
      "overscroll-behavior-inline": "contain|none|auto",
      "overscroll-behavior-x": "contain|none|auto",
      "overscroll-behavior-y": "contain|none|auto",
      "padding": "[<length>|<percentage>]{1,4}",
      "padding-block": "<'padding-left'>{1,2}",
      "padding-block-end": "<'padding-left'>",
      "padding-block-start": "<'padding-left'>",
      "padding-bottom": "<length>|<percentage>",
      "padding-inline": "<'padding-left'>{1,2}",
      "padding-inline-end": "<'padding-left'>",
      "padding-inline-start": "<'padding-left'>",
      "padding-left": "<length>|<percentage>",
      "padding-right": "<length>|<percentage>",
      "padding-top": "<length>|<percentage>",
      "page-break-after": "auto|always|avoid|left|right|recto|verso",
      "page-break-before": "auto|always|avoid|left|right|recto|verso",
      "page-break-inside": "auto|avoid",
      "paint-order": "normal|[fill||stroke||markers]",
      "perspective": "none|<length>",
      "perspective-origin": "<position>",
      "place-content": "<'align-content'> <'justify-content'>?",
      "place-items": "<'align-items'> <'justify-items'>?",
      "place-self": "<'align-self'> <'justify-self'>?",
      "pointer-events": "auto|none|visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|inherit",
      "position": "static|relative|absolute|sticky|fixed|-webkit-sticky",
      "quotes": "none|auto|[<string> <string>]+",
      "resize": "none|both|horizontal|vertical|block|inline",
      "right": "<length>|<percentage>|auto",
      "rotate": "none|<angle>|[x|y|z|<number>{3}]&&<angle>",
      "row-gap": "normal|<length-percentage>",
      "ruby-align": "start|center|space-between|space-around",
      "ruby-merge": "separate|collapse|auto",
      "ruby-position": "[alternate||[over|under]]|inter-character",
      "scale": "none|<number>{1,3}",
      "scrollbar-color": "auto|<color>{2}",
      "scrollbar-gutter": "auto|stable&&both-edges?",
      "scrollbar-width": "auto|thin|none",
      "scroll-behavior": "auto|smooth",
      "scroll-margin": "<length>{1,4}",
      "scroll-margin-block": "<length>{1,2}",
      "scroll-margin-block-start": "<length>",
      "scroll-margin-block-end": "<length>",
      "scroll-margin-bottom": "<length>",
      "scroll-margin-inline": "<length>{1,2}",
      "scroll-margin-inline-start": "<length>",
      "scroll-margin-inline-end": "<length>",
      "scroll-margin-left": "<length>",
      "scroll-margin-right": "<length>",
      "scroll-margin-top": "<length>",
      "scroll-padding": "[auto|<length-percentage>]{1,4}",
      "scroll-padding-block": "[auto|<length-percentage>]{1,2}",
      "scroll-padding-block-start": "auto|<length-percentage>",
      "scroll-padding-block-end": "auto|<length-percentage>",
      "scroll-padding-bottom": "auto|<length-percentage>",
      "scroll-padding-inline": "[auto|<length-percentage>]{1,2}",
      "scroll-padding-inline-start": "auto|<length-percentage>",
      "scroll-padding-inline-end": "auto|<length-percentage>",
      "scroll-padding-left": "auto|<length-percentage>",
      "scroll-padding-right": "auto|<length-percentage>",
      "scroll-padding-top": "auto|<length-percentage>",
      "scroll-snap-align": "[none|start|end|center]{1,2}",
      "scroll-snap-coordinate": "none|<position>#",
      "scroll-snap-destination": "<position>",
      "scroll-snap-points-x": "none|repeat( <length-percentage> )",
      "scroll-snap-points-y": "none|repeat( <length-percentage> )",
      "scroll-snap-stop": "normal|always",
      "scroll-snap-type": "none|[x|y|block|inline|both] [mandatory|proximity]?",
      "scroll-snap-type-x": "none|mandatory|proximity",
      "scroll-snap-type-y": "none|mandatory|proximity",
      "scroll-timeline": "<scroll-timeline-name>||<scroll-timeline-axis>",
      "scroll-timeline-axis": "block|inline|vertical|horizontal",
      "scroll-timeline-name": "none|<custom-ident>",
      "shape-image-threshold": "<alpha-value>",
      "shape-margin": "<length-percentage>",
      "shape-outside": "none|[<shape-box>||<basic-shape>]|<image>",
      "tab-size": "<integer>|<length>",
      "table-layout": "auto|fixed",
      "text-align": "start|end|left|right|center|justify|match-parent",
      "text-align-last": "auto|start|end|left|right|center|justify",
      "text-combine-upright": "none|all|[digits <integer>?]",
      "text-decoration": "<'text-decoration-line'>||<'text-decoration-style'>||<'text-decoration-color'>||<'text-decoration-thickness'>",
      "text-decoration-color": "<color>",
      "text-decoration-line": "none|[underline||overline||line-through||blink]|spelling-error|grammar-error",
      "text-decoration-skip": "none|[objects||[spaces|[leading-spaces||trailing-spaces]]||edges||box-decoration]",
      "text-decoration-skip-ink": "auto|all|none",
      "text-decoration-style": "solid|double|dotted|dashed|wavy",
      "text-decoration-thickness": "auto|from-font|<length>|<percentage>",
      "text-emphasis": "<'text-emphasis-style'>||<'text-emphasis-color'>",
      "text-emphasis-color": "<color>",
      "text-emphasis-position": "[over|under]&&[right|left]",
      "text-emphasis-style": "none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
      "text-indent": "<length-percentage>&&hanging?&&each-line?",
      "text-justify": "auto|inter-character|inter-word|none",
      "text-orientation": "mixed|upright|sideways",
      "text-overflow": "[clip|ellipsis|<string>]{1,2}",
      "text-rendering": "auto|optimizeSpeed|optimizeLegibility|geometricPrecision",
      "text-shadow": "none|<shadow-t>#",
      "text-size-adjust": "none|auto|<percentage>",
      "text-transform": "none|capitalize|uppercase|lowercase|full-width|full-size-kana",
      "text-underline-offset": "auto|<length>|<percentage>",
      "text-underline-position": "auto|from-font|[under||[left|right]]",
      "top": "<length>|<percentage>|auto",
      "touch-action": "auto|none|[[pan-x|pan-left|pan-right]||[pan-y|pan-up|pan-down]||pinch-zoom]|manipulation",
      "transform": "none|<transform-list>",
      "transform-box": "content-box|border-box|fill-box|stroke-box|view-box",
      "transform-origin": "[<length-percentage>|left|center|right|top|bottom]|[[<length-percentage>|left|center|right]&&[<length-percentage>|top|center|bottom]] <length>?",
      "transform-style": "flat|preserve-3d",
      "transition": "<single-transition>#",
      "transition-delay": "<time>#",
      "transition-duration": "<time>#",
      "transition-property": "none|<single-transition-property>#",
      "transition-timing-function": "<easing-function>#",
      "translate": "none|<length-percentage> [<length-percentage> <length>?]?",
      "unicode-bidi": "normal|embed|isolate|bidi-override|isolate-override|plaintext|-moz-isolate|-moz-isolate-override|-moz-plaintext|-webkit-isolate|-webkit-isolate-override|-webkit-plaintext",
      "user-select": "auto|text|none|contain|all",
      "vertical-align": "baseline|sub|super|text-top|text-bottom|middle|top|bottom|<percentage>|<length>",
      "visibility": "visible|hidden|collapse",
      "white-space": "normal|pre|nowrap|pre-wrap|pre-line|break-spaces",
      "widows": "<integer>",
      "width": "auto|<length>|<percentage>|min-content|max-content|fit-content|fit-content( <length-percentage> )|fill|stretch|intrinsic|-moz-max-content|-webkit-max-content|-moz-fit-content|-webkit-fit-content",
      "will-change": "auto|<animateable-feature>#",
      "word-break": "normal|break-all|keep-all|break-word",
      "word-spacing": "normal|<length>",
      "word-wrap": "normal|break-word",
      "writing-mode": "horizontal-tb|vertical-rl|vertical-lr|sideways-rl|sideways-lr|<svg-writing-mode>",
      "z-index": "auto|<integer>",
      "zoom": "normal|reset|<number>|<percentage>",
      "-moz-background-clip": "padding|border",
      "-moz-border-radius-bottomleft": "<'border-bottom-left-radius'>",
      "-moz-border-radius-bottomright": "<'border-bottom-right-radius'>",
      "-moz-border-radius-topleft": "<'border-top-left-radius'>",
      "-moz-border-radius-topright": "<'border-bottom-right-radius'>",
      "-moz-control-character-visibility": "visible|hidden",
      "-moz-osx-font-smoothing": "auto|grayscale",
      "-moz-user-select": "none|text|all|-moz-none",
      "-ms-flex-align": "start|end|center|baseline|stretch",
      "-ms-flex-item-align": "auto|start|end|center|baseline|stretch",
      "-ms-flex-line-pack": "start|end|center|justify|distribute|stretch",
      "-ms-flex-negative": "<'flex-shrink'>",
      "-ms-flex-pack": "start|end|center|justify|distribute",
      "-ms-flex-order": "<integer>",
      "-ms-flex-positive": "<'flex-grow'>",
      "-ms-flex-preferred-size": "<'flex-basis'>",
      "-ms-interpolation-mode": "nearest-neighbor|bicubic",
      "-ms-grid-column-align": "start|end|center|stretch",
      "-ms-grid-row-align": "start|end|center|stretch",
      "-ms-hyphenate-limit-last": "none|always|column|page|spread",
      "-webkit-background-clip": "[<box>|border|padding|content|text]#",
      "-webkit-column-break-after": "always|auto|avoid",
      "-webkit-column-break-before": "always|auto|avoid",
      "-webkit-column-break-inside": "always|auto|avoid",
      "-webkit-font-smoothing": "auto|none|antialiased|subpixel-antialiased",
      "-webkit-mask-box-image": "[<url>|<gradient>|none] [<length-percentage>{4} <-webkit-mask-box-repeat>{2}]?",
      "-webkit-print-color-adjust": "economy|exact",
      "-webkit-text-security": "none|circle|disc|square",
      "-webkit-user-drag": "none|element|auto",
      "-webkit-user-select": "auto|none|text|all",
      "alignment-baseline": "auto|baseline|before-edge|text-before-edge|middle|central|after-edge|text-after-edge|ideographic|alphabetic|hanging|mathematical",
      "baseline-shift": "baseline|sub|super|<svg-length>",
      "behavior": "<url>+",
      "clip-rule": "nonzero|evenodd",
      "cue": "<'cue-before'> <'cue-after'>?",
      "cue-after": "<url> <decibel>?|none",
      "cue-before": "<url> <decibel>?|none",
      "dominant-baseline": "auto|use-script|no-change|reset-size|ideographic|alphabetic|hanging|mathematical|central|middle|text-after-edge|text-before-edge",
      "fill": "<paint>",
      "fill-opacity": "<number-zero-one>",
      "fill-rule": "nonzero|evenodd",
      "glyph-orientation-horizontal": "<angle>",
      "glyph-orientation-vertical": "<angle>",
      "kerning": "auto|<svg-length>",
      "marker": "none|<url>",
      "marker-end": "none|<url>",
      "marker-mid": "none|<url>",
      "marker-start": "none|<url>",
      "pause": "<'pause-before'> <'pause-after'>?",
      "pause-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
      "pause-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
      "rest": "<'rest-before'> <'rest-after'>?",
      "rest-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
      "rest-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
      "shape-rendering": "auto|optimizeSpeed|crispEdges|geometricPrecision",
      "src": "[<url> [format( <string># )]?|local( <family-name> )]#",
      "speak": "auto|none|normal",
      "speak-as": "normal|spell-out||digits||[literal-punctuation|no-punctuation]",
      "stroke": "<paint>",
      "stroke-dasharray": "none|[<svg-length>+]#",
      "stroke-dashoffset": "<svg-length>",
      "stroke-linecap": "butt|round|square",
      "stroke-linejoin": "miter|round|bevel",
      "stroke-miterlimit": "<number-one-or-greater>",
      "stroke-opacity": "<number-zero-one>",
      "stroke-width": "<svg-length>",
      "text-anchor": "start|middle|end",
      "unicode-range": "<urange>#",
      "voice-balance": "<number>|left|center|right|leftwards|rightwards",
      "voice-duration": "auto|<time>",
      "voice-family": "[[<family-name>|<generic-voice>] ,]* [<family-name>|<generic-voice>]|preserve",
      "voice-pitch": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
      "voice-range": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
      "voice-rate": "[normal|x-slow|slow|medium|fast|x-fast]||<percentage>",
      "voice-stress": "normal|strong|moderate|none|reduced",
      "voice-volume": "silent|[[x-soft|soft|medium|loud|x-loud]||<decibel>]"
    },
    "atrules": {
      "charset": {
        "prelude": "<string>",
        "descriptors": null
      },
      "counter-style": {
        "prelude": "<counter-style-name>",
        "descriptors": {
          "additive-symbols": "[<integer>&&<symbol>]#",
          "fallback": "<counter-style-name>",
          "negative": "<symbol> <symbol>?",
          "pad": "<integer>&&<symbol>",
          "prefix": "<symbol>",
          "range": "[[<integer>|infinite]{2}]#|auto",
          "speak-as": "auto|bullets|numbers|words|spell-out|<counter-style-name>",
          "suffix": "<symbol>",
          "symbols": "<symbol>+",
          "system": "cyclic|numeric|alphabetic|symbolic|additive|[fixed <integer>?]|[extends <counter-style-name>]"
        }
      },
      "document": {
        "prelude": "[<url>|url-prefix( <string> )|domain( <string> )|media-document( <string> )|regexp( <string> )]#",
        "descriptors": null
      },
      "font-face": {
        "prelude": null,
        "descriptors": {
          "ascent-override": "normal|<percentage>",
          "descent-override": "normal|<percentage>",
          "font-display": "[auto|block|swap|fallback|optional]",
          "font-family": "<family-name>",
          "font-feature-settings": "normal|<feature-tag-value>#",
          "font-variation-settings": "normal|[<string> <number>]#",
          "font-stretch": "<font-stretch-absolute>{1,2}",
          "font-style": "normal|italic|oblique <angle>{0,2}",
          "font-weight": "<font-weight-absolute>{1,2}",
          "font-variant": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby]",
          "line-gap-override": "normal|<percentage>",
          "size-adjust": "<percentage>",
          "src": "[<url> [format( <string># )]?|local( <family-name> )]#",
          "unicode-range": "<urange>#"
        }
      },
      "font-feature-values": {
        "prelude": "<family-name>#",
        "descriptors": null
      },
      "import": {
        "prelude": "[<string>|<url>] [layer|layer( <layer-name> )]? [supports( [<supports-condition>|<declaration>] )]? <media-query-list>?",
        "descriptors": null
      },
      "keyframes": {
        "prelude": "<keyframes-name>",
        "descriptors": null
      },
      "layer": {
        "prelude": "[<layer-name>#|<layer-name>?]",
        "descriptors": null
      },
      "media": {
        "prelude": "<media-query-list>",
        "descriptors": null
      },
      "namespace": {
        "prelude": "<namespace-prefix>? [<string>|<url>]",
        "descriptors": null
      },
      "page": {
        "prelude": "<page-selector-list>",
        "descriptors": {
          "bleed": "auto|<length>",
          "marks": "none|[crop||cross]",
          "size": "<length>{1,2}|auto|[<page-size>||[portrait|landscape]]"
        }
      },
      "property": {
        "prelude": "<custom-property-name>",
        "descriptors": {
          "syntax": "<string>",
          "inherits": "true|false",
          "initial-value": "<string>"
        }
      },
      "scroll-timeline": {
        "prelude": "<timeline-name>",
        "descriptors": null
      },
      "supports": {
        "prelude": "<supports-condition>",
        "descriptors": null
      },
      "viewport": {
        "prelude": null,
        "descriptors": {
          "height": "<viewport-length>{1,2}",
          "max-height": "<viewport-length>",
          "max-width": "<viewport-length>",
          "max-zoom": "auto|<number>|<percentage>",
          "min-height": "<viewport-length>",
          "min-width": "<viewport-length>",
          "min-zoom": "auto|<number>|<percentage>",
          "orientation": "auto|portrait|landscape",
          "user-zoom": "zoom|fixed",
          "viewport-fit": "auto|contain|cover",
          "width": "<viewport-length>{1,2}",
          "zoom": "auto|<number>|<percentage>"
        }
      },
      "nest": {
        "prelude": "<complex-selector-list>",
        "descriptors": null
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/node/index.js
  var node_exports = {};
  __export(node_exports, {
    AnPlusB: () => AnPlusB_exports,
    Atrule: () => Atrule_exports,
    AtrulePrelude: () => AtrulePrelude_exports,
    AttributeSelector: () => AttributeSelector_exports,
    Block: () => Block_exports,
    Brackets: () => Brackets_exports,
    CDC: () => CDC_exports,
    CDO: () => CDO_exports,
    ClassSelector: () => ClassSelector_exports,
    Combinator: () => Combinator_exports,
    Comment: () => Comment_exports,
    Declaration: () => Declaration_exports,
    DeclarationList: () => DeclarationList_exports,
    Dimension: () => Dimension_exports,
    Function: () => Function_exports,
    Hash: () => Hash_exports,
    IdSelector: () => IdSelector_exports,
    Identifier: () => Identifier_exports,
    MediaFeature: () => MediaFeature_exports,
    MediaQuery: () => MediaQuery_exports,
    MediaQueryList: () => MediaQueryList_exports,
    NestingSelector: () => NestingSelector_exports,
    Nth: () => Nth_exports,
    Number: () => Number_exports,
    Operator: () => Operator_exports,
    Parentheses: () => Parentheses_exports,
    Percentage: () => Percentage_exports,
    PseudoClassSelector: () => PseudoClassSelector_exports,
    PseudoElementSelector: () => PseudoElementSelector_exports,
    Ratio: () => Ratio_exports,
    Raw: () => Raw_exports,
    Rule: () => Rule_exports,
    Selector: () => Selector_exports,
    SelectorList: () => SelectorList_exports,
    String: () => String_exports,
    StyleSheet: () => StyleSheet_exports,
    TypeSelector: () => TypeSelector_exports,
    UnicodeRange: () => UnicodeRange_exports,
    Url: () => Url_exports,
    Value: () => Value_exports,
    WhiteSpace: () => WhiteSpace_exports
  });

  // ../../node_modules/css-tree/lib/syntax/node/AnPlusB.js
  var AnPlusB_exports = {};
  __export(AnPlusB_exports, {
    generate: () => generate2,
    name: () => name,
    parse: () => parse2,
    structure: () => structure
  });
  var PLUSSIGN5 = 43;
  var HYPHENMINUS5 = 45;
  var N5 = 110;
  var DISALLOW_SIGN2 = true;
  var ALLOW_SIGN2 = false;
  function checkInteger2(offset, disallowSign) {
    let pos = this.tokenStart + offset;
    const code2 = this.charCodeAt(pos);
    if (code2 === PLUSSIGN5 || code2 === HYPHENMINUS5) {
      if (disallowSign) {
        this.error("Number sign is not allowed");
      }
      pos++;
    }
    for (; pos < this.tokenEnd; pos++) {
      if (!isDigit(this.charCodeAt(pos))) {
        this.error("Integer is expected", pos);
      }
    }
  }
  function checkTokenIsInteger(disallowSign) {
    return checkInteger2.call(this, 0, disallowSign);
  }
  function expectCharCode(offset, code2) {
    if (!this.cmpChar(this.tokenStart + offset, code2)) {
      let msg = "";
      switch (code2) {
        case N5:
          msg = "N is expected";
          break;
        case HYPHENMINUS5:
          msg = "HyphenMinus is expected";
          break;
      }
      this.error(msg, this.tokenStart + offset);
    }
  }
  function consumeB2() {
    let offset = 0;
    let sign = 0;
    let type = this.tokenType;
    while (type === WhiteSpace || type === Comment) {
      type = this.lookupType(++offset);
    }
    if (type !== Number2) {
      if (this.isDelim(PLUSSIGN5, offset) || this.isDelim(HYPHENMINUS5, offset)) {
        sign = this.isDelim(PLUSSIGN5, offset) ? PLUSSIGN5 : HYPHENMINUS5;
        do {
          type = this.lookupType(++offset);
        } while (type === WhiteSpace || type === Comment);
        if (type !== Number2) {
          this.skip(offset);
          checkTokenIsInteger.call(this, DISALLOW_SIGN2);
        }
      } else {
        return null;
      }
    }
    if (offset > 0) {
      this.skip(offset);
    }
    if (sign === 0) {
      type = this.charCodeAt(this.tokenStart);
      if (type !== PLUSSIGN5 && type !== HYPHENMINUS5) {
        this.error("Number sign is expected");
      }
    }
    checkTokenIsInteger.call(this, sign !== 0);
    return sign === HYPHENMINUS5 ? "-" + this.consume(Number2) : this.consume(Number2);
  }
  var name = "AnPlusB";
  var structure = {
    a: [String, null],
    b: [String, null]
  };
  function parse2() {
    const start = this.tokenStart;
    let a = null;
    let b = null;
    if (this.tokenType === Number2) {
      checkTokenIsInteger.call(this, ALLOW_SIGN2);
      b = this.consume(Number2);
    } else if (this.tokenType === Ident && this.cmpChar(this.tokenStart, HYPHENMINUS5)) {
      a = "-1";
      expectCharCode.call(this, 1, N5);
      switch (this.tokenEnd - this.tokenStart) {
        case 2:
          this.next();
          b = consumeB2.call(this);
          break;
        case 3:
          expectCharCode.call(this, 2, HYPHENMINUS5);
          this.next();
          this.skipSC();
          checkTokenIsInteger.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(Number2);
          break;
        default:
          expectCharCode.call(this, 2, HYPHENMINUS5);
          checkInteger2.call(this, 3, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(start + 2);
      }
    } else if (this.tokenType === Ident || this.isDelim(PLUSSIGN5) && this.lookupType(1) === Ident) {
      let sign = 0;
      a = "1";
      if (this.isDelim(PLUSSIGN5)) {
        sign = 1;
        this.next();
      }
      expectCharCode.call(this, 0, N5);
      switch (this.tokenEnd - this.tokenStart) {
        case 1:
          this.next();
          b = consumeB2.call(this);
          break;
        case 2:
          expectCharCode.call(this, 1, HYPHENMINUS5);
          this.next();
          this.skipSC();
          checkTokenIsInteger.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(Number2);
          break;
        default:
          expectCharCode.call(this, 1, HYPHENMINUS5);
          checkInteger2.call(this, 2, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(start + sign + 1);
      }
    } else if (this.tokenType === Dimension) {
      const code2 = this.charCodeAt(this.tokenStart);
      const sign = code2 === PLUSSIGN5 || code2 === HYPHENMINUS5;
      let i2 = this.tokenStart + sign;
      for (; i2 < this.tokenEnd; i2++) {
        if (!isDigit(this.charCodeAt(i2))) {
          break;
        }
      }
      if (i2 === this.tokenStart + sign) {
        this.error("Integer is expected", this.tokenStart + sign);
      }
      expectCharCode.call(this, i2 - this.tokenStart, N5);
      a = this.substring(start, i2);
      if (i2 + 1 === this.tokenEnd) {
        this.next();
        b = consumeB2.call(this);
      } else {
        expectCharCode.call(this, i2 - this.tokenStart + 1, HYPHENMINUS5);
        if (i2 + 2 === this.tokenEnd) {
          this.next();
          this.skipSC();
          checkTokenIsInteger.call(this, DISALLOW_SIGN2);
          b = "-" + this.consume(Number2);
        } else {
          checkInteger2.call(this, i2 - this.tokenStart + 2, DISALLOW_SIGN2);
          this.next();
          b = this.substrToCursor(i2 + 1);
        }
      }
    } else {
      this.error();
    }
    if (a !== null && a.charCodeAt(0) === PLUSSIGN5) {
      a = a.substr(1);
    }
    if (b !== null && b.charCodeAt(0) === PLUSSIGN5) {
      b = b.substr(1);
    }
    return {
      type: "AnPlusB",
      loc: this.getLocation(start, this.tokenStart),
      a,
      b
    };
  }
  function generate2(node) {
    if (node.a) {
      const a = node.a === "+1" && "n" || node.a === "1" && "n" || node.a === "-1" && "-n" || node.a + "n";
      if (node.b) {
        const b = node.b[0] === "-" || node.b[0] === "+" ? node.b : "+" + node.b;
        this.tokenize(a + b);
      } else {
        this.tokenize(a);
      }
    } else {
      this.tokenize(node.b);
    }
  }

  // ../../node_modules/css-tree/lib/syntax/node/Atrule.js
  var Atrule_exports = {};
  __export(Atrule_exports, {
    generate: () => generate3,
    name: () => name2,
    parse: () => parse3,
    structure: () => structure2,
    walkContext: () => walkContext
  });
  function consumeRaw(startToken) {
    return this.Raw(startToken, this.consumeUntilLeftCurlyBracketOrSemicolon, true);
  }
  function isDeclarationBlockAtrule() {
    for (let offset = 1, type; type = this.lookupType(offset); offset++) {
      if (type === RightCurlyBracket) {
        return true;
      }
      if (type === LeftCurlyBracket || type === AtKeyword) {
        return false;
      }
    }
    return false;
  }
  var name2 = "Atrule";
  var walkContext = "atrule";
  var structure2 = {
    name: String,
    prelude: ["AtrulePrelude", "Raw", null],
    block: ["Block", null]
  };
  function parse3(isDeclaration = false) {
    const start = this.tokenStart;
    let name42;
    let nameLowerCase;
    let prelude = null;
    let block = null;
    this.eat(AtKeyword);
    name42 = this.substrToCursor(start + 1);
    nameLowerCase = name42.toLowerCase();
    this.skipSC();
    if (this.eof === false && this.tokenType !== LeftCurlyBracket && this.tokenType !== Semicolon) {
      if (this.parseAtrulePrelude) {
        prelude = this.parseWithFallback(this.AtrulePrelude.bind(this, name42, isDeclaration), consumeRaw);
      } else {
        prelude = consumeRaw.call(this, this.tokenIndex);
      }
      this.skipSC();
    }
    switch (this.tokenType) {
      case Semicolon:
        this.next();
        break;
      case LeftCurlyBracket:
        if (hasOwnProperty.call(this.atrule, nameLowerCase) && typeof this.atrule[nameLowerCase].block === "function") {
          block = this.atrule[nameLowerCase].block.call(this, isDeclaration);
        } else {
          block = this.Block(isDeclarationBlockAtrule.call(this));
        }
        break;
    }
    return {
      type: "Atrule",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      prelude,
      block
    };
  }
  function generate3(node) {
    this.token(AtKeyword, "@" + node.name);
    if (node.prelude !== null) {
      this.node(node.prelude);
    }
    if (node.block) {
      this.node(node.block);
    } else {
      this.token(Semicolon, ";");
    }
  }

  // ../../node_modules/css-tree/lib/syntax/node/AtrulePrelude.js
  var AtrulePrelude_exports = {};
  __export(AtrulePrelude_exports, {
    generate: () => generate4,
    name: () => name3,
    parse: () => parse4,
    structure: () => structure3,
    walkContext: () => walkContext2
  });
  var name3 = "AtrulePrelude";
  var walkContext2 = "atrulePrelude";
  var structure3 = {
    children: [[]]
  };
  function parse4(name42) {
    let children = null;
    if (name42 !== null) {
      name42 = name42.toLowerCase();
    }
    this.skipSC();
    if (hasOwnProperty.call(this.atrule, name42) && typeof this.atrule[name42].prelude === "function") {
      children = this.atrule[name42].prelude.call(this);
    } else {
      children = this.readSequence(this.scope.AtrulePrelude);
    }
    this.skipSC();
    if (this.eof !== true && this.tokenType !== LeftCurlyBracket && this.tokenType !== Semicolon) {
      this.error("Semicolon or block is expected");
    }
    return {
      type: "AtrulePrelude",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate4(node) {
    this.children(node);
  }

  // ../../node_modules/css-tree/lib/syntax/node/AttributeSelector.js
  var AttributeSelector_exports = {};
  __export(AttributeSelector_exports, {
    generate: () => generate5,
    name: () => name4,
    parse: () => parse5,
    structure: () => structure4
  });
  var DOLLARSIGN = 36;
  var ASTERISK2 = 42;
  var EQUALSSIGN = 61;
  var CIRCUMFLEXACCENT = 94;
  var VERTICALLINE2 = 124;
  var TILDE = 126;
  function getAttributeName() {
    if (this.eof) {
      this.error("Unexpected end of input");
    }
    const start = this.tokenStart;
    let expectIdent = false;
    if (this.isDelim(ASTERISK2)) {
      expectIdent = true;
      this.next();
    } else if (!this.isDelim(VERTICALLINE2)) {
      this.eat(Ident);
    }
    if (this.isDelim(VERTICALLINE2)) {
      if (this.charCodeAt(this.tokenStart + 1) !== EQUALSSIGN) {
        this.next();
        this.eat(Ident);
      } else if (expectIdent) {
        this.error("Identifier is expected", this.tokenEnd);
      }
    } else if (expectIdent) {
      this.error("Vertical line is expected");
    }
    return {
      type: "Identifier",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start)
    };
  }
  function getOperator() {
    const start = this.tokenStart;
    const code2 = this.charCodeAt(start);
    if (code2 !== EQUALSSIGN && // =
    code2 !== TILDE && // ~=
    code2 !== CIRCUMFLEXACCENT && // ^=
    code2 !== DOLLARSIGN && // $=
    code2 !== ASTERISK2 && // *=
    code2 !== VERTICALLINE2) {
      this.error("Attribute selector (=, ~=, ^=, $=, *=, |=) is expected");
    }
    this.next();
    if (code2 !== EQUALSSIGN) {
      if (!this.isDelim(EQUALSSIGN)) {
        this.error("Equal sign is expected");
      }
      this.next();
    }
    return this.substrToCursor(start);
  }
  var name4 = "AttributeSelector";
  var structure4 = {
    name: "Identifier",
    matcher: [String, null],
    value: ["String", "Identifier", null],
    flags: [String, null]
  };
  function parse5() {
    const start = this.tokenStart;
    let name42;
    let matcher = null;
    let value2 = null;
    let flags = null;
    this.eat(LeftSquareBracket);
    this.skipSC();
    name42 = getAttributeName.call(this);
    this.skipSC();
    if (this.tokenType !== RightSquareBracket) {
      if (this.tokenType !== Ident) {
        matcher = getOperator.call(this);
        this.skipSC();
        value2 = this.tokenType === String2 ? this.String() : this.Identifier();
        this.skipSC();
      }
      if (this.tokenType === Ident) {
        flags = this.consume(Ident);
        this.skipSC();
      }
    }
    this.eat(RightSquareBracket);
    return {
      type: "AttributeSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      matcher,
      value: value2,
      flags
    };
  }
  function generate5(node) {
    this.token(Delim, "[");
    this.node(node.name);
    if (node.matcher !== null) {
      this.tokenize(node.matcher);
      this.node(node.value);
    }
    if (node.flags !== null) {
      this.token(Ident, node.flags);
    }
    this.token(Delim, "]");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Block.js
  var Block_exports = {};
  __export(Block_exports, {
    generate: () => generate6,
    name: () => name5,
    parse: () => parse6,
    structure: () => structure5,
    walkContext: () => walkContext3
  });
  var AMPERSAND2 = 38;
  function consumeRaw2(startToken) {
    return this.Raw(startToken, null, true);
  }
  function consumeRule() {
    return this.parseWithFallback(this.Rule, consumeRaw2);
  }
  function consumeRawDeclaration(startToken) {
    return this.Raw(startToken, this.consumeUntilSemicolonIncluded, true);
  }
  function consumeDeclaration() {
    if (this.tokenType === Semicolon) {
      return consumeRawDeclaration.call(this, this.tokenIndex);
    }
    const node = this.parseWithFallback(this.Declaration, consumeRawDeclaration);
    if (this.tokenType === Semicolon) {
      this.next();
    }
    return node;
  }
  var name5 = "Block";
  var walkContext3 = "block";
  var structure5 = {
    children: [[
      "Atrule",
      "Rule",
      "Declaration"
    ]]
  };
  function parse6(isStyleBlock) {
    const consumer = isStyleBlock ? consumeDeclaration : consumeRule;
    const start = this.tokenStart;
    let children = this.createList();
    this.eat(LeftCurlyBracket);
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case RightCurlyBracket:
            break scan;
          case WhiteSpace:
          case Comment:
            this.next();
            break;
          case AtKeyword:
            children.push(this.parseWithFallback(this.Atrule.bind(this, isStyleBlock), consumeRaw2));
            break;
          default:
            if (isStyleBlock && this.isDelim(AMPERSAND2)) {
              children.push(consumeRule.call(this));
            } else {
              children.push(consumer.call(this));
            }
        }
      }
    if (!this.eof) {
      this.eat(RightCurlyBracket);
    }
    return {
      type: "Block",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate6(node) {
    this.token(LeftCurlyBracket, "{");
    this.children(node, (prev) => {
      if (prev.type === "Declaration") {
        this.token(Semicolon, ";");
      }
    });
    this.token(RightCurlyBracket, "}");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Brackets.js
  var Brackets_exports = {};
  __export(Brackets_exports, {
    generate: () => generate7,
    name: () => name6,
    parse: () => parse7,
    structure: () => structure6
  });
  var name6 = "Brackets";
  var structure6 = {
    children: [[]]
  };
  function parse7(readSequence3, recognizer) {
    const start = this.tokenStart;
    let children = null;
    this.eat(LeftSquareBracket);
    children = readSequence3.call(this, recognizer);
    if (!this.eof) {
      this.eat(RightSquareBracket);
    }
    return {
      type: "Brackets",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate7(node) {
    this.token(Delim, "[");
    this.children(node);
    this.token(Delim, "]");
  }

  // ../../node_modules/css-tree/lib/syntax/node/CDC.js
  var CDC_exports = {};
  __export(CDC_exports, {
    generate: () => generate8,
    name: () => name7,
    parse: () => parse8,
    structure: () => structure7
  });
  var name7 = "CDC";
  var structure7 = [];
  function parse8() {
    const start = this.tokenStart;
    this.eat(CDC);
    return {
      type: "CDC",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate8() {
    this.token(CDC, "-->");
  }

  // ../../node_modules/css-tree/lib/syntax/node/CDO.js
  var CDO_exports = {};
  __export(CDO_exports, {
    generate: () => generate9,
    name: () => name8,
    parse: () => parse9,
    structure: () => structure8
  });
  var name8 = "CDO";
  var structure8 = [];
  function parse9() {
    const start = this.tokenStart;
    this.eat(CDO);
    return {
      type: "CDO",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate9() {
    this.token(CDO, "<!--");
  }

  // ../../node_modules/css-tree/lib/syntax/node/ClassSelector.js
  var ClassSelector_exports = {};
  __export(ClassSelector_exports, {
    generate: () => generate10,
    name: () => name9,
    parse: () => parse10,
    structure: () => structure9
  });
  var FULLSTOP = 46;
  var name9 = "ClassSelector";
  var structure9 = {
    name: String
  };
  function parse10() {
    this.eatDelim(FULLSTOP);
    return {
      type: "ClassSelector",
      loc: this.getLocation(this.tokenStart - 1, this.tokenEnd),
      name: this.consume(Ident)
    };
  }
  function generate10(node) {
    this.token(Delim, ".");
    this.token(Ident, node.name);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Combinator.js
  var Combinator_exports = {};
  __export(Combinator_exports, {
    generate: () => generate11,
    name: () => name10,
    parse: () => parse11,
    structure: () => structure10
  });
  var PLUSSIGN6 = 43;
  var SOLIDUS = 47;
  var GREATERTHANSIGN2 = 62;
  var TILDE2 = 126;
  var name10 = "Combinator";
  var structure10 = {
    name: String
  };
  function parse11() {
    const start = this.tokenStart;
    let name42;
    switch (this.tokenType) {
      case WhiteSpace:
        name42 = " ";
        break;
      case Delim:
        switch (this.charCodeAt(this.tokenStart)) {
          case GREATERTHANSIGN2:
          case PLUSSIGN6:
          case TILDE2:
            this.next();
            break;
          case SOLIDUS:
            this.next();
            this.eatIdent("deep");
            this.eatDelim(SOLIDUS);
            break;
          default:
            this.error("Combinator is expected");
        }
        name42 = this.substrToCursor(start);
        break;
    }
    return {
      type: "Combinator",
      loc: this.getLocation(start, this.tokenStart),
      name: name42
    };
  }
  function generate11(node) {
    this.tokenize(node.name);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Comment.js
  var Comment_exports = {};
  __export(Comment_exports, {
    generate: () => generate12,
    name: () => name11,
    parse: () => parse12,
    structure: () => structure11
  });
  var ASTERISK3 = 42;
  var SOLIDUS2 = 47;
  var name11 = "Comment";
  var structure11 = {
    value: String
  };
  function parse12() {
    const start = this.tokenStart;
    let end = this.tokenEnd;
    this.eat(Comment);
    if (end - start + 2 >= 2 && this.charCodeAt(end - 2) === ASTERISK3 && this.charCodeAt(end - 1) === SOLIDUS2) {
      end -= 2;
    }
    return {
      type: "Comment",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substring(start + 2, end)
    };
  }
  function generate12(node) {
    this.token(Comment, "/*" + node.value + "*/");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Declaration.js
  var Declaration_exports = {};
  __export(Declaration_exports, {
    generate: () => generate13,
    name: () => name12,
    parse: () => parse13,
    structure: () => structure12,
    walkContext: () => walkContext4
  });
  var EXCLAMATIONMARK3 = 33;
  var NUMBERSIGN3 = 35;
  var DOLLARSIGN2 = 36;
  var AMPERSAND3 = 38;
  var ASTERISK4 = 42;
  var PLUSSIGN7 = 43;
  var SOLIDUS3 = 47;
  function consumeValueRaw(startToken) {
    return this.Raw(startToken, this.consumeUntilExclamationMarkOrSemicolon, true);
  }
  function consumeCustomPropertyRaw(startToken) {
    return this.Raw(startToken, this.consumeUntilExclamationMarkOrSemicolon, false);
  }
  function consumeValue() {
    const startValueToken = this.tokenIndex;
    const value2 = this.Value();
    if (value2.type !== "Raw" && this.eof === false && this.tokenType !== Semicolon && this.isDelim(EXCLAMATIONMARK3) === false && this.isBalanceEdge(startValueToken) === false) {
      this.error();
    }
    return value2;
  }
  var name12 = "Declaration";
  var walkContext4 = "declaration";
  var structure12 = {
    important: [Boolean, String],
    property: String,
    value: ["Value", "Raw"]
  };
  function parse13() {
    const start = this.tokenStart;
    const startToken = this.tokenIndex;
    const property2 = readProperty2.call(this);
    const customProperty = isCustomProperty(property2);
    const parseValue = customProperty ? this.parseCustomProperty : this.parseValue;
    const consumeRaw7 = customProperty ? consumeCustomPropertyRaw : consumeValueRaw;
    let important = false;
    let value2;
    this.skipSC();
    this.eat(Colon);
    const valueStart = this.tokenIndex;
    if (!customProperty) {
      this.skipSC();
    }
    if (parseValue) {
      value2 = this.parseWithFallback(consumeValue, consumeRaw7);
    } else {
      value2 = consumeRaw7.call(this, this.tokenIndex);
    }
    if (customProperty && value2.type === "Value" && value2.children.isEmpty) {
      for (let offset = valueStart - this.tokenIndex; offset <= 0; offset++) {
        if (this.lookupType(offset) === WhiteSpace) {
          value2.children.appendData({
            type: "WhiteSpace",
            loc: null,
            value: " "
          });
          break;
        }
      }
    }
    if (this.isDelim(EXCLAMATIONMARK3)) {
      important = getImportant.call(this);
      this.skipSC();
    }
    if (this.eof === false && this.tokenType !== Semicolon && this.isBalanceEdge(startToken) === false) {
      this.error();
    }
    return {
      type: "Declaration",
      loc: this.getLocation(start, this.tokenStart),
      important,
      property: property2,
      value: value2
    };
  }
  function generate13(node) {
    this.token(Ident, node.property);
    this.token(Colon, ":");
    this.node(node.value);
    if (node.important) {
      this.token(Delim, "!");
      this.token(Ident, node.important === true ? "important" : node.important);
    }
  }
  function readProperty2() {
    const start = this.tokenStart;
    if (this.tokenType === Delim) {
      switch (this.charCodeAt(this.tokenStart)) {
        case ASTERISK4:
        case DOLLARSIGN2:
        case PLUSSIGN7:
        case NUMBERSIGN3:
        case AMPERSAND3:
          this.next();
          break;
        case SOLIDUS3:
          this.next();
          if (this.isDelim(SOLIDUS3)) {
            this.next();
          }
          break;
      }
    }
    if (this.tokenType === Hash) {
      this.eat(Hash);
    } else {
      this.eat(Ident);
    }
    return this.substrToCursor(start);
  }
  function getImportant() {
    this.eat(Delim);
    this.skipSC();
    const important = this.consume(Ident);
    return important === "important" ? true : important;
  }

  // ../../node_modules/css-tree/lib/syntax/node/DeclarationList.js
  var DeclarationList_exports = {};
  __export(DeclarationList_exports, {
    generate: () => generate14,
    name: () => name13,
    parse: () => parse14,
    structure: () => structure13
  });
  var AMPERSAND4 = 38;
  function consumeRaw3(startToken) {
    return this.Raw(startToken, this.consumeUntilSemicolonIncluded, true);
  }
  var name13 = "DeclarationList";
  var structure13 = {
    children: [[
      "Declaration",
      "Atrule",
      "Rule"
    ]]
  };
  function parse14() {
    const children = this.createList();
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case WhiteSpace:
          case Comment:
          case Semicolon:
            this.next();
            break;
          case AtKeyword:
            children.push(this.parseWithFallback(this.Atrule.bind(this, true), consumeRaw3));
            break;
          default:
            if (this.isDelim(AMPERSAND4)) {
              children.push(this.parseWithFallback(this.Rule, consumeRaw3));
            } else {
              children.push(this.parseWithFallback(this.Declaration, consumeRaw3));
            }
        }
      }
    return {
      type: "DeclarationList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate14(node) {
    this.children(node, (prev) => {
      if (prev.type === "Declaration") {
        this.token(Semicolon, ";");
      }
    });
  }

  // ../../node_modules/css-tree/lib/syntax/node/Dimension.js
  var Dimension_exports = {};
  __export(Dimension_exports, {
    generate: () => generate15,
    name: () => name14,
    parse: () => parse15,
    structure: () => structure14
  });
  var name14 = "Dimension";
  var structure14 = {
    value: String,
    unit: String
  };
  function parse15() {
    const start = this.tokenStart;
    const value2 = this.consumeNumber(Dimension);
    return {
      type: "Dimension",
      loc: this.getLocation(start, this.tokenStart),
      value: value2,
      unit: this.substring(start + value2.length, this.tokenStart)
    };
  }
  function generate15(node) {
    this.token(Dimension, node.value + node.unit);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Function.js
  var Function_exports = {};
  __export(Function_exports, {
    generate: () => generate16,
    name: () => name15,
    parse: () => parse16,
    structure: () => structure15,
    walkContext: () => walkContext5
  });
  var name15 = "Function";
  var walkContext5 = "function";
  var structure15 = {
    name: String,
    children: [[]]
  };
  function parse16(readSequence3, recognizer) {
    const start = this.tokenStart;
    const name42 = this.consumeFunctionName();
    const nameLowerCase = name42.toLowerCase();
    let children;
    children = recognizer.hasOwnProperty(nameLowerCase) ? recognizer[nameLowerCase].call(this, recognizer) : readSequence3.call(this, recognizer);
    if (!this.eof) {
      this.eat(RightParenthesis);
    }
    return {
      type: "Function",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      children
    };
  }
  function generate16(node) {
    this.token(Function2, node.name + "(");
    this.children(node);
    this.token(RightParenthesis, ")");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Hash.js
  var Hash_exports = {};
  __export(Hash_exports, {
    generate: () => generate17,
    name: () => name16,
    parse: () => parse17,
    structure: () => structure16,
    xxx: () => xxx
  });
  var xxx = "XXX";
  var name16 = "Hash";
  var structure16 = {
    value: String
  };
  function parse17() {
    const start = this.tokenStart;
    this.eat(Hash);
    return {
      type: "Hash",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start + 1)
    };
  }
  function generate17(node) {
    this.token(Hash, "#" + node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Identifier.js
  var Identifier_exports = {};
  __export(Identifier_exports, {
    generate: () => generate18,
    name: () => name17,
    parse: () => parse18,
    structure: () => structure17
  });
  var name17 = "Identifier";
  var structure17 = {
    name: String
  };
  function parse18() {
    return {
      type: "Identifier",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      name: this.consume(Ident)
    };
  }
  function generate18(node) {
    this.token(Ident, node.name);
  }

  // ../../node_modules/css-tree/lib/syntax/node/IdSelector.js
  var IdSelector_exports = {};
  __export(IdSelector_exports, {
    generate: () => generate19,
    name: () => name18,
    parse: () => parse19,
    structure: () => structure18
  });
  var name18 = "IdSelector";
  var structure18 = {
    name: String
  };
  function parse19() {
    const start = this.tokenStart;
    this.eat(Hash);
    return {
      type: "IdSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start + 1)
    };
  }
  function generate19(node) {
    this.token(Delim, "#" + node.name);
  }

  // ../../node_modules/css-tree/lib/syntax/node/MediaFeature.js
  var MediaFeature_exports = {};
  __export(MediaFeature_exports, {
    generate: () => generate20,
    name: () => name19,
    parse: () => parse20,
    structure: () => structure19
  });
  var name19 = "MediaFeature";
  var structure19 = {
    name: String,
    value: ["Identifier", "Number", "Dimension", "Ratio", null]
  };
  function parse20() {
    const start = this.tokenStart;
    let name42;
    let value2 = null;
    this.eat(LeftParenthesis);
    this.skipSC();
    name42 = this.consume(Ident);
    this.skipSC();
    if (this.tokenType !== RightParenthesis) {
      this.eat(Colon);
      this.skipSC();
      switch (this.tokenType) {
        case Number2:
          if (this.lookupNonWSType(1) === Delim) {
            value2 = this.Ratio();
          } else {
            value2 = this.Number();
          }
          break;
        case Dimension:
          value2 = this.Dimension();
          break;
        case Ident:
          value2 = this.Identifier();
          break;
        default:
          this.error("Number, dimension, ratio or identifier is expected");
      }
      this.skipSC();
    }
    this.eat(RightParenthesis);
    return {
      type: "MediaFeature",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      value: value2
    };
  }
  function generate20(node) {
    this.token(LeftParenthesis, "(");
    this.token(Ident, node.name);
    if (node.value !== null) {
      this.token(Colon, ":");
      this.node(node.value);
    }
    this.token(RightParenthesis, ")");
  }

  // ../../node_modules/css-tree/lib/syntax/node/MediaQuery.js
  var MediaQuery_exports = {};
  __export(MediaQuery_exports, {
    generate: () => generate21,
    name: () => name20,
    parse: () => parse21,
    structure: () => structure20
  });
  var name20 = "MediaQuery";
  var structure20 = {
    children: [[
      "Identifier",
      "MediaFeature",
      "WhiteSpace"
    ]]
  };
  function parse21() {
    const children = this.createList();
    let child = null;
    this.skipSC();
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case Comment:
          case WhiteSpace:
            this.next();
            continue;
          case Ident:
            child = this.Identifier();
            break;
          case LeftParenthesis:
            child = this.MediaFeature();
            break;
          default:
            break scan;
        }
        children.push(child);
      }
    if (child === null) {
      this.error("Identifier or parenthesis is expected");
    }
    return {
      type: "MediaQuery",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate21(node) {
    this.children(node);
  }

  // ../../node_modules/css-tree/lib/syntax/node/MediaQueryList.js
  var MediaQueryList_exports = {};
  __export(MediaQueryList_exports, {
    generate: () => generate22,
    name: () => name21,
    parse: () => parse22,
    structure: () => structure21
  });
  var name21 = "MediaQueryList";
  var structure21 = {
    children: [[
      "MediaQuery"
    ]]
  };
  function parse22() {
    const children = this.createList();
    this.skipSC();
    while (!this.eof) {
      children.push(this.MediaQuery());
      if (this.tokenType !== Comma) {
        break;
      }
      this.next();
    }
    return {
      type: "MediaQueryList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate22(node) {
    this.children(node, () => this.token(Comma, ","));
  }

  // ../../node_modules/css-tree/lib/syntax/node/NestingSelector.js
  var NestingSelector_exports = {};
  __export(NestingSelector_exports, {
    generate: () => generate23,
    name: () => name22,
    parse: () => parse23,
    structure: () => structure22
  });
  var AMPERSAND5 = 38;
  var name22 = "NestingSelector";
  var structure22 = {};
  function parse23() {
    const start = this.tokenStart;
    this.eatDelim(AMPERSAND5);
    return {
      type: "NestingSelector",
      loc: this.getLocation(start, this.tokenStart)
    };
  }
  function generate23() {
    this.token(Delim, "&");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Nth.js
  var Nth_exports = {};
  __export(Nth_exports, {
    generate: () => generate24,
    name: () => name23,
    parse: () => parse24,
    structure: () => structure23
  });
  var name23 = "Nth";
  var structure23 = {
    nth: ["AnPlusB", "Identifier"],
    selector: ["SelectorList", null]
  };
  function parse24() {
    this.skipSC();
    const start = this.tokenStart;
    let end = start;
    let selector2 = null;
    let nth4;
    if (this.lookupValue(0, "odd") || this.lookupValue(0, "even")) {
      nth4 = this.Identifier();
    } else {
      nth4 = this.AnPlusB();
    }
    end = this.tokenStart;
    this.skipSC();
    if (this.lookupValue(0, "of")) {
      this.next();
      selector2 = this.SelectorList();
      end = this.tokenStart;
    }
    return {
      type: "Nth",
      loc: this.getLocation(start, end),
      nth: nth4,
      selector: selector2
    };
  }
  function generate24(node) {
    this.node(node.nth);
    if (node.selector !== null) {
      this.token(Ident, "of");
      this.node(node.selector);
    }
  }

  // ../../node_modules/css-tree/lib/syntax/node/Number.js
  var Number_exports = {};
  __export(Number_exports, {
    generate: () => generate25,
    name: () => name24,
    parse: () => parse25,
    structure: () => structure24
  });
  var name24 = "Number";
  var structure24 = {
    value: String
  };
  function parse25() {
    return {
      type: "Number",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: this.consume(Number2)
    };
  }
  function generate25(node) {
    this.token(Number2, node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Operator.js
  var Operator_exports = {};
  __export(Operator_exports, {
    generate: () => generate26,
    name: () => name25,
    parse: () => parse26,
    structure: () => structure25
  });
  var name25 = "Operator";
  var structure25 = {
    value: String
  };
  function parse26() {
    const start = this.tokenStart;
    this.next();
    return {
      type: "Operator",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start)
    };
  }
  function generate26(node) {
    this.tokenize(node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Parentheses.js
  var Parentheses_exports = {};
  __export(Parentheses_exports, {
    generate: () => generate27,
    name: () => name26,
    parse: () => parse27,
    structure: () => structure26
  });
  var name26 = "Parentheses";
  var structure26 = {
    children: [[]]
  };
  function parse27(readSequence3, recognizer) {
    const start = this.tokenStart;
    let children = null;
    this.eat(LeftParenthesis);
    children = readSequence3.call(this, recognizer);
    if (!this.eof) {
      this.eat(RightParenthesis);
    }
    return {
      type: "Parentheses",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate27(node) {
    this.token(LeftParenthesis, "(");
    this.children(node);
    this.token(RightParenthesis, ")");
  }

  // ../../node_modules/css-tree/lib/syntax/node/Percentage.js
  var Percentage_exports = {};
  __export(Percentage_exports, {
    generate: () => generate28,
    name: () => name27,
    parse: () => parse28,
    structure: () => structure27
  });
  var name27 = "Percentage";
  var structure27 = {
    value: String
  };
  function parse28() {
    return {
      type: "Percentage",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: this.consumeNumber(Percentage)
    };
  }
  function generate28(node) {
    this.token(Percentage, node.value + "%");
  }

  // ../../node_modules/css-tree/lib/syntax/node/PseudoClassSelector.js
  var PseudoClassSelector_exports = {};
  __export(PseudoClassSelector_exports, {
    generate: () => generate29,
    name: () => name28,
    parse: () => parse29,
    structure: () => structure28,
    walkContext: () => walkContext6
  });
  var name28 = "PseudoClassSelector";
  var walkContext6 = "function";
  var structure28 = {
    name: String,
    children: [["Raw"], null]
  };
  function parse29() {
    const start = this.tokenStart;
    let children = null;
    let name42;
    let nameLowerCase;
    this.eat(Colon);
    if (this.tokenType === Function2) {
      name42 = this.consumeFunctionName();
      nameLowerCase = name42.toLowerCase();
      if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
        this.skipSC();
        children = this.pseudo[nameLowerCase].call(this);
        this.skipSC();
      } else {
        children = this.createList();
        children.push(
          this.Raw(this.tokenIndex, null, false)
        );
      }
      this.eat(RightParenthesis);
    } else {
      name42 = this.consume(Ident);
    }
    return {
      type: "PseudoClassSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      children
    };
  }
  function generate29(node) {
    this.token(Colon, ":");
    if (node.children === null) {
      this.token(Ident, node.name);
    } else {
      this.token(Function2, node.name + "(");
      this.children(node);
      this.token(RightParenthesis, ")");
    }
  }

  // ../../node_modules/css-tree/lib/syntax/node/PseudoElementSelector.js
  var PseudoElementSelector_exports = {};
  __export(PseudoElementSelector_exports, {
    generate: () => generate30,
    name: () => name29,
    parse: () => parse30,
    structure: () => structure29,
    walkContext: () => walkContext7
  });
  var name29 = "PseudoElementSelector";
  var walkContext7 = "function";
  var structure29 = {
    name: String,
    children: [["Raw"], null]
  };
  function parse30() {
    const start = this.tokenStart;
    let children = null;
    let name42;
    let nameLowerCase;
    this.eat(Colon);
    this.eat(Colon);
    if (this.tokenType === Function2) {
      name42 = this.consumeFunctionName();
      nameLowerCase = name42.toLowerCase();
      if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
        this.skipSC();
        children = this.pseudo[nameLowerCase].call(this);
        this.skipSC();
      } else {
        children = this.createList();
        children.push(
          this.Raw(this.tokenIndex, null, false)
        );
      }
      this.eat(RightParenthesis);
    } else {
      name42 = this.consume(Ident);
    }
    return {
      type: "PseudoElementSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: name42,
      children
    };
  }
  function generate30(node) {
    this.token(Colon, ":");
    this.token(Colon, ":");
    if (node.children === null) {
      this.token(Ident, node.name);
    } else {
      this.token(Function2, node.name + "(");
      this.children(node);
      this.token(RightParenthesis, ")");
    }
  }

  // ../../node_modules/css-tree/lib/syntax/node/Ratio.js
  var Ratio_exports = {};
  __export(Ratio_exports, {
    generate: () => generate31,
    name: () => name30,
    parse: () => parse31,
    structure: () => structure30
  });
  var SOLIDUS4 = 47;
  var FULLSTOP2 = 46;
  function consumeNumber2() {
    this.skipSC();
    const value2 = this.consume(Number2);
    for (let i2 = 0; i2 < value2.length; i2++) {
      const code2 = value2.charCodeAt(i2);
      if (!isDigit(code2) && code2 !== FULLSTOP2) {
        this.error("Unsigned number is expected", this.tokenStart - value2.length + i2);
      }
    }
    if (Number(value2) === 0) {
      this.error("Zero number is not allowed", this.tokenStart - value2.length);
    }
    return value2;
  }
  var name30 = "Ratio";
  var structure30 = {
    left: String,
    right: String
  };
  function parse31() {
    const start = this.tokenStart;
    const left = consumeNumber2.call(this);
    let right;
    this.skipSC();
    this.eatDelim(SOLIDUS4);
    right = consumeNumber2.call(this);
    return {
      type: "Ratio",
      loc: this.getLocation(start, this.tokenStart),
      left,
      right
    };
  }
  function generate31(node) {
    this.token(Number2, node.left);
    this.token(Delim, "/");
    this.token(Number2, node.right);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Raw.js
  var Raw_exports = {};
  __export(Raw_exports, {
    generate: () => generate32,
    name: () => name31,
    parse: () => parse32,
    structure: () => structure31
  });
  function getOffsetExcludeWS() {
    if (this.tokenIndex > 0) {
      if (this.lookupType(-1) === WhiteSpace) {
        return this.tokenIndex > 1 ? this.getTokenStart(this.tokenIndex - 1) : this.firstCharOffset;
      }
    }
    return this.tokenStart;
  }
  var name31 = "Raw";
  var structure31 = {
    value: String
  };
  function parse32(startToken, consumeUntil, excludeWhiteSpace) {
    const startOffset = this.getTokenStart(startToken);
    let endOffset;
    this.skipUntilBalanced(startToken, consumeUntil || this.consumeUntilBalanceEnd);
    if (excludeWhiteSpace && this.tokenStart > startOffset) {
      endOffset = getOffsetExcludeWS.call(this);
    } else {
      endOffset = this.tokenStart;
    }
    return {
      type: "Raw",
      loc: this.getLocation(startOffset, endOffset),
      value: this.substring(startOffset, endOffset)
    };
  }
  function generate32(node) {
    this.tokenize(node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Rule.js
  var Rule_exports = {};
  __export(Rule_exports, {
    generate: () => generate33,
    name: () => name32,
    parse: () => parse33,
    structure: () => structure32,
    walkContext: () => walkContext8
  });
  function consumeRaw4(startToken) {
    return this.Raw(startToken, this.consumeUntilLeftCurlyBracket, true);
  }
  function consumePrelude() {
    const prelude = this.SelectorList();
    if (prelude.type !== "Raw" && this.eof === false && this.tokenType !== LeftCurlyBracket) {
      this.error();
    }
    return prelude;
  }
  var name32 = "Rule";
  var walkContext8 = "rule";
  var structure32 = {
    prelude: ["SelectorList", "Raw"],
    block: ["Block"]
  };
  function parse33() {
    const startToken = this.tokenIndex;
    const startOffset = this.tokenStart;
    let prelude;
    let block;
    if (this.parseRulePrelude) {
      prelude = this.parseWithFallback(consumePrelude, consumeRaw4);
    } else {
      prelude = consumeRaw4.call(this, startToken);
    }
    block = this.Block(true);
    return {
      type: "Rule",
      loc: this.getLocation(startOffset, this.tokenStart),
      prelude,
      block
    };
  }
  function generate33(node) {
    this.node(node.prelude);
    this.node(node.block);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Selector.js
  var Selector_exports = {};
  __export(Selector_exports, {
    generate: () => generate34,
    name: () => name33,
    parse: () => parse34,
    structure: () => structure33
  });
  var name33 = "Selector";
  var structure33 = {
    children: [[
      "TypeSelector",
      "IdSelector",
      "ClassSelector",
      "AttributeSelector",
      "PseudoClassSelector",
      "PseudoElementSelector",
      "Combinator",
      "WhiteSpace"
    ]]
  };
  function parse34() {
    const children = this.readSequence(this.scope.Selector);
    if (this.getFirstListNode(children) === null) {
      this.error("Selector is expected");
    }
    return {
      type: "Selector",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate34(node) {
    this.children(node);
  }

  // ../../node_modules/css-tree/lib/syntax/node/SelectorList.js
  var SelectorList_exports = {};
  __export(SelectorList_exports, {
    generate: () => generate35,
    name: () => name34,
    parse: () => parse35,
    structure: () => structure34,
    walkContext: () => walkContext9
  });
  var name34 = "SelectorList";
  var walkContext9 = "selector";
  var structure34 = {
    children: [[
      "Selector",
      "Raw"
    ]]
  };
  function parse35() {
    const children = this.createList();
    while (!this.eof) {
      children.push(this.Selector());
      if (this.tokenType === Comma) {
        this.next();
        continue;
      }
      break;
    }
    return {
      type: "SelectorList",
      loc: this.getLocationFromList(children),
      children
    };
  }
  function generate35(node) {
    this.children(node, () => this.token(Comma, ","));
  }

  // ../../node_modules/css-tree/lib/syntax/node/String.js
  var String_exports = {};
  __export(String_exports, {
    generate: () => generate36,
    name: () => name35,
    parse: () => parse36,
    structure: () => structure35
  });

  // ../../node_modules/css-tree/lib/utils/string.js
  var REVERSE_SOLIDUS = 92;
  var QUOTATION_MARK = 34;
  var APOSTROPHE2 = 39;
  function decode(str) {
    const len = str.length;
    const firstChar = str.charCodeAt(0);
    const start = firstChar === QUOTATION_MARK || firstChar === APOSTROPHE2 ? 1 : 0;
    const end = start === 1 && len > 1 && str.charCodeAt(len - 1) === firstChar ? len - 2 : len - 1;
    let decoded = "";
    for (let i2 = start; i2 <= end; i2++) {
      let code2 = str.charCodeAt(i2);
      if (code2 === REVERSE_SOLIDUS) {
        if (i2 === end) {
          if (i2 !== len - 1) {
            decoded = str.substr(i2 + 1);
          }
          break;
        }
        code2 = str.charCodeAt(++i2);
        if (isValidEscape(REVERSE_SOLIDUS, code2)) {
          const escapeStart = i2 - 1;
          const escapeEnd = consumeEscaped(str, escapeStart);
          i2 = escapeEnd - 1;
          decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
        } else {
          if (code2 === 13 && str.charCodeAt(i2 + 1) === 10) {
            i2++;
          }
        }
      } else {
        decoded += str[i2];
      }
    }
    return decoded;
  }
  function encode(str, apostrophe) {
    const quote = apostrophe ? "'" : '"';
    const quoteCode = apostrophe ? APOSTROPHE2 : QUOTATION_MARK;
    let encoded = "";
    let wsBeforeHexIsNeeded = false;
    for (let i2 = 0; i2 < str.length; i2++) {
      const code2 = str.charCodeAt(i2);
      if (code2 === 0) {
        encoded += "\uFFFD";
        continue;
      }
      if (code2 <= 31 || code2 === 127) {
        encoded += "\\" + code2.toString(16);
        wsBeforeHexIsNeeded = true;
        continue;
      }
      if (code2 === quoteCode || code2 === REVERSE_SOLIDUS) {
        encoded += "\\" + str.charAt(i2);
        wsBeforeHexIsNeeded = false;
      } else {
        if (wsBeforeHexIsNeeded && (isHexDigit(code2) || isWhiteSpace(code2))) {
          encoded += " ";
        }
        encoded += str.charAt(i2);
        wsBeforeHexIsNeeded = false;
      }
    }
    return quote + encoded + quote;
  }

  // ../../node_modules/css-tree/lib/syntax/node/String.js
  var name35 = "String";
  var structure35 = {
    value: String
  };
  function parse36() {
    return {
      type: "String",
      loc: this.getLocation(this.tokenStart, this.tokenEnd),
      value: decode(this.consume(String2))
    };
  }
  function generate36(node) {
    this.token(String2, encode(node.value));
  }

  // ../../node_modules/css-tree/lib/syntax/node/StyleSheet.js
  var StyleSheet_exports = {};
  __export(StyleSheet_exports, {
    generate: () => generate37,
    name: () => name36,
    parse: () => parse37,
    structure: () => structure36,
    walkContext: () => walkContext10
  });
  var EXCLAMATIONMARK4 = 33;
  function consumeRaw5(startToken) {
    return this.Raw(startToken, null, false);
  }
  var name36 = "StyleSheet";
  var walkContext10 = "stylesheet";
  var structure36 = {
    children: [[
      "Comment",
      "CDO",
      "CDC",
      "Atrule",
      "Rule",
      "Raw"
    ]]
  };
  function parse37() {
    const start = this.tokenStart;
    const children = this.createList();
    let child;
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case WhiteSpace:
            this.next();
            continue;
          case Comment:
            if (this.charCodeAt(this.tokenStart + 2) !== EXCLAMATIONMARK4) {
              this.next();
              continue;
            }
            child = this.Comment();
            break;
          case CDO:
            child = this.CDO();
            break;
          case CDC:
            child = this.CDC();
            break;
          case AtKeyword:
            child = this.parseWithFallback(this.Atrule, consumeRaw5);
            break;
          default:
            child = this.parseWithFallback(this.Rule, consumeRaw5);
        }
        children.push(child);
      }
    return {
      type: "StyleSheet",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate37(node) {
    this.children(node);
  }

  // ../../node_modules/css-tree/lib/syntax/node/TypeSelector.js
  var TypeSelector_exports = {};
  __export(TypeSelector_exports, {
    generate: () => generate38,
    name: () => name37,
    parse: () => parse38,
    structure: () => structure37
  });
  var ASTERISK5 = 42;
  var VERTICALLINE3 = 124;
  function eatIdentifierOrAsterisk() {
    if (this.tokenType !== Ident && this.isDelim(ASTERISK5) === false) {
      this.error("Identifier or asterisk is expected");
    }
    this.next();
  }
  var name37 = "TypeSelector";
  var structure37 = {
    name: String
  };
  function parse38() {
    const start = this.tokenStart;
    if (this.isDelim(VERTICALLINE3)) {
      this.next();
      eatIdentifierOrAsterisk.call(this);
    } else {
      eatIdentifierOrAsterisk.call(this);
      if (this.isDelim(VERTICALLINE3)) {
        this.next();
        eatIdentifierOrAsterisk.call(this);
      }
    }
    return {
      type: "TypeSelector",
      loc: this.getLocation(start, this.tokenStart),
      name: this.substrToCursor(start)
    };
  }
  function generate38(node) {
    this.tokenize(node.name);
  }

  // ../../node_modules/css-tree/lib/syntax/node/UnicodeRange.js
  var UnicodeRange_exports = {};
  __export(UnicodeRange_exports, {
    generate: () => generate39,
    name: () => name38,
    parse: () => parse39,
    structure: () => structure38
  });
  var PLUSSIGN8 = 43;
  var HYPHENMINUS6 = 45;
  var QUESTIONMARK3 = 63;
  function eatHexSequence(offset, allowDash) {
    let len = 0;
    for (let pos = this.tokenStart + offset; pos < this.tokenEnd; pos++) {
      const code2 = this.charCodeAt(pos);
      if (code2 === HYPHENMINUS6 && allowDash && len !== 0) {
        eatHexSequence.call(this, offset + len + 1, false);
        return -1;
      }
      if (!isHexDigit(code2)) {
        this.error(
          allowDash && len !== 0 ? "Hyphen minus" + (len < 6 ? " or hex digit" : "") + " is expected" : len < 6 ? "Hex digit is expected" : "Unexpected input",
          pos
        );
      }
      if (++len > 6) {
        this.error("Too many hex digits", pos);
      }
      ;
    }
    this.next();
    return len;
  }
  function eatQuestionMarkSequence(max2) {
    let count = 0;
    while (this.isDelim(QUESTIONMARK3)) {
      if (++count > max2) {
        this.error("Too many question marks");
      }
      this.next();
    }
  }
  function startsWith2(code2) {
    if (this.charCodeAt(this.tokenStart) !== code2) {
      this.error((code2 === PLUSSIGN8 ? "Plus sign" : "Hyphen minus") + " is expected");
    }
  }
  function scanUnicodeRange() {
    let hexLength = 0;
    switch (this.tokenType) {
      case Number2:
        hexLength = eatHexSequence.call(this, 1, true);
        if (this.isDelim(QUESTIONMARK3)) {
          eatQuestionMarkSequence.call(this, 6 - hexLength);
          break;
        }
        if (this.tokenType === Dimension || this.tokenType === Number2) {
          startsWith2.call(this, HYPHENMINUS6);
          eatHexSequence.call(this, 1, false);
          break;
        }
        break;
      case Dimension:
        hexLength = eatHexSequence.call(this, 1, true);
        if (hexLength > 0) {
          eatQuestionMarkSequence.call(this, 6 - hexLength);
        }
        break;
      default:
        this.eatDelim(PLUSSIGN8);
        if (this.tokenType === Ident) {
          hexLength = eatHexSequence.call(this, 0, true);
          if (hexLength > 0) {
            eatQuestionMarkSequence.call(this, 6 - hexLength);
          }
          break;
        }
        if (this.isDelim(QUESTIONMARK3)) {
          this.next();
          eatQuestionMarkSequence.call(this, 5);
          break;
        }
        this.error("Hex digit or question mark is expected");
    }
  }
  var name38 = "UnicodeRange";
  var structure38 = {
    value: String
  };
  function parse39() {
    const start = this.tokenStart;
    this.eatIdent("u");
    scanUnicodeRange.call(this);
    return {
      type: "UnicodeRange",
      loc: this.getLocation(start, this.tokenStart),
      value: this.substrToCursor(start)
    };
  }
  function generate39(node) {
    this.tokenize(node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/node/Url.js
  var Url_exports = {};
  __export(Url_exports, {
    generate: () => generate40,
    name: () => name39,
    parse: () => parse40,
    structure: () => structure39
  });

  // ../../node_modules/css-tree/lib/utils/url.js
  var SPACE3 = 32;
  var REVERSE_SOLIDUS2 = 92;
  var QUOTATION_MARK2 = 34;
  var APOSTROPHE3 = 39;
  var LEFTPARENTHESIS3 = 40;
  var RIGHTPARENTHESIS3 = 41;
  function decode2(str) {
    const len = str.length;
    let start = 4;
    let end = str.charCodeAt(len - 1) === RIGHTPARENTHESIS3 ? len - 2 : len - 1;
    let decoded = "";
    while (start < end && isWhiteSpace(str.charCodeAt(start))) {
      start++;
    }
    while (start < end && isWhiteSpace(str.charCodeAt(end))) {
      end--;
    }
    for (let i2 = start; i2 <= end; i2++) {
      let code2 = str.charCodeAt(i2);
      if (code2 === REVERSE_SOLIDUS2) {
        if (i2 === end) {
          if (i2 !== len - 1) {
            decoded = str.substr(i2 + 1);
          }
          break;
        }
        code2 = str.charCodeAt(++i2);
        if (isValidEscape(REVERSE_SOLIDUS2, code2)) {
          const escapeStart = i2 - 1;
          const escapeEnd = consumeEscaped(str, escapeStart);
          i2 = escapeEnd - 1;
          decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
        } else {
          if (code2 === 13 && str.charCodeAt(i2 + 1) === 10) {
            i2++;
          }
        }
      } else {
        decoded += str[i2];
      }
    }
    return decoded;
  }
  function encode2(str) {
    let encoded = "";
    let wsBeforeHexIsNeeded = false;
    for (let i2 = 0; i2 < str.length; i2++) {
      const code2 = str.charCodeAt(i2);
      if (code2 === 0) {
        encoded += "\uFFFD";
        continue;
      }
      if (code2 <= 31 || code2 === 127) {
        encoded += "\\" + code2.toString(16);
        wsBeforeHexIsNeeded = true;
        continue;
      }
      if (code2 === SPACE3 || code2 === REVERSE_SOLIDUS2 || code2 === QUOTATION_MARK2 || code2 === APOSTROPHE3 || code2 === LEFTPARENTHESIS3 || code2 === RIGHTPARENTHESIS3) {
        encoded += "\\" + str.charAt(i2);
        wsBeforeHexIsNeeded = false;
      } else {
        if (wsBeforeHexIsNeeded && isHexDigit(code2)) {
          encoded += " ";
        }
        encoded += str.charAt(i2);
        wsBeforeHexIsNeeded = false;
      }
    }
    return "url(" + encoded + ")";
  }

  // ../../node_modules/css-tree/lib/syntax/node/Url.js
  var name39 = "Url";
  var structure39 = {
    value: String
  };
  function parse40() {
    const start = this.tokenStart;
    let value2;
    switch (this.tokenType) {
      case Url:
        value2 = decode2(this.consume(Url));
        break;
      case Function2:
        if (!this.cmpStr(this.tokenStart, this.tokenEnd, "url(")) {
          this.error("Function name must be `url`");
        }
        this.eat(Function2);
        this.skipSC();
        value2 = decode(this.consume(String2));
        this.skipSC();
        if (!this.eof) {
          this.eat(RightParenthesis);
        }
        break;
      default:
        this.error("Url or Function is expected");
    }
    return {
      type: "Url",
      loc: this.getLocation(start, this.tokenStart),
      value: value2
    };
  }
  function generate40(node) {
    this.token(Url, encode2(node.value));
  }

  // ../../node_modules/css-tree/lib/syntax/node/Value.js
  var Value_exports = {};
  __export(Value_exports, {
    generate: () => generate41,
    name: () => name40,
    parse: () => parse41,
    structure: () => structure40
  });
  var name40 = "Value";
  var structure40 = {
    children: [[]]
  };
  function parse41() {
    const start = this.tokenStart;
    const children = this.readSequence(this.scope.Value);
    return {
      type: "Value",
      loc: this.getLocation(start, this.tokenStart),
      children
    };
  }
  function generate41(node) {
    this.children(node);
  }

  // ../../node_modules/css-tree/lib/syntax/node/WhiteSpace.js
  var WhiteSpace_exports = {};
  __export(WhiteSpace_exports, {
    generate: () => generate42,
    name: () => name41,
    parse: () => parse42,
    structure: () => structure41
  });
  var SPACE4 = Object.freeze({
    type: "WhiteSpace",
    loc: null,
    value: " "
  });
  var name41 = "WhiteSpace";
  var structure41 = {
    value: String
  };
  function parse42() {
    this.eat(WhiteSpace);
    return SPACE4;
  }
  function generate42(node) {
    this.token(WhiteSpace, node.value);
  }

  // ../../node_modules/css-tree/lib/syntax/config/lexer.js
  var lexer_default = {
    generic: true,
    ...data_default,
    node: node_exports
  };

  // ../../node_modules/css-tree/lib/syntax/scope/index.js
  var scope_exports = {};
  __export(scope_exports, {
    AtrulePrelude: () => atrulePrelude_default,
    Selector: () => selector_default,
    Value: () => value_default
  });

  // ../../node_modules/css-tree/lib/syntax/scope/default.js
  var NUMBERSIGN4 = 35;
  var ASTERISK6 = 42;
  var PLUSSIGN9 = 43;
  var HYPHENMINUS7 = 45;
  var SOLIDUS5 = 47;
  var U2 = 117;
  function defaultRecognizer(context) {
    switch (this.tokenType) {
      case Hash:
        return this.Hash();
      case Comma:
        return this.Operator();
      case LeftParenthesis:
        return this.Parentheses(this.readSequence, context.recognizer);
      case LeftSquareBracket:
        return this.Brackets(this.readSequence, context.recognizer);
      case String2:
        return this.String();
      case Dimension:
        return this.Dimension();
      case Percentage:
        return this.Percentage();
      case Number2:
        return this.Number();
      case Function2:
        return this.cmpStr(this.tokenStart, this.tokenEnd, "url(") ? this.Url() : this.Function(this.readSequence, context.recognizer);
      case Url:
        return this.Url();
      case Ident:
        if (this.cmpChar(this.tokenStart, U2) && this.cmpChar(this.tokenStart + 1, PLUSSIGN9)) {
          return this.UnicodeRange();
        } else {
          return this.Identifier();
        }
      case Delim: {
        const code2 = this.charCodeAt(this.tokenStart);
        if (code2 === SOLIDUS5 || code2 === ASTERISK6 || code2 === PLUSSIGN9 || code2 === HYPHENMINUS7) {
          return this.Operator();
        }
        if (code2 === NUMBERSIGN4) {
          this.error("Hex or identifier is expected", this.tokenStart + 1);
        }
        break;
      }
    }
  }

  // ../../node_modules/css-tree/lib/syntax/scope/atrulePrelude.js
  var atrulePrelude_default = {
    getNode: defaultRecognizer
  };

  // ../../node_modules/css-tree/lib/syntax/scope/selector.js
  var NUMBERSIGN5 = 35;
  var AMPERSAND6 = 38;
  var ASTERISK7 = 42;
  var PLUSSIGN10 = 43;
  var SOLIDUS6 = 47;
  var FULLSTOP3 = 46;
  var GREATERTHANSIGN3 = 62;
  var VERTICALLINE4 = 124;
  var TILDE3 = 126;
  function onWhiteSpace(next, children) {
    if (children.last !== null && children.last.type !== "Combinator" && next !== null && next.type !== "Combinator") {
      children.push({
        // FIXME: this.Combinator() should be used instead
        type: "Combinator",
        loc: null,
        name: " "
      });
    }
  }
  function getNode() {
    switch (this.tokenType) {
      case LeftSquareBracket:
        return this.AttributeSelector();
      case Hash:
        return this.IdSelector();
      case Colon:
        if (this.lookupType(1) === Colon) {
          return this.PseudoElementSelector();
        } else {
          return this.PseudoClassSelector();
        }
      case Ident:
        return this.TypeSelector();
      case Number2:
      case Percentage:
        return this.Percentage();
      case Dimension:
        if (this.charCodeAt(this.tokenStart) === FULLSTOP3) {
          this.error("Identifier is expected", this.tokenStart + 1);
        }
        break;
      case Delim: {
        const code2 = this.charCodeAt(this.tokenStart);
        switch (code2) {
          case PLUSSIGN10:
          case GREATERTHANSIGN3:
          case TILDE3:
          case SOLIDUS6:
            return this.Combinator();
          case FULLSTOP3:
            return this.ClassSelector();
          case ASTERISK7:
          case VERTICALLINE4:
            return this.TypeSelector();
          case NUMBERSIGN5:
            return this.IdSelector();
          case AMPERSAND6:
            return this.NestingSelector();
        }
        break;
      }
    }
  }
  var selector_default = {
    onWhiteSpace,
    getNode
  };

  // ../../node_modules/css-tree/lib/syntax/function/expression.js
  function expression_default() {
    return this.createSingleNodeList(
      this.Raw(this.tokenIndex, null, false)
    );
  }

  // ../../node_modules/css-tree/lib/syntax/function/var.js
  function var_default() {
    const children = this.createList();
    this.skipSC();
    children.push(this.Identifier());
    this.skipSC();
    if (this.tokenType === Comma) {
      children.push(this.Operator());
      const startIndex = this.tokenIndex;
      const value2 = this.parseCustomProperty ? this.Value(null) : this.Raw(this.tokenIndex, this.consumeUntilExclamationMarkOrSemicolon, false);
      if (value2.type === "Value" && value2.children.isEmpty) {
        for (let offset = startIndex - this.tokenIndex; offset <= 0; offset++) {
          if (this.lookupType(offset) === WhiteSpace) {
            value2.children.appendData({
              type: "WhiteSpace",
              loc: null,
              value: " "
            });
            break;
          }
        }
      }
      children.push(value2);
    }
    return children;
  }

  // ../../node_modules/css-tree/lib/syntax/scope/value.js
  function isPlusMinusOperator(node) {
    return node !== null && node.type === "Operator" && (node.value[node.value.length - 1] === "-" || node.value[node.value.length - 1] === "+");
  }
  var value_default = {
    getNode: defaultRecognizer,
    onWhiteSpace(next, children) {
      if (isPlusMinusOperator(next)) {
        next.value = " " + next.value;
      }
      if (isPlusMinusOperator(children.last)) {
        children.last.value += " ";
      }
    },
    "expression": expression_default,
    "var": var_default
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/font-face.js
  var font_face_default = {
    parse: {
      prelude: null,
      block() {
        return this.Block(true);
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/import.js
  var import_default3 = {
    parse: {
      prelude() {
        const children = this.createList();
        this.skipSC();
        switch (this.tokenType) {
          case String2:
            children.push(this.String());
            break;
          case Url:
          case Function2:
            children.push(this.Url());
            break;
          default:
            this.error("String or url() is expected");
        }
        if (this.lookupNonWSType(0) === Ident || this.lookupNonWSType(0) === LeftParenthesis) {
          children.push(this.MediaQueryList());
        }
        return children;
      },
      block: null
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/media.js
  var media_default = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.MediaQueryList()
        );
      },
      block(isStyleBlock = false) {
        return this.Block(isStyleBlock);
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/nest.js
  var nest_default = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.SelectorList()
        );
      },
      block() {
        return this.Block(true);
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/page.js
  var page_default = {
    parse: {
      prelude() {
        return this.createSingleNodeList(
          this.SelectorList()
        );
      },
      block() {
        return this.Block(true);
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/supports.js
  function consumeRaw6() {
    return this.createSingleNodeList(
      this.Raw(this.tokenIndex, null, false)
    );
  }
  function parentheses() {
    this.skipSC();
    if (this.tokenType === Ident && this.lookupNonWSType(1) === Colon) {
      return this.createSingleNodeList(
        this.Declaration()
      );
    }
    return readSequence2.call(this);
  }
  function readSequence2() {
    const children = this.createList();
    let child;
    this.skipSC();
    scan:
      while (!this.eof) {
        switch (this.tokenType) {
          case Comment:
          case WhiteSpace:
            this.next();
            continue;
          case Function2:
            child = this.Function(consumeRaw6, this.scope.AtrulePrelude);
            break;
          case Ident:
            child = this.Identifier();
            break;
          case LeftParenthesis:
            child = this.Parentheses(parentheses, this.scope.AtrulePrelude);
            break;
          default:
            break scan;
        }
        children.push(child);
      }
    return children;
  }
  var supports_default = {
    parse: {
      prelude() {
        const children = readSequence2.call(this);
        if (this.getFirstListNode(children) === null) {
          this.error("Condition is expected");
        }
        return children;
      },
      block(isStyleBlock = false) {
        return this.Block(isStyleBlock);
      }
    }
  };

  // ../../node_modules/css-tree/lib/syntax/atrule/index.js
  var atrule_default = {
    "font-face": font_face_default,
    "import": import_default3,
    media: media_default,
    nest: nest_default,
    page: page_default,
    supports: supports_default
  };

  // ../../node_modules/css-tree/lib/syntax/pseudo/index.js
  var selectorList = {
    parse() {
      return this.createSingleNodeList(
        this.SelectorList()
      );
    }
  };
  var selector = {
    parse() {
      return this.createSingleNodeList(
        this.Selector()
      );
    }
  };
  var identList = {
    parse() {
      return this.createSingleNodeList(
        this.Identifier()
      );
    }
  };
  var nth3 = {
    parse() {
      return this.createSingleNodeList(
        this.Nth()
      );
    }
  };
  var pseudo_default = {
    "dir": identList,
    "has": selectorList,
    "lang": identList,
    "matches": selectorList,
    "is": selectorList,
    "-moz-any": selectorList,
    "-webkit-any": selectorList,
    "where": selectorList,
    "not": selectorList,
    "nth-child": nth3,
    "nth-last-child": nth3,
    "nth-last-of-type": nth3,
    "nth-of-type": nth3,
    "slotted": selector,
    "host": selector,
    "host-context": selector
  };

  // ../../node_modules/css-tree/lib/syntax/node/index-parse.js
  var index_parse_exports = {};
  __export(index_parse_exports, {
    AnPlusB: () => parse2,
    Atrule: () => parse3,
    AtrulePrelude: () => parse4,
    AttributeSelector: () => parse5,
    Block: () => parse6,
    Brackets: () => parse7,
    CDC: () => parse8,
    CDO: () => parse9,
    ClassSelector: () => parse10,
    Combinator: () => parse11,
    Comment: () => parse12,
    Declaration: () => parse13,
    DeclarationList: () => parse14,
    Dimension: () => parse15,
    Function: () => parse16,
    Hash: () => parse17,
    IdSelector: () => parse19,
    Identifier: () => parse18,
    MediaFeature: () => parse20,
    MediaQuery: () => parse21,
    MediaQueryList: () => parse22,
    NestingSelector: () => parse23,
    Nth: () => parse24,
    Number: () => parse25,
    Operator: () => parse26,
    Parentheses: () => parse27,
    Percentage: () => parse28,
    PseudoClassSelector: () => parse29,
    PseudoElementSelector: () => parse30,
    Ratio: () => parse31,
    Raw: () => parse32,
    Rule: () => parse33,
    Selector: () => parse34,
    SelectorList: () => parse35,
    String: () => parse36,
    StyleSheet: () => parse37,
    TypeSelector: () => parse38,
    UnicodeRange: () => parse39,
    Url: () => parse40,
    Value: () => parse41,
    WhiteSpace: () => parse42
  });

  // ../../node_modules/css-tree/lib/syntax/config/parser.js
  var parser_default = {
    parseContext: {
      default: "StyleSheet",
      stylesheet: "StyleSheet",
      atrule: "Atrule",
      atrulePrelude(options) {
        return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
      },
      mediaQueryList: "MediaQueryList",
      mediaQuery: "MediaQuery",
      rule: "Rule",
      selectorList: "SelectorList",
      selector: "Selector",
      block() {
        return this.Block(true);
      },
      declarationList: "DeclarationList",
      declaration: "Declaration",
      value: "Value"
    },
    scope: scope_exports,
    atrule: atrule_default,
    pseudo: pseudo_default,
    node: index_parse_exports
  };

  // ../../node_modules/css-tree/lib/syntax/config/walker.js
  var walker_default = {
    node: node_exports
  };

  // ../../node_modules/css-tree/lib/syntax/index.js
  var syntax_default = create_default({
    ...lexer_default,
    ...parser_default,
    ...walker_default
  });

  // ../../node_modules/css-tree/lib/index.js
  var {
    tokenize: tokenize2,
    parse: parse43,
    generate: generate43,
    lexer,
    createLexer,
    walk: walk2,
    find: find2,
    findLast,
    findAll,
    toPlainObject,
    fromPlainObject,
    fork
  } = syntax_default;

  // ../../node_modules/rescript/lib/es6/belt_Array.js
  function get3(arr, i2) {
    if (i2 >= 0 && i2 < arr.length) {
      return some(arr[i2]);
    }
  }
  function mapU(a, f2) {
    var l = a.length;
    var r = new Array(l);
    for (var i2 = 0; i2 < l; ++i2) {
      r[i2] = f2(a[i2]);
    }
    return r;
  }
  function map7(a, f2) {
    return mapU(a, __1(f2));
  }
  function keepU(a, f2) {
    var l = a.length;
    var r = new Array(l);
    var j = 0;
    for (var i2 = 0; i2 < l; ++i2) {
      var v = a[i2];
      if (f2(v)) {
        r[j] = v;
        j = j + 1 | 0;
      }
    }
    r.length = j;
    return r;
  }
  function keep(a, f2) {
    return keepU(a, __1(f2));
  }

  // ../../node_modules/rescript/lib/es6/belt_List.js
  function head(x) {
    if (x) {
      return some(x.hd);
    }
  }
  function tail(x) {
    if (x) {
      return x.tl;
    }
  }
  function copyAuxWithMap(_cellX, _prec, f2) {
    while (true) {
      var prec = _prec;
      var cellX = _cellX;
      if (!cellX) {
        return;
      }
      var next = {
        hd: f2(cellX.hd),
        tl: (
          /* [] */
          0
        )
      };
      prec.tl = next;
      _prec = next;
      _cellX = cellX.tl;
      continue;
    }
    ;
  }
  function mapU2(xs, f2) {
    if (!xs) {
      return (
        /* [] */
        0
      );
    }
    var cell = {
      hd: f2(xs.hd),
      tl: (
        /* [] */
        0
      )
    };
    copyAuxWithMap(xs.tl, cell, f2);
    return cell;
  }
  function map8(xs, f2) {
    return mapU2(xs, __1(f2));
  }
  function fromArray(a) {
    var _i = a.length - 1 | 0;
    var _res = (
      /* [] */
      0
    );
    while (true) {
      var res = _res;
      var i2 = _i;
      if (i2 < 0) {
        return res;
      }
      _res = {
        hd: a[i2],
        tl: res
      };
      _i = i2 - 1 | 0;
      continue;
    }
    ;
  }

  // ../../node_modules/rescript/lib/es6/belt_Option.js
  function getExn(x) {
    if (x !== void 0) {
      return valFromOption(x);
    }
    throw {
      RE_EXN_ID: "Not_found",
      Error: new Error()
    };
  }
  function mapU3(opt, f2) {
    if (opt !== void 0) {
      return some(f2(valFromOption(opt)));
    }
  }
  function map9(opt, f2) {
    return mapU3(opt, __1(f2));
  }
  function flatMapU(opt, f2) {
    if (opt !== void 0) {
      return f2(valFromOption(opt));
    }
  }
  function flatMap(opt, f2) {
    return flatMapU(opt, __1(f2));
  }
  function getWithDefault(opt, $$default) {
    if (opt !== void 0) {
      return valFromOption(opt);
    } else {
      return $$default;
    }
  }

  // ../../node_modules/rescript/lib/es6/js_null_undefined.js
  function bind3(x, f2) {
    if (x == null) {
      return x;
    } else {
      return f2(x);
    }
  }

  // lib/es6/src/main/re/css/cssTree.mjs
  function parseStyles(declarationArray) {
    return fromArray(values(fromList(map8(fromArray(map7(declarationArray, function(x) {
      var tmp;
      try {
        var ast = parse43(x.value.value, {
          context: "value"
        });
        var values2 = map7(toPlainObject(ast).children, function(v) {
          var s = generate43(fromPlainObject(v));
          if (s.charAt(0) === '"' && s.charAt(s.length - 1 | 0) === '"') {
            return s.slice(1, s.length - 1 | 0);
          } else {
            return s;
          }
        });
        if (x.important) {
          values2.push("!important");
        }
        tmp = fromArray(values2);
      } catch (raw_exn) {
        var exn = internalToOCamlException(raw_exn);
        if (exn.RE_EXN_ID === $$Error$1) {
          tmp = {
            hd: x.value.value,
            tl: (
              /* [] */
              0
            )
          };
        } else {
          throw exn;
        }
      }
      return {
        TAG: "Declaration",
        _0: {
          TAG: "Property",
          _0: x.property
        },
        _1: {
          TAG: "Value",
          _0: tmp
        }
      };
    })), function(x) {
      return [
        x._0._0,
        x
      ];
    }))));
  }
  function parseTag(str) {
    return fromArray(map7(keep(toPlainObject(parse43(str, {
      parseAtrulePrelude: false,
      parseRulePrelude: false,
      parseValue: false
    })).children, function(a) {
      if (a.type === "Atrule") {
        return true;
      } else {
        return a.type === "Rule";
      }
    }), function(a) {
      if (a.type === "Rule") {
        var preludeValue = getWithDefault(nullable_to_opt(bind3(a.prelude, function(x) {
          return x.value;
        })), "");
        return {
          TAG: "Rule",
          _0: {
            TAG: "Selector",
            _0: fromArray(map7(preludeValue.split(","), function(prim) {
              return prim.trim();
            }))
          },
          _1: parseStyles(a.block.children)
        };
      }
      if (a.name !== "list") {
        var preludeValue$1 = getWithDefault(nullable_to_opt(bind3(a.prelude, function(x) {
          return x.value;
        })), "");
        return {
          TAG: "AtRule",
          _0: a.name + preludeValue$1,
          _1: parseStyles(a.block.children)
        };
      }
      var preludeValue$2 = getWithDefault(nullable_to_opt(bind3(a.prelude, function(x) {
        return x.value;
      })), "");
      var listDef = fromArray(preludeValue$2.split(" "));
      var lfo = flatMap(tail(listDef), head);
      var listTypeLevelDef = map9(head(listDef), function(str2) {
        return str2.split(":");
      });
      var listTypeDef = getExn(flatMap(listTypeLevelDef, function(x) {
        return map9(get3(x, 0), function(str2) {
          return {
            TAG: "ListTypeDef",
            _0: str2
          };
        });
      }));
      var listLevelDef = flatMap(listTypeLevelDef, function(x) {
        return map9(get3(x, 1), function(str2) {
          return {
            TAG: "ListLevelDef",
            _0: parseLevel(str2)
          };
        });
      });
      var styles = parseStyles(a.block.children);
      return {
        TAG: "ListRule",
        _0: listTypeDef,
        _1: listLevelDef,
        _2: lfo,
        _3: styles
      };
    }));
  }
  function parseAttribute(str) {
    var declarationList = toPlainObject(parse43(str.replace(/&quot;/g, '"'), {
      parseAtrulePrelude: false,
      parseRulePrelude: false,
      parseValue: false,
      context: "declarationList"
    }));
    return parseStyles(declarationList.children);
  }

  // lib/es6/src/main/re/css/easyCss.mjs
  function extractStyleAttribute(lst) {
    var parseStyles2 = function(param) {
      return parseAttribute(param[1]);
    };
    var predicate = function(param) {
      return equal2(param[0], "style");
    };
    var match = partition(predicate)(lst);
    var parsedStyles = flatten(map3(parseStyles2, match[0]));
    return [
      parsedStyles,
      match[1]
    ];
  }
  var parseTag2 = parseTag;

  // ../../node_modules/rescript/lib/es6/set.js
  function Make(funarg) {
    var height = function(param) {
      if (typeof param !== "object") {
        return 0;
      } else {
        return param.h;
      }
    };
    var create6 = function(l, v, r) {
      var hl;
      hl = typeof l !== "object" ? 0 : l.h;
      var hr;
      hr = typeof r !== "object" ? 0 : r.h;
      return {
        TAG: "Node",
        l,
        v,
        r,
        h: hl >= hr ? hl + 1 | 0 : hr + 1 | 0
      };
    };
    var bal = function(l, v, r) {
      var hl;
      hl = typeof l !== "object" ? 0 : l.h;
      var hr;
      hr = typeof r !== "object" ? 0 : r.h;
      if (hl > (hr + 2 | 0)) {
        if (typeof l !== "object") {
          throw {
            RE_EXN_ID: "Invalid_argument",
            _1: "Set.bal",
            Error: new Error()
          };
        }
        var lr = l.r;
        var lv = l.v;
        var ll = l.l;
        if (height(ll) >= height(lr)) {
          return create6(ll, lv, create6(lr, v, r));
        }
        if (typeof lr === "object") {
          return create6(create6(ll, lv, lr.l), lr.v, create6(lr.r, v, r));
        }
        throw {
          RE_EXN_ID: "Invalid_argument",
          _1: "Set.bal",
          Error: new Error()
        };
      }
      if (hr <= (hl + 2 | 0)) {
        return {
          TAG: "Node",
          l,
          v,
          r,
          h: hl >= hr ? hl + 1 | 0 : hr + 1 | 0
        };
      }
      if (typeof r !== "object") {
        throw {
          RE_EXN_ID: "Invalid_argument",
          _1: "Set.bal",
          Error: new Error()
        };
      }
      var rr = r.r;
      var rv = r.v;
      var rl = r.l;
      if (height(rr) >= height(rl)) {
        return create6(create6(l, v, rl), rv, rr);
      }
      if (typeof rl === "object") {
        return create6(create6(l, v, rl.l), rl.v, create6(rl.r, rv, rr));
      }
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Set.bal",
        Error: new Error()
      };
    };
    var add3 = function(x, param) {
      if (typeof param !== "object") {
        return {
          TAG: "Node",
          l: "Empty",
          v: x,
          r: "Empty",
          h: 1
        };
      }
      var r = param.r;
      var v = param.v;
      var l = param.l;
      var c = _2(funarg.compare, x, v);
      if (c === 0) {
        return param;
      }
      if (c < 0) {
        var ll = add3(x, l);
        if (l === ll) {
          return param;
        } else {
          return bal(ll, v, r);
        }
      }
      var rr = add3(x, r);
      if (r === rr) {
        return param;
      } else {
        return bal(l, v, rr);
      }
    };
    var singleton = function(x) {
      return {
        TAG: "Node",
        l: "Empty",
        v: x,
        r: "Empty",
        h: 1
      };
    };
    var add_min_element = function(x, param) {
      if (typeof param !== "object") {
        return singleton(x);
      } else {
        return bal(add_min_element(x, param.l), param.v, param.r);
      }
    };
    var add_max_element = function(x, param) {
      if (typeof param !== "object") {
        return singleton(x);
      } else {
        return bal(param.l, param.v, add_max_element(x, param.r));
      }
    };
    var join = function(l, v, r) {
      if (typeof l !== "object") {
        return add_min_element(v, r);
      }
      var lh = l.h;
      if (typeof r !== "object") {
        return add_max_element(v, l);
      }
      var rh = r.h;
      if (lh > (rh + 2 | 0)) {
        return bal(l.l, l.v, join(l.r, v, r));
      } else if (rh > (lh + 2 | 0)) {
        return bal(join(l, v, r.l), r.v, r.r);
      } else {
        return create6(l, v, r);
      }
    };
    var min_elt = function(_param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var l = param.l;
        if (typeof l !== "object") {
          return param.v;
        }
        _param = l;
        continue;
      }
      ;
    };
    var min_elt_opt = function(_param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var l = param.l;
        if (typeof l !== "object") {
          return some(param.v);
        }
        _param = l;
        continue;
      }
      ;
    };
    var max_elt = function(_param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var r = param.r;
        if (typeof r !== "object") {
          return param.v;
        }
        _param = r;
        continue;
      }
      ;
    };
    var max_elt_opt = function(_param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var r = param.r;
        if (typeof r !== "object") {
          return some(param.v);
        }
        _param = r;
        continue;
      }
      ;
    };
    var remove_min_elt = function(param) {
      if (typeof param !== "object") {
        throw {
          RE_EXN_ID: "Invalid_argument",
          _1: "Set.remove_min_elt",
          Error: new Error()
        };
      }
      var l = param.l;
      if (typeof l !== "object") {
        return param.r;
      } else {
        return bal(remove_min_elt(l), param.v, param.r);
      }
    };
    var concat6 = function(t1, t2) {
      if (typeof t1 !== "object") {
        return t2;
      } else if (typeof t2 !== "object") {
        return t1;
      } else {
        return join(t1, min_elt(t2), remove_min_elt(t2));
      }
    };
    var split4 = function(x, param) {
      if (typeof param !== "object") {
        return [
          "Empty",
          false,
          "Empty"
        ];
      }
      var r = param.r;
      var v = param.v;
      var l = param.l;
      var c = _2(funarg.compare, x, v);
      if (c === 0) {
        return [
          l,
          true,
          r
        ];
      }
      if (c < 0) {
        var match = split4(x, l);
        return [
          match[0],
          match[1],
          join(match[2], v, r)
        ];
      }
      var match$1 = split4(x, r);
      return [
        join(l, v, match$1[0]),
        match$1[1],
        match$1[2]
      ];
    };
    var is_empty = function(param) {
      if (typeof param !== "object") {
        return true;
      } else {
        return false;
      }
    };
    var mem3 = function(x, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return false;
        }
        var c = _2(funarg.compare, x, param.v);
        if (c === 0) {
          return true;
        }
        _param = c < 0 ? param.l : param.r;
        continue;
      }
      ;
    };
    var remove = function(x, param) {
      if (typeof param !== "object") {
        return "Empty";
      }
      var r = param.r;
      var v = param.v;
      var l = param.l;
      var c = _2(funarg.compare, x, v);
      if (c === 0) {
        if (typeof l !== "object") {
          return r;
        } else if (typeof r !== "object") {
          return l;
        } else {
          return bal(l, min_elt(r), remove_min_elt(r));
        }
      }
      if (c < 0) {
        var ll = remove(x, l);
        if (l === ll) {
          return param;
        } else {
          return bal(ll, v, r);
        }
      }
      var rr = remove(x, r);
      if (r === rr) {
        return param;
      } else {
        return bal(l, v, rr);
      }
    };
    var union = function(s1, s2) {
      if (typeof s1 !== "object") {
        return s2;
      }
      var h1 = s1.h;
      var v1 = s1.v;
      if (typeof s2 !== "object") {
        return s1;
      }
      var h2 = s2.h;
      var v2 = s2.v;
      if (h1 >= h2) {
        if (h2 === 1) {
          return add3(v2, s1);
        }
        var match = split4(v1, s2);
        return join(union(s1.l, match[0]), v1, union(s1.r, match[2]));
      }
      if (h1 === 1) {
        return add3(v1, s2);
      }
      var match$1 = split4(v2, s1);
      return join(union(match$1[0], s2.l), v2, union(match$1[2], s2.r));
    };
    var inter = function(s1, s2) {
      if (typeof s1 !== "object") {
        return "Empty";
      }
      if (typeof s2 !== "object") {
        return "Empty";
      }
      var r1 = s1.r;
      var v1 = s1.v;
      var l1 = s1.l;
      var match = split4(v1, s2);
      var l2 = match[0];
      if (match[1]) {
        return join(inter(l1, l2), v1, inter(r1, match[2]));
      } else {
        return concat6(inter(l1, l2), inter(r1, match[2]));
      }
    };
    var diff = function(s1, s2) {
      if (typeof s1 !== "object") {
        return "Empty";
      }
      if (typeof s2 !== "object") {
        return s1;
      }
      var r1 = s1.r;
      var v1 = s1.v;
      var l1 = s1.l;
      var match = split4(v1, s2);
      var l2 = match[0];
      if (match[1]) {
        return concat6(diff(l1, l2), diff(r1, match[2]));
      } else {
        return join(diff(l1, l2), v1, diff(r1, match[2]));
      }
    };
    var cons_enum = function(_s, _e) {
      while (true) {
        var e = _e;
        var s = _s;
        if (typeof s !== "object") {
          return e;
        }
        _e = {
          TAG: "More",
          _0: s.v,
          _1: s.r,
          _2: e
        };
        _s = s.l;
        continue;
      }
      ;
    };
    var compare5 = function(s1, s2) {
      var _e1 = cons_enum(s1, "End");
      var _e2 = cons_enum(s2, "End");
      while (true) {
        var e2 = _e2;
        var e1 = _e1;
        if (typeof e1 !== "object") {
          if (typeof e2 !== "object") {
            return 0;
          } else {
            return -1;
          }
        }
        if (typeof e2 !== "object") {
          return 1;
        }
        var c = _2(funarg.compare, e1._0, e2._0);
        if (c !== 0) {
          return c;
        }
        _e2 = cons_enum(e2._1, e2._2);
        _e1 = cons_enum(e1._1, e1._2);
        continue;
      }
      ;
    };
    var equal5 = function(s1, s2) {
      return compare5(s1, s2) === 0;
    };
    var subset = function(_s1, _s2) {
      while (true) {
        var s2 = _s2;
        var s1 = _s1;
        if (typeof s1 !== "object") {
          return true;
        }
        var r1 = s1.r;
        var v1 = s1.v;
        var l1 = s1.l;
        if (typeof s2 !== "object") {
          return false;
        }
        var r2 = s2.r;
        var l2 = s2.l;
        var c = _2(funarg.compare, v1, s2.v);
        if (c === 0) {
          if (!subset(l1, l2)) {
            return false;
          }
          _s2 = r2;
          _s1 = r1;
          continue;
        }
        if (c < 0) {
          if (!subset({
            TAG: "Node",
            l: l1,
            v: v1,
            r: "Empty",
            h: 0
          }, l2)) {
            return false;
          }
          _s1 = r1;
          continue;
        }
        if (!subset({
          TAG: "Node",
          l: "Empty",
          v: v1,
          r: r1,
          h: 0
        }, r2)) {
          return false;
        }
        _s1 = l1;
        continue;
      }
      ;
    };
    var iter6 = function(f2, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        iter6(f2, param.l);
        _1(f2, param.v);
        _param = param.r;
        continue;
      }
      ;
    };
    var fold = function(f2, _s, _accu) {
      while (true) {
        var accu = _accu;
        var s = _s;
        if (typeof s !== "object") {
          return accu;
        }
        _accu = _2(f2, s.v, fold(f2, s.l, accu));
        _s = s.r;
        continue;
      }
      ;
    };
    var for_all4 = function(p, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return true;
        }
        if (!_1(p, param.v)) {
          return false;
        }
        if (!for_all4(p, param.l)) {
          return false;
        }
        _param = param.r;
        continue;
      }
      ;
    };
    var exists4 = function(p, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return false;
        }
        if (_1(p, param.v)) {
          return true;
        }
        if (exists4(p, param.l)) {
          return true;
        }
        _param = param.r;
        continue;
      }
      ;
    };
    var filter3 = function(p, param) {
      if (typeof param !== "object") {
        return "Empty";
      }
      var r = param.r;
      var v = param.v;
      var l = param.l;
      var l$p = filter3(p, l);
      var pv = _1(p, v);
      var r$p = filter3(p, r);
      if (pv) {
        if (l === l$p && r === r$p) {
          return param;
        } else {
          return join(l$p, v, r$p);
        }
      } else {
        return concat6(l$p, r$p);
      }
    };
    var partition2 = function(p, param) {
      if (typeof param !== "object") {
        return [
          "Empty",
          "Empty"
        ];
      }
      var v = param.v;
      var match = partition2(p, param.l);
      var lf = match[1];
      var lt = match[0];
      var pv = _1(p, v);
      var match$1 = partition2(p, param.r);
      var rf = match$1[1];
      var rt = match$1[0];
      if (pv) {
        return [
          join(lt, v, rt),
          concat6(lf, rf)
        ];
      } else {
        return [
          concat6(lt, rt),
          join(lf, v, rf)
        ];
      }
    };
    var cardinal = function(param) {
      if (typeof param !== "object") {
        return 0;
      } else {
        return (cardinal(param.l) + 1 | 0) + cardinal(param.r) | 0;
      }
    };
    var elements_aux = function(_accu, _param) {
      while (true) {
        var param = _param;
        var accu = _accu;
        if (typeof param !== "object") {
          return accu;
        }
        _param = param.l;
        _accu = {
          hd: param.v,
          tl: elements_aux(accu, param.r)
        };
        continue;
      }
      ;
    };
    var elements = function(s) {
      return elements_aux(
        /* [] */
        0,
        s
      );
    };
    var find4 = function(x, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var v = param.v;
        var c = _2(funarg.compare, x, v);
        if (c === 0) {
          return v;
        }
        _param = c < 0 ? param.l : param.r;
        continue;
      }
      ;
    };
    var find_first = function(f2, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var v = param.v;
        if (_1(f2, v)) {
          var _v0 = v;
          var _param$1 = param.l;
          while (true) {
            var param$1 = _param$1;
            var v0 = _v0;
            if (typeof param$1 !== "object") {
              return v0;
            }
            var v$1 = param$1.v;
            if (_1(f2, v$1)) {
              _param$1 = param$1.l;
              _v0 = v$1;
              continue;
            }
            _param$1 = param$1.r;
            continue;
          }
          ;
        }
        _param = param.r;
        continue;
      }
      ;
    };
    var find_first_opt = function(f2, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var v = param.v;
        if (_1(f2, v)) {
          var _v0 = v;
          var _param$1 = param.l;
          while (true) {
            var param$1 = _param$1;
            var v0 = _v0;
            if (typeof param$1 !== "object") {
              return some(v0);
            }
            var v$1 = param$1.v;
            if (_1(f2, v$1)) {
              _param$1 = param$1.l;
              _v0 = v$1;
              continue;
            }
            _param$1 = param$1.r;
            continue;
          }
          ;
        }
        _param = param.r;
        continue;
      }
      ;
    };
    var find_last = function(f2, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var v = param.v;
        if (_1(f2, v)) {
          var _v0 = v;
          var _param$1 = param.r;
          while (true) {
            var param$1 = _param$1;
            var v0 = _v0;
            if (typeof param$1 !== "object") {
              return v0;
            }
            var v$1 = param$1.v;
            if (_1(f2, v$1)) {
              _param$1 = param$1.r;
              _v0 = v$1;
              continue;
            }
            _param$1 = param$1.l;
            continue;
          }
          ;
        }
        _param = param.l;
        continue;
      }
      ;
    };
    var find_last_opt = function(f2, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var v = param.v;
        if (_1(f2, v)) {
          var _v0 = v;
          var _param$1 = param.r;
          while (true) {
            var param$1 = _param$1;
            var v0 = _v0;
            if (typeof param$1 !== "object") {
              return some(v0);
            }
            var v$1 = param$1.v;
            if (_1(f2, v$1)) {
              _param$1 = param$1.r;
              _v0 = v$1;
              continue;
            }
            _param$1 = param$1.l;
            continue;
          }
          ;
        }
        _param = param.l;
        continue;
      }
      ;
    };
    var find_opt3 = function(x, _param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var v = param.v;
        var c = _2(funarg.compare, x, v);
        if (c === 0) {
          return some(v);
        }
        _param = c < 0 ? param.l : param.r;
        continue;
      }
      ;
    };
    var map11 = function(f2, param) {
      if (typeof param !== "object") {
        return "Empty";
      }
      var r = param.r;
      var v = param.v;
      var l = param.l;
      var l$p = map11(f2, l);
      var v$p = _1(f2, v);
      var r$p = map11(f2, r);
      if (l === l$p && v === v$p && r === r$p) {
        return param;
      } else if ((l$p === "Empty" || _2(funarg.compare, max_elt(l$p), v$p) < 0) && (r$p === "Empty" || _2(funarg.compare, v$p, min_elt(r$p)) < 0)) {
        return join(l$p, v$p, r$p);
      } else {
        return union(l$p, add3(v$p, r$p));
      }
    };
    var of_list2 = function(l) {
      if (!l) {
        return "Empty";
      }
      var match = l.tl;
      var x0 = l.hd;
      if (!match) {
        return singleton(x0);
      }
      var match$1 = match.tl;
      var x1 = match.hd;
      if (!match$1) {
        return add3(x1, singleton(x0));
      }
      var match$2 = match$1.tl;
      var x2 = match$1.hd;
      if (!match$2) {
        return add3(x2, add3(x1, singleton(x0)));
      }
      var match$3 = match$2.tl;
      var x3 = match$2.hd;
      if (match$3) {
        if (match$3.tl) {
          var l$1 = sort_uniq(funarg.compare, l);
          var sub7 = function(n, l2) {
            switch (n) {
              case 0:
                return [
                  "Empty",
                  l2
                ];
              case 1:
                if (l2) {
                  return [
                    {
                      TAG: "Node",
                      l: "Empty",
                      v: l2.hd,
                      r: "Empty",
                      h: 1
                    },
                    l2.tl
                  ];
                }
                break;
              case 2:
                if (l2) {
                  var match2 = l2.tl;
                  if (match2) {
                    return [
                      {
                        TAG: "Node",
                        l: {
                          TAG: "Node",
                          l: "Empty",
                          v: l2.hd,
                          r: "Empty",
                          h: 1
                        },
                        v: match2.hd,
                        r: "Empty",
                        h: 2
                      },
                      match2.tl
                    ];
                  }
                }
                break;
              case 3:
                if (l2) {
                  var match$12 = l2.tl;
                  if (match$12) {
                    var match$22 = match$12.tl;
                    if (match$22) {
                      return [
                        {
                          TAG: "Node",
                          l: {
                            TAG: "Node",
                            l: "Empty",
                            v: l2.hd,
                            r: "Empty",
                            h: 1
                          },
                          v: match$12.hd,
                          r: {
                            TAG: "Node",
                            l: "Empty",
                            v: match$22.hd,
                            r: "Empty",
                            h: 1
                          },
                          h: 2
                        },
                        match$22.tl
                      ];
                    }
                  }
                }
                break;
              default:
            }
            var nl = n / 2 | 0;
            var match$32 = sub7(nl, l2);
            var l$12 = match$32[1];
            if (l$12) {
              var match$4 = sub7((n - nl | 0) - 1 | 0, l$12.tl);
              return [
                create6(match$32[0], l$12.hd, match$4[0]),
                match$4[1]
              ];
            }
            throw {
              RE_EXN_ID: "Assert_failure",
              _1: [
                "set.res",
                691,
                20
              ],
              Error: new Error()
            };
          };
          return sub7(length(l$1), l$1)[0];
        } else {
          return add3(match$3.hd, add3(x3, add3(x2, add3(x1, singleton(x0)))));
        }
      } else {
        return add3(x3, add3(x2, add3(x1, singleton(x0))));
      }
    };
    return {
      empty: "Empty",
      is_empty,
      mem: mem3,
      add: add3,
      singleton,
      remove,
      union,
      inter,
      diff,
      compare: compare5,
      equal: equal5,
      subset,
      iter: iter6,
      map: map11,
      fold,
      for_all: for_all4,
      exists: exists4,
      filter: filter3,
      partition: partition2,
      cardinal,
      elements,
      min_elt,
      min_elt_opt,
      max_elt,
      max_elt_opt,
      choose: min_elt,
      choose_opt: min_elt_opt,
      split: split4,
      find: find4,
      find_opt: find_opt3,
      find_first,
      find_first_opt,
      find_last,
      find_last_opt,
      of_list: of_list2
    };
  }

  // lib/es6/src/main/re/stdlib/jscore.mjs
  var StringSet = Make({
    compare
  });
  var $$Option;
  var List2;
  var $$String$1;
  var Int;
  var Lazy;
  var Stdlib = {
    StringSet,
    $$Option,
    List: List2,
    $$String: $$String$1,
    Int,
    Lazy
  };

  // lib/es6/src/main/re/wimp/globals.mjs
  var isExcel = {
    contents: false
  };
  var isSafari = {
    contents: false
  };

  // lib/es6/src/main/re/html/htmlStd.mjs
  function gatherUplevel(endmatchOpt, nodes) {
    var endmatch = endmatchOpt !== void 0 ? endmatchOpt : "!";
    var match = $$break(function(x) {
      if (x.TAG === "Data") {
        return false;
      }
      var match2 = x._1;
      if (!match2) {
        return false;
      }
      var match$1 = match2.hd;
      if (match$1[0] === "contents" && match$1[1] === "[endif]" && !match2.tl) {
        return x._0 === endmatch;
      } else {
        return false;
      }
    }, nodes);
    return [
      match[0],
      drop(1, match[1])
    ];
  }
  var blockTags = {
    hd: "address",
    tl: {
      hd: "article",
      tl: {
        hd: "aside",
        tl: {
          hd: "audio",
          tl: {
            hd: "blockquote",
            tl: {
              hd: "canvas",
              tl: {
                hd: "dd",
                tl: {
                  hd: "div",
                  tl: {
                    hd: "dl",
                    tl: {
                      hd: "fieldset",
                      tl: {
                        hd: "figcaption",
                        tl: {
                          hd: "figure",
                          tl: {
                            hd: "footer",
                            tl: {
                              hd: "form",
                              tl: {
                                hd: "h1",
                                tl: {
                                  hd: "h2",
                                  tl: {
                                    hd: "h3",
                                    tl: {
                                      hd: "h4",
                                      tl: {
                                        hd: "h5",
                                        tl: {
                                          hd: "h6",
                                          tl: {
                                            hd: "header",
                                            tl: {
                                              hd: "hgroup",
                                              tl: {
                                                hd: "hr",
                                                tl: {
                                                  hd: "li",
                                                  tl: {
                                                    hd: "noscript",
                                                    tl: {
                                                      hd: "ol",
                                                      tl: {
                                                        hd: "output",
                                                        tl: {
                                                          hd: "p",
                                                          tl: {
                                                            hd: "pre",
                                                            tl: {
                                                              hd: "section",
                                                              tl: {
                                                                hd: "table",
                                                                tl: {
                                                                  hd: "tbody",
                                                                  tl: {
                                                                    hd: "td",
                                                                    tl: {
                                                                      hd: "tfoot",
                                                                      tl: {
                                                                        hd: "th",
                                                                        tl: {
                                                                          hd: "thead",
                                                                          tl: {
                                                                            hd: "tr",
                                                                            tl: {
                                                                              hd: "ul",
                                                                              tl: {
                                                                                hd: "video",
                                                                                tl: (
                                                                                  /* [] */
                                                                                  0
                                                                                )
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var removeWhitespaceAround = _1(Stdlib.StringSet.of_list, append3({
    hd: "body",
    tl: {
      hd: "head",
      tl: {
        hd: "html",
        tl: {
          hd: "link",
          tl: {
            hd: "meta",
            tl: {
              hd: "style",
              tl: {
                hd: "v:shape",
                tl: (
                  /* [] */
                  0
                )
              }
            }
          }
        }
      }
    }
  }, blockTags));
  function isBlockTag(str) {
    return _2(Stdlib.StringSet.mem, str, removeWhitespaceAround);
  }
  function attribute(name42, param) {
    return equal(param[0], name42);
  }
  function findAttr(name42) {
    return function(param) {
      return find(function(param2) {
        return attribute(name42, param2);
      }, param);
    };
  }
  function setAttr(name42, value2, attrs) {
    var updated = update(function(a) {
      var n = a[0];
      if (equal(name42, n)) {
        return [
          n,
          value2
        ];
      } else {
        return a;
      }
    }, attrs);
    if (updated === attrs) {
      return {
        hd: [
          name42,
          value2
        ],
        tl: attrs
      };
    } else {
      return updated;
    }
  }
  function docRoot(_x) {
    while (true) {
      var x = _x;
      if (!x) {
        return;
      }
      var match = x.hd;
      if (match.TAG === "Data") {
        _x = x.tl;
        continue;
      }
      if (match._0 === "html") {
        isExcel.contents = exists3(function(param) {
          return contains_substring(param[1], "excel");
        }, match._1);
        return match._3;
      }
      _x = x.tl;
      continue;
    }
    ;
  }
  var partial_arg = "";
  function allData(param) {
    return fold_left3(function(acc, node) {
      return bind2(function(str) {
        if (node.TAG === "Data") {
          return str + node._0;
        }
      }, acc);
    }, partial_arg, param);
  }
  function withinChildren(f2, x) {
    if (x.TAG !== "Data") {
      return filter_map(f2, x._3);
    }
    throw {
      RE_EXN_ID: "Assert_failure",
      _1: [
        "htmlStd.res",
        130,
        9
      ],
      Error: new Error()
    };
  }
  function findChildTags(name42) {
    return function(param) {
      return withinChildren(function(x) {
        if (x.TAG === "Data" || x._0 !== name42) {
          return;
        } else {
          return x;
        }
      }, param);
    };
  }
  function nodeChildren(x) {
    if (x.TAG === "Data") {
      return (
        /* [] */
        0
      );
    } else {
      return x._3;
    }
  }
  function getElementData(name42, f2, x) {
    if (x.TAG === "Data") {
      return;
    } else if (x._0 === name42) {
      return _2(f2, x._1, x._2);
    } else {
      return find_map(function(param) {
        return getElementData(name42, f2, param);
      }, x._3);
    }
  }
  function matchEmptyTag(tag, name42, param, param$1, children) {
    if (equal(name42, tag)) {
      return children === /* [] */
      0;
    } else {
      return false;
    }
  }

  // lib/es6/src/main/re/css/cssSerialiser.mjs
  function quoteIfSpace(str) {
    if (contains2(
      str,
      /* ' ' */
      32
    )) {
      return '"' + (str + '"');
    } else {
      return str;
    }
  }
  function commaSeparatedValue(values2) {
    var mostlyReversed = fold_left3(function(acc, item) {
      if (!acc) {
        return (
          /* [] */
          0
        );
      }
      var sels = acc.tl;
      var sel2 = acc.hd;
      if (item === ",") {
        return {
          hd: "",
          tl: {
            hd: quoteIfSpace(sel2),
            tl: sels
          }
        };
      } else if (starts_with(item, "!")) {
        return {
          hd: "",
          tl: {
            hd: quoteIfSpace(sel2) + (" " + item),
            tl: sels
          }
        };
      } else {
        return {
          hd: sel2 + item,
          tl: sels
        };
      }
    }, {
      hd: "",
      tl: (
        /* [] */
        0
      )
    }, values2);
    var reversed;
    if (mostlyReversed) {
      var sel = mostlyReversed.hd;
      reversed = sel === "" ? mostlyReversed.tl : {
        hd: quoteIfSpace(sel),
        tl: mostlyReversed.tl
      };
    } else {
      reversed = mostlyReversed;
    }
    return concat5(", ", rev3(reversed));
  }
  var propertiesNeedingQuotes = _1(Stdlib.StringSet.of_list, {
    hd: "font-family",
    tl: (
      /* [] */
      0
    )
  });
  function show_attribute(param) {
    var values2 = param._1._0;
    var name42 = param._0._0;
    var value2;
    if (_2(Stdlib.StringSet.mem, name42, propertiesNeedingQuotes)) {
      value2 = commaSeparatedValue(values2);
    } else {
      var values$1 = ends_with(name42, "color") ? values2 : map3(quoteIfSpace, values2);
      value2 = concat5(" ", values$1);
    }
    var value$1 = value2.length === 0 ? '""' : value2;
    return name42 + (":" + (value$1 + ";"));
  }
  function show_attributes(sepOpt, attrs) {
    var sep = sepOpt !== void 0 ? sepOpt : "";
    return concat5(sep, map3(show_attribute, attrs));
  }
  function show_declarations(declarations) {
    return "  " + show_attributes("\n  ", declarations);
  }
  function show_selector(selectors) {
    return concat5(", ", selectors._0);
  }
  function show_rule(x) {
    switch (x.TAG) {
      case "Rule":
        return show_selector(x._0) + (" {\n" + (show_declarations(x._1) + "\n}"));
      case "AtRule":
        return "@" + (x._0 + (" {\n" + (show_declarations(x._1) + "\n}")));
      case "ListRule":
        return "@list " + (x._0._0 + (value("", map4(function(leveldef) {
          return ":level" + toString(leveldef._0);
        }, x._1)) + (value("", map4(function(s) {
          return " " + s;
        }, x._2)) + (" {\n" + (show_declarations(x._3) + "\n}")))));
    }
  }
  function show_rules(nodes) {
    return concat5("\n", map3(show_rule, nodes));
  }
  function show_value(values2) {
    return concat5(" ", values2._0);
  }

  // lib/es6/src/main/re/html/htmlProcessing.mjs
  function isWhitespace(x) {
    if (x.TAG === "Data") {
      return is_whitespace(x._0);
    }
    var children = x._3;
    if (x._0 !== "body" && children !== /* [] */
    0) {
      return for_all3(isWhitespace, children);
    } else {
      return false;
    }
  }
  function removeEdgeWhitespace(elements) {
    return drop_while_end(isWhitespace)(drop_while(isWhitespace, elements));
  }
  function translateFromNethtml(nodes) {
    return rev3(fold_left3(
      function(acc, nodes2) {
        if (nodes2.TAG !== "Element") {
          return {
            hd: {
              TAG: "Data",
              _0: nodes2._0
            },
            tl: acc
          };
        }
        var match = nodes2._0;
        var match$1 = extractStyleAttribute(match[1]);
        return {
          hd: {
            TAG: "Element",
            _0: match[0],
            _1: match$1[1],
            _2: match$1[0],
            _3: translateFromNethtml(match[2])
          },
          tl: acc
        };
      },
      /* [] */
      0,
      nodes
    ));
  }
  function attrsWithStyle(attrs, styles) {
    if (styles === /* [] */
    0) {
      return attrs;
    } else {
      return {
        hd: [
          "style",
          show_attributes(void 0, styles)
        ],
        tl: attrs
      };
    }
  }
  function translateToNethtml_no_pretty_print(nodes) {
    return rev3(fold_left3(
      function(acc, nodes2) {
        if (nodes2.TAG === "Data") {
          return {
            hd: {
              TAG: "Data",
              _0: nodes2._0
            },
            tl: acc
          };
        }
        var attrs = attrsWithStyle(nodes2._1, nodes2._2);
        return {
          hd: {
            TAG: "Element",
            _0: [
              nodes2._0,
              attrs,
              translateToNethtml_no_pretty_print(nodes2._3)
            ]
          },
          tl: acc
        };
      },
      /* [] */
      0,
      nodes
    ));
  }
  function translateToNethtml_pretty_print(indentOpt, nodes) {
    var indent = indentOpt !== void 0 ? indentOpt : 0;
    var indentData = function(param) {
      return "\n" + make4(
        indent << 1,
        /* ' ' */
        32
      );
    };
    var x = fold_left3(
      function(acc, nodes2) {
        if (nodes2.TAG === "Data") {
          return {
            hd: {
              TAG: "Data",
              _0: nodes2._0
            },
            tl: acc
          };
        }
        var name42 = nodes2._0;
        var attrs = attrsWithStyle(nodes2._1, nodes2._2);
        var children = translateToNethtml_pretty_print(indent + 1 | 0, nodes2._3);
        var children$1 = name42 === "style" ? append3({
          hd: {
            TAG: "Data",
            _0: "\n"
          },
          tl: children
        }, {
          hd: {
            TAG: "Data",
            _0: indentData()
          },
          tl: (
            /* [] */
            0
          )
        }) : children;
        var children$2;
        if (children$1) {
          var match = children$1.hd;
          children$2 = match.TAG === "Element" && isBlockTag(match._0[0]) ? {
            hd: {
              TAG: "Data",
              _0: "\n" + make4(
                (indent + 1 | 0) << 1,
                /* ' ' */
                32
              )
            },
            tl: children$1
          } : children$1;
        } else {
          children$2 = children$1;
        }
        var tag = {
          TAG: "Element",
          _0: [
            name42,
            attrs,
            children$2
          ]
        };
        if (isBlockTag(name42)) {
          return {
            hd: {
              TAG: "Data",
              _0: indentData()
            },
            tl: {
              hd: tag,
              tl: acc
            }
          };
        } else {
          return {
            hd: tag,
            tl: acc
          };
        }
      },
      /* [] */
      0,
      nodes
    );
    var tmp;
    if (x) {
      var d = x.hd;
      tmp = d.TAG === "Element" || !(indent > 0 && d._0 === indentData()) ? x : {
        hd: {
          TAG: "Data",
          _0: "\n" + make4(
            (indent - 1 | 0) << 1,
            /* ' ' */
            32
          )
        },
        tl: x.tl
      };
    } else {
      tmp = x;
    }
    return rev3(tmp);
  }
  function translateToNethtml(prettyPrintOpt, nodes) {
    var prettyPrint = prettyPrintOpt !== void 0 ? prettyPrintOpt : false;
    if (prettyPrint) {
      return translateToNethtml_pretty_print(void 0, nodes);
    } else {
      return translateToNethtml_no_pretty_print(nodes);
    }
  }
  function cleanse(doc) {
    var _acc = (
      /* [] */
      0
    );
    var _nodes = doc;
    while (true) {
      var nodes = _nodes;
      var acc = _acc;
      var exit = 0;
      var name42;
      var e;
      var s;
      var siblings;
      if (!nodes) {
        return rev3(acc);
      }
      var a = nodes.hd;
      if (a.TAG === "Data") {
        var match = nodes.tl;
        if (match) {
          var b = match.hd;
          var a$1 = a._0;
          if (b.TAG === "Data") {
            _nodes = {
              hd: {
                TAG: "Data",
                _0: a$1 + b._0
              },
              tl: match.tl
            };
            continue;
          }
          name42 = b._0;
          e = b;
          s = a$1;
          siblings = match.tl;
          exit = 2;
        }
      } else {
        var match$1 = nodes.tl;
        if (match$1) {
          var s$1 = match$1.hd;
          if (s$1.TAG === "Data") {
            name42 = a._0;
            e = a;
            s = s$1._0;
            siblings = match$1.tl;
            exit = 2;
          }
        }
      }
      if (exit === 2 && isBlockTag(name42) && is_whitespace(s)) {
        _nodes = {
          hd: e,
          tl: siblings
        };
        continue;
      }
      var s$2 = nodes.hd;
      if (s$2.TAG === "Data") {
        _nodes = nodes.tl;
        _acc = {
          hd: {
            TAG: "Data",
            _0: s$2._0
          },
          tl: acc
        };
        continue;
      }
      var children = s$2._3;
      var name$1 = s$2._0;
      var children$1 = isBlockTag(name$1) ? removeEdgeWhitespace(children) : children;
      _nodes = nodes.tl;
      _acc = {
        hd: {
          TAG: "Element",
          _0: name$1,
          _1: s$2._1,
          _2: s$2._2,
          _3: cleanse(children$1)
        },
        tl: acc
      };
      continue;
    }
    ;
  }

  // lib/es6/src/main/re/html/htmldebug.mjs
  function debugNode(node) {
    var debugLevel = function(level, node2) {
      var indent = make4(
        level << 1,
        /* ' ' */
        32
      );
      if (node2.TAG === "Data") {
        return "\n" + (indent + ("Data '" + (node2._0 + "'")));
      }
      var combinedAttrs = attrsWithStyle(node2._1, node2._2);
      var partial_arg2 = level + 1 | 0;
      return "\n" + (indent + ("Element (" + (node2._0 + (", [" + (concat5(", ", map3(function(param) {
        return param[0] + ("='" + (param[1] + "'"));
      }, combinedAttrs)) + ("]" + (concat5("", map3(function(param) {
        return debugLevel(partial_arg2, param);
      }, node2._3)) + ("\n" + (indent + ")")))))))));
    };
    return debugLevel(0, node);
  }
  function debugTree(nodes) {
    return concat5("", map3(debugNode, nodes));
  }

  // lib/es6/src/main/re/wimp/nodeRules.mjs
  function unwrapEmptyPTag_elementApplies(tagname, param, param$1, children) {
    if (tagname !== "p") {
      return false;
    }
    if (length(children) !== 1) {
      return false;
    }
    if (!children) {
      return false;
    }
    var match = children.hd;
    if (match.TAG === "Data" || children.tl) {
      return false;
    } else {
      var _tagname = match._0;
      var _children = match._3;
      while (true) {
        var children$1 = _children;
        var tagname$1 = _tagname;
        if (!(tagname$1 === "u" || tagname$1 === "s" || tagname$1 === "span")) {
          return false;
        }
        if (!children$1) {
          return false;
        }
        var match$1 = children$1.hd;
        if (match$1.TAG === "Data") {
          switch (match$1._0) {
            case "&nbsp;":
              if (children$1.tl) {
                return false;
              } else {
                return true;
              }
            case "\xA0":
              if (children$1.tl || !isSafari.contents) {
                return false;
              } else {
                return true;
              }
            default:
              return false;
          }
        } else {
          if (children$1.tl) {
            return false;
          }
          _children = match$1._3;
          _tagname = match$1._0;
          continue;
        }
      }
      ;
    }
  }
  function unwrapEmptyPTag_process(tagname, attrs, styles, _children) {
    return {
      TAG: "ReplaceSingle",
      _0: {
        TAG: "Element",
        _0: tagname,
        _1: attrs,
        _2: styles,
        _3: {
          hd: isSafari.contents ? {
            TAG: "Data",
            _0: "\xA0"
          } : {
            TAG: "Data",
            _0: "&nbsp;"
          },
          tl: (
            /* [] */
            0
          )
        }
      }
    };
  }
  var unwrapEmptyPTag = {
    elementApplies: unwrapEmptyPTag_elementApplies,
    process: unwrapEmptyPTag_process
  };

  // ../../node_modules/rescript/lib/es6/buffer.js
  function create3(n) {
    var n$1 = n < 1 ? 1 : n;
    var s = create2(n$1);
    return {
      buffer: s,
      position: 0,
      length: n$1,
      initial_buffer: s
    };
  }
  function contents(b) {
    return sub_string(b.buffer, 0, b.position);
  }
  function resize(b, more) {
    var len = b.length;
    var new_len = len;
    while ((b.position + more | 0) > new_len) {
      new_len = new_len << 1;
    }
    ;
    var new_buffer = create2(new_len);
    blit3(b.buffer, 0, new_buffer, 0, b.position);
    b.buffer = new_buffer;
    b.length = new_len;
  }
  function add_string(b, s) {
    var len = s.length;
    var new_position = b.position + len | 0;
    if (new_position > b.length) {
      resize(b, len);
    }
    blit_string(s, 0, b.buffer, b.position, len);
    b.position = new_position;
  }

  // ../../node_modules/rescript/lib/es6/caml_lexer.js
  function caml_lex_array(s) {
    var l = s.length / 2;
    var a = new Array(l);
    for (var i2 = 0; i2 < l; i2++)
      a[i2] = (s.charCodeAt(2 * i2) | s.charCodeAt(2 * i2 + 1) << 8) << 16 >> 16;
    return a;
  }
  var caml_lex_engine_aux = function(tbl, start_state, lexbuf, exn) {
    if (!Array.isArray(tbl.lex_default)) {
      tbl.lex_base = caml_lex_array(tbl.lex_base);
      tbl.lex_backtrk = caml_lex_array(tbl.lex_backtrk);
      tbl.lex_check = caml_lex_array(tbl.lex_check);
      tbl.lex_trans = caml_lex_array(tbl.lex_trans);
      tbl.lex_default = caml_lex_array(tbl.lex_default);
    }
    var c;
    var state2 = start_state;
    var buffer = lexbuf.lex_buffer;
    if (state2 >= 0) {
      lexbuf.lex_last_pos = lexbuf.lex_start_pos = lexbuf.lex_curr_pos;
      lexbuf.lex_last_action = -1;
    } else {
      state2 = -state2 - 1;
    }
    for (; ; ) {
      var base = tbl.lex_base[state2];
      if (base < 0)
        return -base - 1;
      var backtrk = tbl.lex_backtrk[state2];
      if (backtrk >= 0) {
        lexbuf.lex_last_pos = lexbuf.lex_curr_pos;
        lexbuf.lex_last_action = backtrk;
      }
      if (lexbuf.lex_curr_pos >= lexbuf.lex_buffer_len) {
        if (lexbuf.lex_eof_reached === 0)
          return -state2 - 1;
        else
          c = 256;
      } else {
        c = buffer[lexbuf.lex_curr_pos];
        lexbuf.lex_curr_pos++;
      }
      if (tbl.lex_check[base + c] === state2) {
        state2 = tbl.lex_trans[base + c];
      } else {
        state2 = tbl.lex_default[state2];
      }
      if (state2 < 0) {
        lexbuf.lex_curr_pos = lexbuf.lex_last_pos;
        if (lexbuf.lex_last_action == -1)
          throw exn;
        else
          return lexbuf.lex_last_action;
      } else {
        if (c == 256)
          lexbuf.lex_eof_reached = 0;
      }
    }
  };
  var empty_token_lit = "lexing: empty token";
  function lex_engine(tbls, i2, buf) {
    return caml_lex_engine_aux(tbls, i2, buf, {
      RE_EXN_ID: "Failure",
      _1: empty_token_lit
    });
  }

  // ../../node_modules/rescript/lib/es6/lexing.js
  function engine(tbl, state2, buf) {
    var result = lex_engine(tbl, state2, buf);
    if (result >= 0) {
      buf.lex_start_p = buf.lex_curr_p;
      var init4 = buf.lex_curr_p;
      buf.lex_curr_p = {
        pos_fname: init4.pos_fname,
        pos_lnum: init4.pos_lnum,
        pos_bol: init4.pos_bol,
        pos_cnum: buf.lex_abs_pos + buf.lex_curr_pos | 0
      };
    }
    return result;
  }
  var zero_pos = {
    pos_fname: "",
    pos_lnum: 1,
    pos_bol: 0,
    pos_cnum: 0
  };
  function from_string(s) {
    return {
      refill_buff: function(lexbuf) {
        lexbuf.lex_eof_reached = true;
      },
      lex_buffer: of_string(s),
      lex_buffer_len: s.length,
      lex_abs_pos: 0,
      lex_start_pos: 0,
      lex_curr_pos: 0,
      lex_last_pos: 0,
      lex_last_action: 0,
      lex_eof_reached: true,
      lex_mem: [],
      lex_start_p: zero_pos,
      lex_curr_p: zero_pos
    };
  }
  function lexeme(lexbuf) {
    var len = lexbuf.lex_curr_pos - lexbuf.lex_start_pos | 0;
    return sub_string(lexbuf.lex_buffer, lexbuf.lex_start_pos, len);
  }
  function sub_lexeme(lexbuf, i1, i2) {
    var len = i2 - i1 | 0;
    return sub_string(lexbuf.lex_buffer, i1, len);
  }

  // ../../node_modules/rescript/lib/es6/stack.js
  var Empty = /* @__PURE__ */ create("Stack.Empty");
  function create4(param) {
    return {
      c: (
        /* [] */
        0
      ),
      len: 0
    };
  }
  function push(x, s) {
    s.c = {
      hd: x,
      tl: s.c
    };
    s.len = s.len + 1 | 0;
  }
  function pop(s) {
    var match = s.c;
    if (match) {
      s.c = match.tl;
      s.len = s.len - 1 | 0;
      return match.hd;
    }
    throw {
      RE_EXN_ID: Empty,
      Error: new Error()
    };
  }
  function length5(s) {
    return s.len;
  }
  function iter4(f2, s) {
    iter(f2, s.c);
  }

  // ../../node_modules/rescript/lib/es6/int32.js
  var max_int2 = 2147483647;

  // ../../node_modules/rescript/lib/es6/int64.js
  var max_int3 = max_int;

  // ../../node_modules/rescript/lib/es6/caml_md5.js
  function cmn(q, a, b, x, s, t) {
    var a$1 = ((a + q | 0) + x | 0) + t | 0;
    return (a$1 << s | a$1 >>> (32 - s | 0) | 0) + b | 0;
  }
  function f(a, b, c, d, x, s, t) {
    return cmn(b & c | (b ^ -1) & d, a, b, x, s, t);
  }
  function g(a, b, c, d, x, s, t) {
    return cmn(b & d | c & (d ^ -1), a, b, x, s, t);
  }
  function h(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function i(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | d ^ -1), a, b, x, s, t);
  }
  function cycle(x, k) {
    var a = x[0];
    var b = x[1];
    var c = x[2];
    var d = x[3];
    a = f(a, b, c, d, k[0], 7, -680876936);
    d = f(d, a, b, c, k[1], 12, -389564586);
    c = f(c, d, a, b, k[2], 17, 606105819);
    b = f(b, c, d, a, k[3], 22, -1044525330);
    a = f(a, b, c, d, k[4], 7, -176418897);
    d = f(d, a, b, c, k[5], 12, 1200080426);
    c = f(c, d, a, b, k[6], 17, -1473231341);
    b = f(b, c, d, a, k[7], 22, -45705983);
    a = f(a, b, c, d, k[8], 7, 1770035416);
    d = f(d, a, b, c, k[9], 12, -1958414417);
    c = f(c, d, a, b, k[10], 17, -42063);
    b = f(b, c, d, a, k[11], 22, -1990404162);
    a = f(a, b, c, d, k[12], 7, 1804603682);
    d = f(d, a, b, c, k[13], 12, -40341101);
    c = f(c, d, a, b, k[14], 17, -1502002290);
    b = f(b, c, d, a, k[15], 22, 1236535329);
    a = g(a, b, c, d, k[1], 5, -165796510);
    d = g(d, a, b, c, k[6], 9, -1069501632);
    c = g(c, d, a, b, k[11], 14, 643717713);
    b = g(b, c, d, a, k[0], 20, -373897302);
    a = g(a, b, c, d, k[5], 5, -701558691);
    d = g(d, a, b, c, k[10], 9, 38016083);
    c = g(c, d, a, b, k[15], 14, -660478335);
    b = g(b, c, d, a, k[4], 20, -405537848);
    a = g(a, b, c, d, k[9], 5, 568446438);
    d = g(d, a, b, c, k[14], 9, -1019803690);
    c = g(c, d, a, b, k[3], 14, -187363961);
    b = g(b, c, d, a, k[8], 20, 1163531501);
    a = g(a, b, c, d, k[13], 5, -1444681467);
    d = g(d, a, b, c, k[2], 9, -51403784);
    c = g(c, d, a, b, k[7], 14, 1735328473);
    b = g(b, c, d, a, k[12], 20, -1926607734);
    a = h(a, b, c, d, k[5], 4, -378558);
    d = h(d, a, b, c, k[8], 11, -2022574463);
    c = h(c, d, a, b, k[11], 16, 1839030562);
    b = h(b, c, d, a, k[14], 23, -35309556);
    a = h(a, b, c, d, k[1], 4, -1530992060);
    d = h(d, a, b, c, k[4], 11, 1272893353);
    c = h(c, d, a, b, k[7], 16, -155497632);
    b = h(b, c, d, a, k[10], 23, -1094730640);
    a = h(a, b, c, d, k[13], 4, 681279174);
    d = h(d, a, b, c, k[0], 11, -358537222);
    c = h(c, d, a, b, k[3], 16, -722521979);
    b = h(b, c, d, a, k[6], 23, 76029189);
    a = h(a, b, c, d, k[9], 4, -640364487);
    d = h(d, a, b, c, k[12], 11, -421815835);
    c = h(c, d, a, b, k[15], 16, 530742520);
    b = h(b, c, d, a, k[2], 23, -995338651);
    a = i(a, b, c, d, k[0], 6, -198630844);
    d = i(d, a, b, c, k[7], 10, 1126891415);
    c = i(c, d, a, b, k[14], 15, -1416354905);
    b = i(b, c, d, a, k[5], 21, -57434055);
    a = i(a, b, c, d, k[12], 6, 1700485571);
    d = i(d, a, b, c, k[3], 10, -1894986606);
    c = i(c, d, a, b, k[10], 15, -1051523);
    b = i(b, c, d, a, k[1], 21, -2054922799);
    a = i(a, b, c, d, k[8], 6, 1873313359);
    d = i(d, a, b, c, k[15], 10, -30611744);
    c = i(c, d, a, b, k[6], 15, -1560198380);
    b = i(b, c, d, a, k[13], 21, 1309151649);
    a = i(a, b, c, d, k[4], 6, -145523070);
    d = i(d, a, b, c, k[11], 10, -1120210379);
    c = i(c, d, a, b, k[2], 15, 718787259);
    b = i(b, c, d, a, k[9], 21, -343485551);
    x[0] = a + x[0] | 0;
    x[1] = b + x[1] | 0;
    x[2] = c + x[2] | 0;
    x[3] = d + x[3] | 0;
  }
  var state = [
    1732584193,
    -271733879,
    -1732584194,
    271733878
  ];
  var md5blk = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  function md5_string(s, start, len) {
    var s$1 = s.slice(start, len);
    var n = s$1.length;
    state[0] = 1732584193;
    state[1] = -271733879;
    state[2] = -1732584194;
    state[3] = 271733878;
    for (var i2 = 0; i2 <= 15; ++i2) {
      md5blk[i2] = 0;
    }
    var i_end = n / 64 | 0;
    for (var i$1 = 1; i$1 <= i_end; ++i$1) {
      for (var j = 0; j <= 15; ++j) {
        var k = ((i$1 << 6) - 64 | 0) + (j << 2) | 0;
        md5blk[j] = ((s$1.charCodeAt(k) + (s$1.charCodeAt(k + 1 | 0) << 8) | 0) + (s$1.charCodeAt(k + 2 | 0) << 16) | 0) + (s$1.charCodeAt(k + 3 | 0) << 24) | 0;
      }
      cycle(state, md5blk);
    }
    var s_tail = s$1.slice(i_end << 6);
    for (var kk = 0; kk <= 15; ++kk) {
      md5blk[kk] = 0;
    }
    var i_end$1 = s_tail.length - 1 | 0;
    for (var i$2 = 0; i$2 <= i_end$1; ++i$2) {
      md5blk[i$2 / 4 | 0] = md5blk[i$2 / 4 | 0] | s_tail.charCodeAt(i$2) << (i$2 % 4 << 3);
    }
    var i$3 = i_end$1 + 1 | 0;
    md5blk[i$3 / 4 | 0] = md5blk[i$3 / 4 | 0] | 128 << (i$3 % 4 << 3);
    if (i$3 > 55) {
      cycle(state, md5blk);
      for (var i$4 = 0; i$4 <= 15; ++i$4) {
        md5blk[i$4] = 0;
      }
    }
    md5blk[14] = n << 3;
    cycle(state, md5blk);
    return String.fromCharCode(state[0] & 255, state[0] >> 8 & 255, state[0] >> 16 & 255, state[0] >> 24 & 255, state[1] & 255, state[1] >> 8 & 255, state[1] >> 16 & 255, state[1] >> 24 & 255, state[2] & 255, state[2] >> 8 & 255, state[2] >> 16 & 255, state[2] >> 24 & 255, state[3] & 255, state[3] >> 8 & 255, state[3] >> 16 & 255, state[3] >> 24 & 255);
  }

  // ../../node_modules/rescript/lib/es6/digest.js
  function string(str) {
    return md5_string(str, 0, str.length);
  }

  // ../../node_modules/rescript/lib/es6/random.js
  function random_seed(param) {
    return [Math.floor(Math.random() * 2147483647)];
  }
  function assign(st1, st2) {
    blit2(st2.st, 0, st1.st, 0, 55);
    st1.idx = st2.idx;
  }
  function full_init(s, seed) {
    var combine2 = function(accu2, x) {
      return string(accu2 + String(x));
    };
    var extract = function(d) {
      return ((get2(d, 0) + (get2(d, 1) << 8) | 0) + (get2(d, 2) << 16) | 0) + (get2(d, 3) << 24) | 0;
    };
    var seed$1 = seed.length === 0 ? [0] : seed;
    var l = seed$1.length;
    for (var i2 = 0; i2 <= 54; ++i2) {
      set(s.st, i2, i2);
    }
    var accu = "x";
    for (var i$1 = 0, i_finish = 54 + (55 > l ? 55 : l) | 0; i$1 <= i_finish; ++i$1) {
      var j = i$1 % 55;
      var k = i$1 % l;
      accu = combine2(accu, get(seed$1, k));
      set(s.st, j, (get(s.st, j) ^ extract(accu)) & 1073741823);
    }
    s.idx = 0;
  }
  function make5(seed) {
    var result = {
      st: make(55, 0),
      idx: 0
    };
    full_init(result, seed);
    return result;
  }
  function make_self_init(param) {
    return make5(random_seed());
  }
  function copy(s) {
    var result = {
      st: make(55, 0),
      idx: 0
    };
    assign(result, s);
    return result;
  }
  function bits(s) {
    s.idx = (s.idx + 1 | 0) % 55;
    var curval = get(s.st, s.idx);
    var newval = get(s.st, (s.idx + 24 | 0) % 55) + (curval ^ curval >>> 25 & 31) | 0;
    var newval30 = newval & 1073741823;
    set(s.st, s.idx, newval30);
    return newval30;
  }
  function $$int(s, bound) {
    if (bound > 1073741823 || bound <= 0) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Random.int",
        Error: new Error()
      };
    }
    while (true) {
      var r = bits(s);
      var v = r % bound;
      if ((r - v | 0) <= ((1073741823 - bound | 0) + 1 | 0)) {
        return v;
      }
      continue;
    }
    ;
  }
  function int32(s, bound) {
    if (bound <= 0) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Random.int32",
        Error: new Error()
      };
    }
    while (true) {
      var b1 = bits(s);
      var b2 = (bits(s) & 1) << 30;
      var r = b1 | b2;
      var v = r % bound;
      if ((r - v | 0) <= ((max_int2 - bound | 0) + 1 | 0)) {
        return v;
      }
      continue;
    }
    ;
  }
  function int64(s, bound) {
    if (i64_le(bound, zero)) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "Random.int64",
        Error: new Error()
      };
    }
    while (true) {
      var b1 = of_int32(bits(s));
      var b2 = lsl_(of_int32(bits(s)), 30);
      var b3 = lsl_(of_int32(bits(s) & 7), 60);
      var r = or_(b1, or_(b2, b3));
      var v = mod_(r, bound);
      if (!i64_gt(sub2(r, v), add(sub2(max_int3, bound), one))) {
        return v;
      }
      continue;
    }
    ;
  }
  function rawfloat(s) {
    var r1 = bits(s);
    var r2 = bits(s);
    return (r1 / 1073741824 + r2) / 1073741824;
  }
  function $$float(s, bound) {
    return rawfloat(s) * bound;
  }
  function bool(s) {
    return (bits(s) & 1) === 0;
  }
  var State = {
    make: make5,
    make_self_init,
    copy,
    bits,
    $$int,
    int32,
    int64,
    $$float,
    bool
  };

  // ../../node_modules/rescript/lib/es6/caml_hash_primitive.js
  function rotl32(x, n) {
    return x << n | x >>> (32 - n | 0) | 0;
  }
  function hash_mix_int(h2, d) {
    var d$1 = d;
    d$1 = Math.imul(d$1, -862048943);
    d$1 = rotl32(d$1, 15);
    d$1 = Math.imul(d$1, 461845907);
    var h$1 = h2 ^ d$1;
    h$1 = rotl32(h$1, 13);
    return (h$1 + (h$1 << 2) | 0) - 430675100 | 0;
  }
  function hash_final_mix(h2) {
    var h$1 = h2 ^ h2 >>> 16;
    h$1 = Math.imul(h$1, -2048144789);
    h$1 = h$1 ^ h$1 >>> 13;
    h$1 = Math.imul(h$1, -1028477387);
    return h$1 ^ h$1 >>> 16;
  }
  function hash_mix_string(h2, s) {
    var len = s.length;
    var block = (len / 4 | 0) - 1 | 0;
    var hash2 = h2;
    for (var i2 = 0; i2 <= block; ++i2) {
      var j = i2 << 2;
      var w = s.charCodeAt(j) | s.charCodeAt(j + 1 | 0) << 8 | s.charCodeAt(j + 2 | 0) << 16 | s.charCodeAt(j + 3 | 0) << 24;
      hash2 = hash_mix_int(hash2, w);
    }
    var modulo = len & 3;
    if (modulo !== 0) {
      var w$1 = modulo === 3 ? s.charCodeAt(len - 1 | 0) << 16 | s.charCodeAt(len - 2 | 0) << 8 | s.charCodeAt(len - 3 | 0) : modulo === 2 ? s.charCodeAt(len - 1 | 0) << 8 | s.charCodeAt(len - 2 | 0) : s.charCodeAt(len - 1 | 0);
      hash2 = hash_mix_int(hash2, w$1);
    }
    hash2 = hash2 ^ len;
    return hash2;
  }

  // ../../node_modules/rescript/lib/es6/caml_hash.js
  function push_back(q, v) {
    var cell = {
      content: v,
      next: void 0
    };
    var last = q.last;
    if (last !== void 0) {
      q.length = q.length + 1 | 0;
      last.next = cell;
      q.last = cell;
    } else {
      q.length = 1;
      q.first = cell;
      q.last = cell;
    }
  }
  function unsafe_pop(q) {
    var cell = q.first;
    var next = cell.next;
    if (next === void 0) {
      q.length = 0;
      q.first = void 0;
      q.last = void 0;
    } else {
      q.length = q.length - 1 | 0;
      q.first = next;
    }
    return cell.content;
  }
  function hash(count, _limit, seed, obj) {
    var s = seed;
    if (typeof obj === "number") {
      var u = obj | 0;
      s = hash_mix_int(s, (u + u | 0) + 1 | 0);
      return hash_final_mix(s);
    }
    if (typeof obj === "string") {
      s = hash_mix_string(s, obj);
      return hash_final_mix(s);
    }
    var queue = {
      length: 0,
      first: void 0,
      last: void 0
    };
    var num = count;
    push_back(queue, obj);
    num = num - 1 | 0;
    while (queue.length !== 0 && num > 0) {
      var obj$1 = unsafe_pop(queue);
      if (typeof obj$1 === "number") {
        var u$1 = obj$1 | 0;
        s = hash_mix_int(s, (u$1 + u$1 | 0) + 1 | 0);
        num = num - 1 | 0;
      } else if (typeof obj$1 === "string") {
        s = hash_mix_string(s, obj$1);
        num = num - 1 | 0;
      } else if (typeof obj$1 !== "boolean" && typeof obj$1 !== "undefined" && typeof obj$1 !== "symbol" && typeof obj$1 !== "function") {
        var size = obj$1.length | 0;
        if (size !== 0) {
          var obj_tag = obj$1.TAG;
          var tag = size << 10 | obj_tag;
          if (obj_tag === 248) {
            s = hash_mix_int(s, obj$1[1]);
          } else {
            s = hash_mix_int(s, tag);
            var v = size - 1 | 0;
            var block = v < num ? v : num;
            for (var i2 = 0; i2 <= block; ++i2) {
              push_back(queue, obj$1[i2]);
            }
          }
        } else {
          var size$1 = function(obj2, cb) {
            var size2 = 0;
            for (var k in obj2) {
              cb(obj2[k]);
              ++size2;
            }
            return size2;
          }(obj$1, function(v2) {
            push_back(queue, v2);
          });
          s = hash_mix_int(s, size$1 << 10 | 0);
        }
      }
    }
    ;
    return hash_final_mix(s);
  }

  // ../../node_modules/rescript/lib/es6/hashtbl.js
  var randomized = {
    contents: false
  };
  var prng = {
    LAZY_DONE: false,
    VAL: function() {
      return State.make_self_init();
    }
  };
  function power_2_above(_x, n) {
    while (true) {
      var x = _x;
      if (x >= n) {
        return x;
      }
      if (x << 1 < x) {
        return x;
      }
      _x = x << 1;
      continue;
    }
    ;
  }
  function create5(randomOpt, initial_size) {
    var random = randomOpt !== void 0 ? randomOpt : randomized.contents;
    var s = power_2_above(16, initial_size);
    var seed = random ? State.bits(force(prng)) : 0;
    return {
      size: 0,
      data: make(s, "Empty"),
      seed,
      initial_size: s
    };
  }
  function resize2(indexfun, h2) {
    var odata = h2.data;
    var osize = odata.length;
    var nsize = osize << 1;
    if (nsize < osize) {
      return;
    }
    var ndata = make(nsize, "Empty");
    var ndata_tail = make(nsize, "Empty");
    var inplace = h2.initial_size >= 0;
    h2.data = ndata;
    var insert_bucket = function(_param) {
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          return;
        }
        var key = param.key;
        var data = param.data;
        var next = param.next;
        var cell = inplace ? param : {
          TAG: "Cons",
          key,
          data,
          next: "Empty"
        };
        var nidx = _2(indexfun, h2, key);
        var tail3 = get(ndata_tail, nidx);
        if (typeof tail3 !== "object") {
          set(ndata, nidx, cell);
        } else {
          tail3.next = cell;
        }
        set(ndata_tail, nidx, cell);
        _param = next;
        continue;
      }
      ;
    };
    for (var i2 = 0; i2 < osize; ++i2) {
      insert_bucket(get(odata, i2));
    }
    if (!inplace) {
      return;
    }
    for (var i$1 = 0; i$1 < nsize; ++i$1) {
      var tail2 = get(ndata_tail, i$1);
      if (typeof tail2 === "object") {
        tail2.next = "Empty";
      }
    }
  }
  function key_index(h2, key) {
    return hash(10, 100, h2.seed, key) & (h2.data.length - 1 | 0);
  }
  function add2(h2, key, data) {
    var i2 = key_index(h2, key);
    var bucket = {
      TAG: "Cons",
      key,
      data,
      next: get(h2.data, i2)
    };
    set(h2.data, i2, bucket);
    h2.size = h2.size + 1 | 0;
    if (h2.size > h2.data.length << 1) {
      return resize2(key_index, h2);
    }
  }
  function find3(h2, key) {
    var match = get(h2.data, key_index(h2, key));
    if (typeof match !== "object") {
      throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
    }
    var k1 = match.key;
    var d1 = match.data;
    var next1 = match.next;
    if (equal(key, k1)) {
      return d1;
    }
    if (typeof next1 !== "object") {
      throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
    }
    var k2 = next1.key;
    var d2 = next1.data;
    var next2 = next1.next;
    if (equal(key, k2)) {
      return d2;
    }
    if (typeof next2 !== "object") {
      throw {
        RE_EXN_ID: "Not_found",
        Error: new Error()
      };
    }
    var k3 = next2.key;
    var d3 = next2.data;
    var next3 = next2.next;
    if (equal(key, k3)) {
      return d3;
    } else {
      var _param = next3;
      while (true) {
        var param = _param;
        if (typeof param !== "object") {
          throw {
            RE_EXN_ID: "Not_found",
            Error: new Error()
          };
        }
        var k = param.key;
        var data = param.data;
        var next = param.next;
        if (equal(key, k)) {
          return data;
        }
        _param = next;
        continue;
      }
      ;
    }
  }

  // ../../node_modules/rescript/lib/es6/js_string.js
  function indexOf(arg1, obj) {
    return obj.indexOf(arg1);
  }
  function split3(arg1, obj) {
    return obj.split(arg1);
  }
  function splitByRe(arg1, obj) {
    return obj.split(arg1);
  }

  // lib/es6/netstring/code/src/netstring/nethtml_Split.mjs
  function cat_options(opts) {
    return fold_left(
      function(acc, opt) {
        if (opt !== void 0) {
          return {
            hd: valFromOption(opt),
            tl: acc
          };
        } else {
          return acc;
        }
      },
      /* [] */
      0,
      opts
    );
  }
  function split_by_quote(input) {
    return rev(cat_options(to_list(splitByRe(/"/, input))));
  }

  // lib/es6/netstring/code/src/netstring/nethtml_scanner.mjs
  var __ocaml_lex_tables = {
    lex_base: "\0\0\0\xF9\xFF\0\0A\0\xA3\0\xFD\xFF\0\0\0\xFF\xFF\xF1\0 \0\x80\0\xFD\xFF\0@\x8E.\x000\0\xFD\xFF\0\0\0\xFF\xFF\x7F\0\xA0\0\xFE\xFF\xFF\xFF\xEE\0\xFD\xFF\xFE\xFF\0\xFF\xFF\0\xF7\xFFr\xF9\xFF\xFA\xFF\xFB\xFF\x84\0\0\xF8\xFF\xFF\xFE\xFF\xFE\xF9\xFF\xFB\xFF\xFC\xFF\0\n\xFF\xFF\xFE\xFF\0\xFF\xFFu\0\xFF\xFF",
    lex_backtrk: "\xFF\xFF\x07\0\xFF\xFF\0\xFF\xFF\0\xFF\xFF\0\xFF\xFF\xFF\xFF\0\xFF\xFF\0\xFF\xFF\0\xFF\xFF\0\0\xFF\xFF\0\xFF\xFF\0\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\xFF\xFF\0\xFF\xFF\xFF\xFF\xFF\xFF\x07\0\xFF\xFF\xFF\xFF\xFF\xFF\0\0\x07\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\xFF\xFF\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF",
    lex_default: "\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\0\0\xFF\xFF\xFF\xFF\0\0\xFF\xFF\f\0\f\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0#\0\0\0#\0\0\0\0\0\0\0#\0\xFF\xFF#\0\0\0\0\0.\0\0\0.\0\0\0\0\0\xFF\xFF.\0\0\0\0\x005\0\0\x007\0\0\0",
    lex_trans: `\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0(\0(\x001\x001\0(\0\0\x001\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0(\0\x07\x001\0\0\0\0\x006\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\b\0	\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0 \0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0
\0\0\0\0\0\0\0\0\0\0\0\0\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\x008\0\0\0\0\0\0\0
\0\0\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0
\0
\0\r\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0\0\0\0\0\0\xFF\xFF\0\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0\xFF\xFF\xFF\xFF\0\0\0\0
\0\0\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0
\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0(\0(\0\0\0\0\0(\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0(\0\0\0%\0\0\0\0\0\0\0\0\0$\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0)\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'\0\0\0\0\0&\0*\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0'\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\xFF\xFF\0\0\xFF\xFF\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\xFF\xFF\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\xFF\xFF\xFF\xFF'\0'\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0'\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0"\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\0\x001\x001\0\0\0\0\x001\0\0\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\0\0\xFF\xFF\xFF\xFF\0\0\0\0\xFF\xFF\xFF\xFF\0\0\xFF\xFF\0\0\0\0\0\x001\0\xFF\xFF0\0\0\0\0\0\0\0\xFF\xFF/\0\xFF\xFF\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF2\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\xFF\xFF+\0\0\0\0\0\0\0\0\0\0\x003\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\x004\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0-\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\xFF\xFF`,
    lex_check: "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF(\0(\x001\x001\0(\0\xFF\xFF1\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF(\0\x001\0\xFF\xFF\xFF\xFF5\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\x07\0\b\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\v\0\0\xFF\xFF\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x007\0\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\f\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\0\0\0\x005\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\n\0\n\0\v\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\x1B\0\x1B\0\0\xFF\xFF\0\xFF\xFF\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\0\0\xFF\xFF\xFF\xFF\n\0\xFF\xFF\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\n\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF7\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\x1B\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0!\0!\0\xFF\xFF\xFF\xFF!\0\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF!\0\xFF\xFF!\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF!\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF!\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF!\0\xFF\xFF\xFF\xFF!\0!\0\xFF\xFF\xFF\xFF!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF!\0\xFF\xFF!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0!\0#\0#\0\xFF\xFF\xFF\xFF#\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'\0'\0\xFF\xFF\xFF\xFF'\0#\0\xFF\xFF#\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF#\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'\0\xFF\xFF'\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'\0\xFF\xFF\xFF\xFF\xFF\xFF#\0#\0'\0'\0\xFF\xFF'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xFF\xFF\xFF\xFF'\0'\0\xFF\xFF\xFF\xFF'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'\0\xFF\xFF'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xFF\xFF!\0)\0)\0\xFF\xFF\xFF\xFF)\0\xFF\xFF,\0,\0\xFF\xFF\xFF\xFF,\0\xFF\xFF.\0.\0\xFF\xFF\xFF\xFF.\0\xFF\xFF2\x002\0\xFF\xFF\xFF\xFF2\0)\0\xFF\xFF)\0\xFF\xFF\xFF\xFF\xFF\xFF,\0)\0,\0\xFF\xFF\xFF\xFF\xFF\xFF.\0,\0.\0\xFF\xFF\xFF\xFF\xFF\xFF2\0.\x002\0,\0\xFF\xFF\xFF\xFF\xFF\xFF2\0\xFF\xFF\xFF\xFF\xFF\xFF)\0)\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF,\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF.\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF2\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF#\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF'\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF)\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF,\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF.\0\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF2\0",
    lex_base_code: "",
    lex_backtrk_code: "",
    lex_default_code: "",
    lex_trans_code: "",
    lex_check_code: "",
    lex_code: ""
  };
  function __ocaml_lex_scan_pi_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      if (!(__ocaml_lex_state$1 > 2 || __ocaml_lex_state$1 < 0)) {
        if (__ocaml_lex_state$1 >= 2) {
          return "Eof";
        } else {
          return "Rpi";
        }
      }
      if (__ocaml_lex_state$1 === 4 || __ocaml_lex_state$1 === 3) {
        return "Mpi";
      }
      _1(lexbuf.refill_buff, lexbuf);
      ___ocaml_lex_state = __ocaml_lex_state$1;
      continue;
    }
    ;
  }
  function __ocaml_lex_scan_doctype_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      switch (__ocaml_lex_state$1) {
        case 0:
          return "Rdoctype";
        case 1:
          return "Eof";
        case 2:
          return "Mdoctype";
        default:
          _1(lexbuf.refill_buff, lexbuf);
          ___ocaml_lex_state = __ocaml_lex_state$1;
          continue;
      }
    }
    ;
  }
  function __ocaml_lex_scan_element_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      switch (__ocaml_lex_state$1) {
        case 0:
          return "Relement";
        case 1:
          return "Relement_empty";
        case 2:
          return {
            TAG: "Space",
            _0: lexeme(lexbuf).length
          };
        case 3:
          return {
            TAG: "Name",
            _0: lexeme(lexbuf)
          };
        case 4:
          return "Is";
        case 7:
          return {
            TAG: "Literal",
            _0: lexeme(lexbuf)
          };
        case 8:
          return "Eof";
        case 5:
        case 6:
        case 9:
          return "Other";
        default:
          _1(lexbuf.refill_buff, lexbuf);
          ___ocaml_lex_state = __ocaml_lex_state$1;
          continue;
      }
    }
    ;
  }
  function __ocaml_lex_scan_comment_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      if (__ocaml_lex_state$1 >= 3) {
        if (__ocaml_lex_state$1 < 4) {
          return "Mcomment";
        }
        _1(lexbuf.refill_buff, lexbuf);
        ___ocaml_lex_state = __ocaml_lex_state$1;
        continue;
      }
      if (__ocaml_lex_state$1 >= 0) {
        switch (__ocaml_lex_state$1) {
          case 0:
            return "Rcomment";
          case 1:
            return "Mcomment";
          case 2:
            return "Eof";
        }
      } else {
        _1(lexbuf.refill_buff, lexbuf);
        ___ocaml_lex_state = __ocaml_lex_state$1;
        continue;
      }
    }
    ;
  }
  function __ocaml_lex_scan_document_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      switch (__ocaml_lex_state$1) {
        case 0:
          return "Lcomment";
        case 1:
          return "Ldoctype";
        case 2:
          return "Lpi";
        case 3:
          var s = lexeme(lexbuf);
          return {
            TAG: "Lelement",
            _0: sub4(s, 1, s.length - 1 | 0)
          };
        case 4:
          var s$1 = lexeme(lexbuf);
          return {
            TAG: "Lelementend",
            _0: sub4(s$1, 2, s$1.length - 2 | 0)
          };
        case 5:
          return {
            TAG: "Cdata",
            _0: "<"
          };
        case 6:
          return "Eof";
        case 7:
          return {
            TAG: "Cdata",
            _0: lexeme(lexbuf)
          };
        default:
          _1(lexbuf.refill_buff, lexbuf);
          ___ocaml_lex_state = __ocaml_lex_state$1;
          continue;
      }
    }
    ;
  }
  function __ocaml_lex_scan_string_literal2_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      if (__ocaml_lex_state$1 === 0) {
        return sub_lexeme(lexbuf, lexbuf.lex_start_pos, lexbuf.lex_curr_pos - 1 | 0);
      }
      _1(lexbuf.refill_buff, lexbuf);
      ___ocaml_lex_state = __ocaml_lex_state$1;
      continue;
    }
    ;
  }
  function __ocaml_lex_scan_string_literal1_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      if (__ocaml_lex_state$1 === 0) {
        return sub_lexeme(lexbuf, lexbuf.lex_start_pos, lexbuf.lex_curr_pos - 1 | 0);
      }
      _1(lexbuf.refill_buff, lexbuf);
      ___ocaml_lex_state = __ocaml_lex_state$1;
      continue;
    }
    ;
  }
  function __ocaml_lex_scan_element_after_Is_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      switch (__ocaml_lex_state$1) {
        case 0:
          return "Relement";
        case 1:
          return "Relement_empty";
        case 2:
          return {
            TAG: "Space",
            _0: lexeme(lexbuf).length
          };
        case 3:
          try {
            return {
              TAG: "Literal",
              _0: __ocaml_lex_scan_string_literal1_rec(lexbuf, 53)
            };
          } catch (exn) {
            return "Other";
          }
        case 4:
          try {
            return {
              TAG: "Literal",
              _0: __ocaml_lex_scan_string_literal2_rec(lexbuf, 55)
            };
          } catch (exn$1) {
            return "Other";
          }
        case 5:
          return {
            TAG: "Literal",
            _0: lexeme(lexbuf)
          };
        case 6:
          return "Eof";
        case 7:
          return "Other";
        default:
          _1(lexbuf.refill_buff, lexbuf);
          ___ocaml_lex_state = __ocaml_lex_state$1;
          continue;
      }
    }
    ;
  }
  function __ocaml_lex_scan_special_rec(lexbuf, ___ocaml_lex_state) {
    while (true) {
      var __ocaml_lex_state = ___ocaml_lex_state;
      var __ocaml_lex_state$1 = engine(__ocaml_lex_tables, __ocaml_lex_state, lexbuf);
      switch (__ocaml_lex_state$1) {
        case 0:
          var s = lexeme(lexbuf);
          return {
            TAG: "Lelementend",
            _0: sub4(s, 2, s.length - 2 | 0)
          };
        case 1:
          return {
            TAG: "Cdata",
            _0: "<"
          };
        case 2:
          return "Eof";
        case 3:
          return {
            TAG: "Cdata",
            _0: lexeme(lexbuf)
          };
        default:
          _1(lexbuf.refill_buff, lexbuf);
          ___ocaml_lex_state = __ocaml_lex_state$1;
          continue;
      }
    }
    ;
  }
  function scan_document(lexbuf) {
    return __ocaml_lex_scan_document_rec(lexbuf, 0);
  }
  function scan_special(lexbuf) {
    return __ocaml_lex_scan_special_rec(lexbuf, 11);
  }
  function scan_comment(lexbuf) {
    return __ocaml_lex_scan_comment_rec(lexbuf, 17);
  }
  function scan_doctype(lexbuf) {
    return __ocaml_lex_scan_doctype_rec(lexbuf, 23);
  }
  function scan_pi(lexbuf) {
    return __ocaml_lex_scan_pi_rec(lexbuf, 27);
  }
  function scan_element(lexbuf) {
    return __ocaml_lex_scan_element_rec(lexbuf, 33);
  }
  function scan_element_after_Is(lexbuf) {
    return __ocaml_lex_scan_element_after_Is_rec(lexbuf, 44);
  }

  // lib/es6/netstring/code/src/netstring/nethtml.mjs
  var End_of_scan = /* @__PURE__ */ create("Nethtml.End_of_scan");
  var Found = /* @__PURE__ */ create("Nethtml.Found");
  var block_elements = {
    hd: "p",
    tl: {
      hd: "dl",
      tl: {
        hd: "div",
        tl: {
          hd: "center",
          tl: {
            hd: "noscript",
            tl: {
              hd: "noframes",
              tl: {
                hd: "blockquote",
                tl: {
                  hd: "form",
                  tl: {
                    hd: "isindex",
                    tl: {
                      hd: "hr",
                      tl: {
                        hd: "table",
                        tl: {
                          hd: "fieldset",
                          tl: {
                            hd: "address",
                            tl: {
                              hd: "h1",
                              tl: {
                                hd: "h2",
                                tl: {
                                  hd: "h3",
                                  tl: {
                                    hd: "h4",
                                    tl: {
                                      hd: "h5",
                                      tl: {
                                        hd: "h6",
                                        tl: {
                                          hd: "pre",
                                          tl: {
                                            hd: "ul",
                                            tl: {
                                              hd: "ol",
                                              tl: {
                                                hd: "dir",
                                                tl: {
                                                  hd: "menu",
                                                  tl: (
                                                    /* [] */
                                                    0
                                                  )
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var html40_dtd_0 = [
    "tt",
    [
      "Inline",
      "Inline"
    ]
  ];
  var html40_dtd_1 = {
    hd: [
      "i",
      [
        "Inline",
        "Inline"
      ]
    ],
    tl: {
      hd: [
        "b",
        [
          "Inline",
          "Inline"
        ]
      ],
      tl: {
        hd: [
          "big",
          [
            "Inline",
            "Inline"
          ]
        ],
        tl: {
          hd: [
            "small",
            [
              "Inline",
              "Inline"
            ]
          ],
          tl: {
            hd: [
              "u",
              [
                "Inline",
                "Inline"
              ]
            ],
            tl: {
              hd: [
                "s",
                [
                  "Inline",
                  "Inline"
                ]
              ],
              tl: {
                hd: [
                  "strike",
                  [
                    "Inline",
                    "Inline"
                  ]
                ],
                tl: {
                  hd: [
                    "em",
                    [
                      "Inline",
                      "Inline"
                    ]
                  ],
                  tl: {
                    hd: [
                      "strong",
                      [
                        "Inline",
                        "Inline"
                      ]
                    ],
                    tl: {
                      hd: [
                        "dfn",
                        [
                          "Inline",
                          "Inline"
                        ]
                      ],
                      tl: {
                        hd: [
                          "code",
                          [
                            "Inline",
                            "Inline"
                          ]
                        ],
                        tl: {
                          hd: [
                            "samp",
                            [
                              "Inline",
                              "Inline"
                            ]
                          ],
                          tl: {
                            hd: [
                              "kbd",
                              [
                                "Inline",
                                "Inline"
                              ]
                            ],
                            tl: {
                              hd: [
                                "var",
                                [
                                  "Inline",
                                  "Inline"
                                ]
                              ],
                              tl: {
                                hd: [
                                  "cite",
                                  [
                                    "Inline",
                                    "Inline"
                                  ]
                                ],
                                tl: {
                                  hd: [
                                    "abbr",
                                    [
                                      "Inline",
                                      "Inline"
                                    ]
                                  ],
                                  tl: {
                                    hd: [
                                      "acronym",
                                      [
                                        "Inline",
                                        "Inline"
                                      ]
                                    ],
                                    tl: {
                                      hd: [
                                        "sup",
                                        [
                                          "Inline",
                                          "Inline"
                                        ]
                                      ],
                                      tl: {
                                        hd: [
                                          "sub",
                                          [
                                            "Inline",
                                            "Inline"
                                          ]
                                        ],
                                        tl: {
                                          hd: [
                                            "span",
                                            [
                                              "Inline",
                                              "Inline"
                                            ]
                                          ],
                                          tl: {
                                            hd: [
                                              "bdo",
                                              [
                                                "Inline",
                                                "Inline"
                                              ]
                                            ],
                                            tl: {
                                              hd: [
                                                "br",
                                                [
                                                  "Inline",
                                                  "Empty"
                                                ]
                                              ],
                                              tl: {
                                                hd: [
                                                  "a",
                                                  [
                                                    "Inline",
                                                    {
                                                      NAME: "Sub_exclusions",
                                                      VAL: [
                                                        {
                                                          hd: "a",
                                                          tl: (
                                                            /* [] */
                                                            0
                                                          )
                                                        },
                                                        "Inline"
                                                      ]
                                                    }
                                                  ]
                                                ],
                                                tl: {
                                                  hd: [
                                                    "img",
                                                    [
                                                      "Inline",
                                                      "Empty"
                                                    ]
                                                  ],
                                                  tl: {
                                                    hd: [
                                                      "object",
                                                      [
                                                        "Inline",
                                                        {
                                                          NAME: "Or",
                                                          VAL: [
                                                            "Flow",
                                                            {
                                                              NAME: "Elements",
                                                              VAL: {
                                                                hd: "param",
                                                                tl: (
                                                                  /* [] */
                                                                  0
                                                                )
                                                              }
                                                            }
                                                          ]
                                                        }
                                                      ]
                                                    ],
                                                    tl: {
                                                      hd: [
                                                        "script",
                                                        [
                                                          "Inline",
                                                          "Special"
                                                        ]
                                                      ],
                                                      tl: {
                                                        hd: [
                                                          "map",
                                                          [
                                                            "Inline",
                                                            {
                                                              NAME: "Or",
                                                              VAL: [
                                                                "Flow",
                                                                {
                                                                  NAME: "Elements",
                                                                  VAL: {
                                                                    hd: "area",
                                                                    tl: (
                                                                      /* [] */
                                                                      0
                                                                    )
                                                                  }
                                                                }
                                                              ]
                                                            }
                                                          ]
                                                        ],
                                                        tl: {
                                                          hd: [
                                                            "q",
                                                            [
                                                              "Inline",
                                                              "Inline"
                                                            ]
                                                          ],
                                                          tl: {
                                                            hd: [
                                                              "applet",
                                                              [
                                                                "Inline",
                                                                {
                                                                  NAME: "Or",
                                                                  VAL: [
                                                                    "Flow",
                                                                    {
                                                                      NAME: "Elements",
                                                                      VAL: {
                                                                        hd: "param",
                                                                        tl: (
                                                                          /* [] */
                                                                          0
                                                                        )
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              ]
                                                            ],
                                                            tl: {
                                                              hd: [
                                                                "font",
                                                                [
                                                                  "Inline",
                                                                  "Inline"
                                                                ]
                                                              ],
                                                              tl: {
                                                                hd: [
                                                                  "basefont",
                                                                  [
                                                                    "Inline",
                                                                    "Empty"
                                                                  ]
                                                                ],
                                                                tl: {
                                                                  hd: [
                                                                    "iframe",
                                                                    [
                                                                      "Inline",
                                                                      "Flow"
                                                                    ]
                                                                  ],
                                                                  tl: {
                                                                    hd: [
                                                                      "input",
                                                                      [
                                                                        "Inline",
                                                                        "Empty"
                                                                      ]
                                                                    ],
                                                                    tl: {
                                                                      hd: [
                                                                        "select",
                                                                        [
                                                                          "Inline",
                                                                          {
                                                                            NAME: "Elements",
                                                                            VAL: {
                                                                              hd: "optgroup",
                                                                              tl: {
                                                                                hd: "option",
                                                                                tl: (
                                                                                  /* [] */
                                                                                  0
                                                                                )
                                                                              }
                                                                            }
                                                                          }
                                                                        ]
                                                                      ],
                                                                      tl: {
                                                                        hd: [
                                                                          "textarea",
                                                                          [
                                                                            "Inline",
                                                                            {
                                                                              NAME: "Elements",
                                                                              VAL: (
                                                                                /* [] */
                                                                                0
                                                                              )
                                                                            }
                                                                          ]
                                                                        ],
                                                                        tl: {
                                                                          hd: [
                                                                            "label",
                                                                            [
                                                                              "Inline",
                                                                              {
                                                                                NAME: "Sub_exclusions",
                                                                                VAL: [
                                                                                  {
                                                                                    hd: "label",
                                                                                    tl: (
                                                                                      /* [] */
                                                                                      0
                                                                                    )
                                                                                  },
                                                                                  "Inline"
                                                                                ]
                                                                              }
                                                                            ]
                                                                          ],
                                                                          tl: {
                                                                            hd: [
                                                                              "button",
                                                                              [
                                                                                "Inline",
                                                                                {
                                                                                  NAME: "Sub_exclusions",
                                                                                  VAL: [
                                                                                    {
                                                                                      hd: "a",
                                                                                      tl: {
                                                                                        hd: "input",
                                                                                        tl: {
                                                                                          hd: "select",
                                                                                          tl: {
                                                                                            hd: "textarea",
                                                                                            tl: {
                                                                                              hd: "label",
                                                                                              tl: {
                                                                                                hd: "button",
                                                                                                tl: {
                                                                                                  hd: "form",
                                                                                                  tl: {
                                                                                                    hd: "fieldset",
                                                                                                    tl: {
                                                                                                      hd: "isindex",
                                                                                                      tl: {
                                                                                                        hd: "iframe",
                                                                                                        tl: (
                                                                                                          /* [] */
                                                                                                          0
                                                                                                        )
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    },
                                                                                    "Flow"
                                                                                  ]
                                                                                }
                                                                              ]
                                                                            ],
                                                                            tl: {
                                                                              hd: [
                                                                                "p",
                                                                                [
                                                                                  "Block",
                                                                                  "Inline"
                                                                                ]
                                                                              ],
                                                                              tl: {
                                                                                hd: [
                                                                                  "h1",
                                                                                  [
                                                                                    "Block",
                                                                                    "Inline"
                                                                                  ]
                                                                                ],
                                                                                tl: {
                                                                                  hd: [
                                                                                    "h2",
                                                                                    [
                                                                                      "Block",
                                                                                      "Inline"
                                                                                    ]
                                                                                  ],
                                                                                  tl: {
                                                                                    hd: [
                                                                                      "h3",
                                                                                      [
                                                                                        "Block",
                                                                                        "Inline"
                                                                                      ]
                                                                                    ],
                                                                                    tl: {
                                                                                      hd: [
                                                                                        "h4",
                                                                                        [
                                                                                          "Block",
                                                                                          "Inline"
                                                                                        ]
                                                                                      ],
                                                                                      tl: {
                                                                                        hd: [
                                                                                          "h5",
                                                                                          [
                                                                                            "Block",
                                                                                            "Inline"
                                                                                          ]
                                                                                        ],
                                                                                        tl: {
                                                                                          hd: [
                                                                                            "h6",
                                                                                            [
                                                                                              "Block",
                                                                                              "Inline"
                                                                                            ]
                                                                                          ],
                                                                                          tl: {
                                                                                            hd: [
                                                                                              "ul",
                                                                                              [
                                                                                                "Block",
                                                                                                {
                                                                                                  NAME: "Elements",
                                                                                                  VAL: {
                                                                                                    hd: "li",
                                                                                                    tl: (
                                                                                                      /* [] */
                                                                                                      0
                                                                                                    )
                                                                                                  }
                                                                                                }
                                                                                              ]
                                                                                            ],
                                                                                            tl: {
                                                                                              hd: [
                                                                                                "ol",
                                                                                                [
                                                                                                  "Block",
                                                                                                  {
                                                                                                    NAME: "Elements",
                                                                                                    VAL: {
                                                                                                      hd: "li",
                                                                                                      tl: (
                                                                                                        /* [] */
                                                                                                        0
                                                                                                      )
                                                                                                    }
                                                                                                  }
                                                                                                ]
                                                                                              ],
                                                                                              tl: {
                                                                                                hd: [
                                                                                                  "dir",
                                                                                                  [
                                                                                                    "Block",
                                                                                                    {
                                                                                                      NAME: "Sub_exclusions",
                                                                                                      VAL: [
                                                                                                        block_elements,
                                                                                                        {
                                                                                                          NAME: "Elements",
                                                                                                          VAL: {
                                                                                                            hd: "li",
                                                                                                            tl: (
                                                                                                              /* [] */
                                                                                                              0
                                                                                                            )
                                                                                                          }
                                                                                                        }
                                                                                                      ]
                                                                                                    }
                                                                                                  ]
                                                                                                ],
                                                                                                tl: {
                                                                                                  hd: [
                                                                                                    "menu",
                                                                                                    [
                                                                                                      "Block",
                                                                                                      {
                                                                                                        NAME: "Sub_exclusions",
                                                                                                        VAL: [
                                                                                                          block_elements,
                                                                                                          {
                                                                                                            NAME: "Elements",
                                                                                                            VAL: {
                                                                                                              hd: "li",
                                                                                                              tl: (
                                                                                                                /* [] */
                                                                                                                0
                                                                                                              )
                                                                                                            }
                                                                                                          }
                                                                                                        ]
                                                                                                      }
                                                                                                    ]
                                                                                                  ],
                                                                                                  tl: {
                                                                                                    hd: [
                                                                                                      "pre",
                                                                                                      [
                                                                                                        "Block",
                                                                                                        {
                                                                                                          NAME: "Sub_exclusions",
                                                                                                          VAL: [
                                                                                                            {
                                                                                                              hd: "img",
                                                                                                              tl: {
                                                                                                                hd: "object",
                                                                                                                tl: {
                                                                                                                  hd: "applet",
                                                                                                                  tl: {
                                                                                                                    hd: "big",
                                                                                                                    tl: {
                                                                                                                      hd: "small",
                                                                                                                      tl: {
                                                                                                                        hd: "sub",
                                                                                                                        tl: {
                                                                                                                          hd: "sup",
                                                                                                                          tl: {
                                                                                                                            hd: "font",
                                                                                                                            tl: {
                                                                                                                              hd: "basefont",
                                                                                                                              tl: (
                                                                                                                                /* [] */
                                                                                                                                0
                                                                                                                              )
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            },
                                                                                                            "Inline"
                                                                                                          ]
                                                                                                        }
                                                                                                      ]
                                                                                                    ],
                                                                                                    tl: {
                                                                                                      hd: [
                                                                                                        "dl",
                                                                                                        [
                                                                                                          "Block",
                                                                                                          {
                                                                                                            NAME: "Elements",
                                                                                                            VAL: {
                                                                                                              hd: "dt",
                                                                                                              tl: {
                                                                                                                hd: "dd",
                                                                                                                tl: (
                                                                                                                  /* [] */
                                                                                                                  0
                                                                                                                )
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        ]
                                                                                                      ],
                                                                                                      tl: {
                                                                                                        hd: [
                                                                                                          "div",
                                                                                                          [
                                                                                                            "Block",
                                                                                                            "Flow"
                                                                                                          ]
                                                                                                        ],
                                                                                                        tl: {
                                                                                                          hd: [
                                                                                                            "noscript",
                                                                                                            [
                                                                                                              "Block",
                                                                                                              "Flow"
                                                                                                            ]
                                                                                                          ],
                                                                                                          tl: {
                                                                                                            hd: [
                                                                                                              "blockquote",
                                                                                                              [
                                                                                                                "Block",
                                                                                                                {
                                                                                                                  NAME: "Or",
                                                                                                                  VAL: [
                                                                                                                    "Flow",
                                                                                                                    {
                                                                                                                      NAME: "Elements",
                                                                                                                      VAL: {
                                                                                                                        hd: "script",
                                                                                                                        tl: (
                                                                                                                          /* [] */
                                                                                                                          0
                                                                                                                        )
                                                                                                                      }
                                                                                                                    }
                                                                                                                  ]
                                                                                                                }
                                                                                                              ]
                                                                                                            ],
                                                                                                            tl: {
                                                                                                              hd: [
                                                                                                                "form",
                                                                                                                [
                                                                                                                  "Block",
                                                                                                                  {
                                                                                                                    NAME: "Sub_exclusions",
                                                                                                                    VAL: [
                                                                                                                      {
                                                                                                                        hd: "form",
                                                                                                                        tl: (
                                                                                                                          /* [] */
                                                                                                                          0
                                                                                                                        )
                                                                                                                      },
                                                                                                                      {
                                                                                                                        NAME: "Or",
                                                                                                                        VAL: [
                                                                                                                          "Flow",
                                                                                                                          {
                                                                                                                            NAME: "Elements",
                                                                                                                            VAL: {
                                                                                                                              hd: "script",
                                                                                                                              tl: (
                                                                                                                                /* [] */
                                                                                                                                0
                                                                                                                              )
                                                                                                                            }
                                                                                                                          }
                                                                                                                        ]
                                                                                                                      }
                                                                                                                    ]
                                                                                                                  }
                                                                                                                ]
                                                                                                              ],
                                                                                                              tl: {
                                                                                                                hd: [
                                                                                                                  "hr",
                                                                                                                  [
                                                                                                                    "Block",
                                                                                                                    "Empty"
                                                                                                                  ]
                                                                                                                ],
                                                                                                                tl: {
                                                                                                                  hd: [
                                                                                                                    "table",
                                                                                                                    [
                                                                                                                      "Block",
                                                                                                                      {
                                                                                                                        NAME: "Elements",
                                                                                                                        VAL: {
                                                                                                                          hd: "caption",
                                                                                                                          tl: {
                                                                                                                            hd: "col",
                                                                                                                            tl: {
                                                                                                                              hd: "colgroup",
                                                                                                                              tl: {
                                                                                                                                hd: "thead",
                                                                                                                                tl: {
                                                                                                                                  hd: "tfoot",
                                                                                                                                  tl: {
                                                                                                                                    hd: "tbody",
                                                                                                                                    tl: {
                                                                                                                                      hd: "tr",
                                                                                                                                      tl: (
                                                                                                                                        /* [] */
                                                                                                                                        0
                                                                                                                                      )
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    ]
                                                                                                                  ],
                                                                                                                  tl: {
                                                                                                                    hd: [
                                                                                                                      "fieldset",
                                                                                                                      [
                                                                                                                        "Block",
                                                                                                                        {
                                                                                                                          NAME: "Or",
                                                                                                                          VAL: [
                                                                                                                            "Flow",
                                                                                                                            {
                                                                                                                              NAME: "Elements",
                                                                                                                              VAL: {
                                                                                                                                hd: "legend",
                                                                                                                                tl: (
                                                                                                                                  /* [] */
                                                                                                                                  0
                                                                                                                                )
                                                                                                                              }
                                                                                                                            }
                                                                                                                          ]
                                                                                                                        }
                                                                                                                      ]
                                                                                                                    ],
                                                                                                                    tl: {
                                                                                                                      hd: [
                                                                                                                        "address",
                                                                                                                        [
                                                                                                                          "Block",
                                                                                                                          "Inline"
                                                                                                                        ]
                                                                                                                      ],
                                                                                                                      tl: {
                                                                                                                        hd: [
                                                                                                                          "center",
                                                                                                                          [
                                                                                                                            "Block",
                                                                                                                            "Flow"
                                                                                                                          ]
                                                                                                                        ],
                                                                                                                        tl: {
                                                                                                                          hd: [
                                                                                                                            "noframes",
                                                                                                                            [
                                                                                                                              "Block",
                                                                                                                              "Flow"
                                                                                                                            ]
                                                                                                                          ],
                                                                                                                          tl: {
                                                                                                                            hd: [
                                                                                                                              "isindex",
                                                                                                                              [
                                                                                                                                "Block",
                                                                                                                                "Empty"
                                                                                                                              ]
                                                                                                                            ],
                                                                                                                            tl: {
                                                                                                                              hd: [
                                                                                                                                "body",
                                                                                                                                [
                                                                                                                                  "None",
                                                                                                                                  {
                                                                                                                                    NAME: "Or",
                                                                                                                                    VAL: [
                                                                                                                                      "Flow",
                                                                                                                                      {
                                                                                                                                        NAME: "Elements",
                                                                                                                                        VAL: {
                                                                                                                                          hd: "script",
                                                                                                                                          tl: (
                                                                                                                                            /* [] */
                                                                                                                                            0
                                                                                                                                          )
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    ]
                                                                                                                                  }
                                                                                                                                ]
                                                                                                                              ],
                                                                                                                              tl: {
                                                                                                                                hd: [
                                                                                                                                  "area",
                                                                                                                                  [
                                                                                                                                    "None",
                                                                                                                                    "Empty"
                                                                                                                                  ]
                                                                                                                                ],
                                                                                                                                tl: {
                                                                                                                                  hd: [
                                                                                                                                    "link",
                                                                                                                                    [
                                                                                                                                      "None",
                                                                                                                                      "Empty"
                                                                                                                                    ]
                                                                                                                                  ],
                                                                                                                                  tl: {
                                                                                                                                    hd: [
                                                                                                                                      "param",
                                                                                                                                      [
                                                                                                                                        "None",
                                                                                                                                        "Empty"
                                                                                                                                      ]
                                                                                                                                    ],
                                                                                                                                    tl: {
                                                                                                                                      hd: [
                                                                                                                                        "ins",
                                                                                                                                        [
                                                                                                                                          "Everywhere",
                                                                                                                                          "Flow"
                                                                                                                                        ]
                                                                                                                                      ],
                                                                                                                                      tl: {
                                                                                                                                        hd: [
                                                                                                                                          "del",
                                                                                                                                          [
                                                                                                                                            "Everywhere",
                                                                                                                                            "Flow"
                                                                                                                                          ]
                                                                                                                                        ],
                                                                                                                                        tl: {
                                                                                                                                          hd: [
                                                                                                                                            "dt",
                                                                                                                                            [
                                                                                                                                              "None",
                                                                                                                                              "Inline"
                                                                                                                                            ]
                                                                                                                                          ],
                                                                                                                                          tl: {
                                                                                                                                            hd: [
                                                                                                                                              "dd",
                                                                                                                                              [
                                                                                                                                                "None",
                                                                                                                                                "Flow"
                                                                                                                                              ]
                                                                                                                                            ],
                                                                                                                                            tl: {
                                                                                                                                              hd: [
                                                                                                                                                "li",
                                                                                                                                                [
                                                                                                                                                  "None",
                                                                                                                                                  "Flow"
                                                                                                                                                ]
                                                                                                                                              ],
                                                                                                                                              tl: {
                                                                                                                                                hd: [
                                                                                                                                                  "optgroup",
                                                                                                                                                  [
                                                                                                                                                    "None",
                                                                                                                                                    {
                                                                                                                                                      NAME: "Elements",
                                                                                                                                                      VAL: {
                                                                                                                                                        hd: "option",
                                                                                                                                                        tl: (
                                                                                                                                                          /* [] */
                                                                                                                                                          0
                                                                                                                                                        )
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  ]
                                                                                                                                                ],
                                                                                                                                                tl: {
                                                                                                                                                  hd: [
                                                                                                                                                    "option",
                                                                                                                                                    [
                                                                                                                                                      "None",
                                                                                                                                                      {
                                                                                                                                                        NAME: "Elements",
                                                                                                                                                        VAL: (
                                                                                                                                                          /* [] */
                                                                                                                                                          0
                                                                                                                                                        )
                                                                                                                                                      }
                                                                                                                                                    ]
                                                                                                                                                  ],
                                                                                                                                                  tl: {
                                                                                                                                                    hd: [
                                                                                                                                                      "legend",
                                                                                                                                                      [
                                                                                                                                                        "None",
                                                                                                                                                        "Inline"
                                                                                                                                                      ]
                                                                                                                                                    ],
                                                                                                                                                    tl: {
                                                                                                                                                      hd: [
                                                                                                                                                        "caption",
                                                                                                                                                        [
                                                                                                                                                          "None",
                                                                                                                                                          "Inline"
                                                                                                                                                        ]
                                                                                                                                                      ],
                                                                                                                                                      tl: {
                                                                                                                                                        hd: [
                                                                                                                                                          "thead",
                                                                                                                                                          [
                                                                                                                                                            "None",
                                                                                                                                                            {
                                                                                                                                                              NAME: "Elements",
                                                                                                                                                              VAL: {
                                                                                                                                                                hd: "tr",
                                                                                                                                                                tl: (
                                                                                                                                                                  /* [] */
                                                                                                                                                                  0
                                                                                                                                                                )
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          ]
                                                                                                                                                        ],
                                                                                                                                                        tl: {
                                                                                                                                                          hd: [
                                                                                                                                                            "tbody",
                                                                                                                                                            [
                                                                                                                                                              "None",
                                                                                                                                                              {
                                                                                                                                                                NAME: "Elements",
                                                                                                                                                                VAL: {
                                                                                                                                                                  hd: "tr",
                                                                                                                                                                  tl: (
                                                                                                                                                                    /* [] */
                                                                                                                                                                    0
                                                                                                                                                                  )
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            ]
                                                                                                                                                          ],
                                                                                                                                                          tl: {
                                                                                                                                                            hd: [
                                                                                                                                                              "tfoot",
                                                                                                                                                              [
                                                                                                                                                                "None",
                                                                                                                                                                {
                                                                                                                                                                  NAME: "Elements",
                                                                                                                                                                  VAL: {
                                                                                                                                                                    hd: "tr",
                                                                                                                                                                    tl: (
                                                                                                                                                                      /* [] */
                                                                                                                                                                      0
                                                                                                                                                                    )
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              ]
                                                                                                                                                            ],
                                                                                                                                                            tl: {
                                                                                                                                                              hd: [
                                                                                                                                                                "colgroup",
                                                                                                                                                                [
                                                                                                                                                                  "None",
                                                                                                                                                                  {
                                                                                                                                                                    NAME: "Elements",
                                                                                                                                                                    VAL: {
                                                                                                                                                                      hd: "col",
                                                                                                                                                                      tl: (
                                                                                                                                                                        /* [] */
                                                                                                                                                                        0
                                                                                                                                                                      )
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                ]
                                                                                                                                                              ],
                                                                                                                                                              tl: {
                                                                                                                                                                hd: [
                                                                                                                                                                  "col",
                                                                                                                                                                  [
                                                                                                                                                                    "None",
                                                                                                                                                                    "Empty"
                                                                                                                                                                  ]
                                                                                                                                                                ],
                                                                                                                                                                tl: {
                                                                                                                                                                  hd: [
                                                                                                                                                                    "tr",
                                                                                                                                                                    [
                                                                                                                                                                      "None",
                                                                                                                                                                      {
                                                                                                                                                                        NAME: "Elements",
                                                                                                                                                                        VAL: {
                                                                                                                                                                          hd: "th",
                                                                                                                                                                          tl: {
                                                                                                                                                                            hd: "td",
                                                                                                                                                                            tl: (
                                                                                                                                                                              /* [] */
                                                                                                                                                                              0
                                                                                                                                                                            )
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    ]
                                                                                                                                                                  ],
                                                                                                                                                                  tl: {
                                                                                                                                                                    hd: [
                                                                                                                                                                      "th",
                                                                                                                                                                      [
                                                                                                                                                                        "None",
                                                                                                                                                                        "Flow"
                                                                                                                                                                      ]
                                                                                                                                                                    ],
                                                                                                                                                                    tl: {
                                                                                                                                                                      hd: [
                                                                                                                                                                        "td",
                                                                                                                                                                        [
                                                                                                                                                                          "None",
                                                                                                                                                                          "Flow"
                                                                                                                                                                        ]
                                                                                                                                                                      ],
                                                                                                                                                                      tl: {
                                                                                                                                                                        hd: [
                                                                                                                                                                          "head",
                                                                                                                                                                          [
                                                                                                                                                                            "None",
                                                                                                                                                                            {
                                                                                                                                                                              NAME: "Elements",
                                                                                                                                                                              VAL: {
                                                                                                                                                                                hd: "title",
                                                                                                                                                                                tl: {
                                                                                                                                                                                  hd: "base",
                                                                                                                                                                                  tl: {
                                                                                                                                                                                    hd: "script",
                                                                                                                                                                                    tl: {
                                                                                                                                                                                      hd: "style",
                                                                                                                                                                                      tl: {
                                                                                                                                                                                        hd: "meta",
                                                                                                                                                                                        tl: {
                                                                                                                                                                                          hd: "link",
                                                                                                                                                                                          tl: {
                                                                                                                                                                                            hd: "object",
                                                                                                                                                                                            tl: (
                                                                                                                                                                                              /* [] */
                                                                                                                                                                                              0
                                                                                                                                                                                            )
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          ]
                                                                                                                                                                        ],
                                                                                                                                                                        tl: {
                                                                                                                                                                          hd: [
                                                                                                                                                                            "title",
                                                                                                                                                                            [
                                                                                                                                                                              "None",
                                                                                                                                                                              {
                                                                                                                                                                                NAME: "Elements",
                                                                                                                                                                                VAL: (
                                                                                                                                                                                  /* [] */
                                                                                                                                                                                  0
                                                                                                                                                                                )
                                                                                                                                                                              }
                                                                                                                                                                            ]
                                                                                                                                                                          ],
                                                                                                                                                                          tl: {
                                                                                                                                                                            hd: [
                                                                                                                                                                              "base",
                                                                                                                                                                              [
                                                                                                                                                                                "None",
                                                                                                                                                                                "Empty"
                                                                                                                                                                              ]
                                                                                                                                                                            ],
                                                                                                                                                                            tl: {
                                                                                                                                                                              hd: [
                                                                                                                                                                                "meta",
                                                                                                                                                                                [
                                                                                                                                                                                  "None",
                                                                                                                                                                                  "Empty"
                                                                                                                                                                                ]
                                                                                                                                                                              ],
                                                                                                                                                                              tl: {
                                                                                                                                                                                hd: [
                                                                                                                                                                                  "style",
                                                                                                                                                                                  [
                                                                                                                                                                                    "None",
                                                                                                                                                                                    "Special"
                                                                                                                                                                                  ]
                                                                                                                                                                                ],
                                                                                                                                                                                tl: {
                                                                                                                                                                                  hd: [
                                                                                                                                                                                    "html",
                                                                                                                                                                                    [
                                                                                                                                                                                      "None",
                                                                                                                                                                                      {
                                                                                                                                                                                        NAME: "Or",
                                                                                                                                                                                        VAL: [
                                                                                                                                                                                          "Flow",
                                                                                                                                                                                          {
                                                                                                                                                                                            NAME: "Elements",
                                                                                                                                                                                            VAL: {
                                                                                                                                                                                              hd: "head",
                                                                                                                                                                                              tl: {
                                                                                                                                                                                                hd: "title",
                                                                                                                                                                                                tl: {
                                                                                                                                                                                                  hd: "base",
                                                                                                                                                                                                  tl: {
                                                                                                                                                                                                    hd: "script",
                                                                                                                                                                                                    tl: {
                                                                                                                                                                                                      hd: "style",
                                                                                                                                                                                                      tl: {
                                                                                                                                                                                                        hd: "meta",
                                                                                                                                                                                                        tl: {
                                                                                                                                                                                                          hd: "link",
                                                                                                                                                                                                          tl: {
                                                                                                                                                                                                            hd: "object",
                                                                                                                                                                                                            tl: {
                                                                                                                                                                                                              hd: "body",
                                                                                                                                                                                                              tl: {
                                                                                                                                                                                                                hd: "frameset",
                                                                                                                                                                                                                tl: (
                                                                                                                                                                                                                  /* [] */
                                                                                                                                                                                                                  0
                                                                                                                                                                                                                )
                                                                                                                                                                                                              }
                                                                                                                                                                                                            }
                                                                                                                                                                                                          }
                                                                                                                                                                                                        }
                                                                                                                                                                                                      }
                                                                                                                                                                                                    }
                                                                                                                                                                                                  }
                                                                                                                                                                                                }
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        ]
                                                                                                                                                                                      }
                                                                                                                                                                                    ]
                                                                                                                                                                                  ],
                                                                                                                                                                                  tl: {
                                                                                                                                                                                    hd: [
                                                                                                                                                                                      "frameset",
                                                                                                                                                                                      [
                                                                                                                                                                                        "None",
                                                                                                                                                                                        {
                                                                                                                                                                                          NAME: "Elements",
                                                                                                                                                                                          VAL: {
                                                                                                                                                                                            hd: "frameset",
                                                                                                                                                                                            tl: {
                                                                                                                                                                                              hd: "frame",
                                                                                                                                                                                              tl: {
                                                                                                                                                                                                hd: "noframes",
                                                                                                                                                                                                tl: (
                                                                                                                                                                                                  /* [] */
                                                                                                                                                                                                  0
                                                                                                                                                                                                )
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      ]
                                                                                                                                                                                    ],
                                                                                                                                                                                    tl: {
                                                                                                                                                                                      hd: [
                                                                                                                                                                                        "frame",
                                                                                                                                                                                        [
                                                                                                                                                                                          "None",
                                                                                                                                                                                          "Empty"
                                                                                                                                                                                        ]
                                                                                                                                                                                      ],
                                                                                                                                                                                      tl: (
                                                                                                                                                                                        /* [] */
                                                                                                                                                                                        0
                                                                                                                                                                                      )
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var html40_dtd = {
    hd: html40_dtd_0,
    tl: html40_dtd_1
  };
  function relax_dtd(dtd) {
    var relax_model = function(m) {
      if (typeof m !== "object") {
        if (m === "Inline") {
          return "Flow";
        } else {
          return m;
        }
      }
      if (m.NAME !== "Sub_exclusions") {
        return m;
      }
      var match = m.VAL;
      return {
        NAME: "Sub_exclusions",
        VAL: [
          match[0],
          relax_model(match[1])
        ]
      };
    };
    return map(function(param) {
      var match = param[1];
      var elconstr = match[1];
      var elclass = match[0];
      var name42 = param[0];
      if (elclass === "Inline") {
        return [
          name42,
          [
            elclass,
            relax_model(elconstr)
          ]
        ];
      } else {
        return [
          name42,
          [
            elclass,
            elconstr
          ]
        ];
      }
    }, dtd);
  }
  function essential_blocks(dtd, elements) {
    return map(function(param) {
      var match = param[1];
      var elconstr = match[1];
      var elclass = match[0];
      var name42 = param[0];
      if (elclass === "Block" && mem(name42, elements)) {
        return [
          name42,
          [
            "Essential_block",
            elconstr
          ]
        ];
      } else {
        return [
          name42,
          [
            elclass,
            elconstr
          ]
        ];
      }
    }, dtd);
  }
  var relaxed_html40_dtd = essential_blocks(relax_dtd(html40_dtd), {
    hd: "body",
    tl: {
      hd: "table",
      tl: {
        hd: "ol",
        tl: {
          hd: "ul",
          tl: {
            hd: "dl",
            tl: (
              /* [] */
              0
            )
          }
        }
      }
    }
  });
  function parse_comment(buf) {
    var _acc = "";
    while (true) {
      var acc = _acc;
      var t = scan_comment(buf);
      if (typeof t === "object") {
        return acc;
      }
      switch (t) {
        case "Mcomment":
          var s = lexeme(buf);
          _acc = acc + s;
          continue;
        case "Eof":
          throw {
            RE_EXN_ID: End_of_scan,
            Error: new Error()
          };
        default:
          return acc;
      }
    }
    ;
  }
  function parse_doctype(buf) {
    var t = scan_doctype(buf);
    if (typeof t === "object") {
      return "";
    }
    switch (t) {
      case "Mdoctype":
        var s = lexeme(buf);
        return s + parse_doctype(buf);
      case "Eof":
        throw {
          RE_EXN_ID: End_of_scan,
          Error: new Error()
        };
      default:
        return "";
    }
  }
  function parse_pi(buf) {
    var t = scan_pi(buf);
    if (typeof t === "object") {
      return "";
    }
    switch (t) {
      case "Mpi":
        var s = lexeme(buf);
        return s + parse_pi(buf);
      case "Eof":
        throw {
          RE_EXN_ID: End_of_scan,
          Error: new Error()
        };
      default:
        return "";
    }
  }
  function hashtbl_from_alist(l) {
    var ht = create5(void 0, length(l));
    iter(function(param) {
      add2(ht, param[0], param[1]);
    }, l);
    return ht;
  }
  var compare4 = string_compare;
  var S = {
    compare: compare4
  };
  var Strset = Make(S);
  function parse_document(dtdOpt, return_declarationsOpt, return_pisOpt, return_commentsOpt, case_sensitiveOpt, buf) {
    var dtd = dtdOpt !== void 0 ? dtdOpt : html40_dtd;
    var return_declarations = return_declarationsOpt !== void 0 ? return_declarationsOpt : false;
    var return_pis = return_pisOpt !== void 0 ? return_pisOpt : false;
    var return_comments = return_commentsOpt !== void 0 ? return_commentsOpt : false;
    var case_sensitive = case_sensitiveOpt !== void 0 ? case_sensitiveOpt : false;
    var current_name = {
      contents: ""
    };
    var current_atts = {
      contents: (
        /* [] */
        0
      )
    };
    var current_subs = {
      contents: (
        /* [] */
        0
      )
    };
    var current_excl = {
      contents: Strset.empty
    };
    var stack = create4();
    var dtd_hash = hashtbl_from_alist(dtd);
    var maybe_lowercase = case_sensitive ? function(s) {
      return s;
    } : lowercase_ascii3;
    var model_of = function(element_name) {
      if (element_name === "") {
        return [
          "Everywhere",
          "Any"
        ];
      }
      try {
        var m = find3(dtd_hash, element_name);
        var match2 = m[1];
        if (typeof match2 === "object" && match2.NAME === "Sub_exclusions") {
          return [
            m[0],
            match2.VAL[1]
          ];
        } else {
          return m;
        }
      } catch (raw_exn) {
        var exn2 = internalToOCamlException(raw_exn);
        if (exn2.RE_EXN_ID === "Not_found") {
          return [
            "Everywhere",
            "Any"
          ];
        }
        throw exn2;
      }
    };
    var exclusions_of = function(element_name) {
      if (element_name === "") {
        return (
          /* [] */
          0
        );
      }
      try {
        var param = find3(dtd_hash, element_name);
        var match2 = param[1];
        if (typeof match2 === "object" && match2.NAME === "Sub_exclusions") {
          return match2.VAL[0];
        } else {
          return (
            /* [] */
            0
          );
        }
      } catch (raw_exn) {
        var exn2 = internalToOCamlException(raw_exn);
        if (exn2.RE_EXN_ID === "Not_found") {
          return (
            /* [] */
            0
          );
        }
        throw exn2;
      }
    };
    var is_possible_subelement = function(parent_element, parent_exclusions, sub_element) {
      var match2 = model_of(sub_element);
      var sub_class = match2[0];
      var $$eval = function(_m) {
        while (true) {
          var m = _m;
          if (typeof m !== "object") {
            if (m === "Inline") {
              return sub_class === "Inline";
            } else if (m === "Any") {
              return true;
            } else if (m === "Special" || m === "Empty") {
              return false;
            } else if (m === "Flow") {
              if (sub_class === "Inline" || sub_class === "Block") {
                return true;
              } else {
                return sub_class === "Essential_block";
              }
            } else if (sub_class === "Block") {
              return true;
            } else {
              return sub_class === "Essential_block";
            }
          }
          var variant = m.NAME;
          if (variant === "Except") {
            var match3 = m.VAL;
            if ($$eval(match3[0])) {
              return !$$eval(match3[1]);
            } else {
              return false;
            }
          }
          if (variant === "Or") {
            var match$12 = m.VAL;
            if ($$eval(match$12[0])) {
              return true;
            }
            _m = match$12[1];
            continue;
          }
          if (variant === "Sub_exclusions") {
            throw {
              RE_EXN_ID: "Assert_failure",
              _1: [
                "nethtml.ml",
                358,
                27
              ],
              Error: new Error()
            };
          }
          return mem(sub_element, m.VAL);
        }
        ;
      };
      if (sub_class === "Everywhere") {
        return true;
      }
      if (_2(Strset.mem, sub_element, parent_exclusions)) {
        return false;
      }
      var match$1 = model_of(parent_element);
      return $$eval(match$1[1]);
    };
    var unwind_stack = function(sub_name) {
      var backup = create4();
      var backup_name = current_name.contents;
      var backup_atts = current_atts.contents;
      var backup_subs = current_subs.contents;
      var backup_excl = current_excl.contents;
      try {
        while (!is_possible_subelement(current_name.contents, current_excl.contents, sub_name)) {
          var match2 = model_of(current_name.contents);
          if (match2[0] === "Essential_block") {
            throw {
              RE_EXN_ID: Empty,
              Error: new Error()
            };
          }
          var grant_parent = pop(stack);
          push(grant_parent, backup);
          var current = {
            TAG: "Element",
            _0: [
              current_name.contents,
              current_atts.contents,
              rev(current_subs.contents)
            ]
          };
          current_name.contents = grant_parent[0];
          current_atts.contents = grant_parent[1];
          current_excl.contents = grant_parent[3];
          current_subs.contents = {
            hd: current,
            tl: grant_parent[2]
          };
        }
        ;
        return;
      } catch (raw_exn) {
        var exn2 = internalToOCamlException(raw_exn);
        if (exn2.RE_EXN_ID === Empty) {
          while (length5(backup) > 0) {
            push(pop(backup), stack);
          }
          ;
          current_name.contents = backup_name;
          current_atts.contents = backup_atts;
          current_subs.contents = backup_subs;
          current_excl.contents = backup_excl;
          return;
        }
        throw exn2;
      }
    };
    var parse_atts = function(param) {
      var next_no_space = function(p_string) {
        while (true) {
          var tok = p_string ? scan_element_after_Is(buf) : scan_element(buf);
          if (typeof tok !== "object") {
            return tok;
          }
          if (tok.TAG !== "Space") {
            return tok;
          }
          continue;
        }
        ;
      };
      var parse_atts_lookahead = function(_next) {
        while (true) {
          var next = _next;
          if (typeof next !== "object") {
            switch (next) {
              case "Relement":
                return [
                  /* [] */
                  0,
                  false
                ];
              case "Relement_empty":
                return [
                  /* [] */
                  0,
                  true
                ];
              case "Eof":
                throw {
                  RE_EXN_ID: End_of_scan,
                  Error: new Error()
                };
              default:
                _next = next_no_space(false);
                continue;
            }
          } else {
            if (next.TAG === "Name") {
              var n = next._0;
              var next$p = next_no_space(false);
              if (typeof next$p !== "object") {
                switch (next$p) {
                  case "Relement":
                    return [
                      {
                        hd: [
                          _1(maybe_lowercase, n),
                          _1(maybe_lowercase, n)
                        ],
                        tl: (
                          /* [] */
                          0
                        )
                      },
                      false
                    ];
                  case "Relement_empty":
                    return [
                      {
                        hd: [
                          _1(maybe_lowercase, n),
                          _1(maybe_lowercase, n)
                        ],
                        tl: (
                          /* [] */
                          0
                        )
                      },
                      true
                    ];
                  case "Is":
                    var v = next_no_space(true);
                    var exit = 0;
                    if (typeof v !== "object") {
                      switch (v) {
                        case "Relement":
                          return [
                            /* [] */
                            0,
                            false
                          ];
                        case "Relement_empty":
                          return [
                            /* [] */
                            0,
                            true
                          ];
                        case "Eof":
                          throw {
                            RE_EXN_ID: End_of_scan,
                            Error: new Error()
                          };
                        default:
                          _next = next_no_space(false);
                          continue;
                      }
                    } else {
                      switch (v.TAG) {
                        case "Name":
                        case "Literal":
                          exit = 2;
                          break;
                        default:
                          _next = next_no_space(false);
                          continue;
                      }
                    }
                    if (exit === 2) {
                      var match2 = parse_atts_lookahead(next_no_space(false));
                      return [
                        {
                          hd: [
                            _1(maybe_lowercase, n),
                            v._0
                          ],
                          tl: match2[0]
                        },
                        match2[1]
                      ];
                    }
                    break;
                  case "Eof":
                    throw {
                      RE_EXN_ID: End_of_scan,
                      Error: new Error()
                    };
                  default:
                }
              }
              var match$1 = parse_atts_lookahead(next$p);
              return [
                {
                  hd: [
                    _1(maybe_lowercase, n),
                    _1(maybe_lowercase, n)
                  ],
                  tl: match$1[0]
                },
                match$1[1]
              ];
            }
            _next = next_no_space(false);
            continue;
          }
        }
        ;
      };
      return parse_atts_lookahead(next_no_space(false));
    };
    var parse_special = function(name42) {
      while (true) {
        var n = scan_special(buf);
        if (typeof n !== "object") {
          if (n === "Eof") {
            throw {
              RE_EXN_ID: End_of_scan,
              Error: new Error()
            };
          }
          continue;
        } else {
          switch (n.TAG) {
            case "Lelementend":
              var n$1 = n._0;
              if (_1(maybe_lowercase, n$1) === name42) {
                return "";
              } else {
                return "</" + (n$1 + parse_special(name42));
              }
            case "Cdata":
              return n._0 + parse_special(name42);
            default:
              continue;
          }
        }
      }
      ;
    };
    var skip_element = function(_param) {
      while (true) {
        var match2 = scan_element(buf);
        if (typeof match2 !== "object") {
          switch (match2) {
            case "Relement":
            case "Relement_empty":
              return;
            case "Eof":
              throw {
                RE_EXN_ID: End_of_scan,
                Error: new Error()
              };
            default:
              _param = void 0;
              continue;
          }
        } else {
          _param = void 0;
          continue;
        }
      }
      ;
    };
    var parse_next = function(_param) {
      while (true) {
        var t = scan_document(buf);
        if (typeof t !== "object") {
          switch (t) {
            case "Lcomment":
              var comment = parse_comment(buf);
              if (return_comments) {
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      "--",
                      {
                        hd: [
                          "contents",
                          comment
                        ],
                        tl: (
                          /* [] */
                          0
                        )
                      },
                      /* [] */
                      0
                    ]
                  },
                  tl: current_subs.contents
                };
              }
              _param = void 0;
              continue;
            case "Ldoctype":
              var decl = parse_doctype(buf);
              if (return_declarations) {
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      "!",
                      {
                        hd: [
                          "contents",
                          decl
                        ],
                        tl: (
                          /* [] */
                          0
                        )
                      },
                      /* [] */
                      0
                    ]
                  },
                  tl: current_subs.contents
                };
              }
              _param = void 0;
              continue;
            case "Lpi":
              var pi = parse_pi(buf);
              if (return_pis) {
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      "?",
                      {
                        hd: [
                          "contents",
                          pi
                        ],
                        tl: (
                          /* [] */
                          0
                        )
                      },
                      /* [] */
                      0
                    ]
                  },
                  tl: current_subs.contents
                };
              }
              _param = void 0;
              continue;
            case "Eof":
              throw {
                RE_EXN_ID: End_of_scan,
                Error: new Error()
              };
            default:
              _param = void 0;
              continue;
          }
        } else {
          switch (t.TAG) {
            case "Lelement":
              var name42 = _1(maybe_lowercase, t._0);
              var match2 = model_of(name42);
              var model = match2[1];
              if (model === "Empty") {
                var match$1 = parse_atts();
                unwind_stack(name42);
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      name42,
                      match$1[0],
                      /* [] */
                      0
                    ]
                  },
                  tl: current_subs.contents
                };
                _param = void 0;
                continue;
              }
              if (model === "Special") {
                var match$2 = parse_atts();
                unwind_stack(name42);
                var data;
                if (match$2[1]) {
                  data = "";
                } else {
                  var d = parse_special(name42);
                  skip_element();
                  data = d;
                }
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      name42,
                      match$2[0],
                      {
                        hd: {
                          TAG: "Data",
                          _0: data
                        },
                        tl: (
                          /* [] */
                          0
                        )
                      }
                    ]
                  },
                  tl: current_subs.contents
                };
                _param = void 0;
                continue;
              }
              var match$3 = parse_atts();
              var atts = match$3[0];
              unwind_stack(name42);
              if (match$3[1]) {
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      name42,
                      atts,
                      /* [] */
                      0
                    ]
                  },
                  tl: current_subs.contents
                };
              } else {
                var new_excl = exclusions_of(name42);
                push([
                  current_name.contents,
                  current_atts.contents,
                  current_subs.contents,
                  current_excl.contents
                ], stack);
                current_name.contents = name42;
                current_atts.contents = atts;
                current_subs.contents = /* [] */
                0;
                iter(function(xel) {
                  current_excl.contents = _2(Strset.add, xel, current_excl.contents);
                }, new_excl);
              }
              _param = void 0;
              continue;
            case "Lelementend":
              var name$1 = _1(maybe_lowercase, t._0);
              skip_element();
              var found = true;
              if (name$1 !== current_name.contents) {
                var tmp;
                try {
                  iter4(/* @__PURE__ */ function(name$12) {
                    return function(param) {
                      var old_name = param[0];
                      if (name$12 === old_name) {
                        throw {
                          RE_EXN_ID: Found,
                          Error: new Error()
                        };
                      }
                      var match3 = model_of(old_name);
                      if (match3[0] !== "Essential_block") {
                        return;
                      }
                      throw {
                        RE_EXN_ID: "Not_found",
                        Error: new Error()
                      };
                    };
                  }(name$1), stack);
                  tmp = false;
                } catch (raw_exn) {
                  var exn2 = internalToOCamlException(raw_exn);
                  if (exn2.RE_EXN_ID === Found) {
                    tmp = true;
                  } else if (exn2.RE_EXN_ID === "Not_found") {
                    tmp = false;
                  } else {
                    throw exn2;
                  }
                }
                found = tmp;
              }
              if (found) {
                while (current_name.contents !== name$1) {
                  var match$4 = pop(stack);
                  current_subs.contents = {
                    hd: {
                      TAG: "Element",
                      _0: [
                        current_name.contents,
                        current_atts.contents,
                        rev(current_subs.contents)
                      ]
                    },
                    tl: match$4[2]
                  };
                  current_name.contents = match$4[0];
                  current_atts.contents = match$4[1];
                  current_excl.contents = match$4[3];
                }
                ;
                var match$5 = pop(stack);
                current_subs.contents = {
                  hd: {
                    TAG: "Element",
                    _0: [
                      current_name.contents,
                      current_atts.contents,
                      rev(current_subs.contents)
                    ]
                  },
                  tl: match$5[2]
                };
                current_name.contents = match$5[0];
                current_atts.contents = match$5[1];
                current_excl.contents = match$5[3];
                _param = void 0;
                continue;
              }
              _param = void 0;
              continue;
            case "Cdata":
              current_subs.contents = {
                hd: {
                  TAG: "Data",
                  _0: t._0
                },
                tl: current_subs.contents
              };
              _param = void 0;
              continue;
            default:
              _param = void 0;
              continue;
          }
        }
      }
      ;
    };
    try {
      parse_next();
      throw {
        RE_EXN_ID: "Assert_failure",
        _1: [
          "nethtml.ml",
          632,
          4
        ],
        Error: new Error()
      };
    } catch (raw_exn) {
      var exn = internalToOCamlException(raw_exn);
      if (exn.RE_EXN_ID === End_of_scan) {
        while (length5(stack) > 0) {
          var match = pop(stack);
          current_subs.contents = {
            hd: {
              TAG: "Element",
              _0: [
                current_name.contents,
                current_atts.contents,
                rev(current_subs.contents)
              ]
            },
            tl: match[2]
          };
          current_name.contents = match[0];
          current_atts.contents = match[1];
          current_excl.contents = match[3];
        }
        ;
        return rev(current_subs.contents);
      }
      throw exn;
    }
  }
  function write(dtd, xhtml, write_os, doc) {
    var trav = function(doc2) {
      if (doc2.TAG !== "Element") {
        return _1(write_os, doc2._0);
      }
      var match = doc2._0;
      var atts = match[1];
      var name42 = match[0];
      switch (name42) {
        case "!":
          _1(write_os, "<!");
          _1(write_os, assoc("contents", atts));
          return _1(write_os, ">");
        case "--":
          _1(write_os, "<!--");
          _1(write_os, assoc("contents", atts));
          return _1(write_os, "-->");
        case "?":
          _1(write_os, "<?");
          _1(write_os, assoc("contents", atts));
          return _1(write_os, ">");
        default:
          var is_empty;
          try {
            var match$1 = assoc(name42, dtd);
            is_empty = match$1[1] === "Empty";
          } catch (raw_exn) {
            var exn2 = internalToOCamlException(raw_exn);
            if (exn2.RE_EXN_ID === "Not_found") {
              is_empty = false;
            } else {
              throw exn2;
            }
          }
          _1(write_os, "<");
          _1(write_os, name42);
          iter(function(param) {
            _1(write_os, " ");
            _1(write_os, param[0]);
            _1(write_os, '="');
            _1(write_os, concat3("&quot;", split_by_quote(param[1])));
            _1(write_os, '"');
          }, atts);
          if (is_empty) {
            return _1(write_os, xhtml ? "/>" : ">");
          } else {
            _1(write_os, ">");
            iter(trav, match[2]);
            _1(write_os, "</");
            _1(write_os, name42);
            return _1(write_os, ">");
          }
      }
    };
    try {
      return iter(trav, doc);
    } catch (raw_exn) {
      var exn = internalToOCamlException(raw_exn);
      if (exn.RE_EXN_ID === "Not_found") {
        return failwith("write");
      }
      throw exn;
    }
  }

  // lib/es6/src/main/re/html/html5Dtd.mjs
  var block_elements2 = {
    hd: "p",
    tl: {
      hd: "dl",
      tl: {
        hd: "div",
        tl: {
          hd: "center",
          tl: {
            hd: "noscript",
            tl: {
              hd: "noframes",
              tl: {
                hd: "blockquote",
                tl: {
                  hd: "form",
                  tl: {
                    hd: "isindex",
                    tl: {
                      hd: "hr",
                      tl: {
                        hd: "table",
                        tl: {
                          hd: "fieldset",
                          tl: {
                            hd: "address",
                            tl: {
                              hd: "h1",
                              tl: {
                                hd: "h2",
                                tl: {
                                  hd: "h3",
                                  tl: {
                                    hd: "h4",
                                    tl: {
                                      hd: "h5",
                                      tl: {
                                        hd: "h6",
                                        tl: {
                                          hd: "pre",
                                          tl: {
                                            hd: "ul",
                                            tl: {
                                              hd: "ol",
                                              tl: {
                                                hd: "dir",
                                                tl: {
                                                  hd: "menu",
                                                  tl: (
                                                    /* [] */
                                                    0
                                                  )
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var html5_dtd_0 = [
    "tt",
    [
      "Inline",
      "Flow"
    ]
  ];
  var html5_dtd_1 = {
    hd: [
      "i",
      [
        "Inline",
        "Flow"
      ]
    ],
    tl: {
      hd: [
        "b",
        [
          "Inline",
          "Flow"
        ]
      ],
      tl: {
        hd: [
          "big",
          [
            "Inline",
            "Flow"
          ]
        ],
        tl: {
          hd: [
            "small",
            [
              "Inline",
              "Flow"
            ]
          ],
          tl: {
            hd: [
              "u",
              [
                "Inline",
                "Flow"
              ]
            ],
            tl: {
              hd: [
                "s",
                [
                  "Inline",
                  "Flow"
                ]
              ],
              tl: {
                hd: [
                  "strike",
                  [
                    "Inline",
                    "Flow"
                  ]
                ],
                tl: {
                  hd: [
                    "em",
                    [
                      "Inline",
                      "Flow"
                    ]
                  ],
                  tl: {
                    hd: [
                      "strong",
                      [
                        "Inline",
                        "Flow"
                      ]
                    ],
                    tl: {
                      hd: [
                        "dfn",
                        [
                          "Inline",
                          "Flow"
                        ]
                      ],
                      tl: {
                        hd: [
                          "code",
                          [
                            "Inline",
                            "Flow"
                          ]
                        ],
                        tl: {
                          hd: [
                            "samp",
                            [
                              "Inline",
                              "Flow"
                            ]
                          ],
                          tl: {
                            hd: [
                              "kbd",
                              [
                                "Inline",
                                "Flow"
                              ]
                            ],
                            tl: {
                              hd: [
                                "var",
                                [
                                  "Inline",
                                  "Flow"
                                ]
                              ],
                              tl: {
                                hd: [
                                  "cite",
                                  [
                                    "Inline",
                                    "Flow"
                                  ]
                                ],
                                tl: {
                                  hd: [
                                    "abbr",
                                    [
                                      "Inline",
                                      "Flow"
                                    ]
                                  ],
                                  tl: {
                                    hd: [
                                      "acronym",
                                      [
                                        "Inline",
                                        "Flow"
                                      ]
                                    ],
                                    tl: {
                                      hd: [
                                        "sup",
                                        [
                                          "Inline",
                                          "Flow"
                                        ]
                                      ],
                                      tl: {
                                        hd: [
                                          "sub",
                                          [
                                            "Inline",
                                            "Flow"
                                          ]
                                        ],
                                        tl: {
                                          hd: [
                                            "span",
                                            [
                                              "Inline",
                                              "Flow"
                                            ]
                                          ],
                                          tl: {
                                            hd: [
                                              "bdo",
                                              [
                                                "Inline",
                                                "Flow"
                                              ]
                                            ],
                                            tl: {
                                              hd: [
                                                "br",
                                                [
                                                  "Inline",
                                                  "Empty"
                                                ]
                                              ],
                                              tl: {
                                                hd: [
                                                  "a",
                                                  [
                                                    "Inline",
                                                    {
                                                      NAME: "Sub_exclusions",
                                                      VAL: [
                                                        {
                                                          hd: "a",
                                                          tl: (
                                                            /* [] */
                                                            0
                                                          )
                                                        },
                                                        "Inline"
                                                      ]
                                                    }
                                                  ]
                                                ],
                                                tl: {
                                                  hd: [
                                                    "img",
                                                    [
                                                      "Inline",
                                                      "Empty"
                                                    ]
                                                  ],
                                                  tl: {
                                                    hd: [
                                                      "object",
                                                      [
                                                        "Inline",
                                                        {
                                                          NAME: "Or",
                                                          VAL: [
                                                            "Flow",
                                                            {
                                                              NAME: "Elements",
                                                              VAL: {
                                                                hd: "param",
                                                                tl: (
                                                                  /* [] */
                                                                  0
                                                                )
                                                              }
                                                            }
                                                          ]
                                                        }
                                                      ]
                                                    ],
                                                    tl: {
                                                      hd: [
                                                        "script",
                                                        [
                                                          "Inline",
                                                          "Special"
                                                        ]
                                                      ],
                                                      tl: {
                                                        hd: [
                                                          "map",
                                                          [
                                                            "Inline",
                                                            {
                                                              NAME: "Or",
                                                              VAL: [
                                                                "Flow",
                                                                {
                                                                  NAME: "Elements",
                                                                  VAL: {
                                                                    hd: "area",
                                                                    tl: (
                                                                      /* [] */
                                                                      0
                                                                    )
                                                                  }
                                                                }
                                                              ]
                                                            }
                                                          ]
                                                        ],
                                                        tl: {
                                                          hd: [
                                                            "q",
                                                            [
                                                              "Inline",
                                                              "Flow"
                                                            ]
                                                          ],
                                                          tl: {
                                                            hd: [
                                                              "applet",
                                                              [
                                                                "Inline",
                                                                {
                                                                  NAME: "Or",
                                                                  VAL: [
                                                                    "Flow",
                                                                    {
                                                                      NAME: "Elements",
                                                                      VAL: {
                                                                        hd: "param",
                                                                        tl: (
                                                                          /* [] */
                                                                          0
                                                                        )
                                                                      }
                                                                    }
                                                                  ]
                                                                }
                                                              ]
                                                            ],
                                                            tl: {
                                                              hd: [
                                                                "font",
                                                                [
                                                                  "Inline",
                                                                  "Flow"
                                                                ]
                                                              ],
                                                              tl: {
                                                                hd: [
                                                                  "basefont",
                                                                  [
                                                                    "Inline",
                                                                    "Empty"
                                                                  ]
                                                                ],
                                                                tl: {
                                                                  hd: [
                                                                    "iframe",
                                                                    [
                                                                      "Inline",
                                                                      "Flow"
                                                                    ]
                                                                  ],
                                                                  tl: {
                                                                    hd: [
                                                                      "input",
                                                                      [
                                                                        "Inline",
                                                                        "Empty"
                                                                      ]
                                                                    ],
                                                                    tl: {
                                                                      hd: [
                                                                        "select",
                                                                        [
                                                                          "Inline",
                                                                          {
                                                                            NAME: "Elements",
                                                                            VAL: {
                                                                              hd: "optgroup",
                                                                              tl: {
                                                                                hd: "option",
                                                                                tl: (
                                                                                  /* [] */
                                                                                  0
                                                                                )
                                                                              }
                                                                            }
                                                                          }
                                                                        ]
                                                                      ],
                                                                      tl: {
                                                                        hd: [
                                                                          "textarea",
                                                                          [
                                                                            "Inline",
                                                                            {
                                                                              NAME: "Elements",
                                                                              VAL: (
                                                                                /* [] */
                                                                                0
                                                                              )
                                                                            }
                                                                          ]
                                                                        ],
                                                                        tl: {
                                                                          hd: [
                                                                            "label",
                                                                            [
                                                                              "Inline",
                                                                              {
                                                                                NAME: "Sub_exclusions",
                                                                                VAL: [
                                                                                  {
                                                                                    hd: "label",
                                                                                    tl: (
                                                                                      /* [] */
                                                                                      0
                                                                                    )
                                                                                  },
                                                                                  "Inline"
                                                                                ]
                                                                              }
                                                                            ]
                                                                          ],
                                                                          tl: {
                                                                            hd: [
                                                                              "button",
                                                                              [
                                                                                "Inline",
                                                                                {
                                                                                  NAME: "Sub_exclusions",
                                                                                  VAL: [
                                                                                    {
                                                                                      hd: "a",
                                                                                      tl: {
                                                                                        hd: "input",
                                                                                        tl: {
                                                                                          hd: "select",
                                                                                          tl: {
                                                                                            hd: "textarea",
                                                                                            tl: {
                                                                                              hd: "label",
                                                                                              tl: {
                                                                                                hd: "button",
                                                                                                tl: {
                                                                                                  hd: "form",
                                                                                                  tl: {
                                                                                                    hd: "fieldset",
                                                                                                    tl: {
                                                                                                      hd: "isindex",
                                                                                                      tl: {
                                                                                                        hd: "iframe",
                                                                                                        tl: (
                                                                                                          /* [] */
                                                                                                          0
                                                                                                        )
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    },
                                                                                    "Flow"
                                                                                  ]
                                                                                }
                                                                              ]
                                                                            ],
                                                                            tl: {
                                                                              hd: [
                                                                                "p",
                                                                                [
                                                                                  "Block",
                                                                                  "Inline"
                                                                                ]
                                                                              ],
                                                                              tl: {
                                                                                hd: [
                                                                                  "h1",
                                                                                  [
                                                                                    "Block",
                                                                                    "Inline"
                                                                                  ]
                                                                                ],
                                                                                tl: {
                                                                                  hd: [
                                                                                    "h2",
                                                                                    [
                                                                                      "Block",
                                                                                      "Inline"
                                                                                    ]
                                                                                  ],
                                                                                  tl: {
                                                                                    hd: [
                                                                                      "h3",
                                                                                      [
                                                                                        "Block",
                                                                                        "Inline"
                                                                                      ]
                                                                                    ],
                                                                                    tl: {
                                                                                      hd: [
                                                                                        "h4",
                                                                                        [
                                                                                          "Block",
                                                                                          "Inline"
                                                                                        ]
                                                                                      ],
                                                                                      tl: {
                                                                                        hd: [
                                                                                          "h5",
                                                                                          [
                                                                                            "Block",
                                                                                            "Inline"
                                                                                          ]
                                                                                        ],
                                                                                        tl: {
                                                                                          hd: [
                                                                                            "h6",
                                                                                            [
                                                                                              "Block",
                                                                                              "Inline"
                                                                                            ]
                                                                                          ],
                                                                                          tl: {
                                                                                            hd: [
                                                                                              "ul",
                                                                                              [
                                                                                                "Essential_block",
                                                                                                {
                                                                                                  NAME: "Elements",
                                                                                                  VAL: {
                                                                                                    hd: "li",
                                                                                                    tl: (
                                                                                                      /* [] */
                                                                                                      0
                                                                                                    )
                                                                                                  }
                                                                                                }
                                                                                              ]
                                                                                            ],
                                                                                            tl: {
                                                                                              hd: [
                                                                                                "ol",
                                                                                                [
                                                                                                  "Essential_block",
                                                                                                  {
                                                                                                    NAME: "Elements",
                                                                                                    VAL: {
                                                                                                      hd: "li",
                                                                                                      tl: (
                                                                                                        /* [] */
                                                                                                        0
                                                                                                      )
                                                                                                    }
                                                                                                  }
                                                                                                ]
                                                                                              ],
                                                                                              tl: {
                                                                                                hd: [
                                                                                                  "dir",
                                                                                                  [
                                                                                                    "Block",
                                                                                                    {
                                                                                                      NAME: "Sub_exclusions",
                                                                                                      VAL: [
                                                                                                        block_elements2,
                                                                                                        {
                                                                                                          NAME: "Elements",
                                                                                                          VAL: {
                                                                                                            hd: "li",
                                                                                                            tl: (
                                                                                                              /* [] */
                                                                                                              0
                                                                                                            )
                                                                                                          }
                                                                                                        }
                                                                                                      ]
                                                                                                    }
                                                                                                  ]
                                                                                                ],
                                                                                                tl: {
                                                                                                  hd: [
                                                                                                    "menu",
                                                                                                    [
                                                                                                      "Block",
                                                                                                      {
                                                                                                        NAME: "Sub_exclusions",
                                                                                                        VAL: [
                                                                                                          block_elements2,
                                                                                                          {
                                                                                                            NAME: "Elements",
                                                                                                            VAL: {
                                                                                                              hd: "li",
                                                                                                              tl: (
                                                                                                                /* [] */
                                                                                                                0
                                                                                                              )
                                                                                                            }
                                                                                                          }
                                                                                                        ]
                                                                                                      }
                                                                                                    ]
                                                                                                  ],
                                                                                                  tl: {
                                                                                                    hd: [
                                                                                                      "pre",
                                                                                                      [
                                                                                                        "Block",
                                                                                                        {
                                                                                                          NAME: "Sub_exclusions",
                                                                                                          VAL: [
                                                                                                            {
                                                                                                              hd: "object",
                                                                                                              tl: {
                                                                                                                hd: "applet",
                                                                                                                tl: {
                                                                                                                  hd: "big",
                                                                                                                  tl: {
                                                                                                                    hd: "small",
                                                                                                                    tl: {
                                                                                                                      hd: "sub",
                                                                                                                      tl: {
                                                                                                                        hd: "sup",
                                                                                                                        tl: {
                                                                                                                          hd: "font",
                                                                                                                          tl: {
                                                                                                                            hd: "basefont",
                                                                                                                            tl: (
                                                                                                                              /* [] */
                                                                                                                              0
                                                                                                                            )
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            },
                                                                                                            "Inline"
                                                                                                          ]
                                                                                                        }
                                                                                                      ]
                                                                                                    ],
                                                                                                    tl: {
                                                                                                      hd: [
                                                                                                        "dl",
                                                                                                        [
                                                                                                          "Essential_block",
                                                                                                          {
                                                                                                            NAME: "Elements",
                                                                                                            VAL: {
                                                                                                              hd: "dt",
                                                                                                              tl: {
                                                                                                                hd: "dd",
                                                                                                                tl: (
                                                                                                                  /* [] */
                                                                                                                  0
                                                                                                                )
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        ]
                                                                                                      ],
                                                                                                      tl: {
                                                                                                        hd: [
                                                                                                          "div",
                                                                                                          [
                                                                                                            "Block",
                                                                                                            "Flow"
                                                                                                          ]
                                                                                                        ],
                                                                                                        tl: {
                                                                                                          hd: [
                                                                                                            "noscript",
                                                                                                            [
                                                                                                              "Block",
                                                                                                              "Flow"
                                                                                                            ]
                                                                                                          ],
                                                                                                          tl: {
                                                                                                            hd: [
                                                                                                              "blockquote",
                                                                                                              [
                                                                                                                "Block",
                                                                                                                {
                                                                                                                  NAME: "Or",
                                                                                                                  VAL: [
                                                                                                                    "Flow",
                                                                                                                    {
                                                                                                                      NAME: "Elements",
                                                                                                                      VAL: {
                                                                                                                        hd: "script",
                                                                                                                        tl: (
                                                                                                                          /* [] */
                                                                                                                          0
                                                                                                                        )
                                                                                                                      }
                                                                                                                    }
                                                                                                                  ]
                                                                                                                }
                                                                                                              ]
                                                                                                            ],
                                                                                                            tl: {
                                                                                                              hd: [
                                                                                                                "form",
                                                                                                                [
                                                                                                                  "Block",
                                                                                                                  {
                                                                                                                    NAME: "Sub_exclusions",
                                                                                                                    VAL: [
                                                                                                                      {
                                                                                                                        hd: "form",
                                                                                                                        tl: (
                                                                                                                          /* [] */
                                                                                                                          0
                                                                                                                        )
                                                                                                                      },
                                                                                                                      {
                                                                                                                        NAME: "Or",
                                                                                                                        VAL: [
                                                                                                                          "Flow",
                                                                                                                          {
                                                                                                                            NAME: "Elements",
                                                                                                                            VAL: {
                                                                                                                              hd: "script",
                                                                                                                              tl: (
                                                                                                                                /* [] */
                                                                                                                                0
                                                                                                                              )
                                                                                                                            }
                                                                                                                          }
                                                                                                                        ]
                                                                                                                      }
                                                                                                                    ]
                                                                                                                  }
                                                                                                                ]
                                                                                                              ],
                                                                                                              tl: {
                                                                                                                hd: [
                                                                                                                  "hr",
                                                                                                                  [
                                                                                                                    "Block",
                                                                                                                    "Empty"
                                                                                                                  ]
                                                                                                                ],
                                                                                                                tl: {
                                                                                                                  hd: [
                                                                                                                    "table",
                                                                                                                    [
                                                                                                                      "Essential_block",
                                                                                                                      {
                                                                                                                        NAME: "Elements",
                                                                                                                        VAL: {
                                                                                                                          hd: "caption",
                                                                                                                          tl: {
                                                                                                                            hd: "col",
                                                                                                                            tl: {
                                                                                                                              hd: "colgroup",
                                                                                                                              tl: {
                                                                                                                                hd: "thead",
                                                                                                                                tl: {
                                                                                                                                  hd: "tfoot",
                                                                                                                                  tl: {
                                                                                                                                    hd: "tbody",
                                                                                                                                    tl: {
                                                                                                                                      hd: "tr",
                                                                                                                                      tl: (
                                                                                                                                        /* [] */
                                                                                                                                        0
                                                                                                                                      )
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    ]
                                                                                                                  ],
                                                                                                                  tl: {
                                                                                                                    hd: [
                                                                                                                      "fieldset",
                                                                                                                      [
                                                                                                                        "Block",
                                                                                                                        {
                                                                                                                          NAME: "Or",
                                                                                                                          VAL: [
                                                                                                                            "Flow",
                                                                                                                            {
                                                                                                                              NAME: "Elements",
                                                                                                                              VAL: {
                                                                                                                                hd: "legend",
                                                                                                                                tl: (
                                                                                                                                  /* [] */
                                                                                                                                  0
                                                                                                                                )
                                                                                                                              }
                                                                                                                            }
                                                                                                                          ]
                                                                                                                        }
                                                                                                                      ]
                                                                                                                    ],
                                                                                                                    tl: {
                                                                                                                      hd: [
                                                                                                                        "address",
                                                                                                                        [
                                                                                                                          "Block",
                                                                                                                          "Inline"
                                                                                                                        ]
                                                                                                                      ],
                                                                                                                      tl: {
                                                                                                                        hd: [
                                                                                                                          "center",
                                                                                                                          [
                                                                                                                            "Block",
                                                                                                                            "Flow"
                                                                                                                          ]
                                                                                                                        ],
                                                                                                                        tl: {
                                                                                                                          hd: [
                                                                                                                            "noframes",
                                                                                                                            [
                                                                                                                              "Block",
                                                                                                                              "Flow"
                                                                                                                            ]
                                                                                                                          ],
                                                                                                                          tl: {
                                                                                                                            hd: [
                                                                                                                              "isindex",
                                                                                                                              [
                                                                                                                                "Block",
                                                                                                                                "Empty"
                                                                                                                              ]
                                                                                                                            ],
                                                                                                                            tl: {
                                                                                                                              hd: [
                                                                                                                                "body",
                                                                                                                                [
                                                                                                                                  "None",
                                                                                                                                  {
                                                                                                                                    NAME: "Or",
                                                                                                                                    VAL: [
                                                                                                                                      "Flow",
                                                                                                                                      {
                                                                                                                                        NAME: "Elements",
                                                                                                                                        VAL: {
                                                                                                                                          hd: "script",
                                                                                                                                          tl: (
                                                                                                                                            /* [] */
                                                                                                                                            0
                                                                                                                                          )
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    ]
                                                                                                                                  }
                                                                                                                                ]
                                                                                                                              ],
                                                                                                                              tl: {
                                                                                                                                hd: [
                                                                                                                                  "area",
                                                                                                                                  [
                                                                                                                                    "None",
                                                                                                                                    "Empty"
                                                                                                                                  ]
                                                                                                                                ],
                                                                                                                                tl: {
                                                                                                                                  hd: [
                                                                                                                                    "link",
                                                                                                                                    [
                                                                                                                                      "None",
                                                                                                                                      "Empty"
                                                                                                                                    ]
                                                                                                                                  ],
                                                                                                                                  tl: {
                                                                                                                                    hd: [
                                                                                                                                      "param",
                                                                                                                                      [
                                                                                                                                        "None",
                                                                                                                                        "Empty"
                                                                                                                                      ]
                                                                                                                                    ],
                                                                                                                                    tl: {
                                                                                                                                      hd: [
                                                                                                                                        "ins",
                                                                                                                                        [
                                                                                                                                          "Everywhere",
                                                                                                                                          "Flow"
                                                                                                                                        ]
                                                                                                                                      ],
                                                                                                                                      tl: {
                                                                                                                                        hd: [
                                                                                                                                          "del",
                                                                                                                                          [
                                                                                                                                            "Everywhere",
                                                                                                                                            "Flow"
                                                                                                                                          ]
                                                                                                                                        ],
                                                                                                                                        tl: {
                                                                                                                                          hd: [
                                                                                                                                            "dt",
                                                                                                                                            [
                                                                                                                                              "None",
                                                                                                                                              "Inline"
                                                                                                                                            ]
                                                                                                                                          ],
                                                                                                                                          tl: {
                                                                                                                                            hd: [
                                                                                                                                              "dd",
                                                                                                                                              [
                                                                                                                                                "None",
                                                                                                                                                "Flow"
                                                                                                                                              ]
                                                                                                                                            ],
                                                                                                                                            tl: {
                                                                                                                                              hd: [
                                                                                                                                                "li",
                                                                                                                                                [
                                                                                                                                                  "None",
                                                                                                                                                  "Flow"
                                                                                                                                                ]
                                                                                                                                              ],
                                                                                                                                              tl: {
                                                                                                                                                hd: [
                                                                                                                                                  "optgroup",
                                                                                                                                                  [
                                                                                                                                                    "None",
                                                                                                                                                    {
                                                                                                                                                      NAME: "Elements",
                                                                                                                                                      VAL: {
                                                                                                                                                        hd: "option",
                                                                                                                                                        tl: (
                                                                                                                                                          /* [] */
                                                                                                                                                          0
                                                                                                                                                        )
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  ]
                                                                                                                                                ],
                                                                                                                                                tl: {
                                                                                                                                                  hd: [
                                                                                                                                                    "option",
                                                                                                                                                    [
                                                                                                                                                      "None",
                                                                                                                                                      {
                                                                                                                                                        NAME: "Elements",
                                                                                                                                                        VAL: (
                                                                                                                                                          /* [] */
                                                                                                                                                          0
                                                                                                                                                        )
                                                                                                                                                      }
                                                                                                                                                    ]
                                                                                                                                                  ],
                                                                                                                                                  tl: {
                                                                                                                                                    hd: [
                                                                                                                                                      "legend",
                                                                                                                                                      [
                                                                                                                                                        "None",
                                                                                                                                                        "Inline"
                                                                                                                                                      ]
                                                                                                                                                    ],
                                                                                                                                                    tl: {
                                                                                                                                                      hd: [
                                                                                                                                                        "caption",
                                                                                                                                                        [
                                                                                                                                                          "None",
                                                                                                                                                          "Inline"
                                                                                                                                                        ]
                                                                                                                                                      ],
                                                                                                                                                      tl: {
                                                                                                                                                        hd: [
                                                                                                                                                          "thead",
                                                                                                                                                          [
                                                                                                                                                            "None",
                                                                                                                                                            {
                                                                                                                                                              NAME: "Elements",
                                                                                                                                                              VAL: {
                                                                                                                                                                hd: "tr",
                                                                                                                                                                tl: (
                                                                                                                                                                  /* [] */
                                                                                                                                                                  0
                                                                                                                                                                )
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          ]
                                                                                                                                                        ],
                                                                                                                                                        tl: {
                                                                                                                                                          hd: [
                                                                                                                                                            "tbody",
                                                                                                                                                            [
                                                                                                                                                              "None",
                                                                                                                                                              {
                                                                                                                                                                NAME: "Elements",
                                                                                                                                                                VAL: {
                                                                                                                                                                  hd: "tr",
                                                                                                                                                                  tl: (
                                                                                                                                                                    /* [] */
                                                                                                                                                                    0
                                                                                                                                                                  )
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            ]
                                                                                                                                                          ],
                                                                                                                                                          tl: {
                                                                                                                                                            hd: [
                                                                                                                                                              "tfoot",
                                                                                                                                                              [
                                                                                                                                                                "None",
                                                                                                                                                                {
                                                                                                                                                                  NAME: "Elements",
                                                                                                                                                                  VAL: {
                                                                                                                                                                    hd: "tr",
                                                                                                                                                                    tl: (
                                                                                                                                                                      /* [] */
                                                                                                                                                                      0
                                                                                                                                                                    )
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              ]
                                                                                                                                                            ],
                                                                                                                                                            tl: {
                                                                                                                                                              hd: [
                                                                                                                                                                "colgroup",
                                                                                                                                                                [
                                                                                                                                                                  "None",
                                                                                                                                                                  {
                                                                                                                                                                    NAME: "Elements",
                                                                                                                                                                    VAL: {
                                                                                                                                                                      hd: "col",
                                                                                                                                                                      tl: (
                                                                                                                                                                        /* [] */
                                                                                                                                                                        0
                                                                                                                                                                      )
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                ]
                                                                                                                                                              ],
                                                                                                                                                              tl: {
                                                                                                                                                                hd: [
                                                                                                                                                                  "col",
                                                                                                                                                                  [
                                                                                                                                                                    "None",
                                                                                                                                                                    "Empty"
                                                                                                                                                                  ]
                                                                                                                                                                ],
                                                                                                                                                                tl: {
                                                                                                                                                                  hd: [
                                                                                                                                                                    "tr",
                                                                                                                                                                    [
                                                                                                                                                                      "None",
                                                                                                                                                                      {
                                                                                                                                                                        NAME: "Elements",
                                                                                                                                                                        VAL: {
                                                                                                                                                                          hd: "th",
                                                                                                                                                                          tl: {
                                                                                                                                                                            hd: "td",
                                                                                                                                                                            tl: (
                                                                                                                                                                              /* [] */
                                                                                                                                                                              0
                                                                                                                                                                            )
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    ]
                                                                                                                                                                  ],
                                                                                                                                                                  tl: {
                                                                                                                                                                    hd: [
                                                                                                                                                                      "th",
                                                                                                                                                                      [
                                                                                                                                                                        "None",
                                                                                                                                                                        "Flow"
                                                                                                                                                                      ]
                                                                                                                                                                    ],
                                                                                                                                                                    tl: {
                                                                                                                                                                      hd: [
                                                                                                                                                                        "td",
                                                                                                                                                                        [
                                                                                                                                                                          "None",
                                                                                                                                                                          "Flow"
                                                                                                                                                                        ]
                                                                                                                                                                      ],
                                                                                                                                                                      tl: {
                                                                                                                                                                        hd: [
                                                                                                                                                                          "head",
                                                                                                                                                                          [
                                                                                                                                                                            "None",
                                                                                                                                                                            {
                                                                                                                                                                              NAME: "Elements",
                                                                                                                                                                              VAL: {
                                                                                                                                                                                hd: "title",
                                                                                                                                                                                tl: {
                                                                                                                                                                                  hd: "base",
                                                                                                                                                                                  tl: {
                                                                                                                                                                                    hd: "script",
                                                                                                                                                                                    tl: {
                                                                                                                                                                                      hd: "style",
                                                                                                                                                                                      tl: {
                                                                                                                                                                                        hd: "meta",
                                                                                                                                                                                        tl: {
                                                                                                                                                                                          hd: "link",
                                                                                                                                                                                          tl: {
                                                                                                                                                                                            hd: "object",
                                                                                                                                                                                            tl: (
                                                                                                                                                                                              /* [] */
                                                                                                                                                                                              0
                                                                                                                                                                                            )
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          ]
                                                                                                                                                                        ],
                                                                                                                                                                        tl: {
                                                                                                                                                                          hd: [
                                                                                                                                                                            "title",
                                                                                                                                                                            [
                                                                                                                                                                              "None",
                                                                                                                                                                              {
                                                                                                                                                                                NAME: "Elements",
                                                                                                                                                                                VAL: (
                                                                                                                                                                                  /* [] */
                                                                                                                                                                                  0
                                                                                                                                                                                )
                                                                                                                                                                              }
                                                                                                                                                                            ]
                                                                                                                                                                          ],
                                                                                                                                                                          tl: {
                                                                                                                                                                            hd: [
                                                                                                                                                                              "base",
                                                                                                                                                                              [
                                                                                                                                                                                "None",
                                                                                                                                                                                "Empty"
                                                                                                                                                                              ]
                                                                                                                                                                            ],
                                                                                                                                                                            tl: {
                                                                                                                                                                              hd: [
                                                                                                                                                                                "meta",
                                                                                                                                                                                [
                                                                                                                                                                                  "None",
                                                                                                                                                                                  "Empty"
                                                                                                                                                                                ]
                                                                                                                                                                              ],
                                                                                                                                                                              tl: {
                                                                                                                                                                                hd: [
                                                                                                                                                                                  "style",
                                                                                                                                                                                  [
                                                                                                                                                                                    "None",
                                                                                                                                                                                    "Special"
                                                                                                                                                                                  ]
                                                                                                                                                                                ],
                                                                                                                                                                                tl: {
                                                                                                                                                                                  hd: [
                                                                                                                                                                                    "html",
                                                                                                                                                                                    [
                                                                                                                                                                                      "None",
                                                                                                                                                                                      {
                                                                                                                                                                                        NAME: "Or",
                                                                                                                                                                                        VAL: [
                                                                                                                                                                                          "Flow",
                                                                                                                                                                                          {
                                                                                                                                                                                            NAME: "Elements",
                                                                                                                                                                                            VAL: {
                                                                                                                                                                                              hd: "head",
                                                                                                                                                                                              tl: {
                                                                                                                                                                                                hd: "title",
                                                                                                                                                                                                tl: {
                                                                                                                                                                                                  hd: "base",
                                                                                                                                                                                                  tl: {
                                                                                                                                                                                                    hd: "script",
                                                                                                                                                                                                    tl: {
                                                                                                                                                                                                      hd: "style",
                                                                                                                                                                                                      tl: {
                                                                                                                                                                                                        hd: "meta",
                                                                                                                                                                                                        tl: {
                                                                                                                                                                                                          hd: "link",
                                                                                                                                                                                                          tl: {
                                                                                                                                                                                                            hd: "object",
                                                                                                                                                                                                            tl: {
                                                                                                                                                                                                              hd: "body",
                                                                                                                                                                                                              tl: {
                                                                                                                                                                                                                hd: "frameset",
                                                                                                                                                                                                                tl: (
                                                                                                                                                                                                                  /* [] */
                                                                                                                                                                                                                  0
                                                                                                                                                                                                                )
                                                                                                                                                                                                              }
                                                                                                                                                                                                            }
                                                                                                                                                                                                          }
                                                                                                                                                                                                        }
                                                                                                                                                                                                      }
                                                                                                                                                                                                    }
                                                                                                                                                                                                  }
                                                                                                                                                                                                }
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        ]
                                                                                                                                                                                      }
                                                                                                                                                                                    ]
                                                                                                                                                                                  ],
                                                                                                                                                                                  tl: {
                                                                                                                                                                                    hd: [
                                                                                                                                                                                      "frameset",
                                                                                                                                                                                      [
                                                                                                                                                                                        "None",
                                                                                                                                                                                        {
                                                                                                                                                                                          NAME: "Elements",
                                                                                                                                                                                          VAL: {
                                                                                                                                                                                            hd: "frameset",
                                                                                                                                                                                            tl: {
                                                                                                                                                                                              hd: "frame",
                                                                                                                                                                                              tl: {
                                                                                                                                                                                                hd: "noframes",
                                                                                                                                                                                                tl: (
                                                                                                                                                                                                  /* [] */
                                                                                                                                                                                                  0
                                                                                                                                                                                                )
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      ]
                                                                                                                                                                                    ],
                                                                                                                                                                                    tl: {
                                                                                                                                                                                      hd: [
                                                                                                                                                                                        "frame",
                                                                                                                                                                                        [
                                                                                                                                                                                          "None",
                                                                                                                                                                                          "Empty"
                                                                                                                                                                                        ]
                                                                                                                                                                                      ],
                                                                                                                                                                                      tl: (
                                                                                                                                                                                        /* [] */
                                                                                                                                                                                        0
                                                                                                                                                                                      )
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var html5_dtd = {
    hd: html5_dtd_0,
    tl: html5_dtd_1
  };

  // lib/es6/src/main/re/html/parseutil.mjs
  function parseString(s) {
    var buf = from_string(s);
    var parsed = parse_document(html5_dtd, true, false, true, void 0, buf);
    return cleanse(translateFromNethtml(parsed));
  }
  function serialise(prettyPrintOpt, els, bufsize) {
    var prettyPrint = prettyPrintOpt !== void 0 ? prettyPrintOpt : false;
    var els$1 = translateToNethtml(prettyPrint, els);
    var buf = create3(bufsize);
    write(html40_dtd, true, function(param) {
      return add_string(buf, param);
    }, els$1);
    return contents(buf);
  }
  function bodyChildren(nodes) {
    if (!nodes) {
      return [
        /* [] */
        0,
        nodes
      ];
    }
    var match = nodes.hd;
    if (match.TAG === "Data" || match._0 !== "body") {
      return [
        /* [] */
        0,
        nodes
      ];
    } else {
      return [
        match._2,
        match._3
      ];
    }
  }
  function findHead(children) {
    return span(function(x) {
      if (x.TAG === "Data" || x._0 !== "head") {
        return false;
      } else {
        return true;
      }
    }, children);
  }
  function findFragmentedHead(children) {
    return $$break(function(child) {
      if (child.TAG === "Data") {
        return false;
      }
      var attrs = child._1;
      if (!attrs) {
        return false;
      }
      var match = attrs.hd;
      if (match[0] === "contents" && !(attrs.tl || !matchEmptyTag("--", child._0, attrs, child._2, child._3))) {
        return lowercase_ascii5(match[1]) === "startfragment";
      } else {
        return false;
      }
    }, children);
  }
  function extractDoc(nodes) {
    var children = docRoot(nodes);
    if (children !== void 0) {
      var match = findHead(children);
      var styles = value(
        /* [] */
        0,
        map4(parseTag2, allData(bind(nodeChildren, bind(findChildTags("style"), match[0]))))
      );
      var match$1 = bodyChildren(match[1]);
      return [
        styles,
        match$1[1],
        match$1[0]
      ];
    } else {
      var match$2 = findFragmentedHead(nodes);
      var bodyContents = match$2[1];
      if (!bodyContents) {
        return [
          /* [] */
          0,
          nodes,
          /* [] */
          0
        ];
      }
      var head_0 = {
        TAG: "Element",
        _0: "head",
        _1: (
          /* [] */
          0
        ),
        _2: (
          /* [] */
          0
        ),
        _3: match$2[0]
      };
      var head2 = {
        hd: head_0,
        tl: (
          /* [] */
          0
        )
      };
      var styles$1 = value(
        /* [] */
        0,
        map4(parseTag2, allData(bind(nodeChildren, bind(findChildTags("style"), head2))))
      );
      return [
        styles$1,
        bodyContents,
        /* [] */
        0
      ];
    }
  }
  function constructDocument(injectCharsetOpt, body, styles, bodyAttrs) {
    var injectCharset = injectCharsetOpt !== void 0 ? injectCharsetOpt : true;
    var styles$1 = styles === /* [] */
    0 ? (
      /* [] */
      0
    ) : {
      hd: {
        TAG: "Element",
        _0: "style",
        _1: (
          /* [] */
          0
        ),
        _2: (
          /* [] */
          0
        ),
        _3: {
          hd: {
            TAG: "Data",
            _0: show_rules(styles)
          },
          tl: (
            /* [] */
            0
          )
        }
      },
      tl: (
        /* [] */
        0
      )
    };
    var charset = injectCharset ? {
      hd: {
        TAG: "Element",
        _0: "meta",
        _1: {
          hd: [
            "http-equiv",
            "Content-Type"
          ],
          tl: {
            hd: [
              "content",
              "text/html; charset=utf-8"
            ],
            tl: (
              /* [] */
              0
            )
          }
        },
        _2: (
          /* [] */
          0
        ),
        _3: (
          /* [] */
          0
        )
      },
      tl: (
        /* [] */
        0
      )
    } : (
      /* [] */
      0
    );
    var head2 = charset === /* [] */
    0 && styles$1 === /* [] */
    0 ? (
      /* [] */
      0
    ) : {
      hd: {
        TAG: "Element",
        _0: "head",
        _1: (
          /* [] */
          0
        ),
        _2: (
          /* [] */
          0
        ),
        _3: append3(charset, styles$1)
      },
      tl: (
        /* [] */
        0
      )
    };
    return {
      TAG: "Element",
      _0: "html",
      _1: (
        /* [] */
        0
      ),
      _2: (
        /* [] */
        0
      ),
      _3: append3(head2, {
        hd: {
          TAG: "Element",
          _0: "body",
          _1: bodyAttrs,
          _2: (
            /* [] */
            0
          ),
          _3: body
        },
        tl: (
          /* [] */
          0
        )
      })
    };
  }

  // lib/es6/src/main/re/wimp/styleUtils.mjs
  var alwaysKeep = _1(Stdlib.StringSet.of_list, {
    hd: "list-style-type",
    tl: {
      hd: "list-style",
      tl: {
        hd: "display",
        tl: (
          /* [] */
          0
        )
      }
    }
  });
  function keepStyle(property2) {
    return _2(Stdlib.StringSet.mem, property2, alwaysKeep);
  }
  var blacklistStyles = _1(Stdlib.StringSet.of_list, {
    hd: "layout-grid-mode",
    tl: {
      hd: "tab-stops",
      tl: {
        hd: "tab-interval",
        tl: {
          hd: "text-underline",
          tl: {
            hd: "text-effect",
            tl: {
              hd: "text-line-through",
              tl: {
                hd: "page",
                tl: {
                  hd: "font-color",
                  tl: {
                    hd: "horiz-align",
                    tl: {
                      hd: "language",
                      tl: {
                        hd: "separator-image",
                        tl: {
                          hd: "table-border-color-dark",
                          tl: {
                            hd: "table-border-color-light",
                            tl: {
                              hd: "vert-align",
                              tl: {
                                hd: "widows",
                                tl: {
                                  hd: "letter-spacing",
                                  tl: {
                                    hd: "caret-color",
                                    tl: {
                                      hd: "orphans",
                                      tl: (
                                        /* [] */
                                        0
                                      )
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  function removeWhenValueDefault(property2, value2) {
    var exit = 0;
    switch (property2) {
      case "font-stretch":
      case "font-variant-caps":
        exit = 1;
        break;
      case "text-decoration":
      case "text-transform":
        exit = 2;
        break;
      case "vertical-align":
        if (value2 && value2.hd === "baseline" && !value2.tl) {
          return true;
        } else {
          return false;
        }
      case "white-space":
        if (value2 && value2.hd === "normal" && !value2.tl) {
          return isSafari.contents;
        } else {
          return false;
        }
      case "text-indent":
      case "word-spacing":
        exit = 3;
        break;
      default:
        return false;
    }
    switch (exit) {
      case 1:
        if (value2 && value2.hd === "normal" && !value2.tl) {
          return true;
        } else {
          return false;
        }
      case 2:
        if (value2 && value2.hd === "none" && !value2.tl) {
          return true;
        } else {
          return false;
        }
      case 3:
        if (value2 && value2.hd === "0px" && !value2.tl) {
          return true;
        } else {
          return false;
        }
    }
  }
  function prefixBlacklisted(keepLists, str) {
    if (get2(str, 0) === /* '-' */
    45) {
      return true;
    } else if (starts_with(str, "mso-")) {
      if (keepLists) {
        return str !== "mso-list";
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  function defaultFilterClean(param, p, param$1) {
    return keepStyle(p);
  }
  function defaultFilterMerge(keepLists, p, v) {
    if (keepStyle(p)) {
      return true;
    } else {
      return !(_2(Stdlib.StringSet.mem, p, blacklistStyles) || prefixBlacklisted(keepLists, p) || removeWhenValueDefault(p, v));
    }
  }

  // lib/es6/src/main/re/wimp/styleRules.mjs
  var alwaysKeepStyleElems = _1(Stdlib.StringSet.of_list, {
    hd: "table",
    tl: {
      hd: "tr",
      tl: {
        hd: "td",
        tl: {
          hd: "col",
          tl: (
            /* [] */
            0
          )
        }
      }
    }
  });
  function filterStyleDeclarations(keepListsOpt, merge2, styles) {
    var keepLists = keepListsOpt !== void 0 ? keepListsOpt : false;
    var styleFilter = merge2 ? defaultFilterMerge : defaultFilterClean;
    return filter(function(param) {
      return _3(styleFilter, keepLists, param._0._0, param._1._0);
    }, styles);
  }
  function processStyleDeclarations(param) {
    return map3(function(d) {
      var v = d._1._0;
      var p = d._0._0;
      if (p === "border" && isExcel.contents && exists3(function(x) {
        return x === ".5pt";
      }, v)) {
        return {
          TAG: "Declaration",
          _0: {
            TAG: "Property",
            _0: p
          },
          _1: {
            TAG: "Value",
            _0: map3(function(x) {
              if (x === ".5pt") {
                return "1px";
              } else {
                return x;
              }
            }, v)
          }
        };
      } else {
        return d;
      }
    }, param);
  }
  function filterStyleAttributes(keepListsOpt, merge2) {
    var keepLists = keepListsOpt !== void 0 ? keepListsOpt : false;
    return {
      elementApplies: function(tagname, param, styles, param$1) {
        if (styles !== /* [] */
        0) {
          return !_2(Stdlib.StringSet.mem, tagname, alwaysKeepStyleElems);
        } else {
          return false;
        }
      },
      process: function(name42, attrs, styles, children) {
        var styleResult = filterStyleDeclarations(keepLists, merge2, styles);
        if (styles === styleResult) {
          return "Noop";
        } else {
          return {
            TAG: "ReplaceSingle",
            _0: {
              TAG: "Element",
              _0: name42,
              _1: attrs,
              _2: styleResult,
              _3: children
            }
          };
        }
      }
    };
  }
  function filterStyleTag(param) {
    var param$1 = (
      /* [] */
      0
    );
    return fold_right3(function(rule, acc) {
      switch (rule.TAG) {
        case "Rule":
          var filteredStatements = filterStyleDeclarations(void 0, true, rule._1);
          if (filteredStatements === /* [] */
          0) {
            return acc;
          } else {
            return {
              hd: {
                TAG: "Rule",
                _0: {
                  TAG: "Selector",
                  _0: filter(function(s) {
                    return s !== "a:link";
                  }, rule._0._0)
                },
                _1: processStyleDeclarations(filteredStatements)
              },
              tl: acc
            };
          }
        case "AtRule":
        case "ListRule":
          return acc;
      }
    }, param, param$1);
  }

  // lib/es6/src/main/re/wimp/tableRules.mjs
  var stylesList = _1(Stdlib.StringSet.of_list, {
    hd: "width",
    tl: {
      hd: "height",
      tl: (
        /* [] */
        0
      )
    }
  });
  function filterAttrs(attrs) {
    return filter(function(param) {
      return !_2(Stdlib.StringSet.mem, param[0], stylesList);
    }, attrs);
  }
  function filterStyles(merge2, keep2, remove, styles) {
    return filter(function(param) {
      var p = param._0._0;
      var v = param._1._0;
      if (merge2) {
        if (p !== remove) {
          return defaultFilterMerge(true, p, v);
        } else {
          return false;
        }
      } else {
        return p === keep2;
      }
    }, styles);
  }
  function attrToStyle(param) {
    var widthVal = param[1];
    var match = int_of_string_opt(widthVal);
    var newVal = match !== void 0 ? widthVal + "px" : widthVal;
    return {
      TAG: "Declaration",
      _0: {
        TAG: "Property",
        _0: param[0]
      },
      _1: {
        TAG: "Value",
        _0: {
          hd: newVal,
          tl: (
            /* [] */
            0
          )
        }
      }
    };
  }
  function getWidthAttr(attrs) {
    return find(function(param) {
      return param[0] === "width";
    }, attrs);
  }
  function copyTableWidthToStyle_elementApplies(tagname, param, param$1, param$2) {
    return tagname === "table";
  }
  function copyTableWidthToStyle_process(tagname, attrs, styles, children) {
    var widthAttr = getWidthAttr(attrs);
    if (widthAttr === void 0) {
      return "Noop";
    }
    if (exists3(function(param) {
      return param._0._0 === "width";
    }, styles)) {
      return "Noop";
    }
    var newStyles_0 = attrToStyle(widthAttr);
    var newStyles = {
      hd: newStyles_0,
      tl: styles
    };
    return {
      TAG: "ReplaceSingle",
      _0: {
        TAG: "Element",
        _0: tagname,
        _1: attrs,
        _2: newStyles,
        _3: children
      }
    };
  }
  var copyTableWidthToStyle = {
    elementApplies: copyTableWidthToStyle_elementApplies,
    process: copyTableWidthToStyle_process
  };
  function filterTableStyles(merge2) {
    return {
      elementApplies: function(tagname, param, param$1, param$2) {
        return tagname === "table";
      },
      process: function(tagname, attrs, styles, children) {
        var newAttrs = filterAttrs(attrs);
        var newStyles = filter(function(param) {
          var p = param._0._0;
          var v = param._1._0;
          if (merge2) {
            return defaultFilterMerge(true, p, v);
          } else {
            return _2(Stdlib.StringSet.mem, p, stylesList);
          }
        }, styles);
        if (newAttrs === attrs && newStyles === styles) {
          return "Noop";
        } else {
          return {
            TAG: "ReplaceSingle",
            _0: {
              TAG: "Element",
              _0: tagname,
              _1: newAttrs,
              _2: newStyles,
              _3: children
            }
          };
        }
      }
    };
  }
  function filterRowStyles(merge2) {
    return {
      elementApplies: function(tagname, param, param$1, param$2) {
        return tagname === "tr";
      },
      process: function(tagname, attrs, styles, children) {
        var newAttrs = filterAttrs(attrs);
        var newStyles = filterStyles(merge2, "height", "width", styles);
        if (newAttrs === attrs && newStyles === styles) {
          return "Noop";
        } else {
          return {
            TAG: "ReplaceSingle",
            _0: {
              TAG: "Element",
              _0: tagname,
              _1: newAttrs,
              _2: newStyles,
              _3: children
            }
          };
        }
      }
    };
  }
  function filterCellAndColStyles(merge2) {
    var applicableTags = _1(Stdlib.StringSet.of_list, {
      hd: "td",
      tl: {
        hd: "col",
        tl: (
          /* [] */
          0
        )
      }
    });
    return {
      elementApplies: function(tagname, param, param$1, param$2) {
        return _2(Stdlib.StringSet.mem, tagname, applicableTags);
      },
      process: function(tagname, attrs, styles, children) {
        var newAttrs = filterAttrs(attrs);
        var newStyles = filterStyles(merge2, "width", "height", styles);
        if (newAttrs === attrs && newStyles === styles) {
          return "Noop";
        } else {
          return {
            TAG: "ReplaceSingle",
            _0: {
              TAG: "Element",
              _0: tagname,
              _1: newAttrs,
              _2: newStyles,
              _3: children
            }
          };
        }
      }
    };
  }

  // lib/es6/src/main/re/wimp/removeRules.mjs
  function isWordNamespace(str) {
    if (str.length < 3) {
      return false;
    }
    if (get2(str, 1) !== /* ':' */
    58) {
      return false;
    }
    var match = get2(str, 0);
    if (match >= 113) {
      return !(match > 120 || match < 118);
    } else {
      return match >= 111;
    }
  }
  function removeWordNamespaceTag_elementApplies(name42, param, param$1, param$2) {
    return isWordNamespace(name42);
  }
  function removeWordNamespaceTag_process(param, param$1, param$2, x) {
    if (x) {
      return "Unwrap";
    } else {
      return "Remove";
    }
  }
  var removeWordNamespaceTag = {
    elementApplies: removeWordNamespaceTag_elementApplies,
    process: removeWordNamespaceTag_process
  };
  function removeUnwantedAnchors_elementApplies(name42, param, param$1, param$2) {
    return name42 === "a";
  }
  function removeUnwantedAnchors_process(param, attrs, param$1, param$2) {
    if (!attrs) {
      return "Noop";
    }
    var match = attrs.hd;
    if (match[0] === "name" && !(attrs.tl || !starts_with(match[1], "OLE_LINK"))) {
      return "Unwrap";
    } else {
      return "Noop";
    }
  }
  var removeUnwantedAnchors = {
    elementApplies: removeUnwantedAnchors_elementApplies,
    process: removeUnwantedAnchors_process
  };
  function removeComments_elementApplies(name42, param, param$1, children) {
    if (name42 === "--" || name42 === "---") {
      return children === /* [] */
      0;
    } else {
      return false;
    }
  }
  function removeComments_process(param, attrs, param$1, param$2) {
    if (!attrs) {
      return "Noop";
    }
    var match = attrs.hd;
    if (match[0] === "contents" && !attrs.tl) {
      var value2 = lowercase_ascii5(match[1]);
      if (value2 === "startfragment" || value2 === "endfragment" || starts_with(value2, "[if ") || starts_with(value2, "[endif")) {
        return "Remove";
      } else {
        return "Noop";
      }
    } else {
      return "Noop";
    }
  }
  var removeComments = {
    elementApplies: removeComments_elementApplies,
    process: removeComments_process
  };
  function removeWordCommentReference_elementApplies(param, attrs, param$1, param$2) {
    return exists3(function(param2) {
      if (param2[0] === "class") {
        return param2[1] === "MsoCommentReference";
      } else {
        return false;
      }
    }, attrs);
  }
  function removeWordCommentReference_process(param, param$1, param$2, param$3) {
    return "Remove";
  }
  var removeWordCommentReference = {
    elementApplies: removeWordCommentReference_elementApplies,
    process: removeWordCommentReference_process
  };
  function removeWordCommentList_elementApplies(param, param$1, styles, param$2) {
    return exists3(function(param2) {
      if (param2._0._0 === "mso-element") {
        return exists3(function(value2) {
          return value2 === "comment-list";
        }, param2._1._0);
      } else {
        return false;
      }
    }, styles);
  }
  function removeWordCommentList_process(param, param$1, param$2, param$3) {
    return "Remove";
  }
  var removeWordCommentList = {
    elementApplies: removeWordCommentList_elementApplies,
    process: removeWordCommentList_process
  };
  function unwrapWordCommentHighlighting_elementApplies(param, param$1, styles, param$2) {
    return exists3(function(param2) {
      return param2._0._0 === "mso-comment-reference";
    }, styles);
  }
  function unwrapWordCommentHighlighting_process(param, param$1, param$2, param$3) {
    return "Unwrap";
  }
  var unwrapWordCommentHighlighting = {
    elementApplies: unwrapWordCommentHighlighting_elementApplies,
    process: unwrapWordCommentHighlighting_process
  };
  function removeWordCommentListSeparatorSafari_elementApplies(name42, attrs, param, param$1) {
    if (isSafari.contents && name42 === "hr") {
      return exists3(function(param2) {
        if (param2[0] === "class") {
          return param2[1] === "msocomoff";
        } else {
          return false;
        }
      }, attrs);
    } else {
      return false;
    }
  }
  function removeWordCommentListSeparatorSafari_process(param, param$1, param$2, param$3) {
    return "Remove";
  }
  var removeWordCommentListSeparatorSafari = {
    elementApplies: removeWordCommentListSeparatorSafari_elementApplies,
    process: removeWordCommentListSeparatorSafari_process
  };
  function removeWordCommentListSafari_elementApplies(param, attrs, param$1, param$2) {
    if (isSafari.contents) {
      return exists3(function(param2) {
        if (param2[0] === "class") {
          return param2[1] === "msocomtxt";
        } else {
          return false;
        }
      }, attrs);
    } else {
      return false;
    }
  }
  function removeWordCommentListSafari_process(param, param$1, param$2, param$3) {
    return "Remove";
  }
  var removeWordCommentListSafari = {
    elementApplies: removeWordCommentListSafari_elementApplies,
    process: removeWordCommentListSafari_process
  };
  function removeUpLevel_elementApplies(param, param$1, param$2, param$3) {
    return matchEmptyTag("!", param, param$1, param$2, param$3);
  }
  function removeUpLevel_process(param, attrs, param$1, param$2) {
    if (attrs && attrs.hd[0] === "contents" && !attrs.tl) {
      return "Remove";
    } else {
      return "Noop";
    }
  }
  var removeUpLevel = {
    elementApplies: removeUpLevel_elementApplies,
    process: removeUpLevel_process
  };
  var blacklistMergeAttributes = _1(Stdlib.StringSet.of_list, {
    hd: "lang",
    tl: {
      hd: "onmouseover",
      tl: {
        hd: "onmouseout",
        tl: {
          hd: "data-list-type",
          tl: (
            /* [] */
            0
          )
        }
      }
    }
  });
  var blacklistCleanAttributes = _2(Stdlib.StringSet.union, blacklistMergeAttributes, _1(Stdlib.StringSet.of_list, {
    hd: "class",
    tl: {
      hd: "data-converted-paragraph",
      tl: {
        hd: "data-list-level",
        tl: {
          hd: "data-text-indent-alt",
          tl: (
            /* [] */
            0
          )
        }
      }
    }
  }));
  function removeUnwantedAttributes(merge2) {
    var blacklistedAttributes = merge2 ? blacklistMergeAttributes : blacklistCleanAttributes;
    var isAppleSpace = function(attr, value2) {
      if (attr === "class") {
        return value2 === "Apple-converted-space";
      } else {
        return false;
      }
    };
    return {
      elementApplies: function(param, attrs, param$1, param$2) {
        return attrs !== /* [] */
        0;
      },
      process: function(tagname, attrs, styles, children) {
        var attrResult = filter(function(param) {
          var attributeName = param[0];
          return !(isWordNamespace(attributeName) || isAppleSpace(attributeName, param[1]) || _2(Stdlib.StringSet.mem, attributeName, blacklistedAttributes));
        }, attrs);
        if (attrs === attrResult) {
          return "Noop";
        } else {
          return {
            TAG: "ReplaceSingle",
            _0: {
              TAG: "Element",
              _0: tagname,
              _1: attrResult,
              _2: styles,
              _3: children
            }
          };
        }
      }
    };
  }
  function removeDeltaViewInsertion(headStyles, merge2) {
    return {
      elementApplies: function(param, attrs, param$1, param$2) {
        if (merge2) {
          return exists3(function(param2) {
            if (param2[0] === "class") {
              return param2[1] === "DeltaViewInsertion";
            } else {
              return false;
            }
          }, attrs);
        } else {
          return false;
        }
      },
      process: function(tagname, attrs, styles, children) {
        var stylesCheck = exists3(function(x) {
          switch (x.TAG) {
            case "Rule":
              var match = x._0._0;
              if (match && match.hd === "DeltaViewInsertion" && !match.tl) {
                return true;
              } else {
                return false;
              }
            case "AtRule":
            case "ListRule":
              return false;
          }
        }, headStyles);
        if (!stylesCheck) {
          return "Unwrap";
        }
        var attrResult = filter(function(param) {
          return !(param[0] === "class" && param[1] === "DeltaViewInsertion");
        }, attrs);
        return {
          TAG: "ReplaceSingle",
          _0: {
            TAG: "Element",
            _0: tagname,
            _1: attrResult,
            _2: styles,
            _3: children
          }
        };
      }
    };
  }
  function removeEmptySpan_elementApplies(name42, attrs, styles, param) {
    if (name42 === "span" && attrs === /* [] */
    0) {
      return styles === /* [] */
      0;
    } else {
      return false;
    }
  }
  function removeEmptySpan_process(param, param$1, param$2, param$3) {
    return "Unwrap";
  }
  var removeEmptySpan = {
    elementApplies: removeEmptySpan_elementApplies,
    process: removeEmptySpan_process
  };
  function removeUnwantedInlineStyleElements(merge2, invalidInlineElements) {
    return {
      elementApplies: function(tagname, param, param$1, param$2) {
        if (merge2) {
          return false;
        } else {
          return _2(Stdlib.StringSet.mem, tagname, _1(Stdlib.StringSet.of_list, invalidInlineElements));
        }
      },
      process: function(param, param$1, param$2, x) {
        if (x) {
          return "Unwrap";
        } else {
          return "Remove";
        }
      }
    };
  }

  // lib/es6/src/main/re/stdlib/jscore/jslazy.mjs
  function bind4(f2, v) {
    return {
      LAZY_DONE: false,
      VAL: function() {
        return bind2(f2, force(v));
      }
    };
  }

  // lib/es6/src/main/re/wimp/listProcessing.mjs
  function findMsoList(param) {
    return find_map(function(x) {
      if (x._0._0 !== "mso-list") {
        return;
      }
      var match = x._1._0;
      if (!match) {
        return;
      }
      var match$1 = match.tl;
      if (!match$1) {
        return;
      }
      var rest = match$1.tl;
      return [
        {
          TAG: "ListTypeDef",
          _0: match.hd
        },
        parseLevel(match$1.hd),
        {
          LAZY_DONE: false,
          VAL: function() {
            return parseLfo(rest);
          }
        }
      ];
    }, param);
  }
  function valueOfProperty(property2, declarations) {
    return find_map(function(param) {
      if (param._0._0 === property2) {
        return show_value(param._1);
      }
    }, declarations);
  }
  function collectLists(cleanBetweenLists2, listType, siblings) {
    var helper = function(_elements, levelToMatch) {
      while (true) {
        var elements = _elements;
        if (!elements) {
          return [
            /* [] */
            0,
            elements
          ];
        }
        var match = elements.hd;
        if (match.TAG === "Data") {
          return [
            /* [] */
            0,
            elements
          ];
        }
        var xs = elements.tl;
        var children = match._3;
        var styles = match._2;
        var attrs = match._1;
        var name42 = match._0;
        var match$1 = findMsoList(styles);
        if (match$1 !== void 0) {
          var level = match$1[1];
          var ltype = match$1[0]._0;
          if (typeof levelToMatch !== "object") {
            if (ltype !== listType) {
              return [
                /* [] */
                0,
                elements
              ];
            }
            var thisBlock_1 = [
              name42,
              attrs,
              styles,
              children
            ];
            var thisBlock = [
              level,
              thisBlock_1
            ];
            var match$2 = helper(xs, {
              TAG: "Found",
              _0: level
            });
            return [
              {
                hd: thisBlock,
                tl: match$2[0]
              },
              match$2[1]
            ];
          }
          if (!(ltype === listType && level === levelToMatch._0)) {
            return [
              /* [] */
              0,
              elements
            ];
          }
          var thisBlock_1$1 = [
            name42,
            attrs,
            styles,
            children
          ];
          var thisBlock$1 = [
            level,
            thisBlock_1$1
          ];
          var match$3 = helper(xs, levelToMatch);
          return [
            {
              hd: thisBlock$1,
              tl: match$3[0]
            },
            match$3[1]
          ];
        }
        var lst = cleanNode(cleanBetweenLists2, name42, attrs, styles, children);
        if (lst === void 0) {
          return [
            /* [] */
            0,
            elements
          ];
        }
        _elements = append3(lst, xs);
        continue;
      }
      ;
    };
    return helper(siblings, "NotKnownYet");
  }
  function removeBullet(children) {
    var helper = function(_acc, _children) {
      while (true) {
        var children2 = _children;
        var acc = _acc;
        if (!children2) {
          return acc;
        }
        var d = children2.hd;
        if (d.TAG === "Data") {
          _children = children2.tl;
          _acc = {
            hd: d,
            tl: acc
          };
          continue;
        }
        var xs = children2.tl;
        var attrs = d._1;
        var name42 = d._0;
        var newChildren = removeBullet(d._3);
        if (attrs) {
          var match = attrs.hd;
          if (match[0] === "contents" && match[1] === "[if !supportLists]" && !attrs.tl && !newChildren && (name42 === "!" || name42 === "--")) {
            var match$1 = gatherUplevel(name42, xs);
            _children = match$1[1];
            continue;
          }
        }
        _children = xs;
        _acc = {
          hd: {
            TAG: "Element",
            _0: name42,
            _1: attrs,
            _2: d._2,
            _3: newChildren
          },
          tl: acc
        };
        continue;
      }
      ;
    };
    return rev3(helper(
      /* [] */
      0,
      children
    ));
  }
  function listStyleNone(param) {
    return [
      "li",
      param[1],
      {
        hd: {
          TAG: "Declaration",
          _0: {
            TAG: "Property",
            _0: "list-style"
          },
          _1: {
            TAG: "Value",
            _0: {
              hd: "none",
              tl: (
                /* [] */
                0
              )
            }
          }
        },
        tl: param[2]
      },
      /* [] */
      0
    ];
  }
  function parseBlocks(blocks) {
    var helper = function(_acc, _blocks) {
      while (true) {
        var blocks2 = _blocks;
        var acc = _acc;
        if (!blocks2) {
          return [
            acc,
            /* [] */
            0
          ];
        }
        var match2 = blocks2.hd;
        var element = match2[1];
        var newLevel = match2[0];
        if (acc) {
          var match$12 = acc.hd;
          var currentLevel = match$12._0;
          if (newLevel > currentLevel) {
            var nestedAcc = newLevel === (currentLevel + 1 | 0) ? (
              /* [] */
              0
            ) : {
              hd: {
                TAG: "Acc",
                _0: currentLevel + 1 | 0,
                _1: listStyleNone(element),
                _2: (
                  /* [] */
                  0
                )
              },
              tl: (
                /* [] */
                0
              )
            };
            var match$2 = helper(nestedAcc, blocks2);
            _blocks = match$2[1];
            _acc = {
              hd: {
                TAG: "Acc",
                _0: currentLevel,
                _1: match$12._1,
                _2: rev3(match$2[0])
              },
              tl: acc.tl
            };
            continue;
          }
          if (newLevel < currentLevel) {
            return [
              acc,
              blocks2
            ];
          }
        }
        _blocks = blocks2.tl;
        _acc = {
          hd: {
            TAG: "Acc",
            _0: newLevel,
            _1: element,
            _2: (
              /* [] */
              0
            )
          },
          tl: acc
        };
        continue;
      }
      ;
    };
    if (!blocks) {
      return (
        /* [] */
        0
      );
    }
    var match = blocks.hd;
    var base = match[0] === 1 ? (
      /* [] */
      0
    ) : {
      hd: {
        TAG: "Acc",
        _0: 1,
        _1: listStyleNone(match[1]),
        _2: (
          /* [] */
          0
        )
      },
      tl: (
        /* [] */
        0
      )
    };
    var match$1 = helper(base, blocks);
    return rev3(match$1[0]);
  }
  function identifyListBullet(declarations) {
    return bind2(function(x) {
      if (x === Bullets.square) {
        return [
          "ul",
          "square"
        ];
      } else if (x === Bullets.circle) {
        return [
          "ul",
          "circle"
        ];
      } else {
        return;
      }
    }, valueOfProperty("mso-level-text", declarations));
  }
  function listStylesToCopyFromElement(param) {
    return filter(function(param2) {
      var p = param2._0._0;
      if (p === "margin-top") {
        return true;
      } else {
        return p === "margin-bottom";
      }
    }, param);
  }
  function swapDisplayNoneForListStyleNone(param) {
    return map3(function(x) {
      if (x._0._0 !== "display") {
        return x;
      }
      var v = x._1;
      var match = v._0;
      if (match && match.hd === "none" && !match.tl) {
        return {
          TAG: "Declaration",
          _0: {
            TAG: "Property",
            _0: "list-style"
          },
          _1: v
        };
      } else {
        return x;
      }
    }, param);
  }
  function identifyList(startCache, styleRules, styles, overallType, overallLevel) {
    var findListRule = function(listType, listLevel, listLfo) {
      var filterByListType = function(param) {
        return filter(function(x) {
          switch (x.TAG) {
            case "Rule":
            case "AtRule":
              return false;
            case "ListRule":
              if (x._0._0 === listType) {
                return is(x._2, listLfo);
              } else {
                return false;
              }
          }
        }, param);
      };
      var withListLevel = function(param) {
        return find_map(function(x) {
          switch (x.TAG) {
            case "Rule":
            case "AtRule":
              return;
            case "ListRule":
              var match = x._1;
              if (match !== void 0 && match._0 === listLevel) {
                return x._3;
              } else {
                return;
              }
          }
        }, param);
      };
      var withoutListLevel = function(param) {
        return find_map(function(x) {
          switch (x.TAG) {
            case "Rule":
            case "AtRule":
              return;
            case "ListRule":
              if (x._1 !== void 0) {
                return;
              } else {
                return x._3;
              }
          }
        }, param);
      };
      var lst = filterByListType(styleRules);
      var res1 = _1(withListLevel, lst);
      if (res1 !== void 0) {
        return res1;
      } else {
        return _1(withoutListLevel, lst);
      }
    };
    var isLegacyList = function(lst) {
      return filter2(function(param) {
        return equal2("yes", param);
      }, valueOfProperty("mso-level-legacy", lst));
    };
    var findLegacyList = function(param) {
      return findListRule(param[0]._0, param[1], force(param[2]));
    };
    return value([
      "ul",
      /* [] */
      0,
      /* [] */
      0
    ], map4(function(listRule) {
      var legacyDeclarations = {
        LAZY_DONE: false,
        VAL: function() {
          return bind2(function(param) {
            return bind2(findLegacyList, findMsoList(styles));
          }, isLegacyList(listRule));
        }
      };
      var lType = overallType + ":" + toString(overallLevel);
      var identifyFormat = function(format) {
        var match = lowercase_ascii5(format);
        var tmp;
        switch (match) {
          case "alpha-lower":
            tmp = [
              "ol",
              "lower-alpha"
            ];
            break;
          case "alpha-upper":
            tmp = [
              "ol",
              "upper-alpha"
            ];
            break;
          case "bullet":
          case "image":
            tmp = identifyListBullet(listRule);
            break;
          case "roman-lower":
            tmp = [
              "ol",
              "lower-roman"
            ];
            break;
          case "roman-upper":
            tmp = [
              "ol",
              "upper-roman"
            ];
            break;
          default:
            tmp = void 0;
        }
        return selfOr({
          LAZY_DONE: true,
          VAL: [
            "ul",
            void 0
          ]
        }, tmp);
      };
      var listType = value([
        "ol",
        void 0
      ], bind2(identifyFormat, valueOfProperty("mso-level-number-format", listRule)));
      var tag = listType[0];
      var createListStyleType = function(value2) {
        return {
          TAG: "Declaration",
          _0: {
            TAG: "Property",
            _0: "list-style-type"
          },
          _1: {
            TAG: "Value",
            _0: {
              hd: value2,
              tl: (
                /* [] */
                0
              )
            }
          }
        };
      };
      var styles$1 = toList(map4(createListStyleType, listType[1]));
      var consumedLists = startCache.contents;
      var startAttributeConsumedBefore = exists3(function(x) {
        return equal(x, lType);
      }, consumedLists);
      if (tag === "ul" || startAttributeConsumedBefore) {
        return [
          tag,
          /* [] */
          0,
          styles$1
        ];
      }
      var findStartValue = function(param) {
        return valueOfProperty("mso-level-start-at", param);
      };
      var findLegacyStartValue = bind4(findStartValue, legacyDeclarations);
      var startAttribute = map4(function(startValue) {
        return [
          "start",
          startValue
        ];
      }, filter2(function(v) {
        return v !== "0";
      }, selfOr(findLegacyStartValue, valueOfProperty("mso-level-start-at", listRule))));
      if (startAttribute !== void 0) {
        startCache.contents = {
          hd: lType,
          tl: consumedLists
        };
      }
      return [
        tag,
        toList(startAttribute),
        styles$1
      ];
    }, findListRule(overallType, overallLevel, void 0)));
  }
  function findMsoTextIndentAlt(styles) {
    return filter_map(function(x) {
      if (x._0._0 === "mso-text-indent-alt") {
        return [
          "data-text-indent-alt",
          show_value(x._1)
        ];
      }
    }, styles);
  }
  function buildList(startCache, styleRules, ltype, acclist) {
    var getListContinueDetails = function(ltype2, level2) {
      return {
        hd: [
          "data-list-type",
          ltype2 + (":" + toString(level2))
        ],
        tl: {
          hd: [
            "data-list-id",
            ltype2
          ],
          tl: (
            /* [] */
            0
          )
        }
      };
    };
    var buildChildren = function(param) {
      var lists = param._2;
      var match2 = param._1;
      var styles2 = match2[2];
      var attrs = match2[1];
      var name42 = match2[0];
      var listChildren = lists === /* [] */
      0 ? (
        /* [] */
        0
      ) : buildList(startCache, styleRules, ltype, lists);
      var listLevelAttr_1 = toString(param._0);
      var listLevelAttr = [
        "data-list-level",
        listLevelAttr_1
      ];
      if (name42 === "li") {
        return {
          TAG: "Element",
          _0: name42,
          _1: {
            hd: listLevelAttr,
            tl: attrs
          },
          _2: styles2,
          _3: listChildren
        };
      }
      var attrsWithClassData = exists3(function(param2) {
        return attribute("class", param2);
      }, attrs) ? attrs : {
        hd: [
          "data-converted-paragraph",
          "true"
        ],
        tl: attrs
      };
      var attrsWithListData_1 = append3(findMsoTextIndentAlt(styles2), attrsWithClassData);
      var attrsWithListData = {
        hd: listLevelAttr,
        tl: attrsWithListData_1
      };
      var styles$1 = swapDisplayNoneForListStyleNone(styles2);
      return {
        TAG: "Element",
        _0: "li",
        _1: attrsWithListData,
        _2: styles$1,
        _3: append3(removeBullet(match2[3]), listChildren)
      };
    };
    if (!acclist) {
      return (
        /* [] */
        0
      );
    }
    var match = acclist.hd;
    var styles = match._1[2];
    var level = match._0;
    var match$1 = identifyList(startCache, styleRules, styles, ltype, level);
    var childLIs = map3(buildChildren, acclist);
    var continueDetails = getListContinueDetails(ltype, level);
    var listElementAttributes = append3(continueDetails, match$1[1]);
    var listElementStyles = append3(match$1[2], listStylesToCopyFromElement(styles));
    return {
      hd: {
        TAG: "Element",
        _0: match$1[0],
        _1: listElementAttributes,
        _2: listElementStyles,
        _3: childLIs
      },
      tl: (
        /* [] */
        0
      )
    };
  }
  function processLists(styleRules, cleanBetweenLists2) {
    var startCache = {
      contents: (
        /* [] */
        0
      )
    };
    return {
      siblingApplies: function(name42, param, param$1, param$2) {
        return name42 === "p";
      },
      process: function(name42, attrs, styles, children, siblings) {
        return value(void 0, map4(function(param) {
          var ltype = param[0]._0;
          var elements_0 = {
            TAG: "Element",
            _0: name42,
            _1: attrs,
            _2: styles,
            _3: children
          };
          var elements = {
            hd: elements_0,
            tl: siblings
          };
          var match = collectLists(cleanBetweenLists2, ltype, elements);
          var structure42 = parseBlocks(match[0]);
          var lists = buildList(startCache, styleRules, ltype, structure42);
          return append3(lists, match[1]);
        }, findMsoList(styles)));
      }
    };
  }

  // lib/es6/src/main/re/wimp/postProcessing.mjs
  var removableWhenEmpty = _1(Stdlib.StringSet.of_list, {
    hd: "font",
    tl: {
      hd: "span",
      tl: {
        hd: "b",
        tl: {
          hd: "i",
          tl: {
            hd: "u",
            tl: {
              hd: "sub",
              tl: {
                hd: "sup",
                tl: {
                  hd: "em",
                  tl: {
                    hd: "strong",
                    tl: {
                      hd: "samp",
                      tl: {
                        hd: "acronym",
                        tl: {
                          hd: "cite",
                          tl: {
                            hd: "code",
                            tl: {
                              hd: "dfn",
                              tl: {
                                hd: "kbd",
                                tl: {
                                  hd: "tt",
                                  tl: {
                                    hd: "s",
                                    tl: {
                                      hd: "ins",
                                      tl: {
                                        hd: "del",
                                        tl: {
                                          hd: "var",
                                          tl: {
                                            hd: "head",
                                            tl: (
                                              /* [] */
                                              0
                                            )
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  function mergeData(_nodes) {
    while (true) {
      var nodes = _nodes;
      if (!nodes) {
        return nodes;
      }
      var a = nodes.hd;
      if (a.TAG === "Data") {
        var match = nodes.tl;
        if (match) {
          var b = match.hd;
          if (b.TAG === "Data") {
            _nodes = {
              hd: {
                TAG: "Data",
                _0: a._0 + b._0
              },
              tl: match.tl
            };
            continue;
          }
        }
      }
      return {
        hd: a,
        tl: mergeData(nodes.tl)
      };
    }
    ;
  }
  function append4(l1, l2) {
    var _acc = (
      /* [] */
      0
    );
    var _l1 = l1;
    var _l2 = l2;
    while (true) {
      var l2$1 = _l2;
      var l1$1 = _l1;
      var acc = _acc;
      if (l1$1) {
        _l1 = l1$1.tl;
        _acc = {
          hd: l1$1.hd,
          tl: acc
        };
        continue;
      }
      if (!l2$1) {
        return rev3(acc);
      }
      _l2 = l2$1.tl;
      _l1 = /* [] */
      0;
      _acc = {
        hd: l2$1.hd,
        tl: acc
      };
      continue;
    }
    ;
  }
  function removeEmptyTags(nodes) {
    var removeEmptyTagsAux = function(_nodes, _acc) {
      while (true) {
        var acc = _acc;
        var nodes2 = _nodes;
        if (!nodes2) {
          return acc;
        }
        var d = nodes2.hd;
        if (d.TAG === "Data") {
          _acc = append4(acc, {
            hd: d,
            tl: (
              /* [] */
              0
            )
          });
          _nodes = nodes2.tl;
          continue;
        }
        var xs = nodes2.tl;
        var name42 = d._0;
        var cleanedChildren = removeEmptyTagsAux(
          d._3,
          /* [] */
          0
        );
        if (_2(Stdlib.StringSet.mem, name42, removableWhenEmpty) && cleanedChildren === /* [] */
        0) {
          _nodes = xs;
          continue;
        }
        var mergedChildren = mergeData(cleanedChildren);
        _acc = append4(acc, {
          hd: {
            TAG: "Element",
            _0: name42,
            _1: d._1,
            _2: d._2,
            _3: mergedChildren
          },
          tl: (
            /* [] */
            0
          )
        });
        _nodes = xs;
        continue;
      }
      ;
    };
    return removeEmptyTagsAux(
      nodes,
      /* [] */
      0
    );
  }
  function updateListStartValues(param) {
    var startCache = {
      contents: (
        /* [] */
        0
      )
    };
    return {
      elementApplies: function(name42, param2, param$1, param$2) {
        if (name42 === "ol") {
          return true;
        } else {
          return name42 === "ul";
        }
      },
      process: function(name42, attrs, styles, children) {
        var addStartValue = {
          LAZY_DONE: false,
          VAL: function() {
            return value("Noop", map4(function(param2) {
              var ltype = param2[1];
              var startValues = startCache.contents;
              var exit = 0;
              var value2;
              try {
                value2 = assoc3(ltype, startValues);
                exit = 1;
              } catch (raw_exn) {
                var exn = internalToOCamlException(raw_exn);
                if (exn.RE_EXN_ID === "Not_found") {
                  startCache.contents = {
                    hd: [
                      ltype,
                      length3(children)
                    ],
                    tl: startValues
                  };
                  return "Noop";
                }
                throw exn;
              }
              if (exit === 1) {
                var exit$1 = 0;
                if (children) {
                  var match = children.hd;
                  if (match.TAG === "Data" || match._0 !== "li") {
                    exit$1 = 2;
                  } else {
                    var match$1 = match._3;
                    if (match$1) {
                      var match$2 = match$1.hd;
                      if (match$2.TAG === "Data" || !(match$2._0 === "ol" && !match$1.tl)) {
                        exit$1 = 2;
                      } else {
                        if (!children.tl) {
                          return "Noop";
                        }
                        exit$1 = 2;
                      }
                    } else {
                      exit$1 = 2;
                    }
                  }
                } else {
                  exit$1 = 2;
                }
                if (exit$1 === 2) {
                  var lastProcessedLtype = value(ltype, map4(function(prim) {
                    return prim[0];
                  }, hd(startValues)));
                  var currentListLevel = int_of_string(nth2(split2(
                    ltype,
                    /* ':' */
                    58
                  ), 1));
                  var currentListId = nth2(split2(
                    ltype,
                    /* ':' */
                    58
                  ), 0);
                  var lastListLevel = int_of_string(nth2(split2(
                    lastProcessedLtype,
                    /* ':' */
                    58
                  ), 1));
                  var lastListId = value(currentListId, hd(split2(
                    lastProcessedLtype,
                    /* ':' */
                    58
                  )));
                  var currentListLevelIsOuterThanLastListLevel = currentListLevel < lastListLevel;
                  var startValue = lastProcessedLtype === ltype || currentListLevelIsOuterThanLastListLevel || lastListId !== currentListId ? toString(value2 + 1 | 0) : toString(1);
                  var newSize = lastProcessedLtype === ltype || currentListLevelIsOuterThanLastListLevel || lastListId !== currentListId ? value2 + length3(children) | 0 : length3(children);
                  startCache.contents = {
                    hd: [
                      ltype,
                      newSize
                    ],
                    tl: startValues
                  };
                  if (name42 === "ul" || startValue === "1") {
                    return "Noop";
                  } else {
                    return {
                      TAG: "ReplaceSingle",
                      _0: {
                        TAG: "Element",
                        _0: name42,
                        _1: {
                          hd: [
                            "start",
                            startValue
                          ],
                          tl: attrs
                        },
                        _2: styles,
                        _3: children
                      }
                    };
                  }
                }
              }
            }, findAttr("data-list-type")(attrs)));
          }
        };
        return orLazy(addStartValue, map4(function(param2) {
          var ltype = map4(function(prim) {
            return prim[1];
          }, findAttr("data-list-type")(attrs));
          if (ltype !== void 0) {
            var startValues = startCache.contents;
            startCache.contents = {
              hd: [
                ltype,
                (value(1, int_of_string_opt(param2[1])) + length3(children) | 0) - 1 | 0
              ],
              tl: startValues
            };
          }
          return "Noop";
        }, findAttr("start")(attrs)));
      }
    };
  }
  function mergeListStyleNoneLists_siblingApplies(name42, param, param$1, param$2) {
    if (name42 === "ol") {
      return true;
    } else {
      return name42 === "ul";
    }
  }
  function mergeListStyleNoneLists_process(name42, attrs, styles, children, siblings) {
    var isListStyleNone = function(node) {
      if (node.TAG === "Data") {
        return false;
      } else {
        return exists3(function(param) {
          if (param._0._0 === "list-style") {
            return equal(param._1._0, {
              hd: "none",
              tl: (
                /* [] */
                0
              )
            });
          } else {
            return false;
          }
        }, node._2);
      }
    };
    var currentListId = findAttr("data-list-id")(attrs);
    var extracted_list;
    if (siblings) {
      var sibling = siblings.hd;
      if (sibling.TAG === "Data") {
        extracted_list = void 0;
      } else {
        var siblingListId = findAttr("data-list-id")(sibling._1);
        extracted_list = name42 !== sibling._0 || isNone(currentListId) || notequal(currentListId, siblingListId) ? void 0 : bind2(function(child) {
          if (child.TAG === "Data" || !(child._0 === "li" && isListStyleNone(child))) {
            return;
          } else {
            return child._3;
          }
        }, hd(sibling._3));
      }
    } else {
      extracted_list = void 0;
    }
    return map4(function(nodes) {
      var match = partition_list_by_last_child(children);
      if (typeof match !== "object") {
        return {
          hd: {
            TAG: "Element",
            _0: name42,
            _1: attrs,
            _2: styles,
            _3: nodes
          },
          tl: tl2(siblings)
        };
      }
      var last_child = match._0;
      if (last_child.TAG === "Data") {
        return {
          hd: {
            TAG: "Element",
            _0: name42,
            _1: attrs,
            _2: styles,
            _3: append3(children, nodes)
          },
          tl: tl2(siblings)
        };
      } else {
        return {
          hd: {
            TAG: "Element",
            _0: name42,
            _1: attrs,
            _2: styles,
            _3: append3(match._1, {
              hd: {
                TAG: "Element",
                _0: last_child._0,
                _1: last_child._1,
                _2: last_child._2,
                _3: append3(last_child._3, nodes)
              },
              tl: (
                /* [] */
                0
              )
            })
          },
          tl: tl2(siblings)
        };
      }
    }, extracted_list);
  }
  var mergeListStyleNoneLists = {
    siblingApplies: mergeListStyleNoneLists_siblingApplies,
    process: mergeListStyleNoneLists_process
  };
  function getStartAttribute(attrs) {
    return int_of_string(value("1", map4(function(prim) {
      return prim[1];
    }, findAttr("start")(attrs))));
  }
  function mergeConsecutiveListsWithSameID_siblingApplies(name42, param, param$1, param$2) {
    if (name42 === "ol") {
      return true;
    } else {
      return name42 === "ul";
    }
  }
  function mergeConsecutiveListsWithSameID_process(name42, attrs, styles, children, siblings) {
    return bind2(function(param) {
      var listId = param[1];
      var first_sibling_opt = hd(siblings);
      return bind2(function(sibling) {
        if (sibling.TAG === "Data") {
          return;
        }
        var schildren = sibling._3;
        var sattrs = sibling._1;
        var sname = sibling._0;
        var siblingListIdOpt = findAttr("data-list-id")(sattrs);
        return bind2(function(param2) {
          var sListId = param2[1];
          var start = getStartAttribute(attrs);
          var siblingStart = getStartAttribute(sattrs);
          var siblingIsAfterElement = (start + length3(children) | 0) === siblingStart;
          var lists_should_merge = name42 === "ul" && sListId === listId || name42 === "ol" && sname === "ol" && sListId === listId && siblingIsAfterElement;
          if (lists_should_merge) {
            return {
              hd: {
                TAG: "Element",
                _0: name42,
                _1: attrs,
                _2: styles,
                _3: append3(children, schildren)
              },
              tl: tl2(siblings)
            };
          }
        }, siblingListIdOpt);
      }, first_sibling_opt);
    }, findAttr("data-list-id")(attrs));
  }
  var mergeConsecutiveListsWithSameID = {
    siblingApplies: mergeConsecutiveListsWithSameID_siblingApplies,
    process: mergeConsecutiveListsWithSameID_process
  };
  function removeDataListIdAttribute_elementApplies(param, attrs, param$1, param$2) {
    return attrs !== /* [] */
    0;
  }
  function removeDataListIdAttribute_process(tagname, attrs, styles, children) {
    var attrResult = filter(function(param) {
      return param[0] !== "data-list-id";
    }, attrs);
    if (attrs === attrResult) {
      return "Noop";
    } else {
      return {
        TAG: "ReplaceSingle",
        _0: {
          TAG: "Element",
          _0: tagname,
          _1: attrResult,
          _2: styles,
          _3: children
        }
      };
    }
  }
  var removeDataListIdAttribute = {
    elementApplies: removeDataListIdAttribute_elementApplies,
    process: removeDataListIdAttribute_process
  };
  function postprocess(rules, nodes) {
    return $$process(
      true,
      {
        hd: removeDataListIdAttribute,
        tl: (
          /* [] */
          0
        )
      },
      /* [] */
      0,
      $$process(
        true,
        /* [] */
        0,
        {
          hd: mergeConsecutiveListsWithSameID,
          tl: (
            /* [] */
            0
          )
        },
        removeEmptyTags($$process(true, {
          hd: updateListStartValues(),
          tl: rules
        }, {
          hd: mergeListStyleNoneLists,
          tl: (
            /* [] */
            0
          )
        }, nodes))
      )
    );
  }

  // lib/es6/src/main/re/wimp/structureAdjust.mjs
  function combineDirAttributes_elementApplies(name42, param, param$1, param$2) {
    return name42 === "p";
  }
  function combineDirAttributes_process(name42, pAttrs, pStyles, children) {
    if (!children) {
      return "Noop";
    }
    var match = children.hd;
    if (match.TAG === "Data") {
      return "Noop";
    }
    if (match._0 !== "span") {
      return "Noop";
    }
    if (children.tl) {
      return "Noop";
    }
    var match$1 = partition(function(param) {
      return attribute("dir", param);
    })(match._1);
    var dir = match$1[0];
    if (dir && !dir.tl) {
      return {
        TAG: "ReplaceSingle",
        _0: {
          TAG: "Element",
          _0: name42,
          _1: setAttr("dir", dir.hd[1], pAttrs),
          _2: pStyles,
          _3: {
            hd: {
              TAG: "Element",
              _0: "span",
              _1: match$1[1],
              _2: match._2,
              _3: match._3
            },
            tl: (
              /* [] */
              0
            )
          }
        }
      };
    } else {
      return "Noop";
    }
  }
  var combineDirAttributes = {
    elementApplies: combineDirAttributes_elementApplies,
    process: combineDirAttributes_process
  };
  function getNewChildren(styles, children) {
    var addBorderStyles = function(childName, childAttrs, childStyles, childChildren) {
      var borderDivMargin = value(
        /* [] */
        0,
        find_map(function(param) {
          if (param._0._0 === "margin-left") {
            return {
              hd: [
                "data-border-margin",
                show_value(param._1)
              ],
              tl: (
                /* [] */
                0
              )
            };
          }
        }, styles)
      );
      var borderStyles = filter(function(param) {
        return starts_with(param._0._0, "border");
      }, styles);
      var newChildStyles = filter(function(param) {
        var childProp = param._0._0;
        return !exists3(function(param2) {
          return param2._0._0 === childProp;
        }, borderStyles);
      }, childStyles);
      return {
        TAG: "Element",
        _0: childName,
        _1: append3(borderDivMargin, childAttrs),
        _2: append3(newChildStyles, borderStyles),
        _3: childChildren
      };
    };
    var match = rev3(children);
    var tmp;
    if (match) {
      var match$1 = match.hd;
      tmp = match$1.TAG === "Data" ? (
        /* [] */
        0
      ) : {
        hd: addBorderStyles(match$1._0, match$1._1, match$1._2, match$1._3),
        tl: match.tl
      };
    } else {
      tmp = /* [] */
      0;
    }
    return rev3(tmp);
  }
  function unwrapBorderDivs_elementApplies(name42, param, param$1, param$2) {
    return name42 === "div";
  }
  function unwrapBorderDivs_process(param, param$1, styles, children) {
    var isBorderDiv = exists3(function(param2) {
      if (param2._0._0 === "mso-element") {
        return equal(param2._1._0, {
          hd: "para-border-div",
          tl: (
            /* [] */
            0
          )
        });
      } else {
        return false;
      }
    }, styles);
    if (isBorderDiv) {
      return {
        TAG: "ReplaceMulti",
        _0: getNewChildren(styles, children)
      };
    } else {
      return "Noop";
    }
  }
  var unwrapBorderDivs = {
    elementApplies: unwrapBorderDivs_elementApplies,
    process: unwrapBorderDivs_process
  };

  // lib/es6/src/main/re/wimp/imageProcessingRules.mjs
  function adjustForRotation(imgAttrs, vshapeStyles) {
    return bind22(findAttr("width")(imgAttrs), findAttr("height")(imgAttrs), function(param, param$1) {
      var height = param$1[1];
      var width = param[1];
      return map4(function(rotate) {
        switch (rotate) {
          case "-90":
          case "90":
            break;
          default:
            return imgAttrs;
        }
        return setAttr("width", height, setAttr("height", width, imgAttrs));
      }, find_map(function(x) {
        if (x._0._0 === "rotation") {
          return show_value(x._1);
        }
      }, vshapeStyles));
    });
  }
  function imageAttrsFromId(vshapeId) {
    return {
      hd: [
        "data-image-id",
        vshapeId
      ],
      tl: {
        hd: [
          "rtf-data-image",
          "true"
        ],
        tl: (
          /* [] */
          0
        )
      }
    };
  }
  var unsupportedVshapeAttrs_0 = [
    "data-image-id",
    "unsupported"
  ];
  var unsupportedVshapeAttrs_1 = {
    hd: [
      "rtf-data-image",
      "true"
    ],
    tl: (
      /* [] */
      0
    )
  };
  var unsupportedVshapeAttrs = {
    hd: unsupportedVshapeAttrs_0,
    tl: unsupportedVshapeAttrs_1
  };
  function updateImageFromVshape(vshapeAttrs, vshapeStyles, imgAttrs) {
    var preferredId = "o:spid";
    var backupId = "id";
    var vmlAttrCandidates = filter(function(param) {
      var name42 = param[0];
      if (name42 === preferredId) {
        return true;
      } else {
        return name42 === backupId;
      }
    }, vshapeAttrs);
    var imageIdFromVshapeId = function(param) {
      return from_index(param[1], "_x0000_".length);
    };
    var vmlAttributes = value(unsupportedVshapeAttrs, map4(imageAttrsFromId, map4(imageIdFromVshapeId, selfOr({
      LAZY_DONE: false,
      VAL: function() {
        return findAttr(backupId)(vmlAttrCandidates);
      }
    }, findAttr(preferredId)(vmlAttrCandidates)))));
    var imgAttrs$1 = value(imgAttrs, adjustForRotation(imgAttrs, vshapeStyles));
    return append3(vmlAttributes, imgAttrs$1);
  }
  function getVshapeData(name42, lst) {
    return getElementData(name42, function(attrs, styles) {
      return [
        attrs,
        styles
      ];
    }, {
      TAG: "Element",
      _0: "vshapedata",
      _1: (
        /* [] */
        0
      ),
      _2: (
        /* [] */
        0
      ),
      _3: lst
    });
  }
  function convertVshapeImages_elementApplies(name42, param, param$1, param$2) {
    return name42 === "v:shape";
  }
  function convertVshapeImages_process(param, vshapeAttrs, vshapeStyles, children) {
    var match = value([
      unsupportedVshapeAttrs,
      /* [] */
      0
    ], map4(function(param2) {
      var imgAttrs = updateImageFromVshape(vshapeAttrs, vshapeStyles, param2[0]);
      return [
        imgAttrs,
        append3(param2[1], vshapeStyles)
      ];
    }, getVshapeData("v:imagedata", children)));
    return {
      TAG: "ReplaceSingle",
      _0: {
        TAG: "Element",
        _0: "img",
        _1: match[0],
        _2: match[1],
        _3: (
          /* [] */
          0
        )
      }
    };
  }
  var convertVshapeImages = {
    elementApplies: convertVshapeImages_elementApplies,
    process: convertVshapeImages_process
  };
  function findImageAttrs(param) {
    return getElementData("img", function(attrs, param2) {
      return attrs;
    }, param);
  }
  function setImageAttrs(imgAttrs, x) {
    if (x.TAG === "Data") {
      return;
    }
    var name42 = x._0;
    if (name42 === "img") {
      return {
        TAG: "Element",
        _0: "img",
        _1: imgAttrs,
        _2: x._2,
        _3: x._3
      };
    }
    var setImageAttrs$1 = function(x2) {
      if (!x2) {
        return (
          /* [] */
          0
        );
      }
      var d = x2.hd;
      if (d.TAG === "Data") {
        return {
          hd: d,
          tl: setImageAttrs$1(x2.tl)
        };
      }
      var name43 = d._0;
      if (name43 === "img") {
        return {
          hd: {
            TAG: "Element",
            _0: "img",
            _1: imgAttrs,
            _2: d._2,
            _3: d._3
          },
          tl: x2.tl
        };
      } else {
        return {
          hd: {
            TAG: "Element",
            _0: name43,
            _1: d._1,
            _2: d._2,
            _3: setImageAttrs$1(d._3)
          },
          tl: setImageAttrs$1(x2.tl)
        };
      }
    };
    return {
      TAG: "Element",
      _0: name42,
      _1: x._1,
      _2: x._2,
      _3: setImageAttrs$1(x._3)
    };
  }
  var openVml = "[if gte vml 1]>";
  var closeVml = "<![endif]";
  function isOpenVml(value2) {
    if (starts_with(value2, openVml)) {
      return ends_with(value2, closeVml);
    } else {
      return false;
    }
  }
  function extractVmlData(value2) {
    return sub6(value2, openVml.length, (value2.length - closeVml.length | 0) - openVml.length | 0);
  }
  function getVmlImage(parsedContents, downlevelContents) {
    return value(downlevelContents, bind2(function(imgAttrs) {
      var newImgAttrs = orLazy({
        LAZY_DONE: false,
        VAL: function() {
          return append3(unsupportedVshapeAttrs, imgAttrs);
        }
      }, map4(function(param) {
        return updateImageFromVshape(param[0], param[1], imgAttrs);
      }, getVshapeData("v:shape", parsedContents)));
      return setImageAttrs(newImgAttrs, downlevelContents);
    }, findImageAttrs(downlevelContents)));
  }
  function convertVmlImages_siblingApplies(param, param$1, param$2, param$3) {
    return matchEmptyTag("--", param, param$1, param$2, param$3);
  }
  function convertVmlImages_process(param, attrs, param$1, param$2, siblings) {
    if (!attrs) {
      return;
    }
    var match = attrs.hd;
    if (match[0] !== "contents") {
      return;
    }
    if (attrs.tl) {
      return;
    }
    var contents2 = match[1];
    if (!isOpenVml(contents2)) {
      return;
    }
    if (!siblings) {
      return;
    }
    var match$1 = siblings.hd;
    if (match$1.TAG === "Data") {
      return;
    }
    if (match$1._0 !== "!") {
      return;
    }
    var match$2 = match$1._1;
    if (!match$2) {
      return;
    }
    var match$3 = match$2.hd;
    if (match$3[0] !== "contents") {
      return;
    }
    if (match$3[1] !== "[if !vml]") {
      return;
    }
    if (match$2.tl) {
      return;
    }
    var match$4 = siblings.tl;
    if (!match$4) {
      return;
    }
    var match$5 = match$4.tl;
    if (!match$5) {
      return;
    }
    var match$6 = match$5.hd;
    if (match$6.TAG === "Data") {
      return;
    }
    if (match$6._0 !== "!") {
      return;
    }
    var match$7 = match$6._1;
    if (!match$7) {
      return;
    }
    var match$8 = match$7.hd;
    if (match$8[0] !== "contents") {
      return;
    }
    if (match$8[1] !== "[endif]") {
      return;
    }
    if (match$7.tl) {
      return;
    }
    var vmlImage = getVmlImage(parseString(extractVmlData(contents2)), match$4.hd);
    return {
      hd: vmlImage,
      tl: match$5.tl
    };
  }
  var convertVmlImages = {
    siblingApplies: convertVmlImages_siblingApplies,
    process: convertVmlImages_process
  };
  function isOpenEquation(value2) {
    if (starts_with(value2, "[if gte msEquation")) {
      return ends_with(value2, "<![endif]");
    } else {
      return false;
    }
  }
  function getVmlEquation(downlevelContents) {
    return value(downlevelContents, bind2(function(imgAttrs) {
      return setImageAttrs({
        hd: [
          "data-ms-equation",
          "true"
        ],
        tl: imgAttrs
      }, downlevelContents);
    }, findImageAttrs(downlevelContents)));
  }
  function convertMsEquations_siblingApplies(param, param$1, param$2, param$3) {
    return matchEmptyTag("--", param, param$1, param$2, param$3);
  }
  function convertMsEquations_process(param, attrs, param$1, param$2, siblings) {
    if (!attrs) {
      return;
    }
    var match = attrs.hd;
    if (match[0] !== "contents") {
      return;
    }
    if (attrs.tl) {
      return;
    }
    if (!isOpenEquation(match[1])) {
      return;
    }
    if (!siblings) {
      return;
    }
    var match$1 = siblings.hd;
    if (match$1.TAG === "Data") {
      return;
    }
    if (match$1._0 !== "!") {
      return;
    }
    var match$2 = match$1._1;
    if (!match$2) {
      return;
    }
    var match$3 = match$2.hd;
    if (match$3[0] !== "contents") {
      return;
    }
    if (match$3[1] !== "[if !msEquation]") {
      return;
    }
    if (match$2.tl) {
      return;
    }
    var match$4 = siblings.tl;
    if (!match$4) {
      return;
    }
    var match$5 = match$4.tl;
    if (!match$5) {
      return;
    }
    var match$6 = match$5.hd;
    if (match$6.TAG === "Data") {
      return;
    }
    if (match$6._0 !== "!") {
      return;
    }
    var match$7 = match$6._1;
    if (!match$7) {
      return;
    }
    var match$8 = match$7.hd;
    if (match$8[0] !== "contents") {
      return;
    }
    if (match$8[1] !== "[endif]") {
      return;
    }
    if (match$7.tl) {
      return;
    }
    var vmlEquation = getVmlEquation(match$4.hd);
    return {
      hd: vmlEquation,
      tl: match$5.tl
    };
  }
  var convertMsEquations = {
    siblingApplies: convertMsEquations_siblingApplies,
    process: convertMsEquations_process
  };

  // lib/es6/src/main/re/wimp/wimp.mjs
  var wordCommentsRules_1 = {
    hd: removeWordCommentList,
    tl: {
      hd: unwrapWordCommentHighlighting,
      tl: {
        hd: removeWordCommentListSeparatorSafari,
        tl: {
          hd: removeWordCommentListSafari,
          tl: (
            /* [] */
            0
          )
        }
      }
    }
  };
  var wordCommentsRules = {
    hd: removeWordCommentReference,
    tl: wordCommentsRules_1
  };
  var genericElementRules_1 = {
    hd: removeWordNamespaceTag,
    tl: {
      hd: removeUnwantedAnchors,
      tl: wordCommentsRules
    }
  };
  var genericElementRules = {
    hd: convertVshapeImages,
    tl: genericElementRules_1
  };
  function cleanupElementRules(merge2, styleTag, invalidInlineElements) {
    return {
      hd: adjustParagraphAlignment,
      tl: {
        hd: adjustImageSrc,
        tl: {
          hd: removeUnwantedAttributes(merge2),
          tl: {
            hd: removeDeltaViewInsertion(styleTag, merge2),
            tl: {
              hd: removeUpLevel,
              tl: {
                hd: removeComments,
                tl: {
                  hd: unwrapEmptyPTag,
                  tl: {
                    hd: filterStyleAttributes(false, merge2),
                    tl: {
                      hd: removeUnwantedInlineStyleElements(merge2, invalidInlineElements),
                      tl: {
                        hd: copyTableWidthToStyle,
                        tl: {
                          hd: filterTableStyles(merge2),
                          tl: {
                            hd: filterRowStyles(merge2),
                            tl: {
                              hd: filterCellAndColStyles(merge2),
                              tl: {
                                hd: removeEmptySpan,
                                tl: {
                                  hd: combineDirAttributes,
                                  tl: (
                                    /* [] */
                                    0
                                  )
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
  function cleanBetweenLists(merge2) {
    return {
      hd: unwrapBorderDivs,
      tl: {
        hd: filterStyleAttributes(true, merge2),
        tl: {
          hd: removeEmptySpan,
          tl: (
            /* [] */
            0
          )
        }
      }
    };
  }
  function siblingElementRules(styles, merge2) {
    return {
      hd: convertMsEquations,
      tl: {
        hd: convertVmlImages,
        tl: {
          hd: processLists(styles, cleanBetweenLists(merge2)),
          tl: (
            /* [] */
            0
          )
        }
      }
    };
  }
  function bodyStylesToDataAttrs(bodyStyles) {
    return filter_map(function(param) {
      if (param._0._0 === "tab-interval") {
        return [
          "data-tab-interval",
          show_value(param._1)
        ];
      }
    }, bodyStyles);
  }
  function importToNodes(injectCharset, mergeOpt, debugOpt, raw, invalidInlineElements) {
    var merge2 = mergeOpt !== void 0 ? mergeOpt : false;
    var debug = debugOpt !== void 0 ? debugOpt : false;
    var nodes = parseString(raw);
    if (debug) {
      console.log("before:" + debugTree(nodes));
    }
    var match = extractDoc(nodes);
    var styleTag = match[0];
    var siblingRules = siblingElementRules(styleTag, merge2);
    var processed = $$process(void 0, genericElementRules, siblingRules, match[1]);
    var body = postprocess(cleanupElementRules(merge2, styleTag, invalidInlineElements), processed);
    var styles = merge2 ? filterStyleTag(styleTag) : (
      /* [] */
      0
    );
    var bodyAttrs = merge2 ? bodyStylesToDataAttrs(match[2]) : (
      /* [] */
      0
    );
    var outputDocument = constructDocument(injectCharset, body, styles, bodyAttrs);
    if (debug) {
      console.log("after:" + debugNode(outputDocument));
    }
    return {
      hd: outputDocument,
      tl: (
        /* [] */
        0
      )
    };
  }
  function $$import(mergeOpt, debugOpt, raw, invalidInlineElements) {
    var merge2 = mergeOpt !== void 0 ? mergeOpt : false;
    var debug = debugOpt !== void 0 ? debugOpt : false;
    var postprocessed = importToNodes(void 0, merge2, debug, raw, invalidInlineElements);
    return serialise(void 0, postprocessed, raw.length);
  }

  // ../../node_modules/rescript/lib/es6/js_types.js
  function classify(x) {
    var ty = typeof x;
    if (ty === "undefined") {
      return "JSUndefined";
    } else if (x === null) {
      return "JSNull";
    } else if (ty === "number") {
      return {
        TAG: "JSNumber",
        _0: x
      };
    } else if (ty === "bigint") {
      return {
        TAG: "JSBigInt",
        _0: x
      };
    } else if (ty === "string") {
      return {
        TAG: "JSString",
        _0: x
      };
    } else if (ty === "boolean") {
      if (x === true) {
        return "JSTrue";
      } else {
        return "JSFalse";
      }
    } else if (ty === "symbol") {
      return {
        TAG: "JSSymbol",
        _0: x
      };
    } else if (ty === "function") {
      return {
        TAG: "JSFunction",
        _0: x
      };
    } else {
      return {
        TAG: "JSObject",
        _0: x
      };
    }
  }

  // lib/es6/src/main/re/api/bs/uaStrings.mjs
  function detect(candidates, userAgent2) {
    var agent = lowercase_ascii3(userAgent2);
    return find_opt(function(candidate) {
      return _1(candidate.search, agent);
    }, candidates);
  }
  function detectBrowser(browsers2, userAgent2) {
    return map4(function(browser) {
      return {
        current: browser.name
      };
    }, detect(browsers2, userAgent2));
  }

  // lib/es6/src/main/re/api/bs/platformInfo.mjs
  var browsers_0 = {
    name: "Edge",
    brand: void 0,
    search: function(uastring) {
      if (contains_substring(uastring, "edge/") && contains_substring(uastring, "chrome") && contains_substring(uastring, "safari")) {
        return contains_substring(uastring, "applewebkit");
      } else {
        return false;
      }
    }
  };
  var browsers_1 = {
    hd: {
      name: "Chromium",
      brand: "Chromium",
      search: function(uastring) {
        if (contains_substring(uastring, "chrome")) {
          return !contains_substring(uastring, "chromeframe");
        } else {
          return false;
        }
      }
    },
    tl: {
      hd: {
        name: "IE",
        brand: void 0,
        search: function(uastring) {
          if (contains_substring(uastring, "msie")) {
            return true;
          } else {
            return contains_substring(uastring, "trident");
          }
        }
      },
      tl: {
        hd: {
          name: "Opera",
          brand: void 0,
          search: function(param) {
            return contains_substring(param, "opera");
          }
        },
        tl: {
          hd: {
            name: "Firefox",
            brand: void 0,
            search: function(param) {
              return contains_substring(param, "firefox");
            }
          },
          tl: {
            hd: {
              name: "Safari",
              brand: void 0,
              search: function(uastring) {
                if (contains_substring(uastring, "safari") || contains_substring(uastring, "mobile/")) {
                  return contains_substring(uastring, "applewebkit");
                } else {
                  return false;
                }
              }
            },
            tl: (
              /* [] */
              0
            )
          }
        }
      }
    }
  };
  var browsers = {
    hd: browsers_0,
    tl: browsers_1
  };
  function browsers$1(param) {
    return browsers;
  }

  // lib/es6/src/main/re/api/bs/browserEnv.mjs
  var userAgent = window.navigator.userAgent;
  function isSafari2(param) {
    return value(false, map4(function(browser) {
      return browser.current === "Safari";
    }, detectBrowser(browsers$1(), userAgent)));
  }

  // lib/es6/src/main/re/api/bs/main.mjs
  var myFilename = "wordimport.js";
  function asFunction(f2) {
    var v = classify(f2);
    if (typeof v !== "object" || v.TAG !== "JSFunction") {
      return;
    } else {
      return some(v._0);
    }
  }
  function isScript(script) {
    var src = script.src;
    if (src === void 0) {
      return false;
    }
    var srcLength = src.length;
    if (srcLength <= 0) {
      return false;
    }
    var beforeQuery = indexOf("?", src);
    var stringEnd = beforeQuery < 0 ? srcLength : beforeQuery;
    return (indexOf(myFilename, src) + myFilename.length | 0) === stringEnd;
  }
  function resolve(path) {
    var _obj = window;
    var _x = to_list(split3(".", path));
    while (true) {
      var x = _x;
      var obj = _obj;
      if (!x) {
        return some(obj);
      }
      var o = obj[x.hd];
      if (o == null) {
        return;
      }
      _x = x.tl;
      _obj = o;
      continue;
    }
    ;
  }
  function resolveOnTag(tag) {
    if (tag === void 0) {
      return;
    }
    var tag$1 = valFromOption(tag);
    var m = tag$1.getAttribute("data-main");
    if (!(m == null)) {
      tag$1.removeAttribute("data-main");
      return bind2(asFunction, resolve(m == null ? void 0 : some(m)));
    }
  }
  var searchForScript = {
    LAZY_DONE: false,
    VAL: function() {
      var scripts = to_list(document.getElementsByTagName("script"));
      return find_map(function(script) {
        if (isScript(script)) {
          return resolveOnTag(some(script));
        }
      }, scripts);
    }
  };
  var wimpFunction = selfOr(searchForScript, resolveOnTag(document.currentScript == null ? void 0 : some(document.currentScript)));
  isSafari.contents = isSafari2();
  var api = {
    cleanDocument: function(str, merge2, invalidInlineElements) {
      return $$import(merge2, void 0, str, invalidInlineElements);
    }
  };
  function exportTinymce(name42, api2) {
    var tinymceResourceApi = resolve("tinymce.Resource.add");
    if (tinymceResourceApi !== void 0) {
      var f2 = asFunction(valFromOption(tinymceResourceApi));
      if (f2 !== void 0) {
        return f2(name42, api2);
      } else {
        console.error("Unable to find Word Import registration API");
        return;
      }
    }
    console.error("Unable to find Word Import registration API");
  }
  if (wimpFunction !== void 0) {
    valFromOption(wimpFunction).call(null, {
      cleanDocument: function(str, merge2, invalidInlineElements) {
        return $$import(merge2, void 0, str, invalidInlineElements);
      }
    });
  } else {
    exportTinymce("ephox.wimp", api);
  }
})();
