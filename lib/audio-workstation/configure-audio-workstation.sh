LOG() {
    command echo $(date) "[USER DATA]" "$@"
}
SHOW_FILE() {
    command echo $(date) "[USER DATA] SHOW FILE" "$@"
    command ls -l $@
    command cat $@
}

LOG %%VERSION%%

LOG set timezone
timedatectl set-timezone %%TIMEZONE%%

LOG update packages
sudo apt-get update
sudo apt-get -y install awscli

LOG install basic Ubuntu Desktop
sudo apt-get -y install --no-install-recommends ubuntu-desktop
sudo apt-get -y install `check-language-support -l de`

LOG install gnome startup applications
sudo apt-get install gnome-startup-applications

LOG install ubuntu remote desktop environment
sudo apt-get -y install xrdp
sudo service gdm3 start
sudo systemctl enable xrdp

LOG install plugins for Ardour
sudo apt-get -y install x42-plugins calf-plugins invada-studio-plugins-lv2

LOG config.json
echo "%%CONFIG_JSON%%"

LOG fetch all files from S3
USERDIR=/home/ubuntu
TEMPS3=$USERDIR/.temp-s3
BINDIR=$USERDIR/bin
DOCUMENTSDIR=$USERDIR/Documents
mkdir $TEMPS3
aws s3 cp s3://jamulus-config-bucket/AudioWorkstation/ $TEMPS3 --recursive --include "*"

LOG create all target directories
mkdir $BINDIR
mkdir $DOCUMENTSDIR

LOG adjust placeholders
%%ADJUST_PLACEHOLDERS%%

LOG move all files in the correct directories
mv $TEMPS3/jack/jackdrc.conf $USERDIR/.jackdrc
mv $TEMPS3/jamulus* $DOCUMENTSDIR/
mv $TEMPS3/mosaik-live $DOCUMENTSDIR/
mkdir $DOCUMENTSDIR/mosaik-live/analysis
mkdir $DOCUMENTSDIR/mosaik-live/dead
mkdir $DOCUMENTSDIR/mosaik-live/export
mkdir $DOCUMENTSDIR/mosaik-live/externals
mkdir $DOCUMENTSDIR/mosaik-live/interchange
mkdir $DOCUMENTSDIR/mosaik-live/interchange/mosaik-live
mkdir $DOCUMENTSDIR/mosaik-live/interchange/mosaik-live/audiofiles
mkdir $DOCUMENTSDIR/mosaik-live/interchange/mosaik-live/midifiles
mkdir $DOCUMENTSDIR/mosaik-live/peaks
mkdir $DOCUMENTSDIR/mosaik-live/plugins
mv $TEMPS3/app-wrapper/jamulus-startup.desktop /usr/share/applications/
mv $TEMPS3/app-wrapper/jamulus-startup.png /usr/share/icons/
mv $TEMPS3/app-wrapper/install-apps.sh $BINDIR/
mv $TEMPS3/app-wrapper/workstation-autostart.desktop /etc/xdg/autostart/

LOG adjust permissions and ownerships
sudo chown -R ubuntu $BINDIR/
sudo chown -R ubuntu $DOCUMENTSDIR
sudo chown -R ubuntu $USERDIR/.jackdrc
chmod +x $BINDIR/install-apps.sh
chmod +x $DOCUMENTSDIR/jamulus/jamulus-startup.sh

LOG Show all files
SHOW_FILE /etc/xdg/autostart/workstation-autostart.desktop
SHOW_FILE $USERDIR/.jackdrc
SHOW_FILE $BINDIR/install-apps.sh
SHOW_FILE $DOCUMENTSDIR/jamulus/jamulus-startup.sh
SHOW_FILE /usr/share/applications/jamulus-startup.desktop

%%CLOUDWATCH_AGENT%%

LOG create a password for user ubuntu
echo -e "%%UBUNTU_PASSWORD%%\n%%UBUNTU_PASSWORD%%" | sudo passwd ubuntu

LOG upgrade packages
sudo apt-get -y upgrade

LOG finished installation of all dependencies - reboot
sudo reboot
