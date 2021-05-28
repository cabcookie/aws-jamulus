LOG() {
    command echo $(date) "[USER DATA]" "$@"
}

LOG update packages
sudo apt-get update
echo y | sudo apt-get install awscli

LOG install basic Ubuntu Desktop
echo y | sudo apt-get install --no-install-recommends ubuntu-desktop
sudo apt-get -y install `check-language-support -l de`

LOG install gnome startup applications
sudo apt-get install gnome-startup-applications

LOG install ubuntu remote desktop environment
echo y | sudo apt-get install xrdp
sudo service gdm3 start
sudo systemctl enable xrdp

LOG set real-time process permissions for `ubuntu` user
sudo sed -i 's/# End of file/@audio          -       rtprio          99\n@audio          -       memlock         unlimited\n\n# End of file/' /etc/security/limits.conf
echo "# Provided by the jackd package." >> audio.conf
echo "#" >> audio.conf
echo "# Changes to this file will be preserved." >> audio.conf
echo "#" >> audio.conf
echo "# If you want to enable/disable realtime permissions, run" >> audio.conf
echo "#" >> audio.conf
echo "#    dpkg-reconfigure -p high jackd" >> audio.conf
echo " " >> audio.conf
echo "@audio   -  rtprio     95" >> audio.conf
echo "@audio   -  memlock    unlimited" >> audio.conf
echo "#@audio   -  nice      -19" >> audio.conf
sudo mv audio.conf /etc/security/limits.d/
sudo addgroup audio
sudo usermod -a -G audio ubuntu

LOG copy configuration files to local Documents folder
mkdir /home/ubuntu/Documents
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/ /home/ubuntu/Documents/ --recursive --exclude "*" --include "jamulus*"
sudo aws s3 cp s3://jamulus-config-bucket/ardour/ /home/ubuntu/Documents/mosaik-live/ --recursive --include "*"
chmod +x /home/ubuntu/Documents/jamulus-startup.sh

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
mkdir /home/ubuntu/bin
echo "setxkbmap -layout de" >> /home/ubuntu/bin/install-apps.sh
echo "sudo apt-get -y install ardour" >> /home/ubuntu/bin/install-apps.sh
echo "sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/bin/install-apps.sh
echo "sudo apt install ./jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/bin/install-apps.sh
echo "sudo rm ./jamulus_3.7.0_ubuntu_amd64.deb" >> /home/ubuntu/bin/install-apps.sh
echo "sudo rm /etc/xdg/autostart/install-apps.desktop"  >> /home/ubuntu/bin/install-apps.sh
chmod +x /home/ubuntu/bin/install-apps.sh

sudo chown -R ubuntu /home/ubuntu/bin/
sudo chown -R ubuntu /home/ubuntu/Documents
echo "[Desktop Entry]" >> install-apps.desktop
echo "Type=Application" >> install-apps.desktop
echo "Name=Audio-Anwendungen-Installation" >> install-apps.desktop
echo "Exec=/home/ubuntu/bin/install-apps.sh" >> install-apps.desktop
echo "Terminal=true" >> install-apps.desktop
sudo mv install-apps.desktop /etc/xdg/autostart/
cat /etc/xdg/autostart/install-apps.desktop
cat home/ubuntu/bin/install-apps.sh

LOG create a password for user ubuntu
echo -e "%%UBUNTU_PASSWORD%%\n%%UBUNTU_PASSWORD%%" | sudo passwd ubuntu

LOG upgrade packages
echo y | sudo apt-get upgrade

LOG finished installation of all dependencies - reboot
sudo reboot
