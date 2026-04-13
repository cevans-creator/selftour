#!/usr/bin/env bash
set -euo pipefail

# ─── KeySherpa Hub Provisioning Script ────────────────────────────────────────
# Run this on a fresh Raspberry Pi to set up everything automatically.
# Usage: ./provision.sh <hub-number>
# Example: ./provision.sh 02
# ──────────────────────────────────────────────────────────────────────────────

# ─── Configuration ────────────────────────────────────────────────────────────
API_BASE="https://www.keysherpa.io"
PROVISION_API_KEY="24147f7a35d87492180e9b67906f837ff314ffe3229705e1bcfd7ee491fd9cc6"
TAILSCALE_AUTH_KEY=""           # Optional: set to a reusable Tailscale auth key
# ──────────────────────────────────────────────────────────────────────────────

if [ -z "${1:-}" ]; then
  echo "Usage: ./provision.sh <hub-number>"
  echo "Example: ./provision.sh 02"
  exit 1
fi

HUB_NUMBER="$1"
HOSTNAME="keysherpa-hub-${HUB_NUMBER}"

echo ""
echo "============================================"
echo "  KeySherpa Hub Provisioning"
echo "  Hub: ${HOSTNAME}"
echo "============================================"
echo ""

# ─── Step 1: Set hostname ────────────────────────────────────────────────────
echo "[1/10] Setting hostname to ${HOSTNAME}..."
sudo hostnamectl set-hostname "${HOSTNAME}"
echo "127.0.1.1 ${HOSTNAME}" | sudo tee -a /etc/hosts > /dev/null

# ─── Step 2: System update and packages ───────────────────────────────────────
echo "[2/10] Updating system and installing packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y watchdog network-manager curl jq

# ─── Step 3: Hardware watchdog ────────────────────────────────────────────────
echo "[3/10] Configuring hardware watchdog..."
if ! grep -q "dtparam=watchdog=on" /boot/firmware/config.txt 2>/dev/null; then
  echo "dtparam=watchdog=on" | sudo tee -a /boot/firmware/config.txt > /dev/null
fi
sudo tee /etc/watchdog.conf > /dev/null <<WDEOF
watchdog-device = /dev/watchdog
watchdog-timeout = 15
max-load-1 = 24
WDEOF
sudo systemctl enable watchdog
sudo systemctl start watchdog || true

# ─── Step 4: Z-Wave udev rule ────────────────────────────────────────────────
echo "[4/10] Setting up Z-Wave USB stick udev rule..."
sudo tee /etc/udev/rules.d/99-zwave.rules > /dev/null <<UDEVEOF
SUBSYSTEM=="tty", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", SYMLINK+="zwave"
UDEVEOF
sudo udevadm control --reload-rules
sudo udevadm trigger
sudo usermod -a -G dialout pi

# ─── Step 5: Cellular setup ──────────────────────────────────────────────────
echo "[5/10] Setting up cellular connection..."
sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager
sleep 3

# Create Hologram connection if it doesn't exist
if ! nmcli connection show hologram &>/dev/null; then
  sudo nmcli connection add type gsm ifname '*' con-name hologram apn hologram
fi
sudo nmcli connection modify hologram ipv4.route-metric 50
sudo nmcli connection modify hologram connection.autoconnect yes

# Set ethernet to lower priority
WIRED_CON=$(nmcli -t -f NAME,TYPE connection show | grep ethernet | head -1 | cut -d: -f1)
if [ -n "${WIRED_CON}" ]; then
  sudo nmcli connection modify "${WIRED_CON}" ipv4.route-metric 100
fi

# Auto-reconnect config
sudo mkdir -p /etc/NetworkManager/conf.d
sudo tee /etc/NetworkManager/conf.d/cellular.conf > /dev/null <<NMEOF
[connection]
connection.autoconnect-retries=0
NMEOF
sudo systemctl restart NetworkManager
sleep 3
sudo nmcli connection up hologram || echo "Warning: Could not bring up cellular yet (SIM may not be inserted)"

# ─── Step 6: Tailscale ───────────────────────────────────────────────────────
echo "[6/10] Installing Tailscale..."
if ! command -v tailscale &>/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
if [ -n "${TAILSCALE_AUTH_KEY}" ]; then
  sudo tailscale up --authkey="${TAILSCALE_AUTH_KEY}"
  echo "  Tailscale connected automatically."
else
  echo "  No auth key set. Run 'sudo tailscale up' manually to authenticate."
fi

# ─── Step 7: Node.js ─────────────────────────────────────────────────────────
echo "[7/10] Installing Node.js..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "  Node.js $(node --version)"

# ─── Step 8: Hub client ──────────────────────────────────────────────────────
echo "[8/10] Building hub client..."
cd /home/pi/keysherpa-hub
npm install
npm run build

# ─── Step 9: Register with KeySherpa API ──────────────────────────────────────
echo "[9/10] Registering hub with KeySherpa..."
RESPONSE=$(curl -s -X POST "${API_BASE}/api/hub/provision" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${PROVISION_API_KEY}" \
  -d "{\"hostname\": \"${HOSTNAME}\"}")

HUB_ID=$(echo "$RESPONSE" | jq -r '.hubId')
AUTH_TOKEN=$(echo "$RESPONSE" | jq -r '.authToken')
CLAIM_CODE=$(echo "$RESPONSE" | jq -r '.claimCode')

if [ "$HUB_ID" = "null" ] || [ -z "$HUB_ID" ]; then
  echo "ERROR: Failed to register hub. API response:"
  echo "$RESPONSE"
  exit 1
fi

# Save credentials
sudo mkdir -p /etc/keysherpa
sudo tee /etc/keysherpa/hub.env > /dev/null <<ENVEOF
HUB_ID=${HUB_ID}
AUTH_TOKEN=${AUTH_TOKEN}
API_BASE=${API_BASE}
ZWAVE_DEVICE=/dev/zwave
ENVEOF
sudo chmod 600 /etc/keysherpa/hub.env

# Z-Wave cache directory
sudo mkdir -p /var/lib/keysherpa-hub/cache
sudo chown pi:pi /var/lib/keysherpa-hub/cache

# ─── Step 10: Systemd services ───────────────────────────────────────────────
echo "[10/10] Setting up systemd services..."

sudo tee /etc/systemd/system/wait-for-cellular.service > /dev/null <<WCEOF
[Unit]
Description=Wait for cellular connection
After=NetworkManager.service
Before=keysherpa-hub.service

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'for i in \$(seq 1 30); do nmcli -t -f TYPE,STATE device | grep -q "gsm:connected" && exit 0; sleep 2; done; exit 1'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
WCEOF

sudo tee /etc/systemd/system/keysherpa-hub.service > /dev/null <<SVCEOF
[Unit]
Description=KeySherpa Hub Client
After=network-online.target wait-for-cellular.service
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
WatchdogSec=60
NotifyAccess=none

[Install]
WantedBy=multi-user.target
SVCEOF

sudo systemctl daemon-reload
sudo systemctl enable wait-for-cellular keysherpa-hub
sudo systemctl start keysherpa-hub

echo ""
echo "============================================"
echo "  PROVISIONING COMPLETE"
echo ""
echo "  Hostname:   ${HOSTNAME}"
echo "  Hub ID:     ${HUB_ID}"
echo "  Claim Code: ${CLAIM_CODE}"
echo ""
echo "  Write this code on the card shipped"
echo "  with the hub:"
echo ""
echo "       >>> ${CLAIM_CODE} <<<"
echo ""
echo "============================================"
echo ""
