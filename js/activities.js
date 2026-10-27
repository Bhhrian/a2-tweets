function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // Convert raw tweets into Tweet objects
    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

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

    // Activity frequency bar chart
    const activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Number of tweets containing each activity type.",
        "data": {
            "values": activityData
        },
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

    vegaEmbed('#activityVis', activity_vis_spec, {
        actions: false
    });

    // Prepare distance data for the top three activities
    const topNames = topThree.map(([name]) => name);

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
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
        title: "Activity Type",
        legend: {
            title: "Activity Type"
        }
    };

    // Chart 1: Individual activity distances
    const distanceSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Individual activity distances by day.",
        "data": {
            "values": distanceData
        },
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
            "color": colorEncoding,
            "tooltip": [
                {
                    "field": "activity",
                    "type": "nominal",
                    "title": "Activity"
                },
                {
                    "field": "day",
                    "type": "ordinal",
                    "title": "Day"
                },
                {
                    "field": "distance",
                    "type": "quantitative",
                    "title": "Distance (miles)",
                    "format": ".2f"
                }
            ]
        },
        "width": 650,
        "height": 350
    };

    // Chart 2: Mean distance by day and activity
    const meanSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Mean activity distances by day.",
        "data": {
            "values": distanceData
        },
        "mark": {
            "type": "point",
			"filled": true,
			"size": 100
        },
        "encoding": {
            "x": dayEncoding,
            "y": {
                "aggregate": "mean",
                "field": "distance",
                "type": "quantitative",
                "title": "Mean Distance (miles)"
            },
            "color": colorEncoding,
            "tooltip": [
                {
                    "field": "activity",
                    "type": "nominal",
                    "title": "Activity"
                },
                {
                    "field": "day",
                    "type": "ordinal",
                    "title": "Day"
                },
                {
                    "aggregate": "mean",
                    "field": "distance",
                    "type": "quantitative",
                    "title": "Mean Distance (miles)",
                    "format": ".2f"
                }
            ]
        },
        "width": 650,
        "height": 350
    };

    // Render both distance charts
    vegaEmbed('#distanceVis', distanceSpec, {
        actions: false
    });

    vegaEmbed('#distanceVisAggregated', meanSpec, {
        actions: false
    });

    // Get chart containers and toggle button
    const individualChart = document.getElementById('distanceVis');
    const meanChart = document.getElementById('distanceVisAggregated');
    const aggregateButton = document.getElementById('aggregate');

    // Initially display individual distances
    individualChart.style.display = 'block';
    meanChart.style.display = 'none';

    let showingMeans = false;

    // Toggle between individual and mean distance charts
    aggregateButton.addEventListener('click', function() {
        showingMeans = !showingMeans;

        individualChart.style.display =
            showingMeans ? 'none' : 'block';

        meanChart.style.display =
            showingMeans ? 'block' : 'none';

        aggregateButton.innerText =
            showingMeans ? 'Show all activities' : 'Show means';
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function(event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
