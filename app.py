from flask import Flask, request, jsonify, render_template
import requests
import sys
import io
import webbrowser

# Initialize the Flask app
app = Flask(__name__)

STACK_OVERFLOW_API_URL = 'https://api.stackexchange.com/2.3/search'


@app.route('/')
def index():
    return render_template("index.html")

@app.route('/search_stack_overflow', methods=['POST'])
def search_stack_overflow():
    query = request.json['query']
    print(f"Search Query: {query}")  # Log the query for debugging
    response = requests.get(STACK_OVERFLOW_API_URL, params={'intitle': query, 'site': 'stackoverflow'})
    print(f"API Response: {response.json()}")  # Log the response for debugging
    return jsonify(response.json())

@app.route('/run_code', methods=['POST'])
def run_code():
    code = request.json.get('code')
    output = ""
    old_stdout = sys.stdout
    redirected_output = io.StringIO()
    sys.stdout = redirected_output

    try:
        # Try executing the code
        exec(code, {})
        output = redirected_output.getvalue()  # Capture any print output
    except SyntaxError as e:
        # Specifically catch syntax errors and return them
        output = f"Syntax Error: {str(e)}"
    except Exception as e:
        # Catch any other exceptions and return the error message
        output = f"Error: {str(e)}"
    finally:
        # Restore the original stdout to avoid affecting other parts of the program
        sys.stdout = old_stdout

    return jsonify({"output": output})

@app.route('/recommend_expert')
def recommend_expert():
    experts = ["Expert 1", "Expert 2"]  # Replace with actual expert recommendation logic
    return jsonify({"experts": ", ".join(experts)})

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")

if __name__ == "__main__":
    open_browser()  # Open the browser automatically when the app starts
    app.run(debug=True)
