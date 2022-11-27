# YouTube Livestreams Action

Fetch YouTube livestreams from a YouTube channel (by channel id) and create files or
posts on a website.

## Inputs

### `api-key`

**Required** Google api key with access to YouTube Data API v3

### `channel-id`

**Required** YouTube channel id

### `max-results`

**Optional** Max number of results to return, defaults to 5

### `thumbnail-size`

**Optional** Thumbnail image size name, one of default, medium, high, standard,
maxres

### `output-path`

**Optional** Path to write output files to, defaults to `_data/streams`

### `output-filename-template`

**Optional** Output filename template for each output file including
placeholders, defaults to `${publishedAt}.yml`

### `output-content-template`

**Optional** Output content template for each output file including
placeholders[1], defaults to:

```
_id: '${id}'
etag: '${etag}'
title: '${title}'
description: '${description}'
thumbnailUrl: '${thumbnailUrl}'
channelId: '${channelId}'
channelTitle: '${channelTitle}'
videoId: '${videoId}'
publishedAt: '${publishedAt}'
publishTime: '${publishTime}'
duration: '${duration}'
actualStartTime: '${actualStartTime}'
actualEndTime: '${actualEndTime}'
```

[1]: Placeholders currently include the following fields from the YouTube
search and video details responses:

* `${id}`
* `${etag}`
* `${title}`
* `${description}`
* `${thumbnailUrl}`
* `${channelId}`
* `${channelTitle}`
* `${videoId}`
* `${publishedAt}`
* `${publishTime}`
* `${duration}`
* `${actualStartTime}`
* `${actualEndTime}`

## Example usage

```yaml
uses: InSourceSoftware/youtube-livestreams-action@v1
with:
  api-key: ${{ secrets.GOOGLE_API_KEY }}
  channel-id: 'xyz'
  max-results: '5'
  thumbnail-size: 'standard'
  output-path: '_data/streams'
  output-filename-template: '${publishedAt}.yml'
  output-content-template: |
    _id: '${id}'
    etag: '${etag}'
    title: '${title}'
    description: '${description}'
    thumbnailUrl: '${thumbnailUrl}'
    channelId: '${channelId}'
    channelTitle: '${channelTitle}'
    videoId: '${videoId}'
    publishedAt: '${publishedAt}'
    publishTime: '${publishTime}'
    duration: '${duration}'
    actualStartTime: '${actualStartTime}'
    actualEndTime: '${actualEndTime}'
```