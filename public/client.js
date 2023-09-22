document.addEventListener("DOMContentLoaded", () => {
    const fetchTextContent = () => {
        // Fetch text content from the server
        fetch("/initialize-trie")
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    console.error(
                        "Error initializing Trie:",
                        response.statusText
                    );
                }
            })
            .then((data) => {
                const textContent = document.querySelector("#textContent");
                textString = data;
                textContent.textContent = data;
                console.log("Text content fetched");
            })
            .catch((error) => {
                console.error("Error fetching text content:", error);
            });
    };
    fetchTextContent();

    // search UI
    const searchInput = document.querySelector("#searchInput");
    const searchButton = document.querySelector("#searchButton");
    const replaceButton = document.querySelector("#replaceButton");
    const deleteButton = document.querySelector("#deleteButton");
    const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
    const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
    const deleteWarning = document.querySelector("#deleteWarning");
    const deleteUI = document.querySelector("#deleteUI");
    const wordCountResult = document.querySelector("#wordCountResult");
    const textContent = document.querySelector("#textContent");
    const replaceDone = document.querySelector("#replaceDone");
    const deleteDone = document.querySelector("#deleteDone");

    // navbar and side bar
    const openButton = document.querySelector(".open-btn");
    const closeButton = document.querySelector(".close-btn");
    const sidebar = document.querySelector(".sidebar");
    const navbar = document.querySelector("#navbar");

    // open side bar
    openButton.addEventListener("click", function () {
        sidebar.classList.add("active");
        navbar.classList.add("navbar-hide");
    });

    // close side bar
    closeButton.addEventListener("click", function () {
        sidebar.classList.remove("active");
        navbar.classList.remove("navbar-hide");
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchButton.click();
        }
    });

    searchInput.addEventListener("input", (event) => {
        replaceDone.style.display = "none";
        deleteDone.style.display = "none";
        deleteButton.style.display = "none";
        replaceButton.style.display = "none";
        resultsSection.style.display = "none";
        wordCountResult.style.display = "none";
    });

    let instanceCount = null;

    // Event listener for the search button
    searchButton.addEventListener("click", () => {
        const searchTerm = document.querySelector("#searchInput").value.trim();

        fetch(`/api/search?query=${searchTerm}`)
            .then((response) => response.json())
            .then((data) => {
                // handle search result from server
                if (/^\s*$/.test(searchTerm)) {
                    resultsSection.style.display = "none";
                    searchInput.value = "";
                    wordCountResult.style.display = "none";
                    deleteButton.style.display = "none";
                    replaceButton.style.display = "none";
                } else {
                    const similarWords = data.searchResults;

                    // Display the similar words in the "Results" section
                    const resultsList =
                        document.querySelector("#similarWordsList");
                    resultsList.innerHTML = "";
                    resultsSection.style.display = "block";

                    if (similarWords !== null) {
                        similarWords.forEach((word) => {
                            const li = document.createElement("li");
                            li.textContent = word;
                            resultsList.appendChild(li);
                        });
                    }

                    if (similarWords.length === 0) {
                        console.log("no similar words");
                        resultsHeader.style.display = "none";
                    } else {
                        resultsHeader.style.display = "inline-block";
                    }
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        // request to count exact instances
        if (searchTerm.trim() === "") {
            // when the search term is empty or contains only spaces
            console.log("Search term is empty or contains only spaces");
        } else {
            fetch(
                `/count-exact-instances?searchTerm=${encodeURIComponent(
                    searchTerm
                )}`
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    const count = data.count;
                    instanceCount = count;
                    wordCountResult.textContent = `${count} exact instances found`;
                    if (searchTerm) {
                        if (count > 0) {
                            replaceButton.style.display = "inline-block";
                            deleteButton.style.display = "inline-block";
                        } else if (count == 0) {
                            replaceButton.style.display = "none";
                            deleteButton.style.display = "none";
                        }
                        wordCountResult.style.display = "inline-block";
                    } else {
                        replaceButton.style.display = "none";
                        deleteButton.style.display = "none";
                        resultsHeader.style.display = "none";
                        wordCountResult.style.display = "none";
                    }
                })
                .catch((error) => {
                    console.error("Error counting exact instances:", error);
                });
        }
    });

    replaceButton.addEventListener("click", () => {
        searchInput.setAttribute("readonly", "readonly");
        deleteButton.style.display = "none";
        replaceButton.style.display = "none";
        resultsSection.style.display = "none";
        searchButton.style.display = "none";
        replaceUI.style.display = "block";
    });

    confirmReplace.addEventListener("click", () => {
        // Get the replacement word from the input field
        const replacementWord = replacementInput.value.trim();
        const searchTerm = document.querySelector("#searchInput").value.trim();
        const message = `You replaced all ${instanceCount} instances of "${searchTerm}" with "${replacementWord}".`;

        const requestBody = {
            searchTerm: searchTerm,
            replacementWord: replacementWord,
        };
        console.log(requestBody);

        fetch("/replace-text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    console.error("Error replacing text:", response.statusText);
                }
            })
            .then((data) => {
                // update displayed text content with the updated data received from server
                textContent.textContent = data;
                console.log("Text content updated");
            })
            .catch((error) => {
                console.error("Error replacing text:", error);
            });

        replaceUI.style.display = "none";
        replaceDone.style.display = "inline-block";
        replaceDone.textContent = message;
        searchInput.removeAttribute("readonly");
        searchInput.value = "";
        searchButton.style.display = "inline-block";
        wordCountResult.style.display = "none";
        resultsSection.style.display = "none";
    });

    cancelReplaceButton.addEventListener("click", () => {
        // Hide the search-related UI elements
        replacementInput.value = "";
        searchInput.removeAttribute("readonly");
        searchButton.style.display = "inline-block";
        wordCountResult.style.display = "none";
        resultsSection.style.display = "block";
        replaceUI.style.display = "none";
        wordCountResult.style.display = "inline-block";
        deleteButton.style.display = "inline-block";
        replaceButton.style.display = "inline-block";
    });

    deleteButton.addEventListener("click", () => {
        const wordToDelete = document
            .querySelector("#searchInput")
            .value.trim();
        const message = `Are you sure you want to delete all ${instanceCount} instances of "${wordToDelete}"? You can't reverse it 😢`;

        deleteWarning.textContent = message;
        deleteUI.style.display = "block";
        searchInput.setAttribute("readonly", "readonly");
        deleteButton.style.display = "none";
        replaceButton.style.display = "none";
        resultsSection.style.display = "none";
        searchButton.style.display = "none";
    });

    confirmDeleteButton.addEventListener("click", () => {
        // get the replacement word from the input field
        const searchTerm = document.querySelector("#searchInput").value.trim();
        const message = `You deleted all ${instanceCount} instances of "${searchTerm}".`;

        const requestBody = {
            searchTerm: searchTerm,
        };
        console.log(requestBody);

        fetch("/delete-text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    console.error("Error replacing text:", response.statusText);
                }
            })
            .then((data) => {
                // update displayed text content with the updated data received from server
                textContent.textContent = data;
                console.log("Text content updated");
            })
            .catch((error) => {
                console.error("Error replacing text:", error);
            });

        deleteUI.style.display = "none";
        deleteDone.style.display = "inline-block";
        deleteDone.textContent = message;
        searchInput.removeAttribute("readonly");
        searchInput.value = "";
        searchButton.style.display = "inline-block";
        wordCountResult.style.display = "none";
        resultsSection.style.display = "none";
    });

    cancelDeleteButton.addEventListener("click", () => {
        searchInput.removeAttribute("readonly");
        searchButton.style.display = "inline-block";
        wordCountResult.style.display = "none";
        resultsSection.style.display = "block";
        deleteUI.style.display = "none";
        deleteButton.style.display = "inline-block";
        replaceButton.style.display = "inline-block";
    });
});
