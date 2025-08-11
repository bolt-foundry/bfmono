import {
  __commonJS
} from "./chunk-BUSYA2B4.js";

// ../../node_modules/.deno/loglevel@1.9.2/node_modules/loglevel/lib/loglevel.js
var require_loglevel = __commonJS({
  "../../node_modules/.deno/loglevel@1.9.2/node_modules/loglevel/lib/loglevel.js"(exports, module) {
    (function(root, definition) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define(definition);
      } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
      } else {
        root.log = definition();
      }
    })(exports, function() {
      "use strict";
      var noop = function() {
      };
      var undefinedType = "undefined";
      var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
      var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
      ];
      var _loggersByName = {};
      var defaultLogger = null;
      function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === "function") {
          return method.bind(obj);
        } else {
          try {
            return Function.prototype.bind.call(method, obj);
          } catch (e) {
            return function() {
              return Function.prototype.apply.apply(method, [obj, arguments]);
            };
          }
        }
      }
      function traceForIE() {
        if (console.log) {
          if (console.log.apply) {
            console.log.apply(console, arguments);
          } else {
            Function.prototype.apply.apply(console.log, [console, arguments]);
          }
        }
        if (console.trace) console.trace();
      }
      function realMethod(methodName) {
        if (methodName === "debug") {
          methodName = "log";
        }
        if (typeof console === undefinedType) {
          return false;
        } else if (methodName === "trace" && isIE) {
          return traceForIE;
        } else if (console[methodName] !== void 0) {
          return bindMethod(console, methodName);
        } else if (console.log !== void 0) {
          return bindMethod(console, "log");
        } else {
          return noop;
        }
      }
      function replaceLoggingMethods() {
        var level = this.getLevel();
        for (var i = 0; i < logMethods.length; i++) {
          var methodName = logMethods[i];
          this[methodName] = i < level ? noop : this.methodFactory(methodName, level, this.name);
        }
        this.log = this.debug;
        if (typeof console === undefinedType && level < this.levels.SILENT) {
          return "No console available for logging";
        }
      }
      function enableLoggingWhenConsoleArrives(methodName) {
        return function() {
          if (typeof console !== undefinedType) {
            replaceLoggingMethods.call(this);
            this[methodName].apply(this, arguments);
          }
        };
      }
      function defaultMethodFactory(methodName, _level, _loggerName) {
        return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
      }
      function Logger(name, factory) {
        var self = this;
        var inheritedLevel;
        var defaultLevel;
        var userLevel;
        var storageKey = "loglevel";
        if (typeof name === "string") {
          storageKey += ":" + name;
        } else if (typeof name === "symbol") {
          storageKey = void 0;
        }
        function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || "silent").toUpperCase();
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage[storageKey] = levelName;
            return;
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {
          }
        }
        function getPersistedLevel() {
          var storedLevel;
          if (typeof window === undefinedType || !storageKey) return;
          try {
            storedLevel = window.localStorage[storageKey];
          } catch (ignore) {
          }
          if (typeof storedLevel === undefinedType) {
            try {
              var cookie = window.document.cookie;
              var cookieName = encodeURIComponent(storageKey);
              var location = cookie.indexOf(cookieName + "=");
              if (location !== -1) {
                storedLevel = /^([^;]+)/.exec(
                  cookie.slice(location + cookieName.length + 1)
                )[1];
              }
            } catch (ignore) {
            }
          }
          if (self.levels[storedLevel] === void 0) {
            storedLevel = void 0;
          }
          return storedLevel;
        }
        function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage.removeItem(storageKey);
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {
          }
        }
        function normalizeLevel(input) {
          var level = input;
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== void 0) {
            level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            return level;
          } else {
            throw new TypeError("log.setLevel() called with invalid level: " + input);
          }
        }
        self.name = name;
        self.levels = {
          "TRACE": 0,
          "DEBUG": 1,
          "INFO": 2,
          "WARN": 3,
          "ERROR": 4,
          "SILENT": 5
        };
        self.methodFactory = factory || defaultMethodFactory;
        self.getLevel = function() {
          if (userLevel != null) {
            return userLevel;
          } else if (defaultLevel != null) {
            return defaultLevel;
          } else {
            return inheritedLevel;
          }
        };
        self.setLevel = function(level, persist) {
          userLevel = normalizeLevel(level);
          if (persist !== false) {
            persistLevelIfPossible(userLevel);
          }
          return replaceLoggingMethods.call(self);
        };
        self.setDefaultLevel = function(level) {
          defaultLevel = normalizeLevel(level);
          if (!getPersistedLevel()) {
            self.setLevel(level, false);
          }
        };
        self.resetLevel = function() {
          userLevel = null;
          clearPersistedLevel();
          replaceLoggingMethods.call(self);
        };
        self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
        };
        self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
        };
        self.rebuild = function() {
          if (defaultLogger !== self) {
            inheritedLevel = normalizeLevel(defaultLogger.getLevel());
          }
          replaceLoggingMethods.call(self);
          if (defaultLogger === self) {
            for (var childName in _loggersByName) {
              _loggersByName[childName].rebuild();
            }
          }
        };
        inheritedLevel = normalizeLevel(
          defaultLogger ? defaultLogger.getLevel() : "WARN"
        );
        var initialLevel = getPersistedLevel();
        if (initialLevel != null) {
          userLevel = normalizeLevel(initialLevel);
        }
        replaceLoggingMethods.call(self);
      }
      defaultLogger = new Logger();
      defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }
        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name,
            defaultLogger.methodFactory
          );
        }
        return logger;
      };
      var _log = typeof window !== undefinedType ? window.log : void 0;
      defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType && window.log === defaultLogger) {
          window.log = _log;
        }
        return defaultLogger;
      };
      defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
      };
      defaultLogger["default"] = defaultLogger;
      return defaultLogger;
    });
  }
});
export default require_loglevel();
//# sourceMappingURL=loglevel.js.map
