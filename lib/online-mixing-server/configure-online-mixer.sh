echo [USER DATA] update packages
sudo apt-get update

echo [USER DATA] install ubuntu remote desktop environment
# Explained here: https://askubuntu.com/questions/42964/installing-ubuntu-desktop-without-all-the-bloat
echo y | sudo apt-get install xorg xterm menu synaptic --no-install-recommends
echo y | sudo apt-get install gnome-session gnome-panel metacity gnome-terminal --no-install-recommends
echo y | sudo apt install xrdp
sudo service gdm3 start
sudo systemctl enable xrdp
# sudo apt-get install net-tools

echo y | sudo apt-get upgrade
sudo reboot
