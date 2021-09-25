import { ensureDir, getUrlExt, getMediaUrl, download } from "./helpers"
import { writeFile } from "fs/promises"
import { Media, Tweet } from './types'

export async function writeTweetFile(tweet: Tweet) {
  await ensureDir("tweets")
  await writeFile(`tweets/${tweet.id}.json`, JSON.stringify(tweet, null, "  "))
}

export async function writeMediaFile(media: Media) {
  await ensureDir("media")
  const url = getMediaUrl(media)
  console.log(url)
  const ext = getUrlExt(url)
  await download(url, `media/${media.id}${ext}`)
}

export async function saveTweet(tweet: Tweet) {
  await writeTweetFile(tweet)
  const mediaList = tweet.extended_entities?.media || []
  for (const media of mediaList) {
    await writeMediaFile(media)
  }
}
