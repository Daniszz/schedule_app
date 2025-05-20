from utils import get_admissible_colors, calculate_saturation 
from collections import defaultdict

def rsd(G, coloring, p, l, D, vertex):
    """Recoloring using Saturation Degree (RSD) - Fully recolors a vertex or rejects it."""
    new_coloring = {n: set(colors) for n, colors in coloring.items()}
    Z = [i for i in G.neighbors(vertex) if not new_coloring[i]]  
    
    Ai = get_admissible_colors(G, new_coloring, vertex, D, l)
    
    if len(Ai) < p[vertex]:
        return coloring  
    
    new_coloring[vertex] = set() 
    
    for _ in range(p[vertex]):  
        best_color = min(Ai, key=lambda c: calculate_saturation(G, new_coloring, Z, c))
        new_coloring[vertex].add(best_color)
        Ai.remove(best_color)
    
    return new_coloring

def renf(G, coloring, p, l, D, vertex, gain):
    """Enforced Recoloring (REnf) - Forces recoloring even if |Ai| < pi."""
    new_coloring = {n: set(colors) for n, colors in coloring.items()}
    Ai = get_admissible_colors(G, new_coloring, vertex, D, l)  
    
    new_coloring[vertex] = set(Ai)  
    remaining = p[vertex] - len(Ai)
    
    if remaining > 0:
       
        all_colors = set(range(D))
        non_admissible = all_colors - Ai  

        def compute_gain_loss(c):
            loss = 0
            for neighbor in G.neighbors(vertex):
                if c in new_coloring.get(neighbor, set()):
                    loss += gain[neighbor]
            return loss

        non_admissible_sorted = sorted(non_admissible, key=compute_gain_loss)
        
        for c in non_admissible_sorted[:remaining]:
            for neighbor in G.neighbors(vertex):
                if c in new_coloring.get(neighbor, set()):
                    new_coloring[neighbor].remove(c)
            new_coloring[vertex].add(c)  
    
    if len(new_coloring[vertex]) < p[vertex]:
        return coloring 
    return new_coloring

def rdrop(coloring,vertex):
    new_coloring={n: set(colors) for n,colors in coloring.items()}
    new_coloring[vertex]=set()
    return new_coloring