echo "setxkbmap -layout de" > bin/autostart-workstation.sh
chmod +x bin/autostart-workstation.sh
./bin/autostart-workstation.sh
gsettings set org.gnome.shell favorite-apps "$(gsettings get org.gnome.shell favorite-apps | sed s/.$//), 'jamulus-startup.desktop']"
# gsettings set org.gnome.shell favorite-apps "['org.gnome.Nautilus.desktop', 'jamulus-startup.desktop']"
echo "./Documents/jamulus/jamulus-startup.sh" >> bin/autostart-workstation.sh

# DEBFILE=jamulus_3.7.0_ubuntu_amd64.deb
# sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/$DEBFILE

DEBFILE=jamulus_3.8.0_ubuntu_amd64.deb
sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_8_0/$DEBFILE
sudo apt-get -y install ./$DEBFILE
sudo rm ./$DEBFILE

sudo apt-get -y install ardour

sudo sed -i 's/install-apps.sh/autostart-workstation.sh/' /etc/xdg/autostart/workstation-autostart.desktop
sudo apt-get update
echo y | sudo apt-get upgrade
sudo reboot
