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
            },
            extraKeys: {
                'Tab': function(cm) { cm.execCommand('autocomplete'); },  // Use Tab to trigger autocomplete
                'Enter': function(cm) {
                    if (cm.state.completionActive) {
                        cm.state.completionActive.widget.pick();  // Select the suggestion if active
                    } else {
                        cm.execCommand('newlineAndIndent');  // Otherwise, just create a new line
                    }
                }
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
                editor.on('inputRead', handleKeydown);
            } else {
                // Disable autocompletion (remove the inputRead listener)
                editor.off('inputRead', handleKeydown);
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
    console.log(query)
    searchStackOverflow(query);
}

function searchStackOverflow(query) {
    fetch('/search_stack_overflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Search results:", data);  // Log the search results for debugging
        displayResults(data); // Function to display the results on the page
    })
    .catch(error => console.error('Error:', error));
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

function displayResults(data) {
    const resultsContainer = document.getElementById("searchResults");
    console.log(data);
    resultsContainer.innerHTML = "";  // Clear any previous results

    if (data.items && data.items.length > 0) {
        // Loop through the search results and display them
        data.items.forEach(item => {
            const resultItem = document.createElement("li");
            resultItem.classList.add("list-group-item");
            
            // Add title link
            const titleLink = document.createElement("a");
            titleLink.href = item.link;
            titleLink.target = "_blank";  // Open in a new tab
            titleLink.textContent = item.title;
            resultItem.appendChild(titleLink);

            // Optionally add additional details
            const snippet = document.createElement("p");
            snippet.textContent = item.owner.display_name || "";
            resultItem.appendChild(snippet);

            // Append the result item to the results container
            resultsContainer.appendChild(resultItem);
            console.log("done");
        });
        
        // Make the search results container visible when there are results
        resultsContainer.style.display = "block";
    } else {
        // If no results found, display a message
        const noResultsMessage = document.createElement("li");
        noResultsMessage.classList.add("list-group-item");
        noResultsMessage.textContent = "No results found.";
        resultsContainer.appendChild(noResultsMessage);

        // Make the search results container visible when there are no results
        resultsContainer.style.display = "block";
    }
}

function clearOutput() {
    document.getElementById("outputArea").textContent = "";
}
