"""One-shot, hash-bound translation of the observed Rust 1.98.1 diagnostics."""
from pathlib import Path
import hashlib
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src-tauri/src/lib.rs"
BEFORE = "5c833c4eabaec636153b976a3f899558508d52692f976b41a32f91fec7d32536"
AFTER = "18144b099a3f582c590c513c8b96cac5aca22ed58e1213d2db6266107284f521"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> None:
    original = SOURCE.read_bytes()
    require(hashlib.sha256(original).hexdigest() == BEFORE,
            "AGNIR_CHECKPOINT_CONFLICT: Rust source differs from reviewed preimage")
    lines = original.decode("utf-8").splitlines(keepends=True)
    ranges = [(650, 654), (1192, 1196), (1198, 1202), (1805, 1809),
              (4116, 4120), (4149, 4153), (4385, 4391), (4494, 4505),
              (4555, 4567), (5210, 5218)]
    for first, last in reversed(ranges):
        block = lines[first - 1:last]
        indent = block[0][:len(block[0]) - len(block[0].lstrip())]
        require(block[0].lstrip().startswith("if let ") and block[0].endswith(" {\n"), "outer guard changed")
        require(block[1].startswith(indent + "    if ") and block[1].endswith(" {\n"), "inner guard changed")
        require(block[-2:] == [indent + "    }\n", indent + "}\n"], "guard boundary changed")
        body = [line[4:] if line.startswith("    ") else line for line in block[2:-2]]
        lines[first - 1:last] = [block[0][:-3] + "\n",
            indent + "    && " + block[1].strip()[3:-2] + "\n", indent + "{\n", *body, block[-1]]
    source = "".join(lines)
    for old, new in [("RunEvent::Exit { .. }", "RunEvent::Exit"),
                     ("status_code >= 200 && status_code < 300", "(200..300).contains(&status_code)")]:
        require(source.count(old) == 1, "diagnostic target changed")
        source = source.replace(old, new)
    start = source.index("fn open_url_in_system_browser(")
    end = source.index("\nstruct PreparedDesktopUpdateDownload", start)
    fragment = source[start:end]
    require(fragment.count("return Ok(());") == 3, "platform return boundary changed")
    source = source[:start] + fragment.replace("return Ok(());", "Ok(())") + source[end:]
    fd, filename = tempfile.mkstemp(suffix=".rs", prefix="desktop-ci-", dir=SOURCE.parent)
    temporary = Path(filename)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(source)
        subprocess.run(["rustfmt", "--edition", "2024", str(temporary)], check=True)
        require(hashlib.sha256(temporary.read_bytes()).hexdigest() == AFTER,
                "reviewed Rust postimage mismatch; refusing publication")
        temporary.chmod(SOURCE.stat().st_mode & 0o777)
        os.replace(temporary, SOURCE)
    finally:
        temporary.unlink(missing_ok=True)
    print(f"DESKTOP_RUST_REPAIR_SHA256={AFTER}")


if __name__ == "__main__":
    main()
