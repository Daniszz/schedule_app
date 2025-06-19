import sys
import json
import networkx as nx
from collections import defaultdict
from greedy import greedy_multicoloring
from descent_method import descent_coloring
from tabu_search import tabu_search
from utils import calculate_objectives

def convert_for_json(data):
    """Converteste set-uri și alte tipuri în structuri serializabile"""
    if isinstance(data, set):
        return list(data)
    elif isinstance(data, dict):
        return {str(k): convert_for_json(v) for k, v in data.items()}
    elif isinstance(data, (list, tuple)):
        return [convert_for_json(x) for x in data]
    return data

def evaluate_algorithm(G, p, l, D, gain, algorithm, **kwargs):
    """Evaluare algoritm care returnează rezultate serializabile"""
    coloring, fully_colored = algorithm(G, p, l, D, gain, **kwargs)
    total_gain, interruptions, color_range = calculate_objectives(G, coloring, gain)
    
    return {
        "coloring": coloring,
        "fully_colored": fully_colored,
        "metrics": {
            "total_gain": total_gain,
            "interruptions": interruptions,
            "color_range": color_range
        }
    }

def run_scheduler(input_data):
    G = nx.Graph()
    p = {}
    gain = {}
    
    # Construire graf din input
    for job in input_data["jobs"]:
        job_id = job["id"]
        G.add_node(job_id)
        p[job_id] = job["processing_time"]
        gain[job_id] = job["gain"]
    
    for edge in input_data["conflicts"]:
        G.add_edge(edge[0], edge[1])
    
    l = input_data["l"]
    D = input_data["D"]
    
    # Rulează toți algoritmii
    results = {
        "greedy": evaluate_algorithm(G, p, l, D, gain, greedy_multicoloring),
        "descent": evaluate_algorithm(G, p, l, D, gain, descent_coloring),
        "tabu": evaluate_algorithm(G, p, l, D, gain, tabu_search,
                                max_iter=100, tab=10, neighborhood_pct=0.25,
                                I=150, b_pct=0.2, strategy=2, q=20, gamma=0.2)
    }
    
    # Determină cel mai bun rezultat după total_gain
    best_result = max(results.values(), key=lambda x: x["metrics"]["total_gain"])
    
    # Pregătește output-ul final
    output = {
        "fully_colored_jobs": best_result["fully_colored"],
        "color_map": best_result["coloring"],
        "f1": best_result["metrics"]["total_gain"],
        "f2": best_result["metrics"]["interruptions"],
        "f3": best_result["metrics"]["color_range"],
        "algorithm_used": "greedy" if best_result == results["greedy"] else 
                         "descent" if best_result == results["descent"] else 
                         "tabu"
    }
    
    return convert_for_json(output)

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    result = run_scheduler(input_data)
    print(json.dumps(result), flush=True)