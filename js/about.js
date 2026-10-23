function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	const total = tweet_array.length;
	document.getElementById('numberTweets').innerText = tweet_array.length;
	if (total === 0) {
        return;
    }
	
    // Find earliest and latest tweet dates
    const times = tweet_array.map(tweet => tweet.time.getTime());

    const firstDate = new Date(Math.min(...times));
    const lastDate = new Date(Math.max(...times));

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    document.getElementById('firstDate').innerText =
        firstDate.toLocaleDateString('en-US', dateOptions);

    document.getElementById('lastDate').innerText =
        lastDate.toLocaleDateString('en-US', dateOptions);

    // Count tweets by category
    const completed = tweet_array.filter(
        tweet => tweet.source === 'completed_event'
    );

    const live = tweet_array.filter(
        tweet => tweet.source === 'live_event'
    );

    const achievements = tweet_array.filter(
        tweet => tweet.source === 'achievement'
    );

    const miscellaneous = tweet_array.filter(
        tweet => tweet.source === 'miscellaneous'
    );

    // Format percentages to exactly two decimal places
    function percentage(count, denominator) {
        if (denominator === 0) {
            return '0.00%';
        }

        return ((count / denominator) * 100).toFixed(2) + '%';
    }

    // Update all matching HTML elements
    function updateElements(className, value) {
        document.querySelectorAll('.' + className).forEach(
            element => {
                element.innerText = value;
            }
        );
    }

    updateElements('completedEvents', completed.length);
    updateElements('completedEventsPct', percentage(completed.length, total));

    updateElements('liveEvents', live.length);
    updateElements('liveEventsPct', percentage(live.length, total));

    updateElements('achievements', achievements.length);
    updateElements('achievementsPct', percentage(achievements.length, total));

    updateElements('miscellaneous', miscellaneous.length);
    updateElements('miscellaneousPct', percentage(miscellaneous.length, total));

    // Count completed tweets containing user-written text
    const written = completed.filter(tweet => tweet.written);

    updateElements('written', written.length);
    updateElements('writtenPct', percentage(written.length, completed.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});