from utils import get_admissible_colors, calculate_saturation 
from collections import defaultdict




def rsd(G, coloring, p, l, D, vertex):
  
    new_coloring = {n: set(colors) if colors else set() for n, colors in coloring.items()}
    
    Ai = get_admissible_colors(G, new_coloring, vertex, D, l)
    
   
    new_coloring[vertex] = set()
    available_colors = set(Ai)
    
    for _ in range(p[vertex]):
        Z = [neighbor for neighbor in G.neighbors(vertex) 
             if not new_coloring.get(neighbor, set())]
        
        if not Z:
            best_color = available_colors.pop()
        else:

            def calculate_u_sum(color):
                total = 0
                for uncolored_neighbor in Z:
                    for adj_of_uncolored in G.neighbors(uncolored_neighbor):
                        if adj_of_uncolored != vertex and color in new_coloring.get(adj_of_uncolored, set()):
                            total += 1
                            break  
                return total
            
            best_color = max(available_colors, key=calculate_u_sum)
            available_colors.remove(best_color)
        
        new_coloring[vertex].add(best_color)
    
    return {n: list(colors) if isinstance(colors, set) else colors for n, colors in new_coloring.items()}

def renf(G, coloring, p, l, D, vertex, gain):
    """
    Recoloring with Enforcement (RENF) - conform specificațiilor.
    Forțează colorarea chiar și cu culori inadmisibile.
    """
    new_coloring = {n: set(colors) if colors else set() for n, colors in coloring.items()}
    
    Ai = get_admissible_colors(G, new_coloring, vertex, D, l)
    
    new_coloring[vertex] = set()
    
    new_coloring[vertex] = set(Ai)
    colors_needed = p[vertex] - len(Ai)
    
    if colors_needed > 0:
        all_colors = set(range(D))
        non_admissible = all_colors - set(Ai)
        
        non_saturated = []
        for color in non_admissible:
            color_count = sum(1 for node in G.nodes if color in new_coloring.get(node, set()))
            if color_count < l:
                non_saturated.append(color)
        
        def calculate_gain_loss(color):
            affected_neighbors = {
            neighbor for neighbor in G.neighbors(vertex)
             if color in new_coloring.get(neighbor, set())
            }
            return sum(gain.get(neighbor, 0) for neighbor in affected_neighbors)
        
        non_saturated.sort(key=calculate_gain_loss)
        
        for color in non_saturated[:colors_needed]:
            for neighbor in G.neighbors(vertex):
                if color in new_coloring.get(neighbor, set()):
                    new_coloring[neighbor]=set()
            
            new_coloring[vertex].add(color)
    
    if len(new_coloring[vertex]) < p[vertex]:
        return {n: list(colors) if isinstance(colors, set) else colors for n, colors in coloring.items()}
    
    return {n: list(colors) if isinstance(colors, set) else colors for n, colors in new_coloring.items()}


def rdrop(vertex, coloring):
    new_coloring = {v: colors.copy() if isinstance(colors, list) else list(colors) 
                   for v, colors in coloring.items()}
    new_coloring[vertex] = []
    return new_coloring