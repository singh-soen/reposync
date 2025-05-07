document.addEventListener('DOMContentLoaded', () => {
    const repoName = localStorage.getItem('repoName');
    const email = localStorage.getItem('email');

    if (!repoName || !email) {
        alert("Error: Missing repository or user information.");
        window.location.href = 'list.html';
        return;
    }

    document.getElementById('heading').innerText = `Editing: ${repoName}`;

    // Load existing repository code
    fetch('http://127.0.0.1:5000/get_repository', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, repo_name: repoName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.repository) {
            document.getElementById('html-editor').value = data.repository.html_code || '';
            document.getElementById('css-editor').value = data.repository.css_code || '';
            document.getElementById('js-editor').value = data.repository.js_code || '';
        } else {
            alert('Repository not found');
        }
    })
    .catch(error => console.error('Error loading repository:', error));
});

// SAVE button functionality
function saveCode() {
    const email = localStorage.getItem('email');
    const repoName = localStorage.getItem('repoName');

    const htmlCode = document.getElementById('html-editor').value;
    const cssCode = document.getElementById('css-editor').value;
    const jsCode = document.getElementById('js-editor').value;

    fetch('http://127.0.0.1:5000/update_repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            repo_name: repoName,
            html_code: htmlCode,
            css_code: cssCode,
            js_code: jsCode
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error saving code:', error);
        alert('Failed to save repository.');
    });
}

function runCode() {
    const htmlCode = document.getElementById('html-editor').value;
    const cssCode = document.getElementById('css-editor').value;
    const jsCode = document.getElementById('js-editor').value;
  
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}<\/script>
        </body>
      </html>
    `);
    newWindow.document.close();
  }