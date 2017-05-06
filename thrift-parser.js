const path = require('path');

class ThriftFileParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'THRIFT_FILE_PARSING_ERROR';
  }
}

module.exports = (buffer, offset = 0) => {

  buffer = new Buffer(buffer);
  let containerType;

  const readAnyOne = (...args) => {
    let beginning = offset;
    for (let i = 0; i < args.length; i++) {
      try {
        return args[i]();
      } catch (ignore) {
        offset = beginning;
        continue;
      }
    }
    offset = beginning;
    throw 'Unexcepted Token';
  };

  const readUntilThrow = (transaction, key) => {
    let receiver = key ? {} : [];
    let beginning;
    for (; ;) {
      try {
        beginning = offset;
        let result = transaction();
        key ? receiver[result[key]] = result : receiver.push(result);
      } catch (ignore) {
        offset = beginning;
        return receiver;
      }
    }
  };

  const readKeyword = word => {
    for (let i = 0; i < word.length; i++) {
      if (buffer[offset + i] !== word.charCodeAt(i)) {
        throw 'Unexpected token "' + word + '"';
      }
    }
    offset += word.length;
    readSpace();
    return word;
  };

  const readCharCode = (code) => {
    if (buffer[offset] !== code) throw 'Unexpected charCode';
    offset++;
    readSpace();
    return code;
  };

  const readNoop = () => {};

  const readCommentMultiple = () => {
    let i = 0;
    if (buffer[offset + i++] !== 47 || buffer[offset + i++] !== 42) return false;
    do {
      while (offset + i < buffer.length && buffer[offset + i++] !== 42) {}
    } while (offset + i < buffer.length && buffer[offset + i] !== 47);
    offset += i + 1;
    return true;
  };

  const readCommentSharp = () => {
    let i = 0;
    if (buffer[offset + i++] !== 35) return false;
    while (buffer[offset + i] !== 10 && buffer[offset + i] !== 13) offset++;
    offset += i;
    return true;
  };

  const readCommentDoubleSlash = () => {
    let i = 0;
    if (buffer[offset + i++] !== 47 || buffer[offset + i++] !== 47) return false;
    while (buffer[offset + i] !== 10 && buffer[offset + i] !== 13) offset++;
    offset += i;
    return true;
  };

  const readSpace = () => {
    for (; ;) {
      let byte = buffer[offset];
      if (byte === 13 || byte === 10 || byte === 32 || byte === 9) {
        offset++;
      } else {
        if (!readCommentMultiple() && !readCommentSharp() && !readCommentDoubleSlash()) return;
      }
    }
  };

  const readComma = () => {
    if (buffer[offset] === 44 || buffer[offset] === 59) { // , or ;
      offset++;
      readSpace();
      return ',';
    }
  };

  const readTypedef = () => {
    let subject = readKeyword('typedef');
    let type = readType();
    let name = readName();
    readComma();
    return {subject, type, name};
  };

  const readType = () => readAnyOne(readTypeMap, readTypeList, readTypeNormal);

  const readTypeMap = () => {
    let name = readKeyword('map');
    readCharCode(60); // <
    let keyType = readType();
    readComma();
    let valueType = readType();
    readCharCode(62); // >
    containerType = name;
    return {name, keyType, valueType};
  };

  const readTypeList = () => {
    let name = readAnyOne(() => readKeyword('list'), () => readKeyword('set'));
    readCharCode(60); // <
    let valueType = readType();
    readCharCode(62); // >
    containerType = name;
    return {name, valueType};
  };

  const readTypeNormal = () => readName();

  const readName = () => {
    let i = 0;
    let byte = buffer[offset];
    while (
    (byte >= 97 && byte <= 122) || // a-z
    byte === 46 ||                 // .
    byte === 95 ||                 // _
    (byte >= 65 && byte <= 90) ||  // A-Z
    (byte >= 48 && byte <= 57)     // 0-9
      ) byte = buffer[offset + ++i];
    if (i === 0) throw 'Unexpected token';
    let value = buffer.toString('utf8', offset, offset += i);
    readSpace();
    return value;
  };

  const readScope = () => {
    let i = 0;
    let byte = buffer[offset];
    while (
    (byte >= 97 && byte <= 122) || // a-z
    byte === 95 ||                 // _
    (byte >= 65 && byte <= 90) ||  // A-Z
    (byte >= 48 && byte <= 57) ||  // 0-9
    (byte === 42) ||               // *
    (byte === 46)                  // .
      ) byte = buffer[offset + ++i];
    if (i === 0) throw 'Unexpected token';
    let value = buffer.toString('utf8', offset, offset += i);
    readSpace();
    return value;
  };

  const readNumberValue = () => {
    let result = [];
    if (buffer[offset] === 45) { // -
      result.push(buffer[offset]);
      offset++;
    }

    for (; ;) {
      let byte = buffer[offset];
      if ((byte >= 48 && byte <= 57) || byte === 46) {
        offset++;
        result.push(byte);
      } else {
        if (result.length) {
          readSpace();
          return +String.fromCharCode(...result);
        } else {
          throw 'Unexpected token ' + String.fromCharCode(byte);
        }
      }
    }
  };

  const readEnotationValue = () => {
    let result = [];
    if (buffer[offset] === 45) { // -
      result.push(buffer[offset]);
      offset++;
    }

    for (;;) {
      let byte = buffer[offset];
      if ((byte >= 48 && byte <= 57) || byte === 46) {
        result.push(byte);
        offset++;
      } else {
        break;
      }
    }

    if (buffer[offset] !== 69 && buffer[offset] !== 101) throw 'Unexpected token'; // E or e
    result.push(buffer[offset]);
    offset++;

    for (;;) {
      let byte = buffer[offset];
      if (byte >= 48 && byte <= 57) { // 0-9
        offset++;
        result.push(byte);
      } else {
        if (result.length) {
          readSpace();
          return +String.fromCharCode(...result);
        } else {
          throw 'Unexpected token ' + String.fromCharCode(byte);
        }
      }
    }
  };

  const readHexadecimalValue = () => {
    let result = [];
    if (buffer[offset] === 45) { // -
      result.push(buffer[offset]);
      offset++;
    }

    if (buffer[offset] !== 48) throw 'Unexpected token'; // 0
    result.push(buffer[offset]);
    offset++;

    if (buffer[offset] !== 88 && buffer[offset] !== 120) throw 'Unexpected token'; // x or X
    result.push(buffer[offset]);
    offset++;

    for (; ;) {
      let byte = buffer[offset];
      if (
        (byte >= 48 && byte <= 57) || // 0-9
        (byte >= 65 && byte <= 70) || // A-F
        (byte >= 97 && byte <= 102)   // a-f
      ) {
        offset++;
        result.push(byte);
      } else {
        if (result.length) {
          readSpace();
          return +String.fromCharCode(...result);
        } else {
          throw 'Unexpected token ' + String.fromCharCode(byte);
        }
      }
    }
  };

  const readBooleanValue = () => JSON.parse(readAnyOne(() => readKeyword('true'), () => readKeyword('false')));

  const readRefValue = () => {
    let list = [readName()];
    readUntilThrow(() => {
      readCharCode(46); // .
      list.push(readName());
    });
    return {'=': list};
  };

  const readStringValue = () => {
    let receiver = [];
    let start;
    while (buffer[offset] != null) {
      let byte = buffer[offset++];
      if (receiver.length) {
        if (byte === start) { // " or '
          receiver.push(byte);
          readSpace();
          return String.fromCharCode(...receiver.slice(1, -1));
        } else if (byte === 92) { // \
          receiver.push(byte);
          offset++;
          receiver.push(buffer[offset++]);
        } else {
          receiver.push(byte);
        }
      } else {
        if (byte === 34 || byte === 39) {
          start = byte;
          receiver.push(byte);
        } else {
          throw 'Unexpected token ILLEGAL';
        }
      }
    }
    throw 'Unterminated string value';
  };

  const readListValue = () => {
    readCharCode(91); // [
    let list = readUntilThrow(() => {
      let value = readValue();
      readComma();
      return value;
    });
    readCharCode(93); // ]
    if (containerType !== 'set' && containerType !== 'list') {
      throw `Invalid ${containerType} value`;
    }
    containerType = undefined;
    return list;
  };

  const readMapValue = () => {
    readCharCode(123); // {
    let list = readUntilThrow(() => {
      let key = readValue();
      readCharCode(58); // :
      let value = readValue();
      readComma();
      return {key, value};
    });
    readCharCode(125); // }
    if (containerType !== 'map') {
      throw `Invalid ${containerType} value`;
    }
    containerType = undefined;
    return list;
  };

  const readValue = () => readAnyOne(
    readHexadecimalValue, // This coming before readNumberValue is important, unfortunately
    readEnotationValue,   // This also needs to come before readNumberValue
    readNumberValue,
    readStringValue,
    readBooleanValue,
    readListValue,
    readMapValue,
    readRefValue
  );

  const readConst = () => {
    let subject = readKeyword('const');
    let type = readType();
    let name = readName();
    readCharCode(61);
    let value = readValue();
    readComma();
    return {subject, type, name, value};
  };

  const readEnum = () => {
    let subject = readKeyword('enum');
    let name = readName();
    let items = readEnumBlock();
    return {subject, name, items};
  };

  const readEnumBlock = () => {
    readCharCode(123); // {
    let receiver = readUntilThrow(readEnumItem);
    readCharCode(125); // }
    return receiver;
  };

  const readEnumItem = () => {
    let name = readName();
    let value = readAssign();
    readComma();
    let result = {name};
    if (value !== void 0) result.value = value;
    return result;
  };

  const readAssign = () => {
    let beginning = offset;
    try {
      readCharCode(61); // =
      return readValue();
    } catch (ignore) {
      offset = beginning;
    }
  };

  const readStruct = () => {
    let subject = readKeyword('struct');
    let name = readName();
    let items = readStructLikeBlock();
    return {subject, name, items};
  };

  const readStructLikeBlock = () => {
    readCharCode(123); // {
    let receiver = readUntilThrow(readStructLikeItem);
    readCharCode(125); // }
    return receiver;
  };

  const readStructLikeItem = () => {
    let id;
    try {
      id = readNumberValue();
      readCharCode(58); // :
    } catch (err) {

    }

    let option = readAnyOne(() => readKeyword('required'), () => readKeyword('optional'), readNoop);
    let type = readType();
    let name = readName();
    let defaultValue = readAssign();
    readComma();
    let result = {id, type, name};
    if (option !== void 0) result.option = option;
    if (defaultValue !== void 0) result.defaultValue = defaultValue;
    return result;
  };

  const readUnion = () => {
    let subject = readKeyword('union');
    let name = readName();
    let items = readStructLikeBlock();
    return {subject, name, items};
  };

  const readException = () => {
    let subject = readKeyword('exception');
    let name = readName();
    let items = readStructLikeBlock();
    return {subject, name, items};
  };

  const readExtends = () => {
    let beginning = offset;
    try {
      readKeyword('extends');
      let name = readRefValue()['='].join('.');
      return name;
    } catch (ignore) {
      offset = beginning;
      return;
    }
  };

  const readService = () => {
    let subject = readKeyword('service');
    let name = readName();
    let extend = readExtends(); // extends is a reserved keyword
    let functions = readServiceBlock();
    let result = {subject, name};
    if (extend !== void 0) result.extends = extend;
    if (functions !== void 0) result.functions = functions;
    return result;
  };

  const readNamespace = () => {
    let subject = readKeyword('namespace');
    let name = readScope();
    let serviceName = readRefValue()['='].join('.');
    return {subject, name, serviceName};
  };

  const readInclude = () => {
    let subject = readKeyword('include');
    readSpace();
    let includePath = readQuotation();
    let name = path.basename(includePath, '.thrift');
    readSpace();
    return {subject, name, path: includePath};
  };

  const readQuotation = () => {
    let quoteMatch;
    if (buffer[offset] === 34 || buffer[offset] === 39) {
      quoteMatch = buffer[offset];
      offset++;
    } else {
      throw 'include error';
    }
    let i = offset;
    // Read until it finds a matching quote or end-of-file
    while (buffer[i] !== quoteMatch && buffer[i] != null) {
      i++;
    }
    if (buffer[i] === quoteMatch) {
      let value = buffer.toString('utf8', offset, i);
      offset = i + 1;
      return value;
    } else {
      throw 'include error';
    }
  };

  const readServiceBlock = () => {
    readCharCode(123); // {
    let receiver = readUntilThrow(readServiceItem, 'name');
    readCharCode(125); // }
    return receiver;
  };

  const readOneway = () => readKeyword('oneway');

  const readServiceItem = () => {
    let oneway = !!readAnyOne(readOneway, readNoop);
    let type = readType();
    let name = readName();
    let args = readServiceArgs();
    let throws = readServiceThrow();
    readComma();
    return {type, name, args, throws, oneway};
  };

  const readServiceArgs = () => {
    readCharCode(40); // (
    let receiver = readUntilThrow(readStructLikeItem);
    readCharCode(41); // )
    readSpace();
    return receiver;
  };

  const readServiceThrow = () => {
    let beginning = offset;
    try {
      readKeyword('throws');
      return readServiceArgs();
    } catch (ignore) {
      offset = beginning;
      return [];
    }
  };

  const readSubject = () => {
    return readAnyOne(readTypedef, readConst, readEnum, readStruct, readUnion, readException, readService, readNamespace, readInclude);
  };

  const readThrift = () => {
    readSpace();
    let storage = {};
    for (; ;) {
      try {
        let block = readSubject();
        let {subject, name} = block;
        if (!storage[subject]) storage[subject] = {};
        delete block.subject;
        delete block.name;
        switch (subject) {
          case 'exception':
          case 'struct':
            storage[subject][name] = block.items;
            break;
          default:
            storage[subject][name] = block;
        }
      } catch (message) {
        console.error(`[31m${buffer.slice(offset, offset + 50)}[0m`); // eslint-disable-line no-console
        throw new ThriftFileParsingError(message);
      } finally {
        if (buffer.length === offset) break;
      }
    }
    return storage;
  };

  return readThrift();

};
