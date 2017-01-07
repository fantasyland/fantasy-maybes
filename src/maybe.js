'use strict';

//
//   # Maybe
//
//       Maybe a = Just a + Nothing
//
//   The maybe type encodes the presence and absence of a value. The
//   `Just` constructor represents a value and `Nothing` represents the
//   absence.
//
//   * `ap(s)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `concat(s, plus)` - Semigroup concat
//   * `fold(a, b)` - Applies `a` to value if `Just` or defaults to `b`
//   * `orElse(a)` - Default value for `Nothing`
//   * `getOrElse(a)` - Default value for `Nothing`
//   * `map(f)` - Functor map
//
const {tagged, taggedSum} = require('daggy');
const {constant, identity} = require('fantasy-combinators');
const {of, empty, ap, map, chain, concat, sequence} = require('fantasy-land');

const Maybe = taggedSum({
        Just: ['x'],
        Nothing: []
    });

// Methods
Maybe.prototype.fold = function(f, g) {
    return this.cata({
        Just: f,
        Nothing: g
    });
};
Maybe[of] = Maybe.Just;
Maybe[empty] = () => Maybe.Nothing;
Maybe.prototype.orElse = function(x) {
    return this.fold(
        Maybe.Just,
        constant(x)
    );
};
Maybe.prototype.getOrElse = function(x) {
    return this.fold(
        identity,
        constant(x)
    );
};
Maybe.prototype[chain] = function(f) {
    return this.fold(
        (a) => f(a),
        constant(Maybe.Nothing)
    );
};
Maybe.prototype[concat] = function(x) {
    return this[chain]((a) => {
        return x[map]((b) => a[concat](b));
    });
};

// Derived
Maybe.prototype[map] = function(f) {
    return this[chain]((a) => Maybe[of](f(a)));
};
Maybe.prototype[ap] = function(a) {
    return this[chain]((f) => a[map](f));
};

Maybe.prototype[sequence] = function(p) {
    return this.traverse(identity, p);
};
Maybe.prototype.traverse = function(f, p) {
    return this.cata({
        Just: (x) => f(x)[map](Maybe[of]),
        Nothing: () => p[of](Maybe.Nothing)
    });
};

// Transformer
Maybe.MaybeT = (M) => {
    const MaybeT = tagged('run');
    MaybeT.prototype.fold = function(f, g) {
        return this.run[chain]((o) => M[of](o.fold(f, g)));
    };
    MaybeT[of] = (x) => MaybeT(M[of](Maybe.Just(x)));
    MaybeT.prototype.orElse = function(b) {
        return MaybeT(this.run[chain]((a) => {
            return a.fold(
                (x) => M[of](a),
                () => b.run
            );
        }));
    };
    MaybeT.prototype.getOrElse = function(x) {
        return this.run[chain]((o) => M[of](o.getOrElse(x)));
    };
    MaybeT.prototype[chain] = function(f) {
        return MaybeT(this.run[chain]((o) => {
            return o.fold(
                (a) => f(a).run,
                () => M[of](Maybe.Nothing)
            );
        }));
    };
    MaybeT.prototype[map] = function(f) {
        return this[chain]((a) => MaybeT[of](f(a)));
    };
    MaybeT.prototype[ap] = function(a) {
        return this[chain]((f) => a[map](f));
    };
    return MaybeT;
};

module.exports = Maybe;
