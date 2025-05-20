import random

def find_largest_consecutive_subset(colors):
    """Subset of consecutive colors"""
    sorted_colors = sorted(colors)
    longest, current = [], []
    for color in sorted_colors:
        if not current or color == current[-1] + 1:
            current.append(color)
        else:
            if len(current) > len(longest):
                longest = current
            current = [color]
    return longest if len(longest) >= len(current) else current

def calculate_objectives(G, coloring, gain):
    """f1,f2,f3"""
    total_gain = sum(gain[node] for node in coloring if len(coloring[node]) > 0)
    
    interruptions = sum(
        sum(1 for j in range(len(sorted(colors)) - 1) if sorted(colors)[j + 1] != sorted(colors)[j] + 1)
        for colors in coloring.values() if len(colors) > 0
    )
    
    color_range = sum(
        (max(colors) - min(colors)) if len(colors) > 0 else 0
        for colors
          in coloring.values()
    )
    
    return total_gain, interruptions, color_range

def get_admissible_colors(G, current_coloring, vertex, D, l):
    neighbor_colors = {c for n in G.neighbors(vertex) for c in current_coloring[n]}   
    available_colors = {
        c for c in range(D)
        if sum(1 for v in current_coloring if c in current_coloring[v]) < l
    }
    
    Ai = available_colors - neighbor_colors
    return Ai

def calculate_saturation(G, coloring, uncolored_nodes, c):
    """Calculate saturation"""
    saturation = 0
    for i in uncolored_nodes:
        for neighbor in G.neighbors(i):
            if c in coloring.get(neighbor, set()):
                saturation += 1
    return saturation
