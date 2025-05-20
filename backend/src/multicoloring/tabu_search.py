from collections import defaultdict
import random
from greedy import greedy_multicoloring
from utils import calculate_objectives
from tabu_helper import generate_neighborhood, diversify_solution

def tabu_search(
    G, p, l, D, gain, 
    max_iter=1000, 
    tab=7, 
    neighborhood_pct=0.25, 
    I=150, 
    
    b_pct=0.2, 
    strategy=1, 
    q=10, 
    gamma=0.2
):
    current_solution, _ = greedy_multicoloring(G, p, l, D, gain)
    best_solution = current_solution.copy()
    best_objective = calculate_objectives(G, best_solution, gain)
    
    tabu_list = defaultdict(int)
    no_improvement_count = 0
    
    for iteration in range(max_iter):
        neighborhood = []
        for vertex, new_coloring in generate_neighborhood(
            G, current_solution, p, l, D, gain,
            strategy, tab, q, gamma, neighborhood_pct
        ):
            if all(len(colors) == p.get(v, 0) or not colors for v, colors in new_coloring.items()):
                neighborhood.append((vertex, new_coloring))
        
        best_move = None
        best_move_value = (-float('inf'), float('inf'), float('inf'))
        best_vertex = None
        
        for vertex, new_coloring in neighborhood:
            if tabu_list[vertex] > iteration:
                continue
            
            move_value = calculate_objectives(G, new_coloring, gain)
            if (-move_value[0], move_value[1], move_value[2]) < (-best_move_value[0], best_move_value[1], best_move_value[2]):
                best_move_value = move_value
                best_move = new_coloring
                best_vertex = vertex
        
        if best_move is not None:
            current_solution = best_move
            tabu_list[best_vertex] = iteration + tab
            
            current_objective = calculate_objectives(G, current_solution, gain)
            if (-current_objective[0], current_objective[1], current_objective[2]) < (-best_objective[0], best_objective[1], best_objective[2]):
                best_solution = current_solution.copy()
                best_objective = current_objective
                no_improvement_count = 0
            else:
                no_improvement_count += 1
        else:
            no_improvement_count += 1
        
        if no_improvement_count >= I:
            current_solution = diversify_solution(current_solution, b_pct)
            no_improvement_count = 0

    fully_colored = [v for v in G.nodes if len(best_solution.get(v, [])) == p.get(v, 0)]
    return best_solution, fully_colored