document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const repoList = document.getElementById('publicRepoList');
  
    function fetchRepositories(query = '') {
      fetch('http://127.0.0.1:5000/get_all_repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      })
        .then(response => response.json())
        .then(data => {
          repoList.innerHTML = '';
  
          if (!data.repositories || data.repositories.length === 0) {
            repoList.innerHTML = '<p class="empty-text">No public repositories found.</p>';
            return;
          }
  
          data.repositories.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.innerHTML = `
              <h3>${repo.repo_name}</h3>
              <p><strong>Owner:</strong> ${repo.email}</p>
              <div class="repo-actions">
                <button class="btn view-btn" data-email="${repo.email}" data-repo="${repo.repo_name}">View</button>
              </div>
            `;
            repoList.appendChild(card);
          });
          
          document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const email = e.target.dataset.email;
              const repo = e.target.dataset.repo;
              localStorage.setItem('public_view_email', email);
              localStorage.setItem('public_view_repo', repo);
              window.location.href = 'view.html';
            });
          });
          
        })
        .catch(err => {
          console.error('Error fetching repositories:', err);
          repoList.innerHTML = '<p class="empty-text">Error fetching repositories.</p>';
        });
    }
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      fetchRepositories(query);
    });
  
    fetchRepositories();
  });
  