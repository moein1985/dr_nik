#!/bin/sh
# Rotate logs: keep last 5000 lines, restart log follower
docker logs --tail 5000 dr_nik_clinic_app > /root/app-logs-rotated.txt 2>&1
mv /root/app-logs-rotated.txt /root/app-logs.txt
pkill -f "docker logs -f" 2>/dev/null
nohup docker logs -f --tail 0 dr_nik_clinic_app >> /root/app-logs.txt 2>&1 &
