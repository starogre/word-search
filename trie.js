// Trie data structure implementation
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.wordsWithPrefix = [];
        this.count = 0;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    // insert a word into the Trie
    add(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
            node.wordsWithPrefix.push(word); // Add the word to the current node's wordsWithPrefix array
        }
        node.isEndOfWord = true;
        node.count++;
    }

    // Search for words that share a common prefix with the query
    searchSimilarWords(query) {
        const similarWords = new Set(); // Use a Set to store unique words, auto deletes duplicates

        // Try to find words containing the query as a prefix
        for (let len = query.length; len >= 1; len--) {
            const prefix = query.substring(0, len);
            const foundWords = this.searchWordsWithPrefix(prefix);

            // Add found words to the result set
            foundWords.forEach((word) => similarWords.add(word));

            if (similarWords.size >= 3) {
                break; // Stop if we found at least 3 unique similar words
            }
        }

        // If not enough similar words found, try to find words containing the query as a substring
        if (similarWords.size < 3) {
            const foundSubstringWords = this.searchWordsWithSubstring(query);
            foundSubstringWords.forEach((word) => similarWords.add(word));
        }

        // Convert the Set back to an array and limit the results to 3
        return Array.from(similarWords).slice(0, 3);
    }

    searchWordsWithPrefix(prefix) {
        const similarWords = [];
        const dfs = (node, currentPrefix) => {
            if (node.isEndOfWord) {
                similarWords.push(currentPrefix);
            }
            for (const [char, childNode] of node.children) {
                dfs(childNode, currentPrefix + char);
            }
        };

        dfs(this.root, "");

        // Filter words that start with the prefix
        const filteredWords = similarWords.filter((word) =>
            word.startsWith(prefix)
        );

        return filteredWords.slice(0, 3); // Limit the results to 3
    }

    searchWordsWithSubstring(substring) {
        const similarWords = [];

        const dfs = (node, currentPrefix) => {
            if (node.isEndOfWord) {
                similarWords.push(currentPrefix);
            }
            for (const [char, childNode] of node.children) {
                dfs(childNode, currentPrefix + char);
            }
        };

        dfs(this.root, "");

        // Filter words that contain the substring anywhere
        const filteredWords = similarWords.filter((word) =>
            word.includes(substring)
        );

        return filteredWords.slice(0, 3); // Limit the results to 3
    }

    getCount(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                return 0;
            }
            node = node.children.get(char);
        }
        return node.count;
    }

    getThreeWords() {
        const firstThreeWords = [];
        let count = 0;

        // Helper function for depth-first traversal
        const dfs = (node, currentWord) => {
            if (count >= 4) {
                return; // Stop traversal after finding 3 words, skips the first word which is just ''
            }
            if (node.isEndOfWord) {
                firstThreeWords.push(currentWord);
                count++;
            }
            for (const [char, childNode] of node.children) {
                dfs(childNode, currentWord + char);
            }
        };

        dfs(this.root, "");
        return firstThreeWords;
    }

    reset() {
        this.root = new TrieNode(); // Reset the root node
    }
}

module.exports = Trie;
