#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# Get the first 2 arguments.
args = sys.argv[1:]
if len(args) != 2:
    print('Usage: generate_k8s.py <hash> <repo>')
    sys.exit(1)
hash_ = args[0]
repo = args[1]

# Get the directory this script is in.
scripts_folder = os.path.dirname(os.path.realpath(__file__))

# Generate the template file.
with open(os.path.join(scripts_folder, 'k8s.template.yaml'), 'r') as f:
    content = f.read().replace('{hash}', hash_).replace('{repo}', repo)
    with open(os.path.join(scripts_folder, '..', 'k8s.generated.yaml'), 'w+') as f:
        f.write(content)

# Log that the file was generated.
print('Generated k8s.generated.yaml')
