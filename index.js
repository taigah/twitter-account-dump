import { TwitterApi } from 'twitter-api-v2'
import { createWriteStream } from 'fs'
import { writeFile, mkdir } from "fs/promises"
import https from "https"
import { parse } from 'path'

async function waitRateLimit(rateLimit) {
  if (rateLimit.remaining === 0) {
    const duration = rateLimit.reset * 1000 - Date.now()
    await sleep(duration)
  }
}

async function sleep(duration) {
  return new Promise(res => setTimeout(res, duration))
}

async function ensureDir(path) {
  try {
    await mkdir(path)
  } catch {}
}

function getUrlExt(url) {
  return parse(new URL(url).pathname).ext
}

async function download(url, out) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, res => {
      res.pipe(createWriteStream(out))
      res.on("end", () => resolve())
    })

    req.on("error", err => {
      reject(err)
    })
    
    req.end()
  })
}

async function writeTweetFile(tweet) {
  await ensureDir("tweets")
  await writeFile(`tweets/${tweet.id}.json`, JSON.stringify(tweet, null, "  "))
}

function selectVariant(variants) {
  for (const variant of variants) {
    if (variant.content_type === "application/x-mpegURL")
      continue
    return variant
  }
  return undefined
}

function getMediaUrl(media) {
  if (media.type === "video") {
    return selectVariant(media.video_info.variants)
  } else {
    return media.media_url_https
  }
}

async function writeMediaFile(media) {
  await ensureDir("media")
  const url = getMediaUrl(media)
  const ext = getUrlExt(url)
  await download(url, `media/${media.id}${ext}`)
}

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
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
      await writeTweetFile(tweet)
      const mediaList = tweet.extended_entities?.media || []
      for (const media of mediaList) {
        await writeMediaFile(media)
      }
    }

    await waitRateLimit(timeline.rateLimit)

    timeline = await timeline.next()
  }
} catch (err) {
  console.log(err)
  console.log(err.message)
}

