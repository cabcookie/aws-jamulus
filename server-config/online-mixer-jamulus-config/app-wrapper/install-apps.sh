setxkbmap -layout de
sudo apt-get -y install ardour
sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb
sudo apt install ./jamulus_3.7.0_ubuntu_amd64.deb
sudo rm ./jamulus_3.7.0_ubuntu_amd64.deb
sudo rm /etc/xdg/autostart/install-apps.desktop
# gsettings set org.gnome.shell favorite-apps "['firefox.desktop', 'org.gnome.Nautilus.desktop', 'jamulus-startup.desktop']"
gsettings set org.gnome.shell favorite-apps "$(gsettings get org.gnome.shell favorite-apps | sed s/.$//), 'jamulus-startup.desktop']"
