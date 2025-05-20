from utils import find_largest_consecutive_subset,  get_admissible_colors
import random
def greedy_multicoloring(G, p, l, D, gain):
    """Greedy heuristic for multi-coloring graphs with scheduling constraints."""
    U = set(G.nodes)  
    coloring = {node: set() for node in G.nodes} 
    fully_colored_nodes = set()
    
    while U:
     
        i = max(U, key=lambda node: gain[node]) #i with the largest gain
        U.remove(i)
        
       
        Ai = get_admissible_colors(G, coloring, i, D, l)

        
        if len(Ai) < p[i]:
            continue 
        
        
        Bi = find_largest_consecutive_subset(Ai)
        
        if len(Bi) >= p[i]:
            start_index = random.randint(0, len(Bi) - p[i]) #color vertex i with pi consecutive colors in Bi (randomly chosen).
            assigned_colors = Bi[start_index:start_index + p[i]] 
        else:
            assigned_colors = list(Bi)
            Ai.difference_update(Bi)
            
        while len(assigned_colors) < p[i]:
            min_interrupt_color = min(
                Ai,
                key=lambda c: (1 if assigned_colors and c != assigned_colors[-1] + 1 else 0,  # Minimize interruptions
                       max(assigned_colors + [c]) - min(assigned_colors + [c]))  # Minimize range (f3)
             )
            assigned_colors.append(min_interrupt_color)
            Ai.remove(min_interrupt_color)
        
        
        coloring[i] = set(assigned_colors)
        if len(coloring[i]) == p[i]:
            fully_colored_nodes.add(i)
      
    
    return coloring, fully_colored_nodes