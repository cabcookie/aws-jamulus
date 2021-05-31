LOG() {
    command echo $(date) "[USER DATA]" "$@"
}
SHOW_FILE() {
    command echo $(date) "[USER DATA] SHOW FILE" "$@"
    command ls -l $@
    command cat $@
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

LOG set real-time process permissions for ubuntu user
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
sudo usermod -a -G audio ubuntu

LOG fetch Jack configuration files
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/jack/jackdrc.conf /home/ubuntu/.jackdrc
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/jack/conf.xml /home/ubuntu/.config/jack/

SHOW_FILE /home/ubuntu/.jackdrc
SHOW_FILE /home/ubuntu/.config/jack/conf.xml

LOG install node
echo y | sudo apt-get install nodejs

LOG copy app to create jamulus config files to /home/ubuntu/bin
mkdir /home/ubuntu/bin
CFGFOLD=/home/ubuntu/bin/create-config-files
mkdir $CFGFOLD
echo "%%CHANNELS%%" >> $CFGFOLD/channels.json
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/jamulus/ $CFGFOLD/ --recursive --include "*"

LOG create jamulus configuration files in local Documents folder
mkdir /home/ubuntu/Documents
mkdir $CFGFOLD/jamulus-inis
mkdir $CFGFOLD/jamulus-clients
node $CFGFOLD/create-config-files.js $CFGFOLD %%BAND_PRIVATE_IP%% %%BAND_PUBLIC_IP%%
mv $CFGFOLD/jamulus* /home/ubuntu/Documents/
chmod +x /home/ubuntu/Documents/jamulus-startup.sh
sudo chown -R ubuntu /home/ubuntu/Documents

SHOW_FILE /home/ubuntu/Documents/jamulus-startup.sh

LOG create wrapper app Audio Workstation
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/app-wrapper/jamulus-startup.desktop /usr/share/applications/
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/app-wrapper/jamulus-startup.png /usr/share/icons/

SHOW_FILE /usr/share/applications/jamulus-startup.desktop

LOG prepare startup file to install remaining apps – Ardour and Jamulus
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/app-wrapper/install-apps.sh /home/ubuntu/bin/
sudo aws s3 cp s3://jamulus-config-bucket/online-mixer-jamulus-config/app-wrapper/install-apps.desktop /etc/xdg/autostart/
chmod +x /home/ubuntu/bin/install-apps.sh
sudo chown -R ubuntu /home/ubuntu/bin/

SHOW_FILE /etc/xdg/autostart/install-apps.desktop
SHOW_FILE /home/ubuntu/bin/install-apps.sh
SHOW_FILE /usr/share/applications/jamulus-startup.desktop

%%CLOUDWATCH_AGENT%%

LOG create a password for user ubuntu
echo -e "%%UBUNTU_PASSWORD%%\n%%UBUNTU_PASSWORD%%" | sudo passwd ubuntu

LOG upgrade packages
echo y | sudo apt-get upgrade

LOG finished installation of all dependencies - reboot
sudo reboot
