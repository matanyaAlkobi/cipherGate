const setNodesAndEdges = (
  data: FamilyTreeData<FamilyNodeRawData>
): FamilyTreeGraphData => {
  const {
    entity,
    parent,
    grandParent,
    siblings,
    children,
    minimizedSiblings,
    minimizedChildren,
  } = data;

  const graphNodes: Node<FamilyNodeData>[] = [
    {
      id: entity.id,
      position: { x: 0, y: 0 },
      data: setRawDataToData(entity),
      type: 'familyNode',
    },
    ...siblings.map((item) => ({
      id: item.id,
      position: { x: 0, y: 0 },
      data: setRawDataToData(item),
      type: 'familyNode',
    })),
    ...children.map((item) => ({
      id: item.id,
      position: { x: 0, y: 0 },
      data: setRawDataToData(item),
      type: 'familyNode',
    })),
  ];

  if (parent) {
    graphNodes.push({
      id: parent.id,
      position: { x: 0, y: 0 },
      data: setRawDataToData(parent),
      type: 'familyNode',
    });
  }

  if (grandParent) {
    graphNodes.push({
      id: grandParent.id,
      position: { x: 0, y: 0 },
      data: setRawDataToData(grandParent),
      type: 'familyNode',
    });
  }

  if (minimizedSiblings.length) {
    graphNodes.push({
      id: `more-siblings-${entity.id}`,
      position: { x: 0, y: 0 },
      data: {
        name: strings.moreSiblings(minimizedSiblings.length),
        id: `more-siblings-${entity.id}`,
        type: 'more',
        siblings: minimizedSiblings,
      },
      type: 'familyNode',
    });
  }

  if (minimizedChildren.length) {
    graphNodes.push({
      id: `more-children-${entity.id}`,
      position: { x: 0, y: 0 },
      data: {
        name: strings.moreChildren(minimizedChildren.length),
        id: `more-children-${entity.id}`,
        type: 'more',
        children: minimizedChildren,
      },
      type: 'familyNode',
    });
  }

  const filteredNodes = showArchived
    ? graphNodes
    : graphNodes.filter((node) => !node.data.archived);

  const nodeIds = new Set(filteredNodes.map((node) => node.id));
  const edges: Edge[] = [];

  // רק אם יש parent – מוסיפים את החלק העליון
  if (parent) {
    if (grandParent) {
      edges.push({
        id: `e-${grandParent.id}-${parent.id}`,
        source: grandParent.id,
        target: parent.id,
        type: 'step',
      });
    }

    if (minimizedSiblings.length) {
      edges.push({
        id: `e-${parent.id}-more-siblings-${entity.id}`,
        source: parent.id,
        target: `more-siblings-${entity.id}`,
        type: 'step',
      });
    }

    const firstHalf = siblings.slice(0, siblings.length / 2);
    const secondHalf = siblings.slice(siblings.length / 2);
    const parentChildren = [...firstHalf, entity, ...secondHalf];

    parentChildren.forEach((child) => {
      edges.push({
        id: `e-${parent.id}-${child.id}`,
        source: parent.id,
        target: child.id,
        type: 'step',
      });
    });
  }

  // גם בלי parent – עדיין entity -> children חייבים להיבנות
  if (minimizedChildren.length) {
    edges.push({
      id: `e-${entity.id}-more-children-${entity.id}`,
      source: entity.id,
      target: `more-children-${entity.id}`,
      type: 'step',
    });
  }

  children.forEach((child) => {
    edges.push({
      id: `e-${entity.id}-${child.id}`,
      source: entity.id,
      target: child.id,
      type: 'step',
    });
  });

  const filteredEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
};