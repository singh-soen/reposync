document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('public_view_email');
    const repo = localStorage.getItem('public_view_repo');
  
    document.getElementById('heading').textContent = `Viewing: ${repo}`;
  
    fetch('http://127.0.0.1:5000/get_repository', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, repo_name: repo })
    })
    .then(res => res.json())
    .then(data => {
      const { html_code, css_code, js_code } = data.repository;
      document.getElementById('html-editor').value = html_code || '';
      document.getElementById('css-editor').value = css_code || '';
      document.getElementById('js-editor').value = js_code || '';
  
      // Attach runCode to the button now that DOM is ready
      document.querySelector('button[onclick="runCode()"]').addEventListener('click', runCode);
    })
    .catch(err => {
      alert('Failed to load repository');
      console.error(err);
    });
  });
  
  window.runCode = function() {
    const html = document.getElementById('html-editor').value;
    const css = document.getElementById('css-editor').value;
    const js = document.getElementById('js-editor').value;
  
    const output = `
      <!DOCTYPE html>
      <html>
      <head><style>${css}</style></head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
      </html>
    `;
  
    const iframe = document.getElementById('previewFrame');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(output);
    doc.close();
  }
  