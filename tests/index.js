'use strict';

let expect = require('expect');

let thriftParser = require('../');

describe('thriftParser', function() {

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
