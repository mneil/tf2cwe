type Value = string | number | boolean | Reference;
export type PropertyValue = Value | Value[] | Record<string, Value | Value[]>;
export type Attribute = string | number;

/**
 * A basic Node in the AST. Everything is a Node
 */
export interface Node {
  readonly id: number;
  is: (type: Type) => boolean;
}
/**
 * Supported Node Types
 */
export enum Type {
  Resource,
  Output,
  Variable,
  Reference,
  Config,
}
/**
 * Config Node. Holds configuration data from the parsed source.
 * This is concrete or reference that that the user intends
 * to inject into the output into nodes that are configurable.
 */
export interface Config extends Node {}

/**
 * Reference Node. Holds a reference to another node
 */
export interface Reference extends Node {
  /**
   * The target node id
   * TODO: target can currently be a string but needs to ONLY be a number when this is done.
   */
  readonly target: string | number;
  /**
   * The location we which to retrieve from the target
   */
  readonly property: Attribute[];
}

/**
 * Output Node. Data that is intended to be available
 * to the user and other applications at the end of compilation.
 */
export interface Output extends Node {
  /**
   * Name of the output
   */
  readonly name: string;
  /**
   * Type of the output
   */
  readonly type: string;
  /**
   * Value of the output
   */
  readonly value: string | Reference;
}
/**
 * Resource Node. The most complex and important node. Resource Node
 * holds information and references about the actual "things" the user
 * intends to materialize in their cloud.
 */
export interface Resource extends Node {
  /**
   * Name of the resource
   */
  readonly name: string;
  /**
   * Service the resource belongs to
   */
  readonly service: string;
  /**
   * The product subcategory of the service.
   * Ex: ec2:instance, ec2 is the service, instance is the product
   * Ex: compute.v1.instance, compute is the service, instance is the product
   */
  readonly product: string;
  /**
   * Properties of the resource
   */
  readonly properties: Record<string, PropertyValue>;
  /**
   * Action being taken on this resource. For example, for ec2,
   * it could be RunInstances, TerminateInstances, etc...
   *
   * @default Compilers should assume a Create operation as default
   */
  readonly action?: string;
  /**
   * Version of the instance or API if applicable.
   *
   * @default Compilers should assume latest if not set.
   */
  readonly version?: string;
}
/**
 * Variable Node. Represents data the user intends to
 * be configurable. It's often the case, but not always,
 * that Config Nodes will be used to set values on variables.
 */
export interface Variable extends Node {
  /**
   * Name of the variable
   */
  readonly name: string;
  /**
   * Type of the variable value
   */
  readonly type: string;
  /**
   * A default value for the variable
   */
  readonly default?: string;
  /**
   * Description of the variable. What is the purpose of this thing?
   */
  readonly description?: string;
  // TODO: validation should be implemented
  // readonly validation?: string;
  /**
   * Whether or not the value of the variable is sensitive. Most likely if it
   * is you have at most 2 problems.
   *
   * 1. You work in an org that is overly sensitive itself and things like strings
   *    referencing other resources need to be obscured.
   * 2. You're doing it wrong. You are passing actually sensetive information to
   *    your application like a password that would be better stored somewhere else
   *    and referenced. How do I get that information into said place in the first place?
   *    You write something to generate it for you and place it there and run that as
   *    as service so that neither you or anyone else ever even knows the secret.
   *
   * But whatever, mark things sensitive if you must.
   */
  readonly sensitive?: boolean;
  /**
   * Whether or not this value can be null
   */
  readonly nullable?: boolean;
}
