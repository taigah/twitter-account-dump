import { TwitterApiReadOnly, Tweet } from "./types"
import { sleep } from './helpers'

export async function waitRateLimit(rateLimit: { remaining: number, reset: number }): Promise<void> {
  if (rateLimit.remaining === 0) {
    const duration = rateLimit.reset * 1000 - Date.now()
    await sleep(duration)
  }
}

export async function* getTimeline(client: TwitterApiReadOnly, userId: string): AsyncGenerator<Tweet, void, void> {
  let timeline = await client.v1.userTimeline(userId, { exclude_replies: true })

  while (timeline.tweets.length !== 0) {
    for (const tweet of timeline.tweets) {
      yield tweet
    }

    await waitRateLimit(timeline.rateLimit)

    timeline = await timeline.next()
  }
}
