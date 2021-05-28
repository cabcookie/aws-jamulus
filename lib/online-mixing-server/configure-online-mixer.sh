LOG() {
    command echo $(date) "[USER DATA]" "$@"
}

LOG update packages
sudo apt-get update
echo y | sudo apt-get install awscli

LOG install basic Ubuntu Desktop
echo y | sudo apt-get install --no-install-recommends ubuntu-desktop

LOG install ubuntu remote desktop environment
echo y | sudo apt-get install xrdp
sudo service gdm3 start
sudo systemctl enable xrdp

LOG copy configuration files to local Documents folder
mkdir /home/ubuntu/Documents
aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/ /home/ubuntu/Documents/ --recursive --exclude "*" --include "jamulus*"

LOG install the CloudWatch agent
# see download links for different OS here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html
wget https://s3.%%REGION%%.amazonaws.com/amazoncloudwatch-agent-%%REGION%%/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
echo yes | sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

LOG load and show the config file
aws s3 cp s3://jamulus-config-bucket/cloudwatch-linux-settings.json config.json
cat config.json

LOG move the config file and start the CloudWatch agent
sudo mv config.json /opt/aws/amazon-cloudwatch-agent/bin/
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

LOG prepare startup file to install remaining apps – Ardour and Jamulus
echo "echo y | sudo apt-get install ardour" >> /home/ubuntu/Documents/install-apps.sh
echo "sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/Documents/install-apps.sh
echo "sudo apt install ./jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/Documents/install-apps.sh
echo "sudo rm ./jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/Documents/install-apps.sh
chmod 755 /home/ubuntu/Documents/install-apps.sh
cat /home/ubuntu/Documents/install-apps.sh

LOG create a password for user ubuntu
echo -e "%%UBUNTU_PASSWORD%%\n%%UBUNTU_PASSWORD%%" | sudo passwd ubuntu

LOG upgrade packages
echo y | sudo apt-get upgrade

LOG finished installation of all dependencies - reboot
sudo reboot
