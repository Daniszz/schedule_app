from collections import defaultdict
import random
from utils import get_admissible_colors
from methods import renf,rsd,rdrop

def rexact(vertex, G, coloring, p, l, D, gain):
 
    Ai = get_admissible_colors(G, coloring, vertex, D, l)
    pi = p[vertex]
    
    if len(Ai) < pi:
        return set()
    
  
    BestS = {}
    Lint = {}
    Lrg = {}
    
    for q in range(1, pi + 1):
        for c in sorted(Ai):
            if q == 1:
                BestS[(q, c)] = [c]
                Lint[(q, c)] = 0
                Lrg[(q, c)] = 1
            else:
                Bestint = float('inf')
                Bestrg = float('inf')
                B = set()
                
                for c_prime in [x for x in Ai if x < c]:
                    if (q-1, c_prime) not in Lint:
                        continue
                    
                    if c - c_prime == 1:
                        Int = Lint[(q-1, c_prime)]
                    else:
                        Int = Lint[(q-1, c_prime)] + 1
                    
                    if Int == Bestint:
                        B.add(c_prime)
                    elif Int < Bestint:
                        Bestint = Int
                        B = {c_prime}
                
                if not B:
                    continue
                
                c_star = None
                candidates_for_tie_breaking = []
                
                for c_prime in B:
                    if (q-1, c_prime) not in Lrg:
                        continue
                    
                    Rg = Lrg[(q-1, c_prime)] + (c - c_prime)
                    
                    if Rg < Bestrg:
                        c_star = c_prime
                        Bestrg = Rg
                        candidates_for_tie_breaking = [c_prime]
                    elif Rg == Bestrg:
                        candidates_for_tie_breaking.append(c_prime)
                
                if len(candidates_for_tie_breaking) > 1:
                    for i, c_prime in enumerate(candidates_for_tie_breaking, 1):
                        if random.random() < 1.0/i:
                            c_star = c_prime
                elif candidates_for_tie_breaking:
                    c_star = candidates_for_tie_breaking[0]
                
                if c_star is None:
                    continue
                
                BestS[(q, c)] = BestS[(q-1, c_star)] + [c]
                Lint[(q, c)] = Bestint
                Lrg[(q, c)] = Bestrg
    
    best_solutions = []
    best_int = float('inf')
    best_rg = float('inf')
    
    for c in Ai:
        if (pi, c) in Lint and (pi, c) in Lrg:
            current_int = Lint[(pi, c)]
            current_rg = Lrg[(pi, c)]
            
            if (current_int < best_int or 
                (current_int == best_int and current_rg < best_rg)):
                best_int = current_int
                best_rg = current_rg
                best_solutions = [BestS[(pi, c)]]
            elif current_int == best_int and current_rg == best_rg:
                best_solutions.append(BestS[(pi, c)])
    
    if best_solutions:
        return set(best_solutions[0])
    else:
        return set()
        
def generate_neighborhood(G, current_solution, p, l, D, gain, strategy, tab, q, gamma, neighborhood_pct):
    
    neighborhood = []
    Q = [] 
    
    if strategy == 2:
        use_rexact = random.random() < gamma
    
    vertices = list(G.nodes())
    sample_size = max(1, int(neighborhood_pct * len(vertices)))
    sampled_vertices = random.sample(vertices, sample_size)
    
    for vertex in sampled_vertices:
        vertex_moves = []
        
        if (vertex in current_solution and 
            len(current_solution.get(vertex, [])) == p[vertex] and 
            random.random() < 0.25):
            
            new_coloring = rdrop(vertex, current_solution)
            vertex_moves.append(new_coloring)
        
        if random.random() < 0.25:
            Ai = get_admissible_colors(G, current_solution, vertex, D, l)
            
            if len(Ai) < p[vertex]:
                new_coloring = renf(G, current_solution, p, l, D, vertex, gain)
                
               
                
                if new_coloring != current_solution:
                    vertex_moves.append(new_coloring)
            
            else:
                if strategy == 1:
                    new_coloring = rsd(G, current_solution, p, l, D, vertex)
                    
                    if (new_coloring != current_solution and 
                        vertex in new_coloring and 
                        len(new_coloring[vertex]) == p[vertex]):
                        
                        vertex_moves.append(new_coloring)
                        
                        total_gain = sum(gain.get(v, 0) for v in G.nodes() 
                                       if v in new_coloring and len(new_coloring.get(v, [])) == p.get(v, 0))
                        Q.append((total_gain, vertex, new_coloring))
                
                elif strategy == 2:
                    if use_rexact:
                        exact_colors = rexact(vertex, G, current_solution, p, l, D, gain)
                        
                        if exact_colors and len(exact_colors) == p[vertex]:
                            new_coloring = current_solution.copy()
                            new_coloring[vertex] = list(exact_colors)
                            if new_coloring != current_solution:
                                vertex_moves.append(new_coloring)
                    else:
                        new_coloring = rsd(G, current_solution, p, l, D, vertex)
                        
                        if (new_coloring != current_solution and 
                            vertex in new_coloring and 
                            len(new_coloring[vertex]) == p[vertex]):
                            
                            vertex_moves.append(new_coloring)
        
        for move in vertex_moves:
            neighborhood.append((vertex, move))
    
    if strategy == 1 and Q:
        Q.sort(reverse=True, key=lambda x: x[0])
        
        top_q = Q[:q]
        
        num_exact = max(1, int(0.25 * len(top_q)))
        selected = random.sample(top_q, num_exact)
        
        for _, vertex, _ in selected:
            exact_colors = rexact(vertex, G, current_solution, p, l, D, gain)
            
            if exact_colors and len(exact_colors) == p[vertex]:
                new_coloring = current_solution.copy()
                new_coloring[vertex] = list(exact_colors)
                if new_coloring != current_solution:
                    neighborhood.append((vertex, new_coloring))
    
    return neighborhood
