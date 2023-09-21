const express = require("express");
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const Trie = require("./trie.js");

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running on port 3000");
});

let trie = null;
let textContent = null;

const buildTrie = (text, trie) => {
    if (!trie) {
        trie = new Trie();
    }

    const words = text.split(/\s+/); // split by whitespace to get words

    words.forEach((word) => {
        trie.add(word);
    });
    return trie;
};

// Define a route for retrieving text files
app.get("/initializeTrie", async (req, res) => {
    if (!trie || !textContent) {
        try {
            const filePath = path.join(__dirname, "corpus", "hemingway.txt");
            // Check if the file exists
            await fs.promises.access(filePath);

            // Read the text file
            textContent = await fs.promises.readFile(filePath, "utf-8");

            trie = buildTrie(textContent, trie);
            console.log("Trie initialized");

            // Send the text content as a response
            res.status(200).send(textContent);
        } catch (err) {
            if (err.code === "ENOENT") {
                // The file does not exist (404 Not Found)
                res.status(404).send("Text not found.");
            } else {
                // Other error (500 Internal Server Error)
                console.error("Error retrieving text:", err);
                res.status(500).send("Internal Server Error");
            }
        }
    } else {
        res.status(200).send(textContent);
    }
});

function searchTrie(trie, searchTerm) {
    return trie.searchSimilarWords(searchTerm);
}

// route to handle trie search
app.get("/api/search", async (req, res) => {
    try {
        const searchTerm = req.query.query; // get query param
        console.log(`Finding "${searchTerm}" and similar results`);

        let searchResults = searchTrie(trie, searchTerm);
        // not best UX to send back *anything*, but we could improve search later
        // sends back to user first 3 words in trie in case no search results
        if (searchResults.length === 0) {
            searchResults = trie.getThreeWords();
        }

        // respond with results as JSON
        res.status(200).json({ searchResults });
    } catch (error) {
        console.error("Error in /api/search:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// route for counting exact instances of search term
app.get("/countExactInstances", (req, res) => {
    const { searchTerm } = req.query; // Get the searchTerm from the query paramaters

    if (!searchTerm || searchTerm.trim() === "") {
        return res.status(400).json({ error: "Invalid search term" });
    }

    // call method to count instances in trie
    const count = trie.getCount(searchTerm);

    // send count as JSON response
    res.status(200).json({ count });
});

function replaceText(textContent, searchTerm, replacementWord) {
    const regex = new RegExp(`\\b${searchTerm}\\b`, "g");
    textContent = textContent.replace(regex, replacementWord);
    return textContent;
}

// route for replacing text
app.post("/replaceText", (req, res) => {
    const { searchTerm, replacementWord } = req.body;
    console.log(`Replacing "${searchTerm}" with "${replacementWord}"`);

    // replace search term in cache content
    textContent = replaceText(textContent, searchTerm, replacementWord);
    trie.reset();
    trie = buildTrie(textContent, trie);

    // send updated text back to client
    res.status(200).send(textContent);
});

function deleteText(textContent, searchTerm) {
    // regex deletes spaces around word but preserves punctuation using capturing groups

    textContent = textContent.replace(
        new RegExp(`\\b${searchTerm}\\b`, "g"),
        ""
    );

    return textContent;
}

// route for deleting text
app.post("/deleteText", (req, res) => {
    const { searchTerm } = req.body;

    console.log(`Deleting instances of "${searchTerm}"`);

    // replace search term in cache content
    textContent = deleteText(textContent, searchTerm);
    // Ensure that the Trie is built after textContent is modified
    trie.reset();
    trie = buildTrie(textContent, trie);

    // send updated text back to client
    res.status(200).send(textContent);
});

// // start server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = {
    app,
    searchTrie,
    replaceText,
    deleteText,
};
