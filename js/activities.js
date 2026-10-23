function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
    // Get completed event tweets
    const completedTweets = tweet_array.filter(
        tweet => tweet.source === 'completed_event'
    );

    // Count each activity type
    const activityCounts = {};

    completedTweets.forEach(tweet => {
        const activity = tweet.activityType;

        if (activity !== 'unknown' && activity !== '') {
            activityCounts[activity] =
                (activityCounts[activity] || 0) + 1;
        }
    });

    // Sort activities by frequency
    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1]);

    // Get the three most popular activities
    const topThree = sortedActivities.slice(0, 3);

    console.log("Top 3 Activities:", topThree);

	// Calculate average distance for each top activity
    topThree.forEach(([activity, count]) => {
        const distances = completedTweets
            .filter(tweet =>
                tweet.activityType === activity &&
                tweet.distance > 0
            )
            .map(tweet => tweet.distance);

        const average = distances.length > 0
            ? distances.reduce((sum, d) => sum + d, 0) /
              distances.length
            : 0;

        console.log(
            activity,
            "Count:", count,
            "Average distance:", average.toFixed(2), "miles"
        );
    });

	

    // Prepare data for the activity frequency chart
    const activityData = sortedActivities.map(([activity, count]) => {
        return {
            activity: activity,
            count: count
        };
    });

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  //TODO: Add mark and encoding
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "activity",
				"type": "nominal",
				"sort": "-y",
				"title": "Activity Type"
			},
			"y": {
				"field": "count",
				"type": "quantitative",
				"title": "Number of Tweets"
			},
			"tooltip": [
				{
					"field": "activity",
					"type": "nominal"
				},
				{
					"field": "count",
					"type": "quantitative"
				}
			]
		},
		"width": 650,
		"height": 350
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
    // Prepare distance data for the top three activities
    const topNames = topThree.map(([name]) => name);

    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
    ];

    const distanceData = completedTweets
        .filter(tweet =>
            topNames.includes(tweet.activityType) &&
            tweet.distance > 0
        )
        .map(tweet => ({
            activity: tweet.activityType,
            distance: tweet.distance,
            day: days[tweet.time.getUTCDay()]
        }));

    // Shared Vega-Lite encodings
    const dayEncoding = {
        field: "day",
        type: "ordinal",
        sort: days,
        title: "Day of the Week"
    };

    const colorEncoding = {
        field: "activity",
        type: "nominal",
        title: "Activity Type"
    };

    // Plot 1: Individual distances
    const distanceSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": { "values": distanceData },
        "mark": {
            "type": "point",
            "opacity": 0.3
        },
        "encoding": {
            "x": dayEncoding,
            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance (miles)"
            },
            "color": colorEncoding
        },
        "width": 650,
        "height": 350
    };

    // Plot 2: Mean distance by day and activity
    const meanSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": { "values": distanceData },
        "mark": {
            "type": "line",
            "point": true
        },
        "encoding": {
            "x": dayEncoding,
            "y": {
                "aggregate": "mean",
                "field": "distance",
                "type": "quantitative",
                "title": "Mean Distance (miles)"
            },
            "color": colorEncoding
        },
        "width": 650,
        "height": 350
    };

    // Render both charts
    vegaEmbed('#distanceVis', distanceSpec, {
        actions: false
    });

    vegaEmbed('#distanceVisAggregated', meanSpec, {
        actions: false
    });

    // Initially show individual distances
    const individualChart = document.getElementById('distanceVis');
    const meanChart = document.getElementById('distanceVisAggregated');
    const aggregateButton = document.getElementById('aggregate');

    meanChart.style.display = 'none';

    // Toggle between individual and mean distance charts
    let showingMeans = false;

    aggregateButton.addEventListener('click', function() {
        showingMeans = !showingMeans;

        individualChart.style.display =
            showingMeans ? 'none' : 'block';

        meanChart.style.display =
            showingMeans ? 'block' : 'none';

        aggregateButton.innerText =
            showingMeans ? 'Show individual distances' : 'Show means';
    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});