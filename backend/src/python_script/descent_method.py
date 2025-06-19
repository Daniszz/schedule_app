from utils import get_admissible_colors, calculate_saturation, calculate_objectives
from greedy import greedy_multicoloring
from methods import rsd,renf


def descent_coloring(G, p, l, D, gain, max_iter=1000, n_restarts=3):
    """Multi-start descent with full recoloring moves."""
    best_solution = None
    best_score = None
    
    for restart in range(n_restarts):
        current, _ = greedy_multicoloring(G, p, l, D, gain)
        current_score = calculate_objectives(G, current, gain)
        
        
        
        for iteration in range(max_iter):
            best_neighbor = None
            best_neighbor_score = current_score
            
            for vertex in G.nodes:
                Ai = get_admissible_colors(G, current, vertex, D, l)
                
                if len(Ai) >= p[vertex]:
                    neighbor = rsd(G, current, p, l, D, vertex)
                else:
                    neighbor = renf(G, current, p, l, D, vertex, gain)
                
               
                
                neighbor_score = calculate_objectives(G, neighbor, gain)
           
                if neighbor_score > best_neighbor_score:
                    best_neighbor = neighbor
                    best_neighbor_score = neighbor_score
            
            if best_neighbor_score > current_score:
                current = best_neighbor
                current_score = best_neighbor_score
            else:
                break  
        
        if best_score is None or current_score > best_score:
            best_solution = current
            best_score = current_score
    
    fully_colored = {n for n in G.nodes if len(best_solution[n]) >= p[n]}
    return best_solution, fully_colored
