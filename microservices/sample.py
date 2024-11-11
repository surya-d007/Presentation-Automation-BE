# similarity_api.py

from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util

# Initialize the Flask app
app = Flask(__name__)

# Load the model once when the API starts
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/compute_similarity', methods=['POST'])
def compute_similarity():
    # Parse the JSON request
    data = request.get_json()
    sentence1 = data.get("sentence1")
    sentence2 = data.get("sentence2")
    
    # Check if both sentences are provided
    if not sentence1 or not sentence2:
        return jsonify({"error": "Please provide both sentence1 and sentence2"}), 400
    
    # Compute embeddings
    embedding1 = model.encode(sentence1, convert_to_tensor=True)
    embedding2 = model.encode(sentence2, convert_to_tensor=True)
    
    # Compute cosine similarity and convert to percentage
    similarity = util.cos_sim(embedding1, embedding2).item()
    meaning_match_percentage = similarity * 100
    
    # Return the result as JSON
    return jsonify({
        "sentence1": sentence1,
        "sentence2": sentence2,
        "meaning_match_percentage": f"{meaning_match_percentage:.2f}%"
    })

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
