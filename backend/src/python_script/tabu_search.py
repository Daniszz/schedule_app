from collections import defaultdict
import random
from greedy import greedy_multicoloring
from utils import calculate_objectives
from tabu_helper import generate_neighborhood
def tabu_search(
    G, p, l, D, gain,
    max_iter=1000000,
    tab=3,
    neighborhood_pct=0.25,
    I=150,
    b_pct=0.2,
    strategy=1,
    q=20,
    gamma=0.2
):
   
    current_solution, _ = greedy_multicoloring(G, p, l, D, gain)
    
    
    
    best_solution = current_solution.copy()
    best_objective = calculate_objectives(G, best_solution, gain)
   
    tabu_list = defaultdict(int)
    no_improvement_count = 0
    
    for iteration in range(max_iter):
        neighborhood = generate_neighborhood(
            G, current_solution, p, l, D, gain,
            strategy, tab, q, gamma, neighborhood_pct
        )
        
        
        
        best_move = None
        best_move_objective = None
        best_vertex = None
        
        for vertex, new_coloring in neighborhood:
            if tabu_list[vertex] > iteration:
              
                continue
            
            move_objective = calculate_objectives(G, new_coloring, gain)
            
            if (best_move_objective is None or
                move_objective[0] > best_move_objective[0] or
                (move_objective[0] == best_move_objective[0] and move_objective[1] < best_move_objective[1]) or
                (move_objective[0] == best_move_objective[0] and 
                 move_objective[1] == best_move_objective[1] and 
                 move_objective[2] < best_move_objective[2])):
                
                best_move_objective = move_objective
                best_move = new_coloring
                best_vertex = vertex
        
        if best_move is not None:
            current_solution = best_move
            tabu_list[best_vertex] = iteration + tab
            
            current_objective = calculate_objectives(G, current_solution, gain)
            
            if (current_objective[0] > best_objective[0] or
                (current_objective[0] == best_objective[0] and current_objective[1] < best_objective[1]) or
                (current_objective[0] == best_objective[0] and 
                 current_objective[1] == best_objective[1] and 
                 current_objective[2] < best_objective[2])):
                
                best_solution = current_solution.copy()
                best_objective = current_objective
                no_improvement_count = 0
            else:
                no_improvement_count += 1
        else:
            no_improvement_count += 1
        

        if no_improvement_count >= I:
            colored_vertices = [v for v in G.nodes() 
                             if current_solution.get(v, []) and len(current_solution[v]) == p.get(v, 0)]
            
            if colored_vertices:
                num_to_uncolor = max(1, int(b_pct * len(colored_vertices)))
                vertices_to_uncolor = random.sample(colored_vertices, num_to_uncolor)
                for vertex in vertices_to_uncolor:
                    current_solution[vertex] = []
            
            no_improvement_count = 0
    
   
    
    fully_colored = [v for v in G.nodes() 
                    if v in best_solution and len(best_solution.get(v, [])) == p.get(v, 0)]
    
    return best_solution, fully_colored