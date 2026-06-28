import os

Create directory structure
base_dir = "/mnt/agents/output/batik-lanka"
dirs = [
"admin", "css", "js", "images", "firebase", "lang"
]

for d in dirs:
os.makedirs(os.path.join(base_dir, d), exist_ok=True)

print("Directory structure created successfully!")
print(os.listdir(base_dir))