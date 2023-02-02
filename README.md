

# AntiOverload / AO1
A script to monitor CPU usage and kill the top processes if it is too high.
ChatGPT coded ~80% of this. DM `Layer#0002` on Discord if there are issues.

# Installation
```bash
# Install packages
apt install nodejs npm bc
cd /
git clone https://github.com/OVRXGlobal/AntiOverload/
cd AntiOverload
npm install fs pm2

# PM2 / starting it
pm2 start /AntiOverload/index.js --name "ao"
```

You can view the status of it with `pm2 status ao`
