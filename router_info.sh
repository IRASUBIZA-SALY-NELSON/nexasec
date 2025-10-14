#!/bin/bash
# router-info.sh
# A quick script to gather router & network details from Linux terminal

echo "🔎 Router & Network Information"
echo "=================================="

# Find default gateway (router IP)
ROUTER_IP=$(ip route | grep default | awk '{print $3}')

echo "📌 Router IP (Default Gateway): $ROUTER_IP"
echo

# Ping test
echo "📡 Ping Test to Router:"
ping -c 4 $ROUTER_IP
echo

# TTL value (helps guess OS)
TTL=$(ping -c 1 $ROUTER_IP | grep ttl | awk -F "ttl=" '{print $2}' | awk '{print $1}')
echo "🛠 TTL Value: $TTL"
if [ ! -z "$TTL" ]; then
  if [ $TTL -le 64 ]; then
    echo "   → Likely Linux-based firmware (Huawei, MikroTik, OpenWrt, etc)."
  elif [ $TTL -le 128 ]; then
    echo "   → Likely Windows-based system."
  elif [ $TTL -le 255 ]; then
    echo "   → Likely a network appliance (Huawei, Cisco, Juniper, etc)."
  fi
fi
echo

# Traceroute
echo "🌍 Traceroute to Router (first 3 hops):"
traceroute -m 3 $ROUTER_IP
echo

# Nmap scan (if installed)
if command -v nmap &> /dev/null
then
  echo "🧭 Nmap scan of router:"
  sudo nmap -A -T4 $ROUTER_IP
else
  echo "⚠️ Nmap not installed. Install with: sudo apt install nmap"
fi
echo

# Public IP check
echo "🌐 Public IP & ISP Information:"
if command -v curl &> /dev/null
then
  PUBLIC_IP=$(curl -s ifconfig.me)
  echo "Public IP: $PUBLIC_IP"
  echo

  # ISP / ASN details
  echo "🔍 ISP / ASN Info:"
  curl -s ipinfo.io/$PUBLIC_IP
else
  echo "⚠️ curl not installed. Install with: sudo apt install curl"
fi

echo
echo "✅ Scan completed."
