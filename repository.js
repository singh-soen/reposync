function saveCode() {
    const repoName = document.getElementById('repo-name').value;
    const htmlCode = document.getElementById('html-editor').value;
    const cssCode = document.getElementById('css-editor').value;
    const jsCode = document.getElementById('js-editor').value;
    const email = localStorage.getItem('email'); // make sure email is stored in localStorage
  
    if (!repoName || !email) {
      alert('Repository name or Email missing!');
      return;
    }
  
    fetch('http://127.0.0.1:5000/save_repository', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoName, email: email, html_code: htmlCode, css_code: cssCode, js_code: jsCode })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => {
      console.error('Error saving repository:', error);
      alert('Error saving repository.');
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
  