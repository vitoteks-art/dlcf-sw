# DLCF SW Portal Runbook

## Service
- Service name: `dlcf-sw-portal.service`
- Project root: `/root/.openclaw/workspace-atlas/dlcf-sw/web`
- Static build dir: `/root/.openclaw/workspace-atlas/dlcf-sw/web/dist`
- Default port: `4173`
- Healthcheck: `http://127.0.0.1:4173/health`

## Common commands
```bash
systemctl --user status dlcf-sw-portal.service
systemctl --user restart dlcf-sw-portal.service
journalctl --user -u dlcf-sw-portal.service -n 100 --no-pager
curl http://127.0.0.1:4173/health
```

## Deploy/update flow
1. Build/update the frontend so `dist/` contains the latest production files.
2. Restart the user service:
   ```bash
   systemctl --user restart dlcf-sw-portal.service
   ```
3. Verify:
   ```bash
   curl -I http://127.0.0.1:4173/
   curl http://127.0.0.1:4173/health
   ```

## Rollback
- Restore a previous known-good `dist/` bundle or zip export.
- Restart the service:
  ```bash
  systemctl --user restart dlcf-sw-portal.service
  ```

## Notes
- This service replaces ad-hoc `vite preview` usage for better persistence.
- If a future domain proxy is added, point it to this internal service instead of `vite preview`.
