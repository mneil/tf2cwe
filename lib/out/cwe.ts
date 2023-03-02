import { ast } from "../";

export async function compile(nodes: ast.Node[]) {
  const resources = nodes.filter((n) => n.is(ast.Type.Resource));
  return resources;
}
