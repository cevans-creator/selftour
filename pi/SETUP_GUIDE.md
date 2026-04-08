# KeySherpa Pi Hub — Build & Provisioning Guide

Each Raspberry Pi hub controls one property's Z-Wave lock. This guide walks through a complete fresh build from OS image to deployed hub.

---

## Hardware Required

- Raspberry Pi 4 (2GB RAM minimum) or Pi 5
- MicroSD card (16GB+, Class 10 / A1 rated)
- Z-Wave USB stick — Zooz ZST10 700 series recommended
- Hologram Nova USB modem (or compatible USB LTE modem)
- Hologram SIM card (activated)
- Power supply (official Pi USB-C adapter)
- Ethernet cable (temporary, for initial setup)

---

## Part 1 — OS Setup

### 1.1 Flash the OS

1. Download **Raspberry Pi Imager** from raspberrypi.com
2. Select **Raspberry Pi OS Lite (64-bit)** — no desktop needed
3. Click the gear icon (⚙) before flashing and configure:
   - Hostname: `keysherpa-hub-01` (increment per hub)
   - Enable SSH: **Use password authentication**
   - Username: `pi`
   - Password: (pick a strong one, record it)
   - Locale: your timezone
4. Flash to SD card, insert into Pi, connect ethernet + power

### 1.2 Find the Pi on your network

From your laptop on the same network:
```bash
ssh pi@keysherpa-hub-01.local
```

If that doesn't work: log into your router to find the Pi's IP, then `ssh pi@<ip>`.

### 1.3 Initial system hardening

```bash
# Update everything
sudo apt update && sudo apt upgrade -y

# Disable password SSH (after you've confirmed key-based access works — optional)
# For now, password SSH is fine for setup

# Enable the hardware watchdog
sudo apt install -y watchdog
```

### 1.4 Enable the Pi hardware watchdog

```bash
# Load the watchdog kernel module
echo "dtparam=watchdog=on" | sudo tee -a /boot/firmware/config.txt

# Configure watchdog daemon
sudo nano /etc/watchdog.conf
```

Add/uncomment these lines in watchdog.conf:
```
watchdog-device = /dev/watchdog
watchdog-timeout = 15
max-load-1 = 24
```

```bash
sudo systemctl enable watchdog
sudo systemctl start watchdog
```

The Pi will now automatically reboot if it locks up for more than 15 seconds.

---

## Part 2 — Z-Wave USB Stick Setup

### 2.1 Plug in the USB stick

```bash
# Plug in the Zooz ZST10, then check it appears
ls /dev/ttyUSB* /dev/ttyACM*
# Should show: /dev/ttyUSB0 or /dev/ttyACM0
```

### 2.2 Set serial port permissions

```bash
# Add pi user to dialout group (grants serial port access)
sudo usermod -a -G dialout pi

# Apply without reboot
newgrp dialout

# Verify
ls -la /dev/ttyUSB0
# Should show: crw-rw---- 1 root dialout ...
```

### 2.3 Make the device path stable

USB devices can change path on reboot. Create a udev rule:

```bash
# Find the USB stick's vendor/product ID
udevadm info -a /dev/ttyUSB0 | grep -E "idVendor|idProduct" | head -4
```

For Zooz ZST10, idVendor is typically `10c4`, idProduct is `ea60`.

```bash
sudo nano /etc/udev/rules.d/99-zwave.rules
```

Add:
```
SUBSYSTEM=="tty", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", SYMLINK+="zwave"
```

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
# Now /dev/zwave always points to the Z-Wave stick
ls -la /dev/zwave
```

Update `ZWAVE_DEVICE` in your env file to `/dev/zwave`.

---

## Part 3 — Hologram SIM / Cellular Setup

### 3.1 Plug in the Hologram Nova modem

```bash
# Check it appears
lsusb | grep -i "huawei\|hologram\|qualcomm"
# Should show a USB modem device

ls /dev/ttyUSB*
# Will likely show /dev/ttyUSB1 and /dev/ttyUSB2 (modem has multiple interfaces)
```

### 3.2 Install ModemManager and NetworkManager

```bash
sudo apt install -y modemmanager network-manager

sudo systemctl enable ModemManager NetworkManager
sudo systemctl start ModemManager NetworkManager
```

### 3.3 Check modem is detected

```bash
mmcli -L
# Should show something like: /org/freedesktop/ModemManager1/Modem/0
```

```bash
mmcli -m 0
# Shows modem details — confirm SIM is inserted and state is "registered"
```

If state shows `failed` or SIM not detected, reseat the SIM and wait 30 seconds.

### 3.4 Create cellular connection

```bash
# Create the connection profile (Hologram APN is "hologram")
sudo nmcli connection add \
  type gsm \
  ifname cdc-wdm0 \
  con-name hologram \
  apn hologram

# Bring it up
sudo nmcli connection up hologram
```

### 3.5 Verify cellular is connected

```bash
# Check connection status
nmcli device status
# Should show: cdc-wdm0 or ppp0 with state "connected"

# Test internet access over cellular
curl --interface ppp0 https://api.ipify.org
# Should return your cellular IP address
```

### 3.6 Make cellular the default route (priority over ethernet)

```bash
# Set lower metric (higher priority) for cellular vs ethernet
sudo nmcli connection modify hologram ipv4.route-metric 50
sudo nmcli connection modify "Wired connection 1" ipv4.route-metric 100

# Reconnect to apply
sudo nmcli connection up hologram
```

### 3.7 Set NetworkManager to auto-reconnect

```bash
sudo nano /etc/NetworkManager/conf.d/cellular.conf
```

Add:
```ini
[connection]
connection.autoconnect-retries=0
```

```bash
sudo systemctl restart NetworkManager
```

### 3.8 (Optional) Disable ethernet after setup

Once confirmed working, you can unplug ethernet. The Pi will only use cellular.

---

## Part 4 — Node.js Installation

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

---

## Part 5 — KeySherpa Hub Client Installation

### 5.1 Copy files to the Pi

From your laptop (where this repo lives):

```bash
# From the selftour repo root
scp -r pi/keysherpa-hub pi@keysherpa-hub-01.local:/home/pi/
```

### 5.2 Install dependencies and build

```bash
# SSH into the Pi
ssh pi@keysherpa-hub-01.local

cd /home/pi/keysherpa-hub
npm install
npm run build
```

### 5.3 Register the hub in KeySherpa

On your laptop, call the registration endpoint once to get credentials:

```bash
curl -X POST https://www.keysherpa.io/api/hub/register \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{"name": "5010 Mimosa Ln Hub", "propertyId": "<property-uuid>"}'
```

Or use the dashboard if you've built a UI for it. The response will be:
```json
{
  "hubId": "abc123-...",
  "authToken": "deadbeef...",
  "message": "Save this token — it will not be shown again."
}
```

**Save the `hubId` and `authToken`. The token is shown only once.**

Also set `seamDeviceId` on the property to `hubId:nodeId` (e.g., `abc123:3`) where `nodeId` is the Z-Wave node number of the lock. You find the node number after pairing the lock (see Part 6).

### 5.4 Configure environment

```bash
# On the Pi
sudo mkdir -p /etc/keysherpa
sudo nano /etc/keysherpa/hub.env
```

Add:
```
HUB_ID=<hubId from registration>
AUTH_TOKEN=<authToken from registration>
API_BASE=https://www.keysherpa.io
ZWAVE_DEVICE=/dev/zwave
```

```bash
sudo chmod 600 /etc/keysherpa/hub.env
```

### 5.5 Create Z-Wave cache directory

```bash
sudo mkdir -p /var/lib/keysherpa-hub/cache
sudo chown pi:pi /var/lib/keysherpa-hub/cache
```

---

## Part 6 — Pair the Z-Wave Lock

The hub client needs to be running (even temporarily without systemd) to pair the lock.

```bash
# Run temporarily in the foreground to pair
cd /home/pi/keysherpa-hub
node -e "
const { Driver } = require('zwave-js');
const d = new Driver('/dev/zwave', { logConfig: { enabled: true } });
d.once('driver ready', async () => {
  console.log('Driver ready. Starting inclusion...');
  await d.controller.beginInclusion();
  console.log('Put lock in pairing mode now (usually hold button 3 sec)');
  d.controller.on('node added', (node) => {
    console.log('NODE ADDED — node ID:', node.id);
    console.log('Set seamDeviceId on property to: <hubId>:' + node.id);
  });
});
await d.start();
"
```

Put your lock in inclusion/pairing mode (check lock manual — usually hold a button for 3 seconds). When `NODE ADDED` appears, note the node ID. Set the property's `seamDeviceId` to `<hubId>:<nodeId>` in the dashboard.

Press Ctrl+C when done.

---

## Part 7 — Systemd Services

### 7.1 KeySherpa Hub service

```bash
sudo nano /etc/systemd/system/keysherpa-hub.service
```

```ini
[Unit]
Description=KeySherpa Hub Client
After=network-online.target ModemManager.service
Wants=network-online.target
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=simple
User=pi
Group=dialout
WorkingDirectory=/home/pi/keysherpa-hub
EnvironmentFile=/etc/keysherpa/hub.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Watchdog integration — systemd will restart if process hangs
WatchdogSec=60
NotifyAccess=none

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable keysherpa-hub
sudo systemctl start keysherpa-hub
```

Check it's running:
```bash
sudo systemctl status keysherpa-hub
sudo journalctl -u keysherpa-hub -f
```

You should see:
```
[KeySherpa Hub] Starting Z-Wave driver...
[KeySherpa Hub] Z-Wave ready. Polling for commands...
```

### 7.2 Verify cellular-first startup order

The `After=network-online.target` ensures the service waits for network before starting. To ensure cellular specifically is up:

```bash
sudo nano /etc/systemd/system/wait-for-cellular.service
```

```ini
[Unit]
Description=Wait for cellular connection
After=NetworkManager.service ModemManager.service
Before=keysherpa-hub.service

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'for i in $(seq 1 30); do nmcli -t -f TYPE,STATE device | grep -q "gsm:connected" && exit 0; sleep 2; done; exit 1'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable wait-for-cellular
```

Update keysherpa-hub.service to add `wait-for-cellular.service` to `After=`:
```ini
After=network-online.target ModemManager.service wait-for-cellular.service
```

---

## Part 8 — Verify End-to-End

### 8.1 Check hub is checking in

Watch the logs:
```bash
sudo journalctl -u keysherpa-hub -f
```

Should show polling every 2 seconds without errors.

Check `last_seen_at` is updating in Supabase:
```sql
SELECT id, name, last_seen_at FROM hubs ORDER BY last_seen_at DESC;
```

### 8.2 Test a lock command manually

From your laptop, insert a test command directly in Supabase SQL editor:
```sql
INSERT INTO hub_commands (hub_id, command_type, payload, status)
VALUES ('<your-hub-id>', 'get_status', '{"nodeId": <node-id>}', 'pending');
```

Watch the Pi logs — it should pick it up within 2 seconds and mark it completed. Then check:
```sql
SELECT status, result, error FROM hub_commands ORDER BY created_at DESC LIMIT 1;
```

### 8.3 Test a real tour

Book a tour for a Pi-connected property. 15 minutes before the tour:
- Inngest triggers `provision-access-code`
- Pi provider inserts a `create_code` command
- Pi executes it via Z-Wave
- Lock programs the code
- Code is sent to visitor via SMS

---

## Part 9 — Maintenance

### View logs
```bash
sudo journalctl -u keysherpa-hub --since "1 hour ago"
```

### Restart service
```bash
sudo systemctl restart keysherpa-hub
```

### Update hub software

```bash
# On your laptop
scp -r pi/keysherpa-hub pi@<pi-ip>:/home/pi/

# On the Pi
cd /home/pi/keysherpa-hub
npm install
npm run build
sudo systemctl restart keysherpa-hub
```

### Check cellular signal
```bash
mmcli -m 0 | grep -E "signal|state|access tech"
```

### Hub offline alert
The hub health check (runs every 4 hours) checks `last_seen_at`. If a hub hasn't checked in for 5+ minutes it's considered offline and an alert email is sent.

---

## Startup Sequence Summary

On every boot, the Pi follows this sequence:

1. **Kernel boots** → hardware watchdog armed
2. **ModemManager starts** → detects USB modem
3. **NetworkManager starts** → brings up cellular (hologram APN)
4. **wait-for-cellular** → polls until `gsm:connected` (max 60s)
5. **keysherpa-hub starts** → Z-Wave driver initializes, polling begins
6. **Hub checks in** → `last_seen_at` updates in Supabase, dashboard shows Online

If any step fails, systemd restarts the service (up to 5 times per 60 seconds). If the process hangs entirely, the hardware watchdog reboots the Pi.
