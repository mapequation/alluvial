// Builds a path-indexed tree from a flat list of items that each have a
// `path` iterable (string or array of segments) and computes a `size` per
// internal node from an accessor.

type WithPath = { path: string | number[] | string[] };

class TreeNode {
  path: string | number;
  size = 0;
  nodes: Array<TreeNode | unknown> = [];

  constructor(path: string | number = 0) {
    this.path = path;
  }
}

function isTreeNode(value: unknown): value is TreeNode {
  return value instanceof TreeNode;
}

export default class Tree<T extends WithPath> {
  root: TreeNode = new TreeNode();

  constructor(children: T[], getSize: (child: T) => number) {
    children.forEach((child) => {
      let parent = this.root;

      for (const segment of child.path as Iterable<string | number>) {
        let node = parent.nodes.find(
          (n): n is TreeNode => isTreeNode(n) && n.path === segment
        );

        if (!node) {
          node = new TreeNode(segment);
          parent.nodes.push(node);
        }

        node.size += getSize(child);
        parent = node;
      }

      parent.nodes.push(child);
    });
  }

  sort(tree: TreeNode = this.root): this {
    tree.nodes.sort((a, b) => {
      const sa = isTreeNode(a) ? a.size : 0;
      const sb = isTreeNode(b) ? b.size : 0;
      return sb - sa;
    });
    tree.nodes.forEach((node) => {
      if (isTreeNode(node)) this.sort(node);
    });
    return this;
  }

  flatten(tree: TreeNode = this.root): T[] {
    return tree.nodes.reduce<T[]>(
      (flattened, toFlatten) =>
        flattened.concat(
          isTreeNode(toFlatten) ? this.flatten(toFlatten) : (toFlatten as T)
        ),
      []
    );
  }
}
