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
