from utils import get_admissible_colors, calculate_saturation, calculate_objectives
from greedy import greedy_multicoloring
from methods import rsd,renf

def descent_coloring(G, p, l, D, gain, max_iter=100, n_restarts=3):
    """Multi-start descent with full recoloring moves."""
    best_solution = None
    
    initial_solution, _ = greedy_multicoloring(G, p, l, D, gain)
    best_score = calculate_objectives(G, initial_solution, gain)
    print(f"Initial solution score: {best_score}")
    best_solution = initial_solution

    for _ in range(n_restarts):
        current, _ = greedy_multicoloring(G, p, l, D, gain)
        current_score = calculate_objectives(G, current, gain)

        for _ in range(max_iter):
            best_neighbor = None
            best_neighbor_score = current_score

            for vertex in G.nodes:
                Ai = get_admissible_colors(G, current, vertex, D, l)

                if len(Ai) >= p[vertex]:
                    neighbor = rsd(G, current, p, l, D, vertex)
                else:
                    neighbor = renf(G, current, p, l, D, vertex, gain)

                
                fully_colored_nodes = {n for n in G.nodes if len(neighbor[n]) >= p[n]}
                if len(fully_colored_nodes) < len(G.nodes):
                    continue  

                neighbor_score = calculate_objectives(G, neighbor, gain)

                if neighbor_score > best_neighbor_score:
                    best_neighbor = neighbor
                    best_neighbor_score = neighbor_score

            if best_neighbor_score > current_score:
                current, current_score = best_neighbor, best_neighbor_score
            else:
                break  

      
        if best_score is None or best_neighbor_score > best_score:
            best_solution, best_score = current, best_neighbor_score

    fully_colored = {n for n in G.nodes if len(best_solution[n]) >= p[n]}
    return best_solution, fully_colored
