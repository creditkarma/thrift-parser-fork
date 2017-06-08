interface SetType {
  name: 'set',
  valueType: ValueType,
}
interface ListType {
  name: 'list',
  valueType: ValueType,
}
interface MapType {
  name: 'map',
  keyType: ValueType,
  valueType: ValueType,
}
type ValueType = string | SetType | ListType | MapType;
type ThriftType = 'int' | 'bool' | 'i16' | 'i32' | 'i64' | 'string';
type FieldOption = 'required' | 'optional';
interface Field {
  id: string,
  option: FieldOption,
  type: ThriftType,
  name: string,
}

interface Method {
  type: ValueType,
  name: string,
  args: Field[],
  throws: Field[],
}

interface Structs {
  [name: string]: Field[],
}

interface Unions {
  [name: string]: Field[],
}

interface Exceptions {
  [name: string]: Field[],
}

interface Services {
  [serviceName: string]: {
    [methodName: string]: Method,
  },
}

interface Namespaces {
  [name: string]: {
    serviceName: string,
  }
}

interface Includes {
  [name: string]: {
    path: string,
  }
}

interface TypeDefs {
  [name: string]: {
    type: string,
  }
}

interface StaticConst {
  type: string,
  value: any,
}

interface ListConst {
  type: ListType,
  value: any,
}

interface MapConst {
  type: MapType,
  value: {
    key: any,
    value: any,
  }[],
}

interface SetConst {
  type: SetType,
  value: any,
}

interface Consts {
  [name: string]: StaticConst | ListConst | MapConst | SetConst,
}

interface EnumField {
  name: string,
  value: string | number | boolean,
}

interface Enums {
  [name: string]: EnumField[]
}

interface JsonAST {
  namespace?: Namespaces,
  typedef?: TypeDefs,
  include?: Includes,
  const?: Consts,
  enum?: Enums,
  struct?: Structs,
  union?: Unions,
  exception?: Exceptions,
  service?: Services,
}

declare module 'thrift-parser' {
  interface ThriftFileParsingError extends Error {
    messgae: string;
    name: 'THRIFT_FILE_PARSING_ERROR';
  }

  function parser (str: string): JsonAST;

  export = parser;
}
