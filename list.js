document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('email');
    const repoList = document.getElementById('repoList');
    const createRepoBtn = document.getElementById('createRepoBtn');

    function loadRepositories() {
        fetch('http://127.0.0.1:5000/get_repositories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            repoList.innerHTML = '';
            if (data.repositories.length === 0) {
                repoList.innerHTML = '<p class="empty-text">No repositories found. Click "Create New" to get started!</p>';
            } else {
                data.repositories.forEach(repo => {
                    const repoCard = document.createElement('div');
                    repoCard.className = 'repo-card';
                    repoCard.innerHTML = `
                        <h2>${repo.repo_name}</h2>
                        <div class="repo-actions">
                            <button class="btn open-btn" data-repo="${repo.repo_name}">Open</button>
                            <button class="btn delete-btn" data-repo="${repo.repo_name}">Delete</button>
                        </div>
                    `;
                    repoList.appendChild(repoCard);
                });

                document.querySelectorAll('.open-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const repoName = e.target.dataset.repo;
                        localStorage.setItem('repoName', repoName); // << updated key
                        window.location.href = 'saved_editor.html';  // << updated page
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const repoName = e.target.dataset.repo;
                        if (confirm(`Are you sure you want to delete "${repoName}"?`)) {
                            deleteRepository(repoName);
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading repositories:', error);
            repoList.innerHTML = '<p class="empty-text">Error loading repositories.</p>';
        });
    }

    createRepoBtn.addEventListener('click', () => {
        localStorage.removeItem('repoName');  // << updated key
        window.location.href = 'repository.html';
    });

    function deleteRepository(repoName) {
        fetch('http://127.0.0.1:5000/delete_repository', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, repo_name: repoName })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadRepositories();
        })
        .catch(error => {
            console.error('Error deleting repository:', error);
            alert('Error deleting repository.');
        });
    }

    loadRepositories();
});
