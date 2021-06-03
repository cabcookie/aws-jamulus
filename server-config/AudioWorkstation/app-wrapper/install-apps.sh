echo "setxkbmap -layout de" > bin/autostart-workstation.sh
chmod +x bin/autostart-workstation.sh
./bin/autostart-workstation.sh
gsettings set org.gnome.shell favorite-apps "$(gsettings get org.gnome.shell favorite-apps | sed s/.$//), 'jamulus-startup.desktop']"
# gsettings set org.gnome.shell favorite-apps "['org.gnome.Nautilus.desktop', 'jamulus-startup.desktop']"
echo "./Documents/jamulus-startup.sh" >> bin/autostart-workstation.sh

sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb
sudo apt-get -y install ./jamulus_3.7.0_ubuntu_amd64.deb
sudo rm ./jamulus_3.7.0_ubuntu_amd64.deb

sudo apt-get -y install ardour

sudo sed -i 's/install-apps.sh/autostart-workstation.sh/' /etc/xdg/autostart/workstation-autostart.desktop
sudo apt-get update
echo y | sudo apt-get upgrade
sudo reboot
