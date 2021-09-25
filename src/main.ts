import { TwitterApi } from 'twitter-api-v2'
import { saveTweet } from './storage'
import { getTimeline } from "./twitter"

async function run () {
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
  })

  const client = twitterClient.readOnly
  const userId = "1"

  const timeline = getTimeline(client, userId)
  for await (const tweet of timeline) {
    console.log("saving tweet")
    await saveTweet(tweet)
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
