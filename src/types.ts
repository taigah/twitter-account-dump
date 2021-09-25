export type { TwitterApiReadOnly, TweetV1 as Tweet, MediaEntityV1 as Media } from "twitter-api-v2"

export interface MediaVariant {
  bitrate: number
  content_type: string
  url: string
}
