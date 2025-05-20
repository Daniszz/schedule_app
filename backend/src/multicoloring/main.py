from graph_generator import generate_random_graph
from greedy import greedy_multicoloring
from visualize import visualize_coloring
from utils import calculate_objectives
from descent_method import descent_coloring  

def evaluate_algorithm(G, p, l, D, gain, algorithm, algorithm_name):
    """Evaluate and visualize results of a coloring algorithm."""
    print(f"\nEvaluating {algorithm_name} algorithm...")
    coloring, fully_colored = algorithm(G, p, l, D, gain)
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
    
    print("\n=== Greedy Algorithm ===")
    greedy_coloring, greedy_metrics = evaluate_algorithm(
        G, p, l, D, gain, greedy_multicoloring, "Greedy Multi-Coloring"
    )
    
    print("\n=== Descent Method ===")
    descent_coloring_result, descent_metrics = evaluate_algorithm(
        G, p, l, D, gain, descent_coloring, "Descent Method"
    )

    
    print("\n=== Comparison ===")
    print(f"Greedy Total Gain: {greedy_metrics[0]} vs Descent: {descent_metrics[0]} ")
    print(f"Greedy Interruptions: {greedy_metrics[1]} vs Descent: {descent_metrics[1]}")
    print(f"Greedy Color Range: {greedy_metrics[2]} vs Descent: {descent_metrics[2]} ")

if __name__ == "__main__":
    main()
