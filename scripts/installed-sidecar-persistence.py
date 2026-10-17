#!/usr/bin/env python3
"""Real installed-app sidecar/SQLite probe, isolated CI runners only."""
import argparse
import json
import os
from pathlib import Path
import platform
import sqlite3
import sys
import time
import urllib.request
import uuid

URL = "http://127.0.0.1:8787/health"
TABLE = "cineharbor_ci_installed_smoke"


def data_directory():
    if platform.system() == "Darwin":
        return Path.home() / "Library" / "Application Support" / "com.cineharbor.desktop"
    if platform.system() == "Windows":
        if "APPDATA" not in os.environ:
            raise RuntimeError("Missing native Windows APPDATA")
        return Path(os.environ["APPDATA"]) / "com.cineharbor.desktop"
    raise RuntimeError("Unsupported installed target")


def healthy():
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    deadline = time.monotonic() + 30
    last_error = None
    while time.monotonic() < deadline:
        try:
            with opener.open(URL, timeout=2) as response:
                if response.status != 200:
                    raise RuntimeError("Sidecar health HTTP status is not 200")
                result = json.loads(response.read(16385))
            if not isinstance(result, dict) or result.get("status") != "ok" or result.get("version") != "1.0.0":
                raise RuntimeError("Sidecar health status/version mismatch")
            return {"status": "ok", "version": "1.0.0"}
        except (OSError, ValueError, RuntimeError) as exc:
            last_error = type(exc).__name__
            time.sleep(0.5)
    raise RuntimeError(f"Installed sidecar health check timed out: {last_error}")


def check(mode, evidence):
    health = healthy()
    root = data_directory()
    config = root / "desktop.config.json"
    database = root / "cineharbor-desktop.sqlite3"
    if not config.is_file() or not isinstance(json.loads(config.read_text(encoding="utf-8")), dict):
        raise RuntimeError("Real app config JSON not initialized by installed app")
    if not database.is_file():
        raise RuntimeError("Real SQLite database not created by installed sidecar")
    marker_path = evidence / "sqlite-probe-marker.txt"
    with sqlite3.connect(str(database), timeout=10) as conn:
        conn.execute("PRAGMA busy_timeout = 10000")
        if mode == "seed":
            marker = uuid.uuid4().hex
            conn.execute(f"CREATE TABLE IF NOT EXISTS {TABLE} (id TEXT PRIMARY KEY, value TEXT NOT NULL)")
            conn.execute(f"INSERT OR REPLACE INTO {TABLE} (id, value) VALUES (?, ?)", ("relaunch", marker))
            conn.commit()
            marker_path.write_text(marker, encoding="utf-8")
        else:
            marker = marker_path.read_text(encoding="utf-8")
            actual = conn.execute(f"SELECT value FROM {TABLE} WHERE id = ?", ("relaunch",)).fetchall()
            if actual != [(marker,)]:
                raise RuntimeError("SQLite data did not persist across installed-app relaunch")
    summary = {
        "mode": mode, "health": health, "app_config_present": True,
        "sqlite_present": True, "sqlite_marker_retained": mode == "verify",
        "signed_updater_verified": False, "interactive_playback_verified": False,
    }
    (evidence / f"sidecar-{mode}.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["seed", "verify"])
    parser.add_argument("--evidence", required=True)
    args = parser.parse_args()
    try:
        dest = Path(args.evidence)
        dest.mkdir(parents=True, exist_ok=True)
        check(args.mode, dest)
    except (OSError, ValueError, RuntimeError, sqlite3.Error) as exc:
        print(f"Installed app sidecar/data acceptance failed: {exc}", file=sys.stderr)
        sys.exit(1)
