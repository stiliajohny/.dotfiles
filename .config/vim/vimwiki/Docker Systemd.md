# Systemd service template for docker-compose

Here’s my template for running a docker-compose service as a systemd service:

```
    # Save as e.g. /etc/systemd/system/my-service.service
    [Unit]
    Description=MyService
    Requires=docker.service
    After=docker.service
    [Service]
    Restart=always
    User=uli
    Group=docker
    # Shutdown container (if running) when unit is stopped
    ExecStartPre=/usr/local/bin/docker-compose -f /home/uli/mydockerservice/docker-compose.yml down -v
    # Start container when unit is started
    ExecStart=/usr/local/bin/docker-compose -f /home/uli/mydockerservice/docker-compose.yml up
    # Stop container when unit is stopped
    ExecStop=/usr/local/bin/docker-compose -f /home/uli/mydockerservice/docker-compose.yml down -v
    [Install]
    WantedBy=multi-user.target

    StandardOutput=append:/var/log/SERVICE.log
    StandardError=append:/var/log/SERVICE.log
```

In order to get it up and running for your application, you need to modify a couple of things:

- Check if you have ***docker-compose*** in /usr/local/bin/docker-compose (as I do, because I use the docker-ce installation from the official docker repositories for Ubuntu 18.04) or in /usr/bin/docker-compose (in which case you need to set the correct docker-compose path in all 3 places in the service file)
- Ensure that the ***user*** you want to run docker-compose as (uli in this example) is a member of the docker group (sudo usermod -a -G docker <user>), and set the correct user in the User=... line
- Define a ***name*** for your service that should be reflected in both the service filename and the Description=... line
- Set the correct ***path*** for your docker-compose YML config file in all the Exec…=… lines (i.e. replace /home/uli/mydockerservice/docker-compose.yml by your YML path).

After that, you can start your service using

`sudo systemctl start my-service # --> my-service.service, use whatever you named your file as`

and optionally enable it at bootup:

`systemctl enable docker # Docker is required for your service so you need to enable it as well!`
`systemctl enable my-service # --> my-service.service, use whatever you named your file as`
