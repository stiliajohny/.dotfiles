# Configure an ESP board 
  
## Use Arduino IDE to upload Firmware 
* Install Arduino IDE
* Go to File -> Preferences
  * Under "Additional Boards Manager URLs" add: http://arduino.esp8266.com/stable/package_esp8266com_index.json
* Go to Tools -> Boards -> Boards Manager 
  * Search for ESP and install the relevant board(s)
* Go to File -> Examples 
  * install the example wyou want to try


### For Over The Air Updates
* Go to File -> Examples -> ESPhttpUpdate -> httpUpdate
* Push this to the board 
