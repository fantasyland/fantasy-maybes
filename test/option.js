'use strict';

const λ = require('./lib/test');
const {applicative, functor, monad, identity} = λ;
const {Option, Identity} = λ;

function run(a) {
    return a.run.x;
}

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
        (a, b) => {
            const result = Option.Some(a).concat(Option.Some(b));
            return λ.equals(result)(Option.Some(a.concat(b)));
        },
        [String, String]
    ),
    'when testing None with concat should return correct value': λ.check(
        (a) => {
            const result = Option.None.concat(Option.Some(a));
            return λ.equals(result)(Option.None);
        },
        [λ.AnyVal]
    ),

    'when testing traverse with Some should return correct value': λ.check(
        (a) => {
            return a.traverse(function (x) { return Identity.of(x); }, Identity).x.x === a.x;
        },
        [λ.someOf(Number)]
    ),

    'when testing traverse with None should return correct value': λ.check(
        (a) => {
            return a.traverse(function (x) { return Identity.of(x); }, Identity).x === Option.None;
        },
        [λ.noneOf()]
    ),

    'when testing Some with orElse should return correct value': λ.check(
        (a, b) => {
            return λ.equals(Option.Some(a).orElse(b))(Option.Some(a));
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing None with orElse should return correct value': λ.check(
        (a) => {
            return Option.None.orElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when testing Some with getOrElse should return correct value': λ.check(
        (a, b) => {
            return Option.Some(a).getOrElse(b) === a;
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when testing None with getOrElse should return correct value': λ.check(
        (a) => {
            return Option.None.getOrElse(a) === a;
        },
        [λ.AnyVal]
    ),

    'when creating None with value should set value on None': function(test) {
        test.ok(λ.equals(Option.None)(Option.None));
        test.done();
    },
    'when creating None should be valid option': function(test) {
        test.ok(λ.isOption(Option.None));
        test.done();
    },
    'when creating None and mapping value should map to correct value': function(test) {
        test.ok(λ.equals(Option.None.map(λ.error('Failed if called')))(Option.None));
        test.done();
    },
    'when creating None and folding should map to correct value': λ.check(
        (a) => {
            const result = Option.None.fold(
                    λ.error('Failed if called'),
                    λ.constant(a)
                );
            return result === a;
        },
        [λ.AnyVal]
    ),

    'when creating Some should be Some': λ.check(
        (a) => {
            return Option.Some(a).fold(
                    λ.constant(true),
                    λ.constant(false)
                );
        },
        [λ.AnyVal]
    ),
    'when creating Some and folding should map to correct value': λ.check(
        (a) => {
            var result = Option.Some(a).fold(
                    identity,
                    λ.error('Failed if called')
                );
            return result === a;
        },
        [λ.AnyVal]
    ),
    'when testing sequence with Some should return correct type': λ.check(
        (a) => {
            return λ.isIdentity(a.sequence());
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Some should return correct nested type': λ.check(
        (a) => {
            return λ.isSome(a.sequence().x);
        },
        [λ.someOf(λ.identityOf(Number))]
    ),
    'when testing sequence with Some should return correct value': λ.check(
        (a) => {
            return a.sequence().x.x === a.x.x;
        },
        [λ.someOf(λ.identityOf(Number))]
    )
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
