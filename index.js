const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const fs = require('fs');

const YOUTUBE_URL = 'https://youtube.googleapis.com';

main();

function main() {
  const apiKey = core.getInput('api-key');
  console.log('apiKey=***')
  const channelId = core.getInput('channel-id');
  console.log(`channel-id=${channelId}`);
  const maxResults = core.getInput('max-results');
  console.log(`max-results=${maxResults}`);
  const thumbnailSize = core.getInput('thumbnail-size');
  console.log(`thumbnailSize=${thumbnailSize}`);
  const outputPath = core.getInput('output-path');
  console.log(`outputPath=${outputPath}`);
  const outputFilenameTemplate = core.getInput('output-filename-template');
  console.log(`outputFilenameTemplate=${outputFilenameTemplate}`);
  const outputContentTemplate = core.getInput('output-content-template');
  console.log(`outputContentTemplate=${outputContentTemplate}`);

  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`payload=${payload}`);

  console.log('Fetching videos...');
  try {
    fetchVideos(apiKey, channelId, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate)
      .then(() => console.log('finished'));
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

async function fetchVideos(apiKey, channelId, maxResults, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate) {
  const data = await fetchPage(apiKey, channelId, maxResults, null);
  console.log(`found ${data.pageInfo.totalResults} total results`);
  const items = data.items
    .filter(item => Object.keys(item.snippet.thumbnails).length !== 0);
  const videoIds = items.map(item => item.id.videoId);
  const videoDetails = await fetchDetails(apiKey, videoIds);

  for (let index in items) {
    const item = items[index];
    const details = videoDetails.items.find(video => video.id === item.id.videoId);
    // Copy over additional or richer details
    if (details !== undefined) {
      item.snippet.thumbnails = details.snippet.thumbnails;
      item.contentDetails = details.contentDetails;
      item.liveStreamingDetails = details.liveStreamingDetails;
    } else {
      console.log(`details not found for ${item.id}`);
    }
    const filename = template(outputFilenameTemplate, item, thumbnailSize);
    const content = template(outputContentTemplate, item, thumbnailSize);
    await writeFile(outputPath, filename, content);
  }
}

function fetchPage(apiKey, channelId, maxResults, pageToken) {
  return new Promise((resolve, reject) => {
    let url = `${YOUTUBE_URL}/youtube/v3/search?key=${apiKey}&channelId=${channelId}&maxResults=${maxResults}&part=snippet&type=video&eventType=completed&order=date`;
    if (pageToken !== null) {
      url = `${url}&pageToken=${pageToken}`;
      console.log(`fetching page ${pageToken} of ${channelId}`);
    } else {
      console.log(`fetching first page of ${channelId}`);
    }
    const options = {
      'method': 'GET',
      'url': url,
      'headers': {}
    };
    request(options, (error, response) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(response.body));
    });
  });
}

function fetchDetails(apiKey, videoIds) {
  return new Promise((resolve, reject) => {
    const url = `${YOUTUBE_URL}/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=snippet,contentDetails,liveStreamingDetails`;
    const options = {
      'method': 'GET',
      'url': url,
      'headers': {}
    };
    request(options, (error, response) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(response.body));
    });
  });
}

function writeFile(outputPath, filename, content) {
  return new Promise((resolve, reject) => {
    fs.mkdir(outputPath, { recursive: true }, (error) => {
      if (error) {
        reject(error);
      }
      fs.writeFile(`${outputPath}/${filename}`, content, { encoding: 'utf-8' }, resolve);
    });
  });
}

function template(str, item, thumbnailSize) {
  const thumbnail = item.snippet.thumbnails[thumbnailSize] || item.snippet.thumbnails['default'];
  return str
    .replace('${id}', item.id.videoId)
    .replace('${etag}', item.etag)
    .replace('${title}', clean(item.snippet.title))
    .replace('${description}', clean(item.snippet.description))
    .replace('${thumbnailUrl}', thumbnail.url)
    .replace('${channelId}', item.snippet.channelId)
    .replace('${channelTitle}', clean(item.snippet.channelTitle))
    .replace('${videoId}', item.id.videoId)
    .replace('${publishedAt}', item.snippet.publishedAt)
    .replace('${publishTime}', item.snippet.publishTime)
    .replace('${duration}', item.contentDetails.duration)
    .replace('${actualStartTime}', item.liveStreamingDetails.actualStartTime)
    .replace('${actualEndTime}', item.liveStreamingDetails.actualEndTime);
}

function clean(str) {
  return str
    .replaceAll('\n', '\\n')
    .replaceAll('\'', '\'\'')
    .replaceAll('"', '\\"');
}