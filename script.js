document.addEventListener('DOMContentLoaded', function () {
    // Toggle light/dark mode
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    let isDarkMode = true;
    modeToggleBtn.addEventListener('click', toggleMode);

    function toggleMode() {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.body.style.background = 'linear-gradient(135deg, #111, #333)';
            modeToggleBtn.innerText = 'Switch to Light Mode';
        } else {
            document.body.style.background = 'linear-gradient(135deg, #f0f0f0, #fff)';
            modeToggleBtn.innerText = 'Switch to Dark Mode';
        }
    }

    // Search functionality
    const searchBar = document.getElementById('searchBar');
    const foldersContainer = document.getElementById('foldersContainer');

    searchBar.addEventListener('input', searchProjects);

    function searchProjects() {
        const searchQuery = searchBar.value.toLowerCase();
        const folders = document.querySelectorAll('.folder');

        folders.forEach(folder => {
            const folderName = folder.querySelector('h3').innerText.toLowerCase();
            const projectItems = folder.querySelectorAll('.project-item');

            let folderMatchesSearch = false;

            projectItems.forEach(projectItem => {
                const projectName = projectItem.querySelector('span').innerText.toLowerCase();
                if (projectName.includes(searchQuery)) {
                    projectItem.style.display = 'block'; // Show matching project
                    folderMatchesSearch = true; // If any project matches, the folder should be shown
                } else {
                    projectItem.style.display = 'none'; // Hide non-matching project
                }
            });

            // Show or hide the folder based on whether it contains matching projects
            if (folderMatchesSearch || folderName.includes(searchQuery)) {
                folder.style.display = 'block';
            } else {
                folder.style.display = 'none';
            }
        });
    }

    // Handle project upload
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', handleProjectUpload);

    function handleProjectUpload(e) {
        e.preventDefault();

        const projectName = document.getElementById('projectName').value;
        const fileInput = document.getElementById('fileInput');
        const categorySelect = document.getElementById('categorySelect').value;

        if (!fileInput.files[0] || !projectName) {
            alert('Please provide a project name and file.');
            return;
        }

        const file = fileInput.files[0];
        const folderName = categorySelect;

        const projectData = {
            name: projectName,
            file: file.name,
            category: folderName,
            url: URL.createObjectURL(file),
        };

        // Save the project in localStorage
        saveProjectToStorage(folderName, projectData);

        // Create and display the project in the appropriate folder
        createFolderIfNotExist(folderName); // Ensure folder container exists
        createProjectElement(projectData);
        fileInput.value = ''; // Clear file input
        document.getElementById('projectName').value = ''; // Clear project name
    }

    function saveProjectToStorage(folderName, projectData) {
        // Get existing folders from localStorage
        let folders = JSON.parse(localStorage.getItem('folders')) || {};

        // If folder doesn't exist, create it
        if (!folders[folderName]) {
            folders[folderName] = [];
        }

        // Add the new project to the respective folder
        folders[folderName].push(projectData);

        // Save the updated folder structure to localStorage
        localStorage.setItem('folders', JSON.stringify(folders));
    }

    function createFolderIfNotExist(folderName) {
        let folderContainer = document.getElementById(`${folderName}Container`);

        // If folder doesn't exist, create a new one
        if (!folderContainer) {
            folderContainer = document.createElement('div');
            folderContainer.id = `${folderName}Container`;
            folderContainer.classList.add('folder');
            const folderTitle = document.createElement('h3');
            folderTitle.innerText = folderName;
            folderContainer.appendChild(folderTitle);

            // Add download button for saving folder
            const downloadButton = document.createElement('button');
            downloadButton.innerText = `Download ${folderName}`;
            downloadButton.addEventListener('click', () => downloadFolder(folderName));
            folderContainer.appendChild(downloadButton);

            // Add delete folder button
            const deleteFolderButton = document.createElement('button');
            deleteFolderButton.innerText = `Delete Folder`;
            deleteFolderButton.style.backgroundColor = 'red';
            deleteFolderButton.style.marginLeft = '10px';
            deleteFolderButton.addEventListener('click', () => deleteFolder(folderName));
            folderContainer.appendChild(deleteFolderButton);

            foldersContainer.appendChild(folderContainer);
        }
    }

    function createProjectElement(projectData) {
        const folderContainer = document.querySelector(`#${projectData.category}Container`);
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project-item');

        const filePreview = document.createElement('img');
        filePreview.src = projectData.url;
        filePreview.alt = projectData.name;
        filePreview.style.width = '50px';
        filePreview.style.height = '50px';
        filePreview.style.objectFit = 'cover';

        const fileName = document.createElement('span');
        fileName.innerText = projectData.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.addEventListener('click', () => deleteProject(projectData, projectDiv));

        projectDiv.append(filePreview, fileName, deleteBtn);
        folderContainer.appendChild(projectDiv);
    }

    function deleteProject(projectData, projectDiv) {
        // Get the folder from localStorage
        let folders = JSON.parse(localStorage.getItem('folders')) || {};

        // Filter out the deleted project from the folder's projects
        folders[projectData.category] = folders[projectData.category].filter(
            (p) => p.name !== projectData.name
        );

        // Update localStorage
        localStorage.setItem('folders', JSON.stringify(folders));

        // Remove the project from the DOM
        projectDiv.remove();
    }

    function deleteFolder(folderName) {
        // Get the folder from localStorage
        let folders = JSON.parse(localStorage.getItem('folders')) || {};

        // Delete the folder from localStorage
        delete folders[folderName];

        // Update localStorage
        localStorage.setItem('folders', JSON.stringify(folders));

        // Remove the folder from the DOM
        const folderContainer = document.getElementById(`${folderName}Container`);
        folderContainer.remove();
    }

    // Load folders from localStorage when the page is loaded
    loadFoldersFromStorage();

    function loadFoldersFromStorage() {
        const folders = JSON.parse(localStorage.getItem('folders')) || {};

        for (const folderName in folders) {
            createFolderIfNotExist(folderName);
            folders[folderName].forEach(project => createProjectElement(project));
        }
    }

    // Download folder as a zip
    function downloadFolder(folderName) {
        const folders = JSON.parse(localStorage.getItem('folders')) || {};
        const folderData = folders[folderName];

        const zip = new JSZip();
        const folderZip = zip.folder(folderName);

        folderData.forEach(project => {
            folderZip.file(project.name, project.url.split(',')[1], { base64: true });
        });

        zip.generateAsync({ type: "blob" }).then(function(content) {
            saveAs(content, `${folderName}.zip`);
        });
    }
});
