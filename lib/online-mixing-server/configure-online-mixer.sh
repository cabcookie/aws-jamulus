echo [USER DATA] update packages
sudo apt-get update

echo [USER DATA] install basic Ubuntu Desktop
echo y | sudo apt-get install --no-install-recommends ubuntu-desktop

echo [USER DATA] install ubuntu remote desktop environment
echo y | sudo apt install xrdp
sudo service gdm3 start
sudo systemctl enable xrdp

# before installation of ardour give user real-time permissions
# read details here: https://jackaudio.org/faq/linux_rt_config.html
# or here: https://wiki.ubuntuusers.de/Tonstudio/Konfiguration/

echo [USER DATA] install ardour
echo y | sudo apt-get install ardour

echo [USER DATA] install jamulus software
wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb
sudo apt install ./jamulus_3.7.0_ubuntu_amd64.deb
rm ./jamulus_3.7.0_ubuntu_amd64.deb

# You should manually create a password for user ubuntu via this statement
# sudo passwd ubuntu

echo y | sudo apt upgrade
sudo reboot

# If you want to check the syslog:
# cat /var/log/syslog
