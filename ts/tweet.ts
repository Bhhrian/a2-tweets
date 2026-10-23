class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const text = this.text.toLowerCase();

        if (text.startsWith("just completed") ||
            text.startsWith("just posted")) {
            return "completed_event";
        }

        if (text.includes("right now") ||
            text.includes("#rklive")) {
            return "live_event";
        }

        if (text.startsWith("achieved") ||
            text.includes("personal record") ||
            text.includes("goal reached")) {
            return "achievement";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        //TODO: parse the written text from the tweet
        let text = this.text
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/#Runkeeper/gi, "")
            .trim();

        // Remove default Runkeeper messages
        text = text
            .replace(/with @Runkeeper\.?\s*Check it out!/gi, "")
            .replace(/with @Runkeeper\.?/gi, "")
            .replace(/Check it out!/gi, "")
            .trim();

        // Remove standard completed activity prefix
        text = text.replace(
            /^Just (completed|posted) (a|an) .*?(?:run|walk|ride|workout|cycling|hike|swim|activity)\s*-\s*/i,
            ""
        );

        // Ignore remaining automatic activity descriptions
        if (/^Just (completed|posted)\b/i.test(text)) {
            return "";
        }

        // Ignore automatic live event messages
        if (/^Watch my .* right now/i.test(text)) {
            return "";
        }

        return text.trim();
    }


    get activityType():string {
        if (this.source !== 'completed_event') {
            return "unknown";
        }

        // Example: "Just completed a 4.87 km run"
        const distanceMatch = this.text.match(
            /\b\d+(?:\.\d+)?\s*(?:km|mi)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i
        );

        if (distanceMatch) {
            let activity = distanceMatch[1].toLowerCase();

            // Remove automatic trailing words
            activity = activity.replace(/\s+with$/, "");
            activity = activity.replace(/\s+in$/, "");

            return activity.trim();
        }

        // Handle activities expressed using duration
        const durationMatch = this.text.match(
            /Just (?:completed|posted) (?:a|an) (.+?)\s+in\s+\d/i
        );

        if (durationMatch) {
            return durationMatch[1].toLowerCase().trim();
        }

        return "unknown";
    }

    
    get distance():number {
        if (this.source !== 'completed_event') {
            return 0;
        }

        // Extract numerical distance and unit
        const match = this.text.match(
            /\b(\d+(?:\.\d+)?)\s*(km|mi)\b/i
        );

        if (!match) {
            return 0;
        }

        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();

        // Convert kilometers to miles
        if (unit === 'km') {
            return value / 1.609;
        }

        return value;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        // Escape text before inserting into HTML
        const escapeHTML = (value:string):string => {
            return value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        };

        // Identify the URL in the tweet
        const urlMatch = this.text.match(/https?:\/\/[^\s]+/i);

        // Remove URL and Runkeeper hashtag from displayed text
        let displayText = this.text
            .replace(/https?:\/\/[^\s]+/gi, "")
            .replace(/#Runkeeper\b/gi, "")
            .trim();

        let tweetHTML = escapeHTML(displayText);

        // Make the tweet URL clickable
        if (urlMatch) {
            const url = urlMatch[0];
            tweetHTML += ' <a href="' + escapeHTML(url) +
                '" target="_blank" rel="noopener noreferrer">' +
                'View Activity</a>';
        }

        return '<tr>' +
            '<td>' + rowNumber + '</td>' +
            '<td>' + escapeHTML(this.activityType) + '</td>' +
            '<td>' + tweetHTML + '</td>' +
            '</tr>';
    }
}