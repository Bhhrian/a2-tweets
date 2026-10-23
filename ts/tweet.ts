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
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}