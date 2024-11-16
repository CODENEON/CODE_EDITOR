let editor;

load_editor();
fileOperationsEventListeners();
function searchStackOverflow(query) {

    const resultsContainer = document.getElementById("searchResults");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const resultsWrapper = document.getElementById("searchResultsWrapper");

    resultsContainer.style.display = "none";
    loadingSpinner.style.display = "block";
    resultsContainer.innerHTML = "";

    resultsWrapper.querySelector('.no-results')?.remove();

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
            loadingSpinner.style.display = "none";

            if (data.items && data.items.length > 0) {
                resultsContainer.innerHTML = data.items.map(item => {
                    return `\
                    <div>\
                        <a href="${item.link}" target="_blank">${item.title}</a><br>\
                        <small>By ${item.owner.display_name} - &#x1F441; ${item.view_count}</small>\
                    </div>`;
                }).join('');
                resultsContainer.style.display = "block";
            } else {
                resultsContainer.innerHTML = "";
                const noResultsMessage = document.createElement("div");
                noResultsMessage.classList.add("no-results");
                noResultsMessage.textContent = "No results found.";
                resultsWrapper.appendChild(noResultsMessage);
                resultsContainer.style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsContainer.innerHTML = "An error occurred while searching.";
            loadingSpinner.style.display = "none";
            resultsContainer.style.display = "none";
        });
}

function load_editor() {
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
}


//Toggling Search Button
function toggleSearchButton() {
    const queryInput = document.getElementById("query");
    const searchButton = document.getElementById("searchButton");

    // Enable the button if there's input, disable it otherwise
    if (queryInput.value.trim() !== "") {
        searchButton.disabled = false;
        searchButton.style.backgroundColor = ""; // Restore default color
        searchButton.style.cursor = "pointer"; // Change to pointer cursor
    } else {
        searchButton.disabled = true;
        searchButton.style.backgroundColor = "gray"; // Gray for disabled state
        searchButton.style.cursor = "not-allowed"; // Show "not-allowed" cursor
    }
}


// Function to handle form submit
function handleSearchSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const query = document.getElementById('searchQuery').value;
    searchStackOverflow(query);
}


function runCode() {
    // Ensure the CodeMirror editor instance is used
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

function recommendExpert(query) {
    const expertList = document.getElementById('expertList');
    const sidebar = document.getElementById('expertSidebar');
    const loadingSpinner = document.getElementById("loadingSpinner");

    expertList.innerHTML = '';
    loadingSpinner.style.display = "block";

    fetch('/recommend_expert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
        .then(response => response.json())
        .then(data => {

            loadingSpinner.style.display = "none";

            if (data && data.length > 0) {
                data.forEach(expert => {
                    const expertCard = document.createElement('div');
                    expertCard.classList.add('expert-card');
                    expertCard.innerHTML = `
                    <h4>${expert.user_name || 'Unknown'}</h4>
                    <p>Expertise: ${expert.expertise || 'Not specified'}</p>
                    <a href="${expert.link}" target="_blank">Go to Profile</a>
                `;
                    expertList.appendChild(expertCard);
                });
            } else {
                const noExpertsCard = document.createElement('div');
                noExpertsCard.classList.add('expert-card', 'no-experts');
                noExpertsCard.innerHTML = `
                <h4>No Experts Found</h4>
                <p>We couldn't find any experts matching your query.</p>
            `;
                expertList.appendChild(noExpertsCard);
            }

            sidebar.classList.add('open');
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.style.display = "none";

            const errorCard = document.createElement('div');
            errorCard.classList.add('expert-card', 'error-message');
            errorCard.innerHTML = `
            <h4>Error</h4>
            <p>An error occurred while fetching experts. Please try again later.</p>
        `;
            expertList.appendChild(errorCard);

            sidebar.classList.add('open');
        });
    closeSidebar();
}

function closeSidebar() {
    document.querySelector('.sidebar .close-btn').addEventListener('click', function () {
        const sidebar = document.getElementById('expertSidebar');
        sidebar.classList.remove('open');
    });
}



function clearOutput() {
    document.getElementById("outputArea").textContent = "";
}

function exportCode() {
    const code = editor.getValue();

    // Create a Blob with the code content
    const blob = new Blob([code], { type: 'text/plain' });

    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'code.py';  // Set the file name (you can customize it)

    // Trigger the download
    link.click();
}

function importCode(file) {
    const reader = new FileReader();

    // When the file is read, load it into the editor
    reader.onload = function (event) {
        const code = event.target.result;  // File content
        editor.setValue(code);  // Set the code in CodeMirror editor
    };

    // Read the file as text
    reader.readAsText(file);
}

function fileOperationsEventListeners() {
    document.getElementById('exportBtn').addEventListener('click', exportCode);
    document.getElementById('importBtn').addEventListener('click', function () {
        document.getElementById('importFile').click();  // Trigger the file input
    });

    document.getElementById('importFile').addEventListener('change', function (event) {
        const file = event.target.files[0];  // Get the selected file
        if (file) {
            importCode(file);  // Import the code from the file
        }
    });
}

