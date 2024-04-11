#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# Get the first 3 arguments.
args = sys.argv[1:]
if len(args) != 3:
    print('Usage: generate_k8s.py <shard count> <hash> <repo>')
    sys.exit(1)

# Make sure the shard count is a whole number >= 1.
try:
    shard_count = int(args[0])
    if shard_count < 1:
        raise ValueError()
except ValueError:
    print('Shard count must be a whole number >= 1')
    sys.exit(1)

# Get the last 2 arguments.
hash_ = args[1]
repo = args[2]

# Get the directory this script is in.
scripts_folder = os.path.dirname(os.path.realpath(__file__))

# Generate the template file.
with open(os.path.join(scripts_folder, 'k8s.template.yml'), 'r') as f:
    content = f.read().replace('{hash}', hash_).replace('{repo}', repo).replace('{shard_count}', str(shard_count))
    with open(os.path.join(scripts_folder, '..', 'k8s.generated.yml'), 'w+') as f:
        f.write(content)

# Log that the file was generated.
print('Generated k8s.generated.yml')
