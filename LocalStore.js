var self;
self = LocalStore = {
    keys: {},
    deps: {},
    _useChromeStorage: typeof chrome !== 'undefined' && chrome.storage,

    /**
     Creates at least ones a `Tracker.Dependency` object to a key.

     @method _ensureDeps
     @private
     @param {String} key     the name of the key to add a dependecy tracker to
     @return undefined
     **/
    _ensureDeps: function (key) {
        if (!self.deps[key]) {
            self.deps[key] = new Tracker.Dependency();
        }
    },

    set: function (key, value, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }

        self._ensureDeps(key);

        function afterUpdate() {
            // re-run reactive functions
            if (!options || options.reactive !== false) {
                self.deps[key].changed();
            }
            callback && callback();
        }

        if (self._useChromeStorage) {
            var item = {};
            item[key] = value;
            if (value === undefined) {
                chrome.storage.local.remove(item, afterUpdate);
            } else {
                chrome.storage.local.set(item, afterUpdate);
            }
        } else {
            // stringify if necessary
            if (_.isObject(value)) {
                value = EJSON.stringify(value);
            }

            if (value === undefined) {
                localStorage.removeItem(key);
            } else {
                try {
                    localStorage.setItem(key, value);
                } catch (e) {
                    console.log('WARNING: not able to store value for [' + key + ']:', e);
                    throw e;
                }
            }

            afterUpdate();
        }
    },
    unset: function (key, options, callback) {
        return self.set(key, undefined, options, callback);
    },
    get: function (key, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }

        self._ensureDeps(key);

        // DEPEND REACTIVE FUNCTIONS
        if (!options || options.reactive !== false) {
            self.deps[key].depend();
        }

        if (self._useChromeStorage) {
            chrome.storage.local.get(key, callback);
        } else {
            var value = localStorage.getItem(key);

            // try to parse
            if (value && _.isString(value)) {
                try {
                    value = EJSON.parse(value);
                } catch (e) {
                    // ignore
                }
            }
            // schedule callback just as if this were an actual async operation
            callback && Meteor.defer(function () {
                callback(value);
            });
            return value;
        }
    }
};
