"use client";

interface ImageLoaderOptions {
  src: string;
  width?: number;
  quality?: number;
}

/** Keep external media out of the server-side image fetcher and serve local assets directly. */
export default function imageLoader({ src }: ImageLoaderOptions): string {
  return src;
}

