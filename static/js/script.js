// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    lineNumbers: true,
    mode: "python",
    theme: "material-darker",
});

// AJAX for Stack Overflow search results
$("#searchForm").on("submit", function(event) {
    event.preventDefault();
    $.ajax({
        url: "/search_stack_overflow",
        type: "POST",
        data: { query: $("#query").val() },
        success: function(data) {
            let resultsHtml = "<h5>Search Results</h5><ul class='list-group'>";
            data.items.slice(0, 5).forEach(item => {
                resultsHtml += `<li class='list-group-item bg-light'><a href='${item.link}' target='_blank'>${item.title}</a></li>`;
            });
            resultsHtml += "</ul>";
            $("#searchResults").html(resultsHtml);
        }
    });
});

// Run code and display output
function runCode() {
    $.ajax({
        url: "/run_code",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ code: editor.getValue() }),
        success: function(data) {
            $("#outputArea").text(data.output);
        }
    });
}

// Recommend experts
function recommendExpert() {
    $.get("/recommend_expert", function(data) {
        alert(data.experts);
    });
}
