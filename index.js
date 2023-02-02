#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("settings.json"));
const TROUBLEMAKERS = settings.troublemakers;
const THRESHOLD = settings.threshold;
const MINUTES_TO_WAIT = settings.minutesToWait;

setInterval(() => {
  exec("top -b -n 1 | awk 'NR>7{print $1,$9,$12}'", (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    const lines = stdout.trim().split("\n");
    let processFound = false;
    for (let i = 0; i < lines.length; i++) {
      const [pid, cpuUsage, processName] = lines[i].split(" ");
      if (TROUBLEMAKERS.includes(processName) && cpuUsage >= THRESHOLD) {
        exec(`ps -o etimes= -p ${pid}`, (error, stdout) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }

          const elapsedTime = Number(stdout.trim());
          if (elapsedTime >= MINUTES_TO_WAIT * 60) {
            exec(`docker inspect -f '{{.Id}}' $(docker ps -q --filter ancestor=${processName})`, (error, stdout) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              const containerId = stdout.trim();
              if (containerId) {
                console.log(`Stopping process "${processName}" (containerId: ${containerId})`);
                exec(`docker stop ${containerId}`, (error) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                  }
                });
              } else {
                console.log(`Killing process "${processName}" (pid: ${pid})`);
                process.kill(pid, "SIGKILL");
              }
            });
          } else {
            console.log(`Process "${processName}" (pid: ${pid}) is running for less than ${MINUTES_TO_WAIT} minutes. Ignoring...`);
          }
        });
        processFound = true;
        break;
      }
    }

    if (!processFound) {
      console.log("No process found that meets the conditions");
    }
  });
}, 1000);
