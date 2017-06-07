/// <reference types="node" />

export = thriftParser;

declare function thriftParser(str: string | Buffer): thriftParser.JsonAST;

declare namespace thriftParser {
  export interface ThriftFileParsingError extends Error {
    messgae: string;
    name: 'THRIFT_FILE_PARSING_ERROR';
  }

  // Containers
  export interface ContainerType {
    name: 'set' | 'list' | 'map';
    keyType?: Type;
    valueType: Type;
  }
  export interface SetType extends ContainerType {
    name: 'set';
  }
  export interface ListType extends ContainerType {
    name: 'list';
  }
  export interface MapType extends ContainerType {
    name: 'map';
    keyType: Type;
  }

  // Types
  export type ThriftType = 'int' | 'bool' | 'i16' | 'i32' | 'i64' | 'string';
  export type CustomType = string;
  export type Type = ThriftType | SetType | ListType | MapType | CustomType;

  export type FieldOption = 'required' | 'optional';

  export interface Field {
    id: number;
    option: FieldOption;
    type: ThriftType;
    name: string;
  }

  export interface Method {
    type: Type;
    name: string;
    args: Field[];
    throws: Field[];
  }

  export interface Structs {
    [name: string]: Field[];
  }

  export interface Unions {
    [name: string]: Field[];
  }

  export interface Exceptions {
    [name: string]: Field[];
  }

  export interface ServiceMethods {
    [methodName: string]: Method;
  }

  export interface Services {
    [serviceName: string]: ServiceMethods
  }

  export interface Namespaces {
    [name: string]: {
      serviceName: string;
    }
  }

  export interface Includes {
    [name: string]: {
      path: string;
    }
  }

  export interface TypeDefs {
    [name: string]: {
      type: string;
    }
  }

  export interface StaticConst {
    type: string;
    value: any;
  }

  export interface ListConst {
    type: ListType;
    value: any[];
  }

  export interface SetConst {
    type: SetType;
    value: any[];
  }

  export interface MapValue {
    key: any;
    value: any;
  }

  export interface MapConst {
    type: MapType,
    value: MapValue[],
  }

  export interface Consts {
    [name: string]: StaticConst | ListConst | MapConst | SetConst;
  }

  export interface Enum {
    name: string;
    value: number;
  }

  export interface Enums {
    [name: string]: {
      items: Enum[];
    }
  }

  export interface JsonAST {
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
}
