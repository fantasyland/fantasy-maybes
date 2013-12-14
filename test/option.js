var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),

    Identity = require('fantasy-identities'),
    Option = require('../fantasy-options'),
    
    constant = combinators.constant,
    identity = combinators.identity,

    equals = function(a) {
        return function(b) {
            return a.fold(
                function(x) {
                    return b.fold(
                        function(y) {
                            return x === y;
                        },
                        constant(false)
                    );
                },
                function() {
                    return b.fold(
                        constant(false),
                        constant(true)
                    );
                });
        };
    },
    error = function(a) {
        return function() {
            throw new Error(a);
        };
    },

    isOption = helpers.isInstanceOf(Option),
    isSome = helpers.isInstanceOf(Option.Some),
    isNone = helpers.isInstanceOf(Option.None),
    isSomeOf = helpers.isInstanceOf(someOf),
    isNoneOf = helpers.isInstanceOf(noneOf),
    isIdentity = helpers.isInstanceOf(Identity),
    isIdentityOf = helpers.isInstanceOf(identityOf);

function run(a) {
    return a.run.x;
}

function identityOf(type) {
    var self = this.getInstance(this, identityOf);
    self.type = type;
    return self;
}

function someOf(type) {
    var self = this.getInstance(this, someOf);
    self.type = type;
    return self;
}

function noneOf() {
    var self = this.getInstance(this, noneOf);
    return self;
}

λ = λ
    .property('identityOf', identityOf)
    .method('arb', isIdentityOf, function(a, b) {
        return Identity.of(this.arb(a.type, b - 1));
    })
    .property('someOf', someOf)
    .method('arb', isSomeOf, function(a, b) {
        return Option.of(this.arb(a.type, b - 1));
    })
    .property('noneOf', noneOf)
    .method('arb', isNoneOf, function(a, b) {
        return Option.None;
    });

exports.option = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Option, identity),
    'Identity (Applicative)': applicative.identity(λ)(Option, identity),
    'Composition (Applicative)': applicative.composition(λ)(Option, identity),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Option, identity),
    'Interchange (Applicative)': applicative.interchange(λ)(Option, identity),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Option.of, identity),
    'Identity (Functor)': functor.identity(λ)(Option.of, identity),
    'Composition (Functor)': functor.composition(λ)(Option.of, identity),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Option, identity),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Option, identity),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Option, identity),
    'Associativity (Monad)': monad.associativity(λ)(Option, identity),

    // Manual tests
    'when testing Some with concat should return correct value': λ.check(
        function(a, b) {
            var result = Option.Some(a).concat(Option.Some(b));
            return equals(result)(Option.Some(a.concat(b)));
        },
        [String, String]
    ),
    'when testing None with concat should return correct value': λ.check(
        function(a) {
            var result = Option.None.concat(Option.Some(a));
            return equals(result)(Option.None);
        },
        [λ.AnyVal]
    ),

    'when testing traverse with Some should return correct value': λ.check(
        function(a) {
            return a.traverse(identity, Identity).x === a.x;
        },
        [λ.someOf(Number)]
    ),

    'when testing traverse with None should return correct value': λ.check(
        function(a) {
            return a.traverse(identity, Identity).x === Option.None;
        },
        [λ.noneOf()]
    ),
    'when testing sequence with None should throw error': λ.check(
        function(a) {
            var msg = '';
            try {
                a.sequence();
            } catch(e) {
                msg = e.message;
            }
            return msg === 'Unable to sequence on None';
        },
        [λ.noneOf()]
    ),

    'when testing Some with orElse should return correct value': λ.check(
        function(a, b) {
            return equals(Option.Some(a).orElse(b))(Option.Some(a));
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing None with orElse should return correct value': λ.check(
        function(a) {
            return Option.None.orElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when testing Some with getOrElse should return correct value': λ.check(
        function(a, b) {
            return Option.Some(a).getOrElse(b) === a;
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing None with getOrElse should return correct value': λ.check(
        function(a) {
            return Option.None.getOrElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when creating None with value should set value on None': function(test) {
        test.ok(equals(Option.None)(Option.None));
        test.done();
    },
    'when creating None should be valid option': function(test) {
        test.ok(isOption(Option.None));
        test.done();
    },
    'when creating None and mapping value should map to correct value': function(test) {
        test.ok(equals(Option.None.map(error('Failed if called')))(Option.None));
        test.done();
    },
    'when creating None and folding should map to correct value': λ.check(
        function(a) {
            var result = Option.None.fold(
                    error('Failed if called'),
                    constant(a)
                );
            return result === a;
        },
        [λ.AnyVal]
    ),

    'when creating Some should be Some': λ.check(
        function(a) {
            return Option.Some(a).fold(
                    constant(true),
                    constant(false)
                );
        },
        [λ.AnyVal]
    ),
    'when creating Some and folding should map to correct value': λ.check(
        function(a) {
            var result = Option.Some(a).fold(
                    identity,
                    error('Failed if called')
                );
            return result === a;
        },
        [λ.AnyVal]
    )

    /*
    
    // Uncomment when fantasy-identites version 0.0.2 has been pushed to npm

    'when testing sequence with Some should return correct type': λ.check(
        function(a) {
            return isIdentity(a.sequence());
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Some should return correct nested type': λ.check(
        function(a) {
            return isSome(a.sequence().x);
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Some should return correct value': λ.check(
        function(a) {
            return a.sequence().x.x === a.x.x;
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    */
};

exports.optionT = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Option.OptionT(Identity), run),
    'Identity (Applicative)': applicative.identity(λ)(Option.OptionT(Identity), run),
    'Composition (Applicative)': applicative.composition(λ)(Option.OptionT(Identity), run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Option.OptionT(Identity), run),
    'Interchange (Applicative)': applicative.interchange(λ)(Option.OptionT(Identity), run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Option.OptionT(Identity).of, run),
    'Identity (Functor)': functor.identity(λ)(Option.OptionT(Identity).of, run),
    'Composition (Functor)': functor.composition(λ)(Option.OptionT(Identity).of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Option.OptionT(Identity), run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Option.OptionT(Identity), run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Option.OptionT(Identity), run),
    'Associativity (Monad)': monad.associativity(λ)(Option.OptionT(Identity), run)
};
