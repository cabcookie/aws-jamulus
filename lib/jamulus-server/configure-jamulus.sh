LOG() {
    command echo $(date) "[USER DATA]" "$@"
}
SHOW_FILE() {
    command echo $(date) "[USER DATA] SHOW FILE" "$@"
    command ls -l $@
    command cat $@
}

LOG %%VERSION%%

LOG update packages
sudo apt update

LOG install dependencies
echo yes | sudo apt-get install awscli build-essential qt5-qmake qtdeclarative5-dev libjack-jackd2-dev qt5-default python-pip

LOG clone the jamulus.git repo
git clone https://github.com/corrados/jamulus.git llcon-jamulus

cd llcon-jamulus
qmake "CONFIG+=nosound" Jamulus.pro

LOG make the jamulus server
make clean
make

LOG show current folder
pwd
ls
cd ..
LOG should be user folder now and it should show the llcon-jamulus folder
pwd
ls

LOG move the jamulus directory into the ‘/usr/local/bin’ directory
sudo mv llcon-jamulus/ /usr/local/bin

LOG show if Jamulus exists in the correct folder
ls /usr/local/bin/llcon-jamulus/Jamulus

LOG create a non-privileged user to run the server; user: jamulus
sudo adduser --system --no-create-home jamulus

LOG make a log directory so that the jamulus logs are saved somewhere
sudo mkdir /var/log/jamulus
sudo chown jamulus:nogroup /var/log/jamulus

LOG copy the jamulus start script from S3
aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service

LOG move the script to the systems folder
sudo mv jamulus.service /etc/systemd/system/

LOG let’s double check the script is correct
SHOW_FILE /etc/systemd/system/jamulus.service

LOG now give it executable permissions
sudo chmod 644 /etc/systemd/system/jamulus.service

LOG install the CloudWatch agent
# see download links for different OS here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html
wget https://s3.%%REGION%%.amazonaws.com/amazoncloudwatch-agent-%%REGION%%/ubuntu/arm64/latest/amazon-cloudwatch-agent.deb
echo yes | sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

LOG load and show the config file
aws s3 cp s3://jamulus-config-bucket/cloudwatch-linux-settings.json config.json
SHOW_FILE config.json

LOG move the config file and start the CloudWatch agent
sudo mv config.json /opt/aws/amazon-cloudwatch-agent/bin/
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

LOG start up the jamulus service
sudo systemctl start jamulus

LOG make sure the service runs when the instance is rebooted
sudo systemctl enable jamulus

# If you want to check the syslog:
# cat /var/log/syslog

# If you ever want to shutdown your server you can just issue the command:
# sudo systemctl stop jamulus
