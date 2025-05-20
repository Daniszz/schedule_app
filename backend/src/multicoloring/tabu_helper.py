from collections import defaultdict
import random
from utils import get_admissible_colors
from methods import renf,rsd,rdrop
def rexact(vertex, G, coloring, p, l, D, gain):
    """
    Fixed exact recoloring procedure with proper DP table initialization
    """
    Ai = get_admissible_colors(G, coloring, vertex, D, l)
    pi = p[vertex]
    
    BestS = defaultdict(set)
    Lint = defaultdict(int)
    Lrg = defaultdict(int)
    
    for c in Ai:
        BestS[(1, c)] = {c}
        Lint[(1, c)] = 0
        Lrg[(1, c)] = 1
    
    for q in range(2, pi + 1):
        for c in Ai:
            Bestint = float('inf')
            Bestrg = float('inf')
            B = set()
            
            for c_prime in [x for x in Ai if x < c]:
                if (q-1, c_prime) not in Lint:
                    continue
                
                Int = Lint[(q-1, c_prime)] + (0 if c - c_prime == 1 else 1)
                
                if Int < Bestint:
                    Bestint = Int
                    B = {c_prime}
                elif Int == Bestint:
                    B.add(c_prime)
            
            c_star = None
            min_rg = float('inf')
            
            for c_prime in B:
                if (q-1, c_prime) not in Lrg:
                    continue
                    
                current_rg = Lrg[(q-1, c_prime)] + (c - c_prime)
                
                if current_rg < min_rg:
                    min_rg = current_rg
                    c_star = c_prime
            
            if c_star is not None:
                BestS[(q, c)] = BestS[(q-1, c_star)].union({c})
                Lint[(q, c)] = Bestint
                Lrg[(q, c)] = min_rg
    
    best_solution = None
    min_int = float('inf')
    min_rg = float('inf')
    
    for c in Ai:
        if (pi, c) not in Lint:
            continue
            
        if Lint[(pi, c)] < min_int or \
           (Lint[(pi, c)] == min_int and Lrg[(pi, c)] < min_rg):
            min_int = Lint[(pi, c)]
            min_rg = Lrg[(pi, c)]
            best_solution = BestS[(pi, c)]
    
    return best_solution if best_solution else set()

def generate_neighborhood(
    G, current_solution, p, l, D, gain,
    strategy, tab, q, gamma, neighborhood_pct
):
    neighborhood = []
    Q = []
    
    vertices = list(G.nodes())
    sample_size = max(1, int(neighborhood_pct * len(vertices)))
    vertices_sample = random.sample(vertices, sample_size)
    
    for vertex in vertices_sample:
        if random.random() < 0.25 and current_solution.get(vertex, []):
            new_coloring = current_solution.copy()
            new_coloring[vertex] = []
            neighborhood.append((vertex, new_coloring))
            continue
        
        if random.random() < 0.25:
            Ai = get_admissible_colors(G, current_solution, vertex, D, l)
            
            if len(Ai) < p[vertex]:
                new_coloring = renf(G, current_solution, p, l, D, vertex, gain)
                if new_coloring != current_solution and len(new_coloring[vertex]) == p[vertex]:
                    neighborhood.append((vertex, new_coloring))
            else:
                if strategy == 1:
                    new_coloring = rsd(G, current_solution, p, l, D, vertex)
                    if new_coloring != current_solution and len(new_coloring[vertex]) == p[vertex]:
                        neighborhood.append((vertex, new_coloring))
                        current_gain = sum(gain[v] for v in G.nodes() 
                                         if len(new_coloring.get(v, [])) == p.get(v, 0))
                        Q.append((current_gain, vertex))
                        Q.sort(reverse=True, key=lambda x: x[0])
                        Q = Q[:q]
                else:
                    if random.random() < gamma:
                        new_coloring = current_solution.copy()
                        exact_colors = rexact(vertex, G, current_solution, p, l, D, gain)
                        if exact_colors and len(exact_colors) == p[vertex]:
                            new_coloring[vertex] = list(exact_colors)
                            if new_coloring != current_solution:
                                neighborhood.append((vertex, new_coloring))
                    else:
                        new_coloring = rsd(G, current_solution, p, l, D, vertex)
                        if new_coloring != current_solution and len(new_coloring[vertex]) == p[vertex]:
                            neighborhood.append((vertex, new_coloring))
    
    if strategy == 1 and Q:
        num_exact = max(1, int(0.25 * len(Q)))
        selected = random.sample([v for (_, v) in Q], num_exact)
        
        for vertex in selected:
            new_coloring = current_solution.copy()
            exact_colors = rexact(vertex, G, current_solution, p, l, D, gain)
            if exact_colors and len(exact_colors) == p[vertex]:
                new_coloring[vertex] = list(exact_colors)
                if new_coloring != current_solution:
                    neighborhood.append((vertex, new_coloring))
    
    return neighborhood

def diversify_solution(coloring, b_pct=0.2):
    new_solution = {v: colors.copy() for v, colors in coloring.items()}
    colored_vertices = [v for v in coloring if coloring[v]]
    
    if colored_vertices:
        num_to_uncolor = max(1, int(b_pct * len(colored_vertices)))
        for vertex in random.sample(colored_vertices, num_to_uncolor):
            new_solution[vertex] = [] 
    
    return new_solution