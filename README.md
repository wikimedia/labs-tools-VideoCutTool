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
<http://localhost:8000/api/auth/mediawiki/callback>

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

#### Database

##### On a development system

- View the users list using the following commands:
  - Connect to postgresql using `psql --host=0.0.0.0 --port=5435 --dbname=videocuttool --username=videocuttool`
  - Enter the password (by default it is set to `videocuttool`)
  - Run `select * from Users;`
- View the list of videos being edited/that have been processed:
  - Connect to postgresql using `psql --host=0.0.0.0 --port=5435 --dbname=videocuttool --username=videocuttool`
  - Enter the password (by default it is set to `videocuttool`)
  - Run `select * from Videos;`

#### Run environment

Run this command inside VideoCutTool to start development Docker container, if you operating system is Windows

```
docker-compose -f .\docker-compose.dev.yml up --build -V
```

If your operating system is other than Windows (Linux/Mac), run this command instead

```
docker-compose -f ./docker-compose.dev.yml up --build -V
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
- docker

### Setting up beta version

Set up your Cloud VPS Horizon, from the above tutorial.

beta-videocuttool instance using `ssh -J <username>@primary.bastion.wmflabs.org <username>@beta-videocuttool.videocuttool.eqiad1.wikimedia.cloud`

> where _username_ is your gerrit-authorized username

After setting up the cloud, set up Crontab, for syncing your beta with the current master

- Create a file for storing the logs

```
sudo mkdir /app/logs
```

```
sudo touch /app/logs/beta.log
```

- Create a crontab for the root user

```
sudo crontab -e
```

opens the Cron-tab for the root user, and paste the below line on the editor

```
0 * * * * /app/VideoCutTool/beta-sync.sh >> /app/logs/beta.log
```

> Note: The above line runs the beta-sync.sh file at every hour.

If you couldn't find `/app/VideoCutTool` in the server instance, go ahead and install dependencies like

- Git
- [Docker Engine](https://docs.docker.com/engine/install/debian/)
- Vim/Nano (Based on preference)

via `apt` or some other package manager you prefer.

- After installing these, go to `/app`, and use the above `git pull` command to get the repository on the beta-server
- Now follow the above steps to set up crontab.
- Make sure to run all the docker commands in the detached mode, via the -d flag

If you face any issues regarding setting up beta instance, feel free to raise your queries on [phabricator](https://phabricator.wikimedia.org/tag/videocuttool/), or contact us via Zulip.

## Credits

VideoCutTool is created by Gopa Vasanth as a part of 2019 Google Summer of Code in the mentorship of Pratik Shetty, Hassan Amin and James Heilman.

Khr2003 joined as a co-maintainer of the tool and revamped the code base.

Sohom Datta (@soda on phabricator.wikimedia.org) joined as a co-maintainer of the tool for Google Summer of Code 2023 as a mentor to the project.
