import { createWriteStream } from 'fs'
import { mkdir } from "fs/promises"
import { parse } from 'path'
import { request } from "https"

export async function sleep(duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration)
  })
}

export async function ensureDir(path: string): Promise<void> {
  try {
    await mkdir(path)
  } catch {}
}

export function getUrlExt(url: string): string {
  return parse(new URL(url).pathname).ext
}

export async function download(url: string, out: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = request(url, res => {
      res.pipe(createWriteStream(out))
      res.on("end", () => resolve())
      res.on("error", err => {
        reject(err)
      })
    })

    req.on("error", err => {
      reject(err)
    })
    
    req.end()
  })
}

export async function waitRateLimit(rateLimit: { remaining: number, reset: number }): Promise<void> {
  if (rateLimit.remaining === 0) {
    const duration = rateLimit.reset * 1000 - Date.now()
    await sleep(duration)
  }
}

export function selectVariant(variants: any): any | undefined {
  for (const variant of variants) {
    if (variant.content_type === "application/x-mpegURL")
      continue
    return variant
  }
  return undefined
}

export function getMediaUrl(media: any): string {
  if (media.type === "video") {
    return selectVariant(media.video_info.variants)
  } else {
    return media.media_url_https
  }
}
