echo "setxkbmap -layout de" > set-language-pack-de.sh
chmod +x set-language-pack-de.sh
./set-language-pack-de.sh
sudo apt-get -y install ardour
sudo wget https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/jamulus_3.7.0_ubuntu_amd64.deb
sudo apt install ./jamulus_3.7.0_ubuntu_amd64.deb
sudo rm ./jamulus_3.7.0_ubuntu_amd64.deb
sudo sed -i 's/install-apps.sh/set-language-pack-de.sh/' /etc/xdg/autostart/install-apps.desktop
gsettings set org.gnome.shell favorite-apps "['org.gnome.Nautilus.desktop', 'jamulus-startup.desktop']"
# gsettings set org.gnome.shell favorite-apps "$(gsettings get org.gnome.shell favorite-apps | sed s/.$//), 'jamulus-startup.desktop']"
# sudo reboot
