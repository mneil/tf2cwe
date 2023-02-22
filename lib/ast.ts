export interface ResourceNode {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly properties: Record<string, string | ReferenceNode>;
}

export interface ReferenceNode {
  readonly target: string;
  readonly property: string;
}

export interface OutputNode {
  readonly name: string;
  readonly type: string;
  readonly value: string | ReferenceNode;
}
