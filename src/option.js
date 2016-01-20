'use strict';

//
//   # Option
//
//       Option a = Some a + None
//
//   The option type encodes the presence and absence of a value. The
//   `Some` constructor represents a value and `None` represents the
//   absence.
//
//   * `ap(s)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `concat(s, plus)` - Semigroup concat
//   * `fold(a, b)` - Applies `a` to value if `Some` or defaults to `b`
//   * `orElse(a)` - Default value for `None`
//   * `getOrElse(a)` - Default value for `None`
//   * `map(f)` - Functor map
//
const {tagged, taggedSum} = require('daggy');
const {constant, identity} = require('fantasy-combinators');
const {of, empty, ap, map, chain, concat, sequence} = require('fantasy-land');

const Option = taggedSum({
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
Option[of] = Option.Some;
Option[empty] = () => Option.None;
Option.prototype.orElse = function(x) {
    return this.fold(
        Option.Some,
        constant(x)
    );
};
Option.prototype.getOrElse = function(x) {
    return this.fold(
        identity,
        constant(x)
    );
};
Option.prototype[chain] = function(f) {
    return this.fold(
        (a) => f(a),
        constant(Option.None)
    );
};
Option.prototype[concat] = function(x) {
    return this[chain]((a) => {
        return x[map]((b) => a[concat](b));
    });
};

// Derived
Option.prototype[map] = function(f) {
    return this[chain]((a) => Option[of](f(a)));
};
Option.prototype[ap] = function(a) {
    return this[chain]((f) => a[map](f));
};

Option.prototype[sequence] = function(p) {
    return this.traverse(identity, p);
};
Option.prototype.traverse = function(f, p) {
    return this.cata({
        Some: (x) => f(x)[map](Option[of]),
        None: () => p[of](Option.None)
    });
};

// Transformer
Option.OptionT = (M) => {
    const OptionT = tagged('run');
    OptionT.prototype.fold = function(f, g) {
        return this.run[chain]((o) => M[of](o.fold(f, g)));
    };
    OptionT[of] = (x) => OptionT(M[of](Option.Some(x)));
    OptionT.prototype.orElse = function(b) {
        return OptionT(this.run[chain]((a) => {
            return a.fold(
                (x) => M[of](a),
                () => b.run
            );
        }));
    };
    OptionT.prototype.getOrElse = function(x) {
        return this.run[chain]((o) => M[of](o.getOrElse(x)));
    };
    OptionT.prototype[chain] = function(f) {
        return OptionT(this.run[chain]((o) => {
            return o.fold(
                (a) => f(a).run,
                () => M[of](Option.None)
            );
        }));
    };
    OptionT.prototype[map] = function(f) {
        return this[chain]((a) => OptionT[of](f(a)));
    };
    OptionT.prototype[ap] = function(a) {
        return this[chain]((f) => a[map](f));
    };
    return OptionT;
};

module.exports = Option;