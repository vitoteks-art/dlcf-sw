import json
import re
import sys
from pathlib import Path


def extract_state_regions(source: str):
    state_regions = {}
    pattern = re.compile(r'(?:if|else if)\s*\(state === "([^"]+)"\)\s*\{(.*?)\n\s*\}', re.S)
    for match in pattern.finditer(source):
        state = match.group(1).strip()
        block = match.group(2)
        regions = re.findall(r'option value="([^"]+)"', block)
        if regions:
            state_regions[state] = sorted(set(regions))
    return state_regions


def extract_region_centres(source: str):
    region_centres = {}
    pattern = re.compile(r'(?:if|else if)\s*\(region === "([^"]+)"\)\s*\{(.*?)\n\s*\}', re.S)
    for match in pattern.finditer(source):
        region = match.group(1).strip()
        block = match.group(2)
        centres = re.findall(r'option value="([^"]+)"', block)
        if centres:
            region_centres[region] = centres
    return region_centres


def build_locations(state_regions, region_centres):
    region_to_state = {}
    for state, regions in state_regions.items():
        for region in regions:
            region_to_state[region] = state

    locations = {}
    for state, regions in state_regions.items():
        locations[state] = {"regions": {}}
        for region in regions:
            centres = region_centres.get(region, [])
            locations[state]["regions"][region] = sorted(set(centres))

    missing = sorted({r for r in region_centres if r not in region_to_state})
    return locations, missing


def write_seed_sql(locations, output_path: Path):
    rows = []
    for state, data in locations.items():
        for region, centres in data["regions"].items():
            for centre in centres:
                name = centre.replace("'", "''")
                rows.append(f"('{name}', '{state}', '{region}', NOW(), NOW())")

    if not rows:
        output_path.write_text("-- No centres found.\n")
        return

    sql = (
        "INSERT INTO fellowship_centres (name, state, region, created_at, updated_at)\nVALUES\n"
        + ",\n".join(rows)
        + ";\n"
    )
    output_path.write_text(sql)


def main():
    if len(sys.argv) < 2:
        print("Usage: extract_locations.py <dlcfform.php> [output_dir]")
        sys.exit(1)

    source_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path.cwd()

    source = source_path.read_text(encoding="utf-8", errors="ignore")
    state_regions = extract_state_regions(source)
    region_centres = extract_region_centres(source)
    locations, missing = build_locations(state_regions, region_centres)

    output_dir.mkdir(parents=True, exist_ok=True)

    locations_path = output_dir / "locations.json"
    locations_path.write_text(json.dumps(locations, indent=2, ensure_ascii=True) + "\n")

    seed_path = output_dir / "seed_fellowships.sql"
    write_seed_sql(locations, seed_path)

    if missing:
        missing_path = output_dir / "missing_regions.json"
        missing_path.write_text(json.dumps(missing, indent=2, ensure_ascii=True) + "\n")

    print(f"Wrote {locations_path}")
    print(f"Wrote {seed_path}")
    if missing:
        print(f"Wrote {missing_path}")


if __name__ == "__main__":
    main()
