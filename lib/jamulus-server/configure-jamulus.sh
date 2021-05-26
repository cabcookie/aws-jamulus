# This file installs the Jamulus code, its dependencies, compiles the server
# and runs it as a server.
# It follow the instructions from this how to guide:
#   http://orangeblossomchorus.com/index.php/howto-idiots-guide-to-installing-jamulus-server-on-amazon-aws-lightsail-ubuntu-instance

echo [USER DATA] update packages
sudo apt update

echo [USER DATA] install dependencies
echo yes | sudo apt-get install awscli build-essential qt5-qmake qtdeclarative5-dev libjack-jackd2-dev qt5-default python-pip

echo [USER DATA] clone the jamulus.git repo
git clone https://github.com/corrados/jamulus.git llcon-jamulus

cd llcon-jamulus
qmake "CONFIG+=nosound" Jamulus.pro

echo [USER DATA] make the jamulus server
make clean
make

echo [USER DATA] show current folder
pwd
ls
cd ..
echo [USER DATA] should be user folder now and it should show the llcon-jamulus folder
pwd
ls

echo [USER DATA] move the jamulus directory into the ‘/usr/local/bin’ directory
sudo mv llcon-jamulus/ /usr/local/bin

echo [USER DATA] show if Jamulus exists in the correct folder
ls /usr/local/bin/llcon-jamulus/Jamulus

echo [USER DATA] create a non-privileged user to run the server; user: jamulus
sudo adduser --system --no-create-home jamulus

echo [USER DATA] make a log directory so that the jamulus logs are saved somewhere
sudo mkdir /var/log/jamulus
sudo chown jamulus:nogroup /var/log/jamulus

echo [USER DATA] copy the jamulus start script from S3
aws s3 cp s3://jamulus-config-bucket/%%SERVER-SETTINGS-FILE-NAME%% jamulus.service

echo [USER DATA] move the script to the systems folder
sudo mv jamulus.service /etc/systemd/system/

echo [USER DATA] let’s double check the script is correct
cat /etc/systemd/system/jamulus.service

echo [USER DATA] now give it executable permissions
sudo chmod 644 /etc/systemd/system/jamulus.service

echo [USER DATA] install the CloudWatch agent
# see download links for different OS here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html
wget https://s3.%%REGION%%.amazonaws.com/amazoncloudwatch-agent-%%REGION%%/ubuntu/arm64/latest/amazon-cloudwatch-agent.deb
echo yes | sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

echo [USER DATA] load and show the config file
aws s3 cp s3://jamulus-config-bucket/cloudwatch-linux-settings.json config.json
cat config.json

echo [USER DATA] move the config file and start the CloudWatch agent
sudo mv config.json /opt/aws/amazon-cloudwatch-agent/bin/
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

echo [USER DATA] start up the jamulus service
sudo systemctl start jamulus

echo [USER DATA] make sure the service runs when the instance is rebooted
sudo systemctl enable jamulus

# If you want to check the syslog:
# cat /var/log/syslog

# If you ever want to shutdown your server you can just issue the command:
# sudo systemctl stop jamulus
