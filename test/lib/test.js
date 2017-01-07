'use strict';

const λ = require('fantasy-check/src/adapters/nodeunit');
const applicative = require('fantasy-check/src/laws/applicative');
const functor = require('fantasy-check/src/laws/functor');
const monad = require('fantasy-check/src/laws/monad');
    
const daggy = require('daggy');

const {isInstanceOf} = require('fantasy-helpers');
const {constant, identity} = require('fantasy-combinators');

const Identity = require('fantasy-identities');
const Maybe = require('../../fantasy-options');

const isMaybe = isInstanceOf(Maybe);
const isJust = isInstanceOf(Maybe.Just);
const isNothing = (a) => isMaybe(a) && !isJust(a);
const isJustOf = isInstanceOf(someOf);
const isNothingOf = isInstanceOf(noneOf);
const isIdentity = isInstanceOf(Identity);
const isIdentityOf = isInstanceOf(identityOf);

function inc(a) {
    return a + 1;
}
function equals(a) {
    return (b) => {
        return a.fold(
            (x) => b.fold((y) => x === y, constant(false)),
            () => b.fold(constant(false), constant(true))
        );
    };
}
function error(a) {
    return () => {
        throw new Error(a);
    };
}

Identity.prototype.traverse = function(f, p) {
    return p.of(f(this.x));
};

function identityOf(type) {
    const self = this.getInstance(this, identityOf);
    self.type = type;
    return self;
}

function someOf(type) {
    const self = this.getInstance(this, someOf);
    self.type = type;
    return self;
}

function noneOf() {
    return this.getInstance(this, noneOf);
}

const λʹ = λ
    .property('applicative', applicative)
    .property('functor', functor)
    .property('monad', monad)
    .property('equals', equals)
    .property('inc', inc)
    .property('error', error)
    .property('isJust', isJust)
    .property('isNothing', isNothing)
    .property('isMaybe', isMaybe)
    .property('Maybe', Maybe)
    .property('Identity', Identity)
    .property('isIdentity', isIdentity)
    .property('identityOf', identityOf)
    .method('arb', isIdentityOf, function(a, b) {
        return Identity.of(this.arb(a.type, b - 1));
    })
    .property('someOf', someOf)
    .method('arb', isJustOf, function(a, b) {
        return Maybe.of(this.arb(a.type, b - 1));
    })
    .property('noneOf', noneOf)
    .method('arb', isNothingOf, function(a, b) {
        return Maybe.Nothing;
    });


module.exports = λʹ;
