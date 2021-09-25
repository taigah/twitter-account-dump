import { createWriteStream } from 'fs'
import { mkdir } from "fs/promises"
import { parse } from 'path'
import { request } from "https"
import { Media, MediaVariant } from './types'

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

export function selectVariant(variants: MediaVariant[]): MediaVariant | undefined {
  for (const variant of variants) {
    if (variant.content_type === "application/x-mpegURL")
      continue
    return variant
  }
  return undefined
}

export function getMediaUrl(media: Media): string {
  if (media.type === "video") {
    const variants = media.video_info?.variants
    if (variants !== undefined) {
      const variant = selectVariant(variants)
      if (variant !== undefined)
        return variant.url
    }
  }
  return media.media_url_https
}
