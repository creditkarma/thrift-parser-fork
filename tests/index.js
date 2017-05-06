'use strict';

let expect = require('expect');

let thriftParser = require('../');

describe('thriftParser', function() {

  describe('namespace', function() {

    it('parses a basic namespace', function(done) {
      const content = `
        namespace js test
      `;

      const expected = {
        namespace: {
          js: {
            serviceName: 'test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses the * scope', function(done) {
      const content = `
        namespace * test
      `;

      const expected = {
        namespace: {
          '*': {
            serviceName: 'test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a dot.separated scope', function(done) {
      const content = `
        namespace js.noexist test
      `;

      const expected = {
        namespace: {
          'js.noexist': {
            serviceName: 'test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a dot.separated namespace (Identifier)', function(done) {
      const content = `
        namespace js test.sub
      `;

      const expected = {
        namespace: {
          js: {
            serviceName: 'test.sub'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a namespace that starts with `_` (Identifier)', function(done) {
      const content = `
        namespace js _test
      `;

      const expected = {
        namespace: {
          js: {
            serviceName: '_test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a namespace containing `_` (Identifier)', function(done) {
      const content = `
        namespace js test_sub
      `;

      const expected = {
        namespace: {
          js: {
            serviceName: 'test_sub'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a namespace containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        namespace js test.sub_123
      `;

      const expected = {
        namespace: {
          js: {
            serviceName: 'test.sub_123'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });
  });

  describe('include', function() {

    it('parses a basic include', function(done) {
      const content = `
         include "test"
      `;

      const expected = {
        include: {
          test: {
            path: 'test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('drops .thrift extension for key', function(done) {
      const content = `
         include "test.thrift"
      `;

      const expected = {
        include: {
          test: {
            path: 'test.thrift'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses paths wrapped in single-quotes', function(done) {
      const content = `
         include 'test'
      `;

      const expected = {
        include: {
          test: {
            path: 'test'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse paths wrapped in mixed-quotes (Literal)', function(done) {
      const content = `
         include 'test"
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a double-quote inside a single-quoted value (Literal)', function(done) {
      const content = `
         include 'te"st'
      `;

      const expected = {
        include: {
          'te"st': {
            path: 'te"st'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a single-quote inside a double-quoted value (Literal)', function(done) {
      const content = `
         include "te'st"
      `;

      const expected = {
        include: {
          "te'st": {
            path: "te'st"
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });
  });

  describe('typedef', function() {

    it('parses a simple typedef', function(done) {
      const content = `
        typedef string Test
      `;

      const expected = {
        typedef: {
          Test: {
            type: 'string'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a typedef of another typedef type', function(done) {
      const content = `
        typedef string Json
        typedef Json Test
      `;

      const expected = {
        typedef: {
          Json: {
            type: 'string'
          },
          Test: {
            type: 'Json'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a typedef that ends in `,` (ListSeparator)', function(done) {
      const content = `
        typedef string Test,
      `;

      const expected = {
        typedef: {
          Test: {
            type: 'string'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a typedef that ends in `;` (ListSeparator)', function(done) {
      const content = `
        typedef string Test;
      `;

      const expected = {
        typedef: {
          Test: {
            type: 'string'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a Map typedef', function(done) {
      const content = `
        typedef map<string, string> Test;
      `;

      const expected = {
        typedef: {
          Test: {
            type: {
              name: 'map',
              keyType: 'string',
              valueType: 'string'
            }
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid Map typedef', function(done) {
      const content = `
        typedef map<string> Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an unclosed Map typedef', function(done) {
      const content = `
        typedef map<string, string Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a Set typedef', function(done) {
      const content = `
        typedef set<string> Test;
      `;

      const expected = {
        typedef: {
          Test: {
            type: {
              name: 'set',
              valueType: 'string'
            }
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid Set typedef', function(done) {
      const content = `
        typedef set<string, string> Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an unclosed Set typedef', function(done) {
      const content = `
        typedef set<string Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a List typedef', function(done) {
      const content = `
        typedef list<string> Test;
      `;

      const expected = {
        typedef: {
          Test: {
            type: {
              name: 'list',
              valueType: 'string'
            }
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid List typedef', function(done) {
      const content = `
        typedef list<string, string> Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an unclosed List typedef', function(done) {
      const content = `
        typedef list<string Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses nested Lists/Maps/Sets in typedef', function(done) {
      const content = `
        typedef list<set<map<string, string>>> Test;
      `;

      const expected = {
        typedef: {
          Test: {
            type: {
              name: 'list',
              valueType: {
                name: 'set',
                valueType: {
                  name: 'map',
                  keyType: 'string',
                  valueType: 'string'
                }
              }
            }
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse unclosed nested Lists/Maps/Sets in typedef', function(done) {
      const content = `
        typedef list<set<map<string, string>> Test;
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });
  });

  describe('const', function() {

    it('parses a simple const', function(done) {
      const content = `
        const string test = 'hello world'
      `;

      const expected = {
        const: {
          test: {
            type: 'string',
            value: 'hello world'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a const without assignment', function(done) {
      const content = `
        const string test
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a const as a number for number types', function(done) {
      const content = `
        const i32 test = 123
      `;

      const expected = {
        const: {
          test: {
            type: 'i32',
            value: 123
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const with a hex value as a number', function(done) {
      const content = `
        const i16 testSmall = 0x7fff
        const i32 testLarge = 0x7fffffff
      `;

      const expected = {
        const: {
          testSmall: {
            type: 'i16',
            value: 32767
          },
          testLarge: {
            type: 'i32',
            value: 2147483647
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const with an e-notation value as a number', function(done) {
      const content = `
        const i16 testSmall = -3e4
        const i32 testLarge = 2.147483647e9
      `;

      const expected = {
        const: {
          testSmall: {
            type: 'i16',
            value: -30000
          },
          testLarge: {
            type: 'i32',
            value: 2147483647
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const as a boolean for boolean types', function(done) {
      const content = `
        const bool testTrue = true
        const bool testFalse = false
      `;

      const expected = {
        const: {
          testTrue: {
            type: 'bool',
            value: true
          },
          testFalse: {
            type: 'bool',
            value: false
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const that ends in `,` (ListSeparator)', function(done) {
      const content = `
        const string test = 'hello world',
      `;

      const expected = {
        const: {
          test: {
            type: 'string',
            value: 'hello world'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const that ends in `;` (ListSeparator)', function(done) {
      const content = `
        const string test = 'hello world';
      `;

      const expected = {
        const: {
          test: {
            type: 'string',
            value: 'hello world'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const with a value wrapped in double-quotes', function(done) {
      const content = `
        const string test = "hello world"
      `;

      const expected = {
        const: {
          test: {
            type: 'string',
            value: 'hello world'
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a const with a value wrapped in mixed-quotes', function(done) {
      const content = `
        const string test = "hello world'
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a const as an array of objects for Map types', function(done) {
      const content = `
        const map<i32, string> test = { 1: 'a', 2: 'b', 3: 'c' }
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'map',
              keyType: 'i32',
              valueType: 'string'
            },
            value: [
              {
                key: 1,
                value: 'a'
              },
              {
                key: 2,
                value: 'b'
              },
              {
                key: 3,
                value: 'c'
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const for Map type with `;` separator (ListSeparator)', function(done) {
      const content = `
        const map<i32, string> test = { 1: 'a'; 2: 'b'; 3: 'c' }
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'map',
              keyType: 'i32',
              valueType: 'string'
            },
            value: [
              {
                key: 1,
                value: 'a'
              },
              {
                key: 2,
                value: 'b'
              },
              {
                key: 3,
                value: 'c'
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid Map type', function(done) {
      const content = `
        const map<i32> test = { 1: 'a', 2: 'b', 3: 'c' }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an invalid Map value', function(done) {
      const content = `
        const map<i32, string> test = [ 1, 2, 3]
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a const as an array for Set types', function(done) {
      const content = `
        const set<i32> test = [ 1, 2, 3 ]
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'set',
              valueType: 'i32'
            },
            value: [1, 2, 3]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const for Set type with `;` separator (ListSeparator)', function(done) {
      const content = `
        const set<i32> test = [ 1; 2; 3 ]
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'set',
              valueType: 'i32'
            },
            value: [1, 2, 3]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid Set type', function(done) {
      const content = `
        const set<i32, string> test = [ 1, 2, 3 ]
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an invalid Set values', function(done) {
      const content = `
        const set<i32> test = { 1: 'a', 2: 'b', 3: 'c' }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a const as an array for List types', function(done) {
      const content = `
        const list<i32> test = [ 1, 2, 3 ]
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'list',
              valueType: 'i32'
            },
            value: [1, 2, 3]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a const for List type with `;` separator (ListSeparator)', function(done) {
      const content = `
        const list<i32> test = [ 1; 2; 3 ]
      `;

      const expected = {
        const: {
          test: {
            type: {
              name: 'list',
              valueType: 'i32'
            },
            value: [1, 2, 3]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an invalid List type', function(done) {
      const content = `
        const list<i32, string> test = [ 1, 2, 3 ]
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an invalid List values', function(done) {
      const content = `
        const list<i32> test = { 1: 'a', 2: 'b', 3: 'c' }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });
  });

  describe('enum', function() {

    it('parses a simple enum', function(done) {
      const content = `
        enum Test {
          test = 1
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with multiple values', function(done) {
      const content = `
        enum Test {
          test1 = 1
          test2 = 2
          test3 = 3
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              },
              {
                name: 'test2',
                value: 2
              },
              {
                name: 'test3',
                value: 3
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum without values', function(done) {
      const content = `
        enum Test {
          test1
          test2
          test3
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1'
              },
              {
                name: 'test2'
              },
              {
                name: 'test3'
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with mixed values', function(done) {
      const content = `
        enum Test {
          test1 = 1
          test2
          test3 = 3
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              },
              {
                name: 'test2'
              },
              {
                name: 'test3',
                value: 3
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with hex value assigmnet', function(done) {
      const content = `
        enum Test {
          test1 = 0x01
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values that end in `,` (ListSeparator)', function(done) {
      const content = `
        enum Test {
          test1 = 1,
          test2 = 2,
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              },
              {
                name: 'test2',
                value: 2
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values that end in `;` (ListSeparator)', function(done) {
      const content = `
        enum Test {
          test1 = 1;
          test2 = 2;
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              },
              {
                name: 'test2',
                value: 2
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values that end in `;` and `,` (ListSeparator)', function(done) {
      const content = `
        enum Test {
          test1 = 1,
          test2 = 2;
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test1',
                value: 1
              },
              {
                name: 'test2',
                value: 2
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum that starts with `_` (Identifier)', function(done) {
      const content = `
        enum _Test {
          test1 = 1
        }
      `;

      const expected = {
        enum: {
          _Test: {
            items: [
              {
                name: 'test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum containing `_` (Identifier)', function(done) {
      const content = `
        enum Te_st {
          test1 = 1
        }
      `;

      const expected = {
        enum: {
          Te_st: {
            items: [
              {
                name: 'test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum containing `.` (Identifier)', function(done) {
      const content = `
        enum Te.st {
          test1 = 1
        }
      `;

      const expected = {
        enum: {
          'Te.st': {
            items: [
              {
                name: 'test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        enum Te.st_123 {
          test1 = 1
        }
      `;

      const expected = {
        enum: {
          'Te.st_123': {
            items: [
              {
                name: 'test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values that starts with `_` (Identifier)', function(done) {
      const content = `
        enum Test {
          _test1 = 1
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: '_test1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values containing `_` (Identifier)', function(done) {
      const content = `
        enum Test {
          test_1 = 1
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test_1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values containing `.` (Identifier)', function(done) {
      const content = `
        enum Test {
          test.1 = 1
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'test.1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses an enum with values containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        enum Test {
          te.st_1 = 1
        }
      `;

      const expected = {
        enum: {
          Test: {
            items: [
              {
                name: 'te.st_1',
                value: 1
              }
            ]
          }
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse an enum with invalid value assignment', function(done) {
      const content = `
        enum Test {
          test1 =
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an enum with a string value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 'test'
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an enum with a decimal value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 1.2
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an enum with an e-notation value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 1e2
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an enum with a Map value assignment', function(done) {
      const content = `
        enum Test {
          test1 = {'test':'test'}
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse an enum with a Set/List value assignment', function(done) {
      const content = `
        enum Test {
          test1 = [1,2,3]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });
  });

  describe('struct', function() {

    it('parses simple struct', function(done) {
      const content = `
        struct Test {
          1: i16 test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with a required field', function(done) {
      const content = `
        struct Test {
          1: required i16 test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with an optional field', function(done) {
      const content = `
        struct Test {
          1: optional i16 test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with mixed option fields', function(done) {
      const content = `
        struct Test {
          1: required i16 test1
          2: i16 test2
          3: optional i16 test3
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            },
            {
              id: 3,
              type: 'i16',
              name: 'test3',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses custom types in struct field', function(done) {
      const content = `
        struct Test {
          1: TestType test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'TestType',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with default values', function(done) {
      const content = `
        struct Test {
          1: string test1 = 'test'
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with mixed default/no-default values', function(done) {
      const content = `
        struct Test {
          1: string test1 = 'test'
          2: i16 test2
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing a field with a hex FieldID', function(done) {
      const content = `
        struct Test {
          0x01: string test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing a field with a negative FieldID', function(done) {
      const content = `
        struct Test {
          -1: string test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: -1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing a field with a positive FieldID with `+`', function(done) {
      const content = `
        struct Test {
          +1: string test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing a field without a FieldID', function(done) {
      const content = `
        struct Test {
          string test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing a field without a FieldID but with required', function(done) {
      const content = `
        struct Test {
          required string test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              type: 'string',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing mixed fields with/without a FieldID', function(done) {
      const content = `
        struct Test {
          string test1
          2: string test2
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with values that end in `,` (ListSeparator)', function(done) {
      const content = `
        struct Test {
          1: string test1,
          2: string test2 = 'test',
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with values that end in `;` (ListSeparator)', function(done) {
      const content = `
        struct Test {
          1: string test1;
          2: string test2 = 'test';
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with values that end in `;` and `,` (ListSeparator)', function(done) {
      const content = `
        struct Test {
          1: string test1,
          2: string test2 = 'test';
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a struct containing a field without a type', function(done) {
      const content = `
        struct Test {
          1: test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with required & without a type', function(done) {
      const content = `
        struct Test {
          1: required test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with default & without a type', function(done) {
      const content = `
        struct Test {
          1: test = 'test'
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with invalid default', function(done) {
      const content = `
        struct Test {
          1: string test = 'test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with default containing mixed quotes', function(done) {
      const content = `
        struct Test {
          1: string test = 'test"
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with string FieldID', function(done) {
      const content = `
        struct Test {
          test: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with e-notation FieldID', function(done) {
      const content = `
        struct Test {
          1e2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with decimal FieldID', function(done) {
      const content = `
        struct Test {
          1.2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with invalid option', function(done) {
      const content = `
        struct Test {
          1: failure string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a struct containing a field with a Map type', function(done) {
      const content = `
        struct Test {
          1: map<i16, string> test = { 1: 'a', 2: 'b' }
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: {
                name: 'map',
                keyType: 'i16',
                valueType: 'string'
              },
              name: 'test',
              defaultValue: [
                {
                  key: 1,
                  value: 'a'
                },
                {
                  key: 2,
                  value: 'b'
                }
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a struct containing a field with an invalid Map type', function(done) {
      const content = `
        struct Test {
          1: map<i16> test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with a Map type but invalid default', function(done) {
      const content = `
        struct Test {
          1: map<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a struct containing a field with a Set type', function(done) {
      const content = `
        struct Test {
          1: set<i16> test = [1,2]
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: {
                name: 'set',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a struct containing a field with an invalid Set type', function(done) {
      const content = `
        struct Test {
          1: set<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with a Set type but invalid default', function(done) {
      const content = `
        struct Test {
          1: set<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a struct containing a field with a List type', function(done) {
      const content = `
        struct Test {
          1: list<i16> test = [1,2]
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: {
                name: 'list',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a struct containing a field with an invalid List type', function(done) {
      const content = `
        struct Test {
          1: list<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with a List type but invalid default', function(done) {
      const content = `
        struct Test {
          1: list<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a struct containing a field with an invalid default assignment', function(done) {
      const content = `
        struct Test {
          1: string test =
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a struct that starts with `_` (Identifier)', function(done) {
      const content = `
        struct _Test {
          1: string test1
        }
      `;

      const expected = {
        struct: {
          _Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing `_` (Identifier)', function(done) {
      const content = `
        struct Te_st {
          1: string test1
        }
      `;

      const expected = {
        struct: {
          Te_st: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing `.` (Identifier)', function(done) {
      const content = `
        struct Te.st {
          1: string test1
        }
      `;

      const expected = {
        struct: {
          'Te.st': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        struct Te.st_123 {
          1: string test1
        }
      `;

      const expected = {
        struct: {
          'Te.st_123': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with a field that starts with `_` (Identifier)', function(done) {
      const content = `
        struct Test {
          1: string _test1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: '_test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with a field containing `_` (Identifier)', function(done) {
      const content = `
        struct Test {
          1: string test_1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with a field containing `.` (Identifier)', function(done) {
      const content = `
        struct Test {
          1: string test.1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test.1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a struct with a field containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        struct Test {
          1: string te.st_1
        }
      `;

      const expected = {
        struct: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'te.st_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });
  });

  // TODO: Need to fix union
  describe.skip('union', function() {

    it('parses simple union', function(done) {
      const content = `
        union Test {
          1: i16 test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with a required field', function(done) {
      const content = `
        union Test {
          1: required i16 test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with an optional field', function(done) {
      const content = `
        union Test {
          1: optional i16 test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with mixed option fields', function(done) {
      const content = `
        union Test {
          1: required i16 test1
          2: i16 test2
          3: optional i16 test3
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            },
            {
              id: 3,
              type: 'i16',
              name: 'test3',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses custom types in union field', function(done) {
      const content = `
        union Test {
          1: TestType test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'TestType',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with default values', function(done) {
      const content = `
        union Test {
          1: string test1 = 'test'
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with mixed default/no-default values', function(done) {
      const content = `
        union Test {
          1: string test1 = 'test'
          2: i16 test2
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a union containing a field with a hex FieldID', function(done) {
      const content = `
        union Test {
          0x01: string test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union containing a field with a negative FieldID', function(done) {
      const content = `
        union Test {
          -1: string test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: -1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a union containing a field with a positive FieldID with `+`', function(done) {
      const content = `
        union Test {
          +1: string test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: -1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    // TODO: Remove undefined field in output
    it.skip('parses a union containing a field without a FieldID', function(done) {
      const content = `
        union Test {
          string test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a union containing a field without a FieldID but with required', function(done) {
      const content = `
        union Test {
          required string test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              type: 'string',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a union containing mixed fields with/without a FieldID', function(done) {
      const content = `
        union Test {
          string test1
          2: string test2
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with values that end in `,` (ListSeparator)', function(done) {
      const content = `
        union Test {
          1: string test1,
          2: string test2 = 'test',
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with values that end in `;` (ListSeparator)', function(done) {
      const content = `
        union Test {
          1: string test1;
          2: string test2 = 'test';
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with values that end in `;` and `,` (ListSeparator)', function(done) {
      const content = `
        union Test {
          1: string test1,
          2: string test2 = 'test';
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a union containing a field without a type', function(done) {
      const content = `
        union Test {
          1: test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with required & without a type', function(done) {
      const content = `
        union Test {
          1: required test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with default & without a type', function(done) {
      const content = `
        union Test {
          1: test = 'test'
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    // TODO: OOMs the VM
    it.skip('does not parse a union containing a field with invalid default', function(done) {
      const content = `
        union Test {
          1: string test = 'test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    // TODO: OOMs the VM
    it.skip('does not parse a union containing a field with default containing mixed quotes', function(done) {
      const content = `
        union Test {
          1: string test = 'test"
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with string FieldID', function(done) {
      const content = `
        union Test {
          test: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with e-notation FieldID', function(done) {
      const content = `
        union Test {
          1e2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a union containing a field with decimal FieldID', function(done) {
      const content = `
        union Test {
          1.2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with invalid option', function(done) {
      const content = `
        union Test {
          1: failure string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a union containing a field with a Map type', function(done) {
      const content = `
        union Test {
          1: map<i16, string> test = { 1: 'a', 2: 'b' }
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: {
                name: 'map',
                keyType: 'i16',
                valueType: 'string'
              },
              name: 'test',
              defaultValue: [
                {
                  key: 1,
                  value: 'a'
                },
                {
                  key: 2,
                  value: 'b'
                }
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a union containing a field with an invalid Map type', function(done) {
      const content = `
        union Test {
          1: map<i16> test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a union containing a field with a Map type but invalid default', function(done) {
      const content = `
        union Test {
          1: map<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a union containing a field with a Set type', function(done) {
      const content = `
        union Test {
          1: set<i16> test = [1,2]
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: {
                name: 'set',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a union containing a field with an invalid Set type', function(done) {
      const content = `
        union Test {
          1: set<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a union containing a field with a Set type but invalid default', function(done) {
      const content = `
        union Test {
          1: set<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a union containing a field with a List type', function(done) {
      const content = `
        union Test {
          1: list<i16> test = [1,2]
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: {
                name: 'list',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a union containing a field with an invalid List type', function(done) {
      const content = `
        union Test {
          1: list<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a union containing a field with a List type but invalid default', function(done) {
      const content = `
        union Test {
          1: list<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a union containing a field with an invalid default assignment', function(done) {
      const content = `
        union Test {
          1: string test =
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a union that starts with `_` (Identifier)', function(done) {
      const content = `
        union _Test {
          1: string test1
        }
      `;

      const expected = {
        union: {
          _Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union containing `_` (Identifier)', function(done) {
      const content = `
        union Te_st {
          1: string test1
        }
      `;

      const expected = {
        union: {
          Te_st: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union containing `.` (Identifier)', function(done) {
      const content = `
        union Te.st {
          1: string test1
        }
      `;

      const expected = {
        union: {
          'Te.st': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        union Te.st_123 {
          1: string test1
        }
      `;

      const expected = {
        union: {
          'Te.st_123': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with a field that starts with `_` (Identifier)', function(done) {
      const content = `
        union Test {
          1: string _test1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: '_test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with a field containing `_` (Identifier)', function(done) {
      const content = `
        union Test {
          1: string test_1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with a field containing `.` (Identifier)', function(done) {
      const content = `
        union Test {
          1: string test.1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test.1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a union with a field containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        union Test {
          1: string te.st_1
        }
      `;

      const expected = {
        union: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'te.st_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });
  });

  describe('exception', function() {

    it('parses simple exception', function(done) {
      const content = `
        exception Test {
          1: i16 test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with a required field', function(done) {
      const content = `
        exception Test {
          1: required i16 test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with an optional field', function(done) {
      const content = `
        exception Test {
          1: optional i16 test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with mixed option fields', function(done) {
      const content = `
        exception Test {
          1: required i16 test1
          2: i16 test2
          3: optional i16 test3
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'i16',
              name: 'test1',
              option: 'required'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            },
            {
              id: 3,
              type: 'i16',
              name: 'test3',
              option: 'optional'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses custom types in exception field', function(done) {
      const content = `
        exception Test {
          1: TestType test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'TestType',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with default values', function(done) {
      const content = `
        exception Test {
          1: string test1 = 'test'
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with mixed default/no-default values', function(done) {
      const content = `
        exception Test {
          1: string test1 = 'test'
          2: i16 test2
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1',
              defaultValue: 'test'
            },
            {
              id: 2,
              type: 'i16',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a exception containing a field with a hex FieldID', function(done) {
      const content = `
        exception Test {
          0x01: string test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception containing a field with a negative FieldID', function(done) {
      const content = `
        exception Test {
          -1: string test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: -1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a exception containing a field with a positive FieldID with `+`', function(done) {
      const content = `
        exception Test {
          +1: string test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: -1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    // TODO: Remove undefined field in output
    it.skip('parses a exception containing a field without a FieldID', function(done) {
      const content = `
        exception Test {
          string test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a exception containing a field without a FieldID but with required', function(done) {
      const content = `
        exception Test {
          required string test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              type: 'string',
              name: 'test1',
              option: 'required'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('parses a exception containing mixed fields with/without a FieldID', function(done) {
      const content = `
        exception Test {
          string test1
          2: string test2
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with values that end in `,` (ListSeparator)', function(done) {
      const content = `
        exception Test {
          1: string test1,
          2: string test2 = 'test',
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with values that end in `;` (ListSeparator)', function(done) {
      const content = `
        exception Test {
          1: string test1;
          2: string test2 = 'test';
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with values that end in `;` and `,` (ListSeparator)', function(done) {
      const content = `
        exception Test {
          1: string test1,
          2: string test2 = 'test';
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            },
            {
              id: 2,
              type: 'string',
              name: 'test2',
              defaultValue: 'test'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('does not parse a exception containing a field without a type', function(done) {
      const content = `
        exception Test {
          1: test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with required & without a type', function(done) {
      const content = `
        exception Test {
          1: required test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with default & without a type', function(done) {
      const content = `
        exception Test {
          1: test = 'test'
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    // TODO: OOMs the VM
    it.skip('does not parse a exception containing a field with invalid default', function(done) {
      const content = `
        exception Test {
          1: string test = 'test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    // TODO: OOMs the VM
    it.skip('does not parse a exception containing a field with default containing mixed quotes', function(done) {
      const content = `
        exception Test {
          1: string test = 'test"
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with string FieldID', function(done) {
      const content = `
        exception Test {
          test: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with e-notation FieldID', function(done) {
      const content = `
        exception Test {
          1e2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a exception containing a field with decimal FieldID', function(done) {
      const content = `
        exception Test {
          1.2: string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with invalid option', function(done) {
      const content = `
        exception Test {
          1: failure string test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a exception containing a field with a Map type', function(done) {
      const content = `
        exception Test {
          1: map<i16, string> test = { 1: 'a', 2: 'b' }
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: {
                name: 'map',
                keyType: 'i16',
                valueType: 'string'
              },
              name: 'test',
              defaultValue: [
                {
                  key: 1,
                  value: 'a'
                },
                {
                  key: 2,
                  value: 'b'
                }
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a exception containing a field with an invalid Map type', function(done) {
      const content = `
        exception Test {
          1: map<i16> test
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a exception containing a field with a Map type but invalid default', function(done) {
      const content = `
        exception Test {
          1: map<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a exception containing a field with a Set type', function(done) {
      const content = `
        exception Test {
          1: set<i16> test = [1,2]
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: {
                name: 'set',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a exception containing a field with an invalid Set type', function(done) {
      const content = `
        exception Test {
          1: set<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a exception containing a field with a Set type but invalid default', function(done) {
      const content = `
        exception Test {
          1: set<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a exception containing a field with a List type', function(done) {
      const content = `
        exception Test {
          1: list<i16> test = [1,2]
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: {
                name: 'list',
                valueType: 'i16'
              },
              name: 'test',
              defaultValue: [
                1,
                2
              ]
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it.skip('does not parse a exception containing a field with an invalid List type', function(done) {
      const content = `
        exception Test {
          1: list<i16, string> test = [1,2]
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse a exception containing a field with a List type but invalid default', function(done) {
      const content = `
        exception Test {
          1: list<i16> test = { 1: 'a', 2: 'b' }
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('does not parse a exception containing a field with an invalid default assignment', function(done) {
      const content = `
        exception Test {
          1: string test =
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it('parses a exception that starts with `_` (Identifier)', function(done) {
      const content = `
        exception _Test {
          1: string test1
        }
      `;

      const expected = {
        exception: {
          _Test: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception containing `_` (Identifier)', function(done) {
      const content = `
        exception Te_st {
          1: string test1
        }
      `;

      const expected = {
        exception: {
          Te_st: [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception containing `.` (Identifier)', function(done) {
      const content = `
        exception Te.st {
          1: string test1
        }
      `;

      const expected = {
        exception: {
          'Te.st': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        exception Te.st_123 {
          1: string test1
        }
      `;

      const expected = {
        exception: {
          'Te.st_123': [
            {
              id: 1,
              type: 'string',
              name: 'test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with a field that starts with `_` (Identifier)', function(done) {
      const content = `
        exception Test {
          1: string _test1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: '_test1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with a field containing `_` (Identifier)', function(done) {
      const content = `
        exception Test {
          1: string test_1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with a field containing `.` (Identifier)', function(done) {
      const content = `
        exception Test {
          1: string test.1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'test.1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });

    it('parses a exception with a field containing `.`, `_`, letters and numbers (Identifier)', function(done) {
      const content = `
        exception Test {
          1: string te.st_1
        }
      `;

      const expected = {
        exception: {
          Test: [
            {
              id: 1,
              type: 'string',
              name: 'te.st_1'
            }
          ]
        }
      };

      const ast = thriftParser(content);

      expect(ast).toEqual(expected);
      done();
    });
  });

  describe('regressions', function() {

    it('throws on number with `-` in the middle', function(done) {
      const content = `
        const int32 invalid = 1-2
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });
  });
});
