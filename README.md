# VideoCutTool

An online tool to cut/trim videos in Wikimedia commons.

See live demo at: [VideoCutTool](https://videocuttool.wmcloud.org/)

## Learn More

You can learn more in the [VideoCutTool page](https://commons.wikimedia.org/wiki/Commons:VideoCutTool).

## Installation

To set up the tool on your local machine, follow these steps

### Get OAuth2.0 Credentials

Go to:
<https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose>.

Create an application with the following grants:

- Edit existing pages.
- Create, edit, and move pages.
- Upload new files.
- Upload, replace, and move files.

### Setting the CallBack URL

If it's for production, use call back URL as:
<https://videocuttool.wmcloud.org/api/auth/mediawiki/callback>

If it's for development, use call back URL as:
<http://localhost:4000/api/auth/mediawiki/callback>

### Creating .env file

Store the obtained Client ID, and Client Secret, in the `.env` file, under the keys `CLIENT_ID`, and `CLIENT_SECRET` respectively.

Name the file as `.env.dev` if its for development, or `.env.prod` if its for production.

Note: These files should follow the format, given in the `.env.example` file

### Running locally

The tool uses Docker to install and run everything with a single command.

Install Docker from this link: <https://docs.docker.com/get-docker/>

#### Clone Repo

Run these commands to clone the code from the remote repo:

```
git clone "https://gerrit.wikimedia.org/r/labs/tools/VideoCutTool"

cd ./VideoCutTool
```

#### Run environment

Run this command inside VideoCutTool to start development Docker container, if you operating system is Windows

```
docker-compose -f .\docker-compose.dev.yml up --build
```

If your operating system is other than Windows (Linux/Mac), run this command instead

```
docker-compose -f ./docker-compose.dev.yml up --build
```

The first time you run it will take some time (4-8 minutes depending on your internet speed) because it will pull the necessary images from Docker and install NPM packages. Once it is up and running changes will be hot loaded.

> Note: Anytime you update package.json the build process will take a while.

To run production you can run this command:

```
docker-compose -f .\docker-compose.prd.yml up -d
```

for windows

and

```
docker-compose -f ./docker-compose.prd.yml up -d
```

for other operating systems.

You are now good to go, and should have successfully set up the tool on your local machine for development. If you encounter any error while setting this up locally, do checkout our tickets on [phabricator](https://phabricator.wikimedia.org/tag/videocuttool/), if you could find something relevant there.

> Note: If are facing errors specific to `mediawikiId`, please have a look [here](https://phabricator.wikimedia.org/T331247)

### Connecting to Cloud VPS Servers

If you want to set up cloud services for production, follow here:

Cloud VPS Horizon URL: <https://horizon.wikimedia.org>

- videocuttool instance using `ssh -J <username>@primary.bastion.wmflabs.org <username>@videocuttool.videocuttool.eqiad1.wikimedia.cloud`
- nc-videocuttool instance using `ssh -J <username>@primary.bastion.wmflabs.org <username>@nc-videocuttool.videocuttool.eqiad1.wikimedia.cloud`

#### Installing VideoCutTool in cloud server

To install the tool in the cloud server (production), follow here

Install the following utilities:

- git
- node version v16.15.1
- npm version v8.12.1
- ffmpeg
- mongodb
- nginx

#### Database

- View the users list using the following commands:
  - Connect to mongo using shell - `mongo`
  - `show databases`
  - `use video-cut-tool`
  - `db.users.find({}, {"_id":0 })`
- View the list of videos being edited/that have been processed:
  - Connect to mongo using shell - `mongo`
  - `show databases`
  - `use video-cut-tool`
  - `db.videos.find({}, {"_id":0 })`

## Credits

VideoCutTool is created by Gopa Vasanth as a part of 2019 Google Summer of Code in the mentorship of Pratik Shetty, Hassan Amin and James Heilman.

Khr2003 joined as a co-maintainer of the tool and revamped the code base.

Sohom Datta (@soda on phabricator.wikimedia.org) joined as a co-maintainer of the tool for Google Summer of Code 2023 as a mentor to the project.
