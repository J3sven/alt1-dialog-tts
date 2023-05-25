import json

# Read the text file
with open('src/data/female.txt', 'r') as f:
    lines = f.readlines()

# Remove newline characters from each line and convert to all caps
lines = [line.strip().upper() for line in lines]

# Create an object with the lines as separate strings
female_npcs = {'FemaleNpcs': lines}

# Write the object to a JSON file
with open('src/data/FemaleNpcs.json', 'w') as f:
    json.dump(female_npcs, f, indent=4)

print('FemaleNpcs.json file created successfully.')