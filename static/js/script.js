// Global variable to store the CodeMirror editor instance
let editor;

document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor) {
        editor = CodeMirror.fromTextArea(codeEditor, {
            lineNumbers: true,
            mode: "python",
            theme: "material-darker",
            hintOptions: {
                completeSingle: false // Do not automatically complete when there's only one suggestion
            }
        });

        // Function to handle keydown event for autocompletion
        const handleKeydown = function(cm, event) {
            // Check if autocompletion is enabled and if a key was pressed
            if (document.getElementById('autocompleteToggle').checked) {
                cm.showHint({
                    hint: CodeMirror.hint.python  // Enable Python-specific autocompletion
                });
            }
        };

        // Add event listener to toggle autocompletion when checkbox is changed
        document.getElementById('autocompleteToggle').addEventListener('change', function() {
            // Enable or disable the autocomplete feature based on checkbox status
            if (this.checked) {
                // Enable autocompletion
                editor.on('keydown', handleKeydown);
            } else {
                // Disable autocompletion (remove the keydown listener)
                editor.off('keydown', handleKeydown);
            }
        });
    }

    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.style.display = "none";
});

// Function to handle form submit
function handleSearchSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const query = document.getElementById('searchQuery').value;
    searchStackOverflow(query);
}

// Function to handle running code
function runCode() {
    // Get the code from the CodeMirror editor
    const code = editor.getValue();

    // Display a loading message
    document.getElementById("outputArea").textContent = "Running...";

    // Use fetch to send the code to the backend for execution
    fetch('/run_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })  // Send the code as a JSON payload
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();  // Parse the JSON response
    })
    .then(data => {
        // Display the result or error message in the output area
        if (data.error) {
            document.getElementById("outputArea").textContent = "Error: " + data.error;
        } else {
            document.getElementById("outputArea").textContent = data.output;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("outputArea").textContent = "An error occurred while running the code.";
    });
}

function clearOutput() {
    document.getElementById("outputArea").textContent = "";
}
