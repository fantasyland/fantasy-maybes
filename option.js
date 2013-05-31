var daggy = require('daggy'),
    Option = daggy.taggedSum({
        Some: ['x'],
        None: []
    });

// Methods
Option.prototype.fold = function(f, g) {
    return this.cata({
        Some: f,
        None: g
    });
};
Option.of = Option.Some;
Option.prototype.orElse = function(x) {
    return this.fold(
        function(x) {
            return Option.Some(x);
        },
        function() {
            return x;
        }
    );
};
Option.prototype.getOrElse = function(x) {
    return this.fold(
        function(a) {
            return a;
        },
        function() {
            return x;
        }
    );
};
Option.prototype.chain = function(f) {
    return this.fold(
        function(a) {
            return f(a);
        },
        function() {
            return Option.None;
        }
    );
};
Option.prototype.concat = function(x) {
    return this.fold(
        function(a) {
            return x.chain(function(b) {
                return Option.Some(a.concat(b));
            });
        },
        function() {
            return b;
        }
    );
};

// Derived
Option.prototype.map = function(f) {
    return this.chain(function(a) {
        return Option.of(f(a));
    });
};
Option.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};

// Export
if(typeof module != 'undefined')
    module.exports = Option;
