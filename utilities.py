#Utility methods file
from dependencies import *
class CQA:
    def __init__(self):
        self.graph = nx.Graph()  # Graph to model user-topic relationships

    def add_user(self, user_id, expertise):
        """Add a user with their expertise topics to the CQA graph."""
        self.graph.add_node(user_id, expertise=expertise)
        for topic in expertise:
            self.graph.add_edge(user_id, topic)

    def add_question(self, user_id, topic):
        """Link user questions to topics in the graph."""
        self.graph.add_edge(user_id, topic)

    def recommend_users(self, topic):
        """Recommend users with expertise in the specified topic."""
        neighbors = list(self.graph.neighbors(topic))
        return neighbors if neighbors else ["No experts found"]

