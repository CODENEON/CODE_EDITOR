// Global variable to store the CodeMirror editor instance
let editor;

// This function will be triggered when the search form is submitted
function searchStackOverflow(query) {
    // Display a loading message
    console.log('Query being sent:', query);
    document.getElementById("searchResults").innerHTML = "Searching...";

    // Use fetch to make the AJAX request
    fetch('/search_stack_overflow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })  // Send query as JSON payload
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();  // Parse the JSON response
    })
    .then(data => {
        // Log the entire response data to the console
        console.log(data);

        const resultsContainer = document.getElementById("searchResults");
        
        // Check if the response has items
        if (data.items && data.items.length > 0) {
            // Display the search results
            resultsContainer.innerHTML = data.items.map(item => {
                return `\
                    <div>\
                        <a href="${item.link}" target="_blank">${item.title}</a><br>\
                        <small>By ${item.owner.display_name} - ${item.creation_date}</small>\
                    </div>`;
            }).join('');
        } else {
            resultsContainer.innerHTML = "No results found.";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("searchResults").innerHTML = "An error occurred while searching.";
    });
}

// Initialize the code editor using CodeMirror
document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor) {
        editor = CodeMirror.fromTextArea(codeEditor, {
            lineNumbers: true,
            mode: "python",  // You can change this to the mode of your choice
            theme: "material-darker"
        });
    }
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
