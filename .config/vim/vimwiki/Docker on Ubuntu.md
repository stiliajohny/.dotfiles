# Install Docker on Ubuntu 

# Step 1: Update Software Repositories

As usual, it’s a good idea to update the local database of software to make sure you’ve got access to the latest revisions.

Therefore, open a terminal window and type:

`sudo apt-get update`
Allow the operation to complete.


# Step 2: Uninstall Old Versions of Docker

Next, it’s recommended to uninstall any old Docker software before proceeding.
Use the command:
`sudo apt-get remove docker docker-engine docker.io`

# Step 3: Install Docker

To install Docker on Ubuntu, in the terminal window enter the command:

`sudo apt install docker.io`

# Step 4: Start and Automate Docker

The Docker service needs to be setup to run at startup. To do so, type in each command followed by enter:

`sudo systemctl start docker`
`sudo systemctl enable docker`

enable docker command, in terminal

# Step 5 (Optional): Check Docker Version

To verify the installed Docker version number, enter:

`docker --version`
