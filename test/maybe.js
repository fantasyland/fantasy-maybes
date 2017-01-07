'use strict';

const λ = require('./lib/test');
const {applicative, functor, monad, identity} = λ;
const {Maybe, Identity} = λ;

function run(a) {
    return a.run.x;
}

exports.maybe = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Maybe, identity),
    'Identity (Applicative)': applicative.identity(λ)(Maybe, identity),
    'Composition (Applicative)': applicative.composition(λ)(Maybe, identity),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Maybe, identity),
    'Interchange (Applicative)': applicative.interchange(λ)(Maybe, identity),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Maybe.of, identity),
    'Identity (Functor)': functor.identity(λ)(Maybe.of, identity),
    'Composition (Functor)': functor.composition(λ)(Maybe.of, identity),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Maybe, identity),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Maybe, identity),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Maybe, identity),
    'Associativity (Monad)': monad.associativity(λ)(Maybe, identity),

    // Manual tests
    'when testing Just with concat should return correct value': λ.check(
        (a, b) => {
            const result = Maybe.Just(a).concat(Maybe.Just(b));
            return λ.equals(result)(Maybe.Just(a.concat(b)));
        },
        [String, String]
    ),
    'when testing Nothing with concat should return correct value': λ.check(
        (a) => {
            const result = Maybe.Nothing.concat(Maybe.Just(a));
            return λ.equals(result)(Maybe.Nothing);
        },
        [λ.AnyVal]
    ),

    'when testing traverse with Just should return correct value': λ.check(
        (a) => {
            return a.traverse(function (x) { return Identity.of(x); }, Identity).x.x === a.x;
        },
        [λ.someOf(Number)]
    ),

    'when testing traverse with Nothing should return correct value': λ.check(
        (a) => {
            return a.traverse(function (x) { return Identity.of(x); }, Identity).x === Maybe.Nothing;
        },
        [λ.noneOf()]
    ),

    'when testing Just with orElse should return correct value': λ.check(
        (a, b) => {
            return λ.equals(Maybe.Just(a).orElse(b))(Maybe.Just(a));
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing Nothing with orElse should return correct value': λ.check(
        (a) => {
            return Maybe.Nothing.orElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when testing Just with getOrElse should return correct value': λ.check(
        (a, b) => {
            return Maybe.Just(a).getOrElse(b) === a;
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing Nothing with getOrElse should return correct value': λ.check(
        (a) => {
            return Maybe.Nothing.getOrElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when creating Nothing with value should set value on Nothing': function(test) {
        test.ok(λ.equals(Maybe.Nothing)(Maybe.Nothing));
        test.done();
    },
    'when creating Nothing should be valid maybe': function(test) {
        test.ok(λ.isMaybe(Maybe.Nothing));
        test.done();
    },
    'when creating Nothing and mapping value should map to correct value': function(test) {
        test.ok(λ.equals(Maybe.Nothing.map(λ.error('Failed if called')))(Maybe.Nothing));
        test.done();
    },
    'when creating Nothing and folding should map to correct value': λ.check(
        (a) => {
            const result = Maybe.Nothing.fold(
                    λ.error('Failed if called'),
                    λ.constant(a)
                );
            return result === a;
        },
        [λ.AnyVal]
    ),

    'when creating Just should be Just': λ.check(
        (a) => {
            return Maybe.Just(a).fold(
                    λ.constant(true),
                    λ.constant(false)
                );
        },
        [λ.AnyVal]
    ),
    'when creating Just and folding should map to correct value': λ.check(
        (a) => {
            var result = Maybe.Just(a).fold(
                    identity,
                    λ.error('Failed if called')
                );
            return result === a;
        },
        [λ.AnyVal]
    ),
    'when testing sequence with Just should return correct type': λ.check(
        (a) => {
            return λ.isIdentity(a.sequence());
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Just should return correct nested type': λ.check(
        (a) => {
            return λ.isJust(a.sequence().x);
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Just should return correct value': λ.check(
        (a) => {
            return a.sequence().x.x === a.x.x;
        },
        [λ.someOf(λ.identityOf(Number))]
    )
};

exports.maybeT = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Maybe.MaybeT(Identity), run),
    'Identity (Applicative)': applicative.identity(λ)(Maybe.MaybeT(Identity), run),
    'Composition (Applicative)': applicative.composition(λ)(Maybe.MaybeT(Identity), run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Maybe.MaybeT(Identity), run),
    'Interchange (Applicative)': applicative.interchange(λ)(Maybe.MaybeT(Identity), run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Maybe.MaybeT(Identity).of, run),
    'Identity (Functor)': functor.identity(λ)(Maybe.MaybeT(Identity).of, run),
    'Composition (Functor)': functor.composition(λ)(Maybe.MaybeT(Identity).of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Maybe.MaybeT(Identity), run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Maybe.MaybeT(Identity), run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Maybe.MaybeT(Identity), run),
    'Associativity (Monad)': monad.associativity(λ)(Maybe.MaybeT(Identity), run)
};
