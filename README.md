# Fantasy Options

![](https://raw.github.com/puffnfresh/fantasy-land/master/logo.png)

## General

The option type encodes the presence and absence of a value. The
`Some` constructor represents a value and `None` represents the
absence.

## Testing

### Library

Fantasy Options uses [nodeunit](https://github.com/caolan/nodeunit) for 
all the tests and because of this there is currently an existing 
[adapter](test/lib/test.js) in the library to help with integration 
between nodeunit and Fantasy Check.

### Coverage

Currently Fantasy Check is using [Istanbul](https://github.com/gotwarlost/istanbul) 
for code coverage analysis; you can run the coverage via the following
command:

_This assumes that you have istanbul installed correctly._

```
istanbul cover nodeunit -- test/*.js
```
