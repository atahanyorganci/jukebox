# JukeBox

Discord bot for playing music from YouTube, add JukeBox to your server via [link](https://discord.com/oauth2/authorize?client_id=717888968519319576&scope=bot).

-   [JukeBox](#jukebox)
    -   [About](#about)
    -   [How it works](#how-it-works)
    -   [Usage](#usage)
    -   [Getting Started](#getting-started)
        -   [Prerequisites](#prerequisites)
        -   [Developing](#developing)
-   [Deployment](#deployment)
    -   [Built Using](#built-using)
    -   [Authors](#authors)

## About

Jukebox is simple Discord bot for playing music from YouTube directly to voice channels in the your server. Bot listens to text channels, after being summoned to play audio starts streaming only the audio portion of the given YouTube video.

## How it works

JukeBox connects to the Discord API using `discord.js` to interact with the Discord server. It listens for messages starting with the specified command prefix (e.g., `'!'`) in text channels. When a user sends a play command with a song name, JukeBox utilizes the YouTube API to search for the top search result for that song. Once the video is selected, JukeBox uses the `ytdl-core` library to download the audio portion of the YouTube video and plays it in the user's voice channel. This allows the bot to stream the music directly from YouTube to the voice channel.

## Usage

| Name    | Arguments    | Description                                                                          |
| ------- | ------------ | ------------------------------------------------------------------------------------ |
| !play   | [song name]  | Plays the top result from YouTube search with the given song name.                   |
| !pause  | -            | Pauses the current audio stream.                                                     |
| !resume | -            | Resumes the paused audio stream.                                                     |
| !skip   | -            | Skips the currently playing song. If it's the end of the queue, the bot disconnects. |
| !stop   | -            | Stops streaming audio and disconnects from the voice channel.                        |
| !queue  | -            | Lists all the songs in the queue along with the current song.                        |
| !np     | -            | Displays the currently playing song.                                                 |
| !remove | [number]     | Removes the song with the specified number from the queue.                           |
| !volume | [number]     | Sets the volume level of the audio stream (0-100).                                   |
| !info   | [bot/server] | Displays general information about the bot or the server.                            |
| !search | [song name]  | Searches YouTube for the given video name and displays the first result.             |
| !help   | -            | Prints information about available commands.                                         |

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js runtime version 18.16.0 or later, it can be downloaded from [official website](https://nodejs.org).
-   `pnpm` package manager for managing dependencies [installation instructions](https://pnpm.io/installation)
-   Discord bot token that is used to connect to Discord API, and can be obtained from [here](https://discord.com/developers/applications/).
-   YouTube API key is used for authenticating queries, and can be obtained from GCP.

### Developing

TypeScript compiler (`tsc`) is only used for typechecking for bundling ESBuild (`esbuild`) is used. Script `build.mjs` is used to invoke `esbuild` programmatically.

-   `build`: Executes the `build.mjs` script, which likely handles the compilation of TypeScript files into JavaScript.
-   `build:watch`: Uses Nodemon to watch for changes in TypeScript files and run `build` script
-   `check`: Runs the TypeScript compiler (`tsc`) to check the project's TypeScript code for errors.
-   `check:watch`: Similar to check but runs in watch mode, continuously checking for TypeScript errors during development.
-   `start`: Starts the bot using the compiled JavaScript bundle located in the dist directory.
-   `start:watch`: Uses Nodemon to watch for changes in the compiled JavaScript files and restarts the bot when changes are detected.
-   `dev`: Concurrently runs three npm scripts (`build:watch`, `check:watch`, and `start:watch`) in parallel during development.
-   `test`: Executes the vitest script, which likely runs the project's test suite.

# Deployment

Bot is deployed on [fly.io](https://fly.io) using [`Dockerfile`](./Dockerfile).

## Built Using

-   `discord.js`: An easy-to-use and performant library for interacting with the Discord API.
-   `@discordjs/voice`: Provides tools for voice-based functionalities in Discord.js.
-   `ytdl-core`: A library for downloading and streaming audio from YouTube.
-   `winston`: A versatile logging library for Node.js.
-   `zod`: A powerful TypeScript-first schema validation library.

## Authors

-   [@atahanyorganci](https://github.com/atahanyorganci)
