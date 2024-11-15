from dependencies import *
from utilities import *

# Initialize the Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/search_stack_overflow', methods=['POST'])
def search_stack_overflow():
    query = request.json.get('query')
    
    try:
        keywords = find_keywords(query)
        tags = "; ".join(keywords)
        tags = tags + '; ' + 'python'
        response = requests.get(
            STACK_OVERFLOW_API_URL,
            params={
                'intitle': query,
                'tagged': tags,       # Only search for questions tagged with 'python'
                'site': 'stackoverflow',
                'order': 'desc',
                'sort': 'votes'
            }
        )
        response.raise_for_status()  # Check if the request was successful
        response_data = response.json()  # Parse JSON response
        items = response_data.get('items', [])
        
        for item in items:
            owner = item.get('owner', {})
            if 'user_id' in owner and 'display_name' in owner and 'link' in owner:
                RE.add_user(owner['user_id'], owner['display_name'], owner['link'], keywords[0] if keywords else 'python')
            
        return jsonify(response_data)
    
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

@app.route('/recommend_expert', methods=['POST'])
def recommend_expert():
    query = request.json.get('query')

    try:
        # Extract keywords and search Stack Overflow
        keywords = find_keywords(query)
        top_keyword = keywords[0] if keywords else 'python'  # Use top keyword for expertise matching
        return jsonify(RE.recommend_users(top_keyword))
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error fetching recommendations'}), 500

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")

def open_browser_once():
    if not hasattr(open_browser_once, "opened"):
        open_browser()  # Open the browser automatically when the app starts
        open_browser_once.opened = True

if __name__ == "__main__":
    open_browser_once()  # Open the browser automatically when the app starts
    app.run(debug=True, use_reloader = False)