# JukeBox

Discord bot for playing music from YouTube, add JukeBox to your server via [link](https://discord.com/oauth2/authorize?client_id=717888968519319576&scope=bot).

- [JukeBox](#jukebox)
  - [About](#about)
  - [How it works](#how-it-works)
  - [Usage](#usage)
    - [Music Commands](#music-commands)
    - [Other Commands](#other-commands)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
  - [Built Using](#built-using)
  - [Future Plans](#future-plans)
  - [Authors](#authors)

## About

Jukebox is simple Discord bot for playing music from YouTube directly to voice channels in the your server. Bot listens to text channels, after being summoned to play audio starts streaming only the audio portion of the given YouTube video.

## How it works

The bot uses Discord's JavaScript API Discord.js using [env file](./.env.dev) initializes itself and connects to the server, and starts listening to text channels. If a message starts with specified command prefix (default is !) then the message is treated as bot command.

Each bot command consists of the command and its arguments, the bot warns the user through the channel in which it received the command and logs into the console.

Music search is done through YouTube API v3 instead of web scraping. Using the API over web scraping allows for more performance and reduces overhead. However, this means that to run this bot you need an Google API key.

The entire bot is developed with TypeScript v4.1.3, and Node.js 14.15.5 LTS version.

## Usage

To start playing a song join a voice channel type:
```
!play [song, name]
```
To use most of the music commands you need to be in same voice channel as the bot if the bot is already in voice channel.

The bot will then query YouTube search for the song and will pick first search result for the song. If it is not in a voice channel it will join the your voice channel, and will start streaming the video's audio.

### Music Commands
To run these commands you need to be in same voice channel with the bot if the bot is already in a voice channel, otherwise your command will be ignored. If bot is currently not in a voice channel it will try join your voice channel.

+ Play a Song
```
!play [song, name]
```
Picks the top result from YouTube search with song name you provide, and streams it into the voice channel. If the bot is already playing a song adds the YouTube link into queue.

+ Pause Streaming
```
!pause
```
Pauses the current audio stream.

+ Resume Streaming
```
!resume
```
Resumes the current audio stream.

+ Skip Currently Playing Song
```
!skip
```
Skips current song, if it is the end of queue, bot will disconnect from the voice channel.

+ Stop Streaming
```
!stop
```
Stops streaming audio and disconnects from the voice channel. Warning this command will remove any song in the queue.

+ Display Song Queue
```
!queue
```
Lists all the songs in the queue along with current song.

+ Display Currently Playing Song
```
!np
```
Displays current song.

+ Remove a Song from Queue
```
!remove [number]
```
Removes the song with specified number, to see each song with their song numbers you can use queue command.

+ Set Volume Level
```
!volume [level]
```
Sets the volume level of audio stream, argument should be a number between 0-100.

### Other Commands
+ Get information about the bot
```
!info bot
```
Prints general information about the bot into the text channel.

+ Get information about the server
```
!info server
```
Prints general information about the server into the text channel.

+ Search YouTube for a Video
```
!search Name of the Searched Video
```
Searches YouTube for given video name, and displays first result.

+ Get information about available commands
```
!help
```
Prints information about available commands into the text channel.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Node.js installation preferably LTS version 14.15.5 , it can be downloaded from the website.

### Installation

+ Using [Git](https://git-scm.com) version control clone this repository with the following command.
```shell
$ git clone https://github.com/atahanyorganci/jukebox.git
```

+ Using Node package manager (npm) install projects dependencies.
 ```shell
$ npm install
```
+ After installing the dependencies compile TypeScript files into JavaScript files.
 ```shell
$ tsc
```
+ Installation is now complete, now you can configure your bot.

### Configuration

Bot uses `.env` files to obtain configuration information, and if it cannot load the file falls back to using environment variables. An example `.env` file is provided under [`.env.dev`](./.env.dev), replace crosses with your Discord bot token, and YouTube API v3 key.

-  Discord bot token that is used to connect to Discord API, and can be obtained from [here](https://discord.com/developers/applications/).
- YouTube API key is used for authenticating queries, and can be obtained from GCP.

## Built Using

+ [discord.js](https://discord.js.org/) - easy to use, and performant wrapper for Discord API.
+ [YouTube API v3](https://developers.google.com/youtube/v3/) - Google's public API for querying YouTube content.
+ [TypeScript](https://www.typescriptlang.org/) - For scalability and compile time error checking.

## Future Plans

+ Playlists
+ DJ roles and better user interaction

## Authors
+ [@atahanyorganci](https://github.com/atahanyorganci)
