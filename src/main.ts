import { TwitterApi } from 'twitter-api-v2'
import { waitRateLimit } from "./helpers"
import { saveTweet } from './storage'

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
})

const client = twitterClient.readOnly
const userId = "1"

try {
  let timeline = await client.v1.userTimeline(userId, { exclude_replies: true })

  while (timeline.tweets.length !== 0) {
    for (const tweet of timeline.tweets) {
      console.log("saving tweet")
      await saveTweet(tweet)
    }

    await waitRateLimit(timeline.rateLimit)

    timeline = await timeline.next()
  }
} catch (err) {
  console.log(err)
  process.exit(1)
}

