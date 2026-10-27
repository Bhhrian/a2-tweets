let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	// Convert raw tweets into Tweet objects
    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // Keep only tweets containing user-written text
    writtenTweets = tweet_array.filter(tweet => tweet.written);

    console.log("User-written tweets:", writtenTweets.length);

    // Update search results after data finishes loading
    updateSearchResults();
}

function updateSearchResults() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const searchInput = document.getElementById('textFilter');
    const searchText = searchInput.value.trim().toLowerCase();

    const table = document.getElementById('tweetTable');

    // Clear previous search results
    table.innerHTML = '';

    document.getElementById('searchText').textContent =
        searchInput.value;

    // Empty search should show no results
    if (searchText === '') {
        document.getElementById('searchCount').textContent = '0';
        return;
    }

    // Search only user-written text
    const matches = writtenTweets.filter(tweet =>
        tweet.writtenText.toLowerCase().includes(searchText)
    );

    document.getElementById('searchCount').textContent =
        matches.length;

    // Populate the table
    matches.forEach((tweet, index) => {
        table.insertAdjacentHTML(
            'beforeend',
            tweet.getHTMLTableRow(index + 1)
        );
    });
}

function addEventHandlerForSearch() {
    const searchInput = document.getElementById('textFilter');

    // Update after every character entered or removed
    searchInput.addEventListener('input', updateSearchResults);

    updateSearchResults();
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});