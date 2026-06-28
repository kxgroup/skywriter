import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Generation } from "../types";
import { downloadDataUrl } from "../lib/storage";

interface Node {
  gen: Generation;
  children: Node[];
}

function buildForest(gens: Generation[]): Node[] {
  const byId = new Map<string, Node>();
  gens.forEach((g) => byId.set(g.id, { gen: g, children: [] }));
  const roots: Node[] = [];
  for (const node of byId.values()) {
    const parentId = node.gen.parentId;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (nodes: Node[]) => {
    nodes.sort((a, b) => a.gen.createdAt - b.gen.createdAt);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  roots.sort((a, b) => b.gen.createdAt - a.gen.createdAt);
  return roots;
}

export default function Timeline() {
  const { generations, deleteGeneration, activeChainId, setActiveChainId } = useApp();
  const forest = useMemo(() => buildForest(generations), [generations]);

  if (!generations.length) {
    return (
      <aside className="timeline">
        <h3>Timeline Explorer</h3>
        <p className="muted small">Generations will appear here as a thread tree.</p>
      </aside>
    );
  }

  return (
    <aside className="timeline">
      <h3>Timeline Explorer</h3>
      <div className="tree">
        {forest.map((n) => (
          <TreeNode
            key={n.gen.id}
            node={n}
            depth={0}
            activeChainId={activeChainId}
            onChain={setActiveChainId}
            onDelete={deleteGeneration}
          />
        ))}
      </div>
    </aside>
  );
}

function TreeNode({
  node,
  depth,
  activeChainId,
  onChain,
  onDelete,
}: {
  node: Node;
  depth: number;
  activeChainId: string | null;
  onChain: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const g = node.gen;
  const hasChildren = node.children.length > 0;
  const isActive = activeChainId === g.id;

  return (
    <div className="tree-node" style={{ marginLeft: depth ? 14 : 0 }}>
      <div className={"tree-row" + (isActive ? " active" : "")}>
        <button
          className="twisty"
          onClick={() => setOpen((o) => !o)}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
        >
          {open ? "▾" : "▸"}
        </button>
        <span className="tree-icon">{g.kind === "image" ? "🖼" : "📄"}</span>
        <span className="tree-title" title={g.title}>
          {g.title}
        </span>
        {g.kind === "image" && g.image && (
          <img className="tree-thumb" src={g.image.dataUrl} alt="" />
        )}
      </div>
      <div className="tree-actions">
        {g.kind === "text" && g.text && (
          <button className="link-btn" onClick={() => navigator.clipboard.writeText(g.text!)}>
            copy
          </button>
        )}
        {g.kind === "image" && g.image && (
          <button className="link-btn" onClick={() => downloadDataUrl(g.image!.dataUrl, g.image!.name)}>
            download
          </button>
        )}
        {g.kind === "text" &&
          (isActive ? (
            <button className="link-btn" onClick={() => onChain(null)}>
              release
            </button>
          ) : (
            <button className="link-btn" onClick={() => onChain(g.id)}>
              chain
            </button>
          ))}
        <button className="link-btn danger" onClick={() => onDelete(g.id)}>
          delete
        </button>
      </div>
      {open &&
        node.children.map((c) => (
          <TreeNode
            key={c.gen.id}
            node={c}
            depth={depth + 1}
            activeChainId={activeChainId}
            onChain={onChain}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}
