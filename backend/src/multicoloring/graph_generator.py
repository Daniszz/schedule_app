import networkx as nx
import random

def generate_random_graph(n=15, p=0.3):
    """Random graph"""
    G = nx.erdos_renyi_graph(n, p)
    p_values = {node: random.randint(1, 3) for node in G.nodes}  
    gain = {node: random.randint(1, 100) for node in G.nodes}   
    return G, p_values, gain