import { ensureDir, getUrlExt, getMediaUrl, download } from "./helpers"
import { writeFile } from "fs/promises"

export async function writeTweetFile(tweet: any) {
  await ensureDir("tweets")
  await writeFile(`tweets/${tweet.id}.json`, JSON.stringify(tweet, null, "  "))
}

export async function writeMediaFile(media: any) {
  await ensureDir("media")
  const url = getMediaUrl(media)
  const ext = getUrlExt(url)
  await download(url, `media/${media.id}${ext}`)
}

export async function saveTweet(tweet: any) {
  await writeTweetFile(tweet)
  const mediaList = tweet.extended_entities?.media || []
  for (const media of mediaList) {
    await writeMediaFile(media)
  }
}
