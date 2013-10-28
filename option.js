var daggy = require('daggy'),
    C = require('fantasy-combinators'),
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
        Option.Some,
        function() {
            return x;
        }
    );
};
Option.prototype.getOrElse = function(x) {
    return this.fold(
        C.identity,
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
    return this.chain(function(a) {
        return x.map(function(b) {
            return a.concat(b);
        });
    });
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

// Transformer
Option.OptionT = function(M) {
    var OptionT = daggy.tagged('run');
    OptionT.prototype.fold = function(f, g) {
        return this.run.chain(function(o) {
            return M.of(o.fold(f, g));
        });
    };
    OptionT.of = function(x) {
        return OptionT(M.of(Option.Some(x)));
    };
    OptionT.prototype.orElse = function(b) {
        return OptionT(this.run.chain(function(a) {
            return a.fold(
                function(x) {
                    return M.of(a);
                },
                function() {
                    return b.run;
                }
            );
        }));
    };
    OptionT.prototype.getOrElse = function(x) {
        return this.run.chain(function(o) {
            return M.of(o.getOrElse(x));
        });
    };
    OptionT.prototype.chain = function(f) {
        var m = this.run;
        return OptionT(m.chain(function(o) {
            return o.fold(
                function(a) {
                    return f(a).run;
                },
                function() {
                    return M.of(Option.None);
                }
            );
        }));
    };
    OptionT.prototype.map = function(f) {
        return this.chain(function(a) {
            return OptionT.of(f(a));
        });
    };
    OptionT.prototype.ap = function(a) {
        return this.chain(function(f) {
            return a.map(f);
        });
    };
    return OptionT;
};

// Export
if(typeof module != 'undefined')
    module.exports = Option;
