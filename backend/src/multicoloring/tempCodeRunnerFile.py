from graph_generator import generate_random_graph
from greedy import greedy_multicoloring
from visualize import visualize_coloring
from utils import calculate_objectives
from descent_method import descent_coloring
import random
from collections import defaultdict
from tabu_search import tabu_search

def evaluate_algorithm(G, p, l, D, gain, algorithm, algorithm_name, **kwargs):
    """Enhanced to handle algorithms with different parameters."""
    print(f"\nEvaluating {algorithm_name} algorithm...")
    coloring, fully_colored = algorithm(G, p, l, D, gain, **kwargs)
    total_gain, interruptions, color_range = calculate_objectives(G, coloring, gain)
    
    print(f"Total Gain: {total_gain}")
    print(f"Total Interruptions: {interruptions}")
    print(f"Total Color Range: {color_range}")
    print(f"Fully colored nodes: {len(fully_colored)}/{len(G.nodes)}")
    
    visualize_coloring(G, coloring, gain, p, title=f"{algorithm_name} Results")
    
    return coloring, (total_gain, interruptions, color_range)

def main():
    G, p, gain = generate_random_graph(n=20, p=0.3)
    l = 3
    D = 10 
    
    # Common parameters for all algorithms
    common_params = {
        'G': G,
        'p': p,
        'l': l,
        'D': D,
        'gain': gain
    }
    
    print("\n=== Greedy Algorithm ===")
    greedy_coloring, greedy_metrics = evaluate_algorithm(
        **common_params,
        algorithm=greedy_multicoloring,
        algorithm_name="Greedy Multi-Coloring"
    )
    
    print("\n=== Descent Method ===")
    descent_coloring_result, descent_metrics = evaluate_algorithm(
        **common_params,
        algorithm=descent_coloring,
        algorithm_name="Descent Method"
    )

    print("\n=== Tabu Search ===")
    tabu_coloring, tabu_metrics = evaluate_algorithm(
        **common_params,
        algorithm=tabu_search,
        algorithm_name="Tabu Search",
        # Tabu-specific parameters
        max_iter=100,
        tab=10,
        neighborhood_pct=0.25,
        I=150,
        b_pct=0.2,
        strategy=1,
        q=20,
        gamma=0.2
    )
    
    print("\n=== Comparison ===")
    print(f"Greedy Total Gain: {greedy_metrics[0]} vs "
          f"Descent: {descent_metrics[0]} vs "
          f"Tabu: {tabu_metrics[0]}")
    print(f"Greedy Interruptions: {greedy_metrics[1]} vs "
          f"Descent: {descent_metrics[1]} vs "
          f"Tabu: {tabu_metrics[1]}")
    print(f"Greedy Color Range: {greedy_metrics[2]} vs "
          f"Descent: {descent_metrics[2]} vs "
          f"Tabu: {tabu_metrics[2]}")

if __name__ == "__main__":
    main()