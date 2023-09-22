const request = require("supertest");
const { app, searchTrie, replaceText, deleteText } = require("../app"); // Update the path to your Express app
const Trie = require("../trie.js");

let testTrie;

beforeEach(() => {
    testTrie = new Trie();
    testTrie.add("ebook");
    testTrie.add("ewok");
    testTrie.add("ebook.");
    testTrie.add("ebook:");
});

// search for exact term with prefixes
test('Search Trie for "ebook"', () => {
    const searchTerm = "ebook";
    const results = searchTrie(testTrie, searchTerm);
    expect(results).toEqual(["ebook", "ebook.", "ebook:"]);
});

// search for item not found in trie
test('Search Trie for "apple"', () => {
    const searchTerm = "apple";
    const results = searchTrie(testTrie, searchTerm);
    expect(results).toEqual([]);
});

// replace text
test("Replace text in content", () => {
    const searchTerm = "ebook";
    const replacementWord = "book";
    const originalText = "This is an ebook. Read the ebook.";

    const updatedText = replaceText(originalText, searchTerm, replacementWord);

    expect(updatedText).toEqual("This is an book. Read the book.");
});

// delete text
test("Delete text from content", () => {
    const searchTerm = "ebook";
    const originalText = "This is an ebook. Read the ebook.";

    const updatedText = deleteText(originalText, searchTerm);

    expect(updatedText).toEqual("This is an . Read the .");
});

// Define a setup function to initialize the Trie

// describe('API Endpoint Tests', () => {

//     it('should respond with search results for /api/search', async() => {

//         const searchTerm = 'ebook'; // test search term

//         const response = await request(app)
//             .get(`/api/search?query=${searchTerm}`);

//         expect(response.status).toBe(200);
//         // expect(response.body).toEqual({
//         //     searchResults: ['ebook', 'ebook.', 'ebook:']
//         // });
//     });

// });
