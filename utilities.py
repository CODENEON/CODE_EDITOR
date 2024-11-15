#Utility methods file
from dependencies import *

def find_keywords(query):
    kw_extractor = yake.KeywordExtractor()
    keywords = kw_extractor.extract_keywords(query)
    return [kw[0] for kw in keywords][:5]
    
class RecommendExpert:
    def __init__(self, save_file='recommend_expert_graph.pkl'):
        self.save_file = save_file
        # Load the graph from the save file if it exists
        self.graph = self.load_graph()

    def add_user(self, user_id, user_name, link, expertise):
        # Add the user node with its attributes
        self.graph.add_node(user_id, user_name=user_name, link=link, expertise=expertise)
        # Add an edge between the user and their expertise topic
        self.graph.add_edge(user_id, expertise)
        # Save the updated graph
        self.save_graph()

    def recommend_users(self, topic):
        """Recommend users with expertise in the specified topic."""
        try: 
            user_info = []
            neighbors = list(self.graph.neighbors(topic))
            for neighbour in neighbors:
                id = neighbour
                name = self.graph.nodes[id]['user_name']
                link = self.graph.nodes[id]['link']
                expertise = self.graph.nodes[id]['expertise']
                user_info.append({'user_id':neighbour, 'user_name': name, 'link': link, 'expertise':expertise})

            return user_info[:5] if neighbors else []
        except:
            return []

    def save_graph(self):
        """Save the graph to a file."""
        with open(self.save_file, 'wb') as f:
            pickle.dump(self.graph, f)

    def load_graph(self):
        """Load the graph from a file, or create a new one if the file does not exist."""
        if os.path.exists(self.save_file):
            with open(self.save_file, 'rb') as f:
                return pickle.load(f)
        return nx.Graph()  # Return a new empty graph if no file exists

RE = RecommendExpert()