from dependencies import *
from utilities import *

# Initialize the Flask app
app = Flask(__name__)

# routes and functions
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/search_stack_overflow', methods=['POST'])
def search_stack_overflow():
    query = request.json.get('query')
    print(f"Search Query: {query}")  # Log the query for debugging
    
    try:
        response = requests.get(
            STACK_OVERFLOW_API_URL,
            params={
                'intitle': query,
                'tagged': 'python',       # Only search for questions tagged with 'python'
                'site': 'stackoverflow',
                'order': 'desc',
                'sort': 'activity'
            }
        )
        response.raise_for_status()  # Check if the request was successful
        print(f"API Response: {response.json()}")  # Log the response for debugging
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")  # Log any request errors
        return jsonify({'error': 'An error occurred while processing your request.'}), 500

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

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")

def open_browser_once():
    if not hasattr(open_browser_once, "opened"):
        open_browser()  # Open the browser automatically when the app starts
        open_browser_once.opened = True

if __name__ == "__main__":
    open_browser_once()  # Open the browser automatically when the app starts
    app.run(debug=True, use_reloader = False)