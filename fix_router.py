
import os

file_path = 'frontend/src/app/router.tsx'

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Middle part: lines 410 and 411 (1-indexed)
# End part: lines 508, 509, 510 (1-indexed)

new_lines = []
removed_count = 0
for i, line in enumerate(lines):
    line_num = i + 1
    # Check middle dangling brackets
    if line_num in [410, 411]:
        if '],' in line or '},' in line:
            print(f"Removing line {line_num}: {repr(line)}")
            removed_count += 1
            continue
    # Check end dangling brackets (including the empty line 508)
    if line_num in [508, 509, 510]:
        print(f"Removing line {line_num}: {repr(line)}")
        removed_count += 1
        continue
    new_lines.append(line)

if removed_count > 0:
    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(new_lines)
    print(f"Successfully updated router.tsx, removed {removed_count} lines")
else:
    print("No lines were removed. Check line numbers or content.")
