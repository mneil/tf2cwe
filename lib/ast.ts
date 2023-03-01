type Value = string | number | boolean | Reference;
export type PropertyValue = Value | Value[] | Record<string, Value | Value[]>;

export type Attribute = string | number;

export interface Node {
  readonly id: number;
}

// todo: remove Node from name
export interface Reference extends Node {
  readonly target: string | Node;
  readonly property: Attribute[];
}

export interface Output extends Node {
  readonly name: string;
  readonly type: string;
  readonly value: string | Reference;
}

export interface Resource extends Node {
  readonly name: string;
  readonly type: string;
  readonly properties: Record<string, PropertyValue>;
}

export interface Variable extends Node {
  readonly name: string;
  readonly type: string;
  readonly default?: string;
  readonly description?: string;
  // TODO: validation should be implemented
  // readonly validation?: string;
  readonly sensitive?: boolean;
  readonly nullable?: boolean;
}
