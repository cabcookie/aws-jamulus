<powershell>
  $scriptVersion = "%%VERSION%%"
  Write-Output $scriptVersion

  $configJson = "%%CONFIG_JSON%%"
  Write-Output $configJson

  # The name of your S3 Bucket
  $bucket = "%%CONFIG_BUCKET_NAME%%"
  
  # The folder in your bucket to copy, without a trailing slash. Leave blank to copy the entire bucket
  $bucketDir = "WindowsZoomServer"

  
  # The local file paths where files should be copied
  $localJamulusPath = "C:\Users\Administrator\Desktop\Jamulus"
  $localJamulusIniPath = $localJamulusPath + "\jamulus-inis"
  $localInstallPath = "C:\Users\Administrator\Desktop\Install-Files"
  $localVoiceMeeterConfig = "C:\Users\Administrator\Desktop\Voicemeeter-Config"

  # Create those directories
  New-Item -Path $localJamulusPath -ItemType Directory
  New-Item -Path $localJamulusIniPath -ItemType Directory
  New-Item -Path $localInstallPath -ItemType Directory
  New-Item -Path $localVoiceMeeterConfig -ItemType Directory
  
  # Set the timezone to Europe/Berlin; should be optimized later
  # (needs mapping between Ubuntu timezones and PowerShell timezones)
  Set-TimeZone -Id "Central European Standard Time" -PassThru
  
  Function Get-Url-File {
    Param ($url, $fileName)
    Invoke-WebRequest $url/$fileName -UseBasicParsing -Outfile $localInstallPath\$fileName
  }

  Function Get-From-S3 {
    Param ($remotePath, $fileName, $localPath)
    Copy-S3Object -BucketName $bucket -Key $remotePath/$fileName -LocalFile $localPath\$fileName
  }

  # Get files from Urls
  Get-Url-File "https://github.com/jamulussoftware/assets/raw/main/ASIO4ALL/v2.14/" "ASIO4ALL_2_14_English.exe"
  Get-Url-File "https://github.com/jamulussoftware/jamulus/releases/download/r3_7_0/" "jamulus_3.7.0_win.exe"
  Get-Url-File "https://www.zoom.us/client/latest/" "ZoomInstallerFull.msi"
  Get-Url-File "https://download.vb-audio.com/Download_CABLE/" "VoicemeeterProSetup.exe"
  
  Get-From-S3 $bucketDir JamulusToZoomServer.xml $localVoiceMeeterConfig
  Get-From-S3 $bucketDir Jamulus_Startup.bat $localJamulusPath
  Get-From-S3 $bucketDir/jamulus-inis JamulusFromZoom.ini $localJamulusIniPath
  Get-From-S3 $bucketDir/jamulus-inis JamulusToZoom.ini $localJamulusIniPath

  $content = Get-Content -Path $localJamulusPath\Jamulus_Startup.bat
  $content = $content -replace '%JAMULUS_MIXER_IP%', '%%MIXER_PRIVATE_IP%%'
  $content = $content -replace '%JAMULUS_BAND_IP%', '%%BAND_PRIVATE_IP%%'
  $content = $content -replace '%MEETING_ID%', '%%MEETING_ID%%'
  $content = $content -replace '%MEETING_PASSWORD%', '%%MEETING_PASSWORD%%'
  $content | Set-Content -Path $localJamulusPath\Jamulus_Startup.bat
  
  Set-Location $localInstallPath
  
  msiexec /i ZoomInstallerFull.msi /quiet /qn /norestart /log install.log
</powershell>