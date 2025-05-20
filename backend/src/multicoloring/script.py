import json
import sys
import networkx as nx
from tabu_search import tabu_search
from utils import calculate_objectives  # Înlocuiește cu modulul tău real
from greedy import greedy_multicoloring

def build_graph(jobs):
    G = nx.Graph()
    for job in jobs:
        G.add_node(job['id'])
    for i in range(len(jobs)):
        for j in range(i + 1, len(jobs)):
            res_i = set(jobs[i]['critical_resources'])
            res_j = set(jobs[j]['critical_resources'])
            if res_i & res_j:
                G.add_edge(jobs[i]['id'], jobs[j]['id'])
    return G

def main():
    input_data = json.load(sys.stdin)

    jobs = input_data['jobs']
    l = input_data['l']
    D = input_data['D']

    G = build_graph(jobs)
    p = {job['id']: job['processing_time'] for job in jobs}
    gain = {job['id']: job['gain'] for job in jobs}
    
    # # Parametri algoritm
    # max_iter = 1000
    # tab = 7
    # neighborhood_pct = 0.25
    # I = 150
    # b_pct = 0.2
    # strategy = 1
    # q = 10
    # gamma = 0.2

    # best_solution, fully_colored  = tabu_search(
    #     G, p, l, D, gain,
    #     max_iter=max_iter,
    #     tab=tab,
    #     neighborhood_pct=neighborhood_pct,
    #     I=I,
    #     b_pct=b_pct,
    #     strategy=strategy,
    #     q=q,
    #     gamma=gamma
    # )
    best_solution, fully_colored= greedy_multicoloring(G, p, l, D, gain)

    f1, f2, f3 = calculate_objectives(G, best_solution, gain)

    # Convertim set-urile în liste pentru JSON
    best_solution_serializable = {node: list(colors) for node, colors in best_solution.items()}
    fully_colored = list(fully_colored)
    result = {
        "color_map": best_solution_serializable,
        "fully_colored_jobs": fully_colored,
        "f1": f1,
        "f2": f2,
        "f3": f3
    }

    print(json.dumps(result))

if __name__ == "__main__":
    main()
