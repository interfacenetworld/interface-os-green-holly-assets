#!/usr/bin/env python3
"""Safely extract the original Interface OS Green Holly asset kit to assets/.

Local-only import utility. Does not upload data, perform a Git commit, or deploy.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, BadZipFile

EXPECTED_FILES = 445
ALLOWED_EXT = {".png", ".svg", ".gif", ".css", ".html", ".md", ".json"}
MAX_UNCOMPRESSED = 100_000_000
MAX_FILE = 8_000_000

def import_kit(archive: Path, destination: Path) -> dict:
    if not archive.is_file():
        raise FileNotFoundError(archive)
    if destination.exists() and any(destination.iterdir()):
        raise FileExistsError(f"Destination must be empty: {destination}")
    with ZipFile(archive) as zf:
        infos = [f for f in zf.infolist() if not f.is_dir()]
        if len(infos) != EXPECTED_FILES:
            raise ValueError(f"Expected {EXPECTED_FILES} files; got {len(infos)}")
        if sum(f.file_size for f in infos) > MAX_UNCOMPRESSED:
            raise ValueError("Archive size exceeds safety limit")
        names = set()
        validated = []
        for info in infos:
            original = PurePosixPath(info.filename)
            parts = original.parts
            if original.is_absolute() or len(parts)<2 or ".." in parts or "\\" in info.filename:
                raise ValueError(f"Unsafe ZIP path: {info.filename}")
            relative = PurePosixPath(*parts[1:])
            if not relative.parts or relative.suffix.lower() not in ALLOWED_EXT:
                raise ValueError(f"Unexpected file type: {info.filename}")
            if info.file_size > MAX_FILE:
                raise ValueError(f"File exceeds size limit: {info.filename}")
            if str(relative) in names:
                raise ValueError(f"Duplicate file name: {relative}")
            names.add(str(relative))
            validated.append((info,relative))
        root = destination.resolve()
        records=[]
        for info,rel in validated:
            target=destination.joinpath(*rel.parts)
            if not target.resolve().is_relative_to(root):
                raise ValueError("Unsafe extracted target")
            target.parent.mkdir(parents=True,exist_ok=True)
            data=zf.read(info)
            target.write_bytes(data)
            records.append({"file":str(rel),"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()})
    return {"files":len(records),"bytes":sum(x["bytes"] for x in records),"files_manifest":records}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip_file",type=Path)
    parser.add_argument("--output",type=Path,default=Path("assets"))
    args=parser.parse_args()
    result=import_kit(args.zip_file,args.output)
    print(f"Imported {result['files']} assets ({result['bytes']} bytes) into {args.output}")
    print("Original ZIP paths preserved beneath assets/. Review git status before committing.")

if __name__=="__main__":
    main()
