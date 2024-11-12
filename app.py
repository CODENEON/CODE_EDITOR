from dependencies import *
from utilities import *

# Route for the main editor page
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/search_stack_overflow', methods=['POST'])
def search_stack_overflow():
    query = request.form['query']
    response = requests.get(STACK_OVERFLOW_API_URL, params={'intitle': query, 'site': 'stackoverflow'})
    return jsonify(response.json())

@app.route('/run_code', methods=['POST'])
def run_code():
    code = request.json.get('code')
    output = ""
    old_stdout = sys.stdout
    redirected_output = io.StringIO()
    sys.stdout = redirected_output

    try:
        exec(code, {})
        output = redirected_output.getvalue()
    except Exception as e:
        output = str(e)
    finally:
        sys.stdout = old_stdout

    return jsonify({"output": output})

@app.route('/recommend_expert')
def recommend_expert():
    experts = ["Expert 1", "Expert 2"]  # Replace with actual expert recommendation logic
    return jsonify({"experts": ", ".join(experts)})

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")


if __name__ == "__main__":
    open_browser()   
    app.run(debug=True)