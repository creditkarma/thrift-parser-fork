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
