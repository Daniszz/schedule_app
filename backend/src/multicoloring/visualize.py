import matplotlib.pyplot as plt
import networkx as nx

def visualize_coloring(G, coloring, gain=None, p=None, title="Graph Coloring", filename=None):
    """Visualize the colored graph"""
    plt.figure(figsize=(10, 8))
    pos = nx.spring_layout(G)
    
    node_colors = ['lightblue' if len(coloring[node]) > 0 else 'white' for node in G.nodes]
    nx.draw_networkx_nodes(G, pos, node_color=node_colors, node_size=700)
    
    labels = {}
    for node in G.nodes:
        color_str = ", ".join(map(str, sorted(coloring.get(node, []))))
        label_parts = [f"Node {node}"]
        if color_str:
            label_parts.append(f"Colors: {color_str}")
        if p is not None:
            label_parts.append(f"pi: {p[node]}")
        if gain is not None:
            label_parts.append(f"Gain: {gain[node]}")
        labels[node] = "\n".join(label_parts)
    
    nx.draw_networkx_labels(G, pos, labels=labels, font_size=8)
    nx.draw_networkx_edges(G, pos, alpha=0.5)
    
    plt.title(title)
    if filename:
        plt.savefig(filename)
    else:
        plt.show()
    plt.close()