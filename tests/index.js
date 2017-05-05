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

    // TODO: Make this pass
    it.skip('parses a dot.separated scope', function(done) {
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

    // TODO: Make this pass
    it.skip('does not parse paths wrapped in mixed-quotes (Literal)', function(done) {
      const content = `
         include 'test"
      `;

      expect(() => thriftParser(content)).toThrow();
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

    it.skip('does not parse an invalid Map typedef', function(done) {
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

    it.skip('does not parse an invalid Set typedef', function(done) {
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

    it.skip('does not parse an invalid List typedef', function(done) {
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

    it.skip('does not parse a const without assignment', function(done) {
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

    // TODO: this currently OOMs V8
    it.skip('does not parse a const with a value wrapped in mixed-quotes', function(done) {
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

    it.skip('does not parse an invalid Map type', function(done) {
      const content = `
        const map<i32> test = { 1: 'a', 2: 'b', 3: 'c' }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an invalid Map values', function(done) {
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

    it.skip('does not parse an invalid Set type', function(done) {
      const content = `
        const set<i32, string> test = [ 1, 2, 3 ]
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an invalid Set values', function(done) {
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

    it.skip('does not parse an invalid List type', function(done) {
      const content = `
        const list<i32, string> test = [ 1, 2, 3 ]
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an invalid List values', function(done) {
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

    // TODO: fix values
    it.skip('parses an enum without values', function(done) {
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

    // TODO: fix values
    it.skip('parses an enum with mixed values', function(done) {
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

    it.skip('does not parse an enum with a string value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 'test'
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an enum with a decimal value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 1.2
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an enum with an e-notation value assignment', function(done) {
      const content = `
        enum Test {
          test1 = 1e2
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an enum with a Map value assignment', function(done) {
      const content = `
        enum Test {
          test1 = {'test':'test'}
        }
      `;

      expect(() => thriftParser(content)).toThrow();
      done();
    });

    it.skip('does not parse an enum with a Set/List value assignment', function(done) {
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
      let content = `
        struct MyStruct {
          1: required int id,
        }
      `;

      let expected = {
        struct: {
          MyStruct: [
            {
              id: 1,
              option: 'required',
              type: 'int',
              name: 'id'
            }
          ]
        }
      };

      let ast = thriftParser(content);

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
