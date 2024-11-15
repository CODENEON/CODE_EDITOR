// Global variable to store the CodeMirror editor instance
let editor;
// This function will be triggered when the search form is submitted
function searchStackOverflow(query) {

    const resultsContainer = document.getElementById("searchResults");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const resultsWrapper = document.getElementById("searchResultsWrapper");

    resultsContainer.style.display = "none";
    // Show the loading spinner
    loadingSpinner.style.display = "block";
    resultsContainer.innerHTML = "";  // Clear previous results

    // Hide the "No results" message if any
    resultsWrapper.querySelector('.no-results')?.remove();

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
            // Hide the loading spinner once the request is done
            loadingSpinner.style.display = "none";

            // Check if the response has items
            if (data.items && data.items.length > 0) {
                // Display the search results
                resultsContainer.innerHTML = data.items.map(item => {
                    return `\
                    <div>\
                        <a href="${item.link}" target="_blank">${item.title}</a><br>\
                        <small>By ${item.owner.display_name} - &#x1F441; ${item.view_count}</small>\
                    </div>`;
                }).join('');
                // Show the results container when results are available
                resultsContainer.style.display = "block";
            } else {
                // If no results, display a message
                resultsContainer.innerHTML = "";
                const noResultsMessage = document.createElement("div");
                noResultsMessage.classList.add("no-results");
                noResultsMessage.textContent = "No results found.";
                resultsWrapper.appendChild(noResultsMessage);
                // Hide the results container if no results
                resultsContainer.style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsContainer.innerHTML = "An error occurred while searching.";
            loadingSpinner.style.display = "none";
            // Hide the results container if an error occurs
            resultsContainer.style.display = "none";
        });
}


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
                'Tab': function (cm) { cm.showHint({ hint: CodeMirror.hint.python }); },  // Use Tab to trigger autocomplete
                'Enter': function (cm) {
                    if (cm.state.completionActive) {
                        cm.state.completionActive.widget.pick();  // Select the suggestion if active
                    } else {
                        cm.execCommand('newlineAndIndent');  // Otherwise, just create a new line
                    }
                }
            }
        });

        // Add event listener to toggle autocompletion when checkbox is changed
        document.getElementById('autocompleteToggle').addEventListener('change', function () {
            // Enable or disable the autocomplete feature based on checkbox status
            if (this.checked) {
                editor.setOption('extraKeys', {
                    'Tab': function (cm) { cm.showHint({ hint: CodeMirror.hint.python }); },  // Trigger autocomplete with Tab
                    'Enter': function (cm) {
                        if (cm.state.completionActive) {
                            cm.state.completionActive.widget.pick();  // Select the suggestion if active
                        } else {
                            cm.execCommand('newlineAndIndent');  // Otherwise, create a new line
                        }
                    }
                });
            } else {
                // Disable Tab-triggered autocomplete when checkbox is unchecked
                editor.setOption('extraKeys', {
                    'Enter': function (cm) {
                        cm.execCommand('newlineAndIndent');
                    }
                });
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
    // Ensure the CodeMirror editor instance is used
    const code = editor.getValue();  // Use the global `editor` instance to get the code

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

function recommendExpert(query) {
    fetch('/recommend_expert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner if it exists
            document.getElementById("loadingSpinner").style.display = "none";

            if (data && data.length > 0) {
                // Prepare the expert list for the modal
                const expertList = document.getElementById('expertList');
                expertList.innerHTML = ''; // Clear existing list
                data.forEach(expert => {
                    const expertCard = document.createElement('div');
                    expertCard.classList.add('expert-card');
                    expertCard.innerHTML = `
                    <h4>${expert.user_name || 'Unknown'}</h4>
                    <p>Expertise: ${expert.expertise || 'Unknown'}</p>
                    <a href="${expert.link}" target="_blank">Go to Profile</a>
                `;
                    expertList.appendChild(expertCard);
                });

                // Show the modal
                const modal = document.getElementById("expertModal");
                modal.style.display = "block";
            } else {
                alert("No experts found for your query.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsContainer.innerHTML = '<p>An error occurred while fetching experts.</p>';
            document.getElementById("loadingSpinner").style.display = "none";
        });
    closeModal();
}

function closeModal() {
    const closeModal = document.querySelector('.close');
    closeModal.addEventListener('click', function () {
        const modal = document.getElementById("expertModal");
        modal.style.display = "none"; // Hide the modal
    });

    // Close the modal if the user clicks outside of the modal content
    window.onclick = function (event) {
        const modal = document.getElementById("expertModal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}



function clearOutput() {
    document.getElementById("outputArea").textContent = "";
}
