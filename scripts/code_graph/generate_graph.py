#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Codebase Knowledge Graph Generator
Parses Go, Python, and JavaScript/TypeScript files, builds a dependency graph,
and outputs a JSON index and an interactive HTML visualizer.
"""

import os
import re
import json
import ast
import fnmatch
import subprocess
from visualizer_template import HTML_TEMPLATE

class GitIgnoreMatcher:
    """Parses and matches file paths against .gitignore rules."""
    def __init__(self, root_dir):
        self.root_dir = os.path.abspath(root_dir)
        self.rules = []
        self.load_gitignore(os.path.join(self.root_dir, '.gitignore'))
        
    def load_gitignore(self, path):
        if not os.path.exists(path):
            return
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                # Handle negations
                is_negated = False
                if line.startswith('!'):
                    is_negated = True
                    line = line[1:]
                self.rules.append((line, is_negated))

    def is_ignored(self, path):
        # Resolve path relative to root
        abs_path = os.path.abspath(path)
        if not abs_path.startswith(self.root_dir):
            return True
            
        rel_path = os.path.relpath(abs_path, self.root_dir).replace('\\', '/')
        parts = rel_path.split('/')
        
        # Hardcoded default ignore list for speed and safety
        hard_ignores = {
            '.git', 'node_modules', '.next', '__pycache__', 
            '.venv', 'venv', 'ENV', '.vscode', '.idea',
            'dist', 'build', '.agents', '.gemini'
        }
        for part in parts:
            if part in hard_ignores:
                return True
                
        # File extension ignores for binary files
        _, ext = os.path.splitext(abs_path)
        if ext.lower() in ['.exe', '.dll', '.so', '.dylib', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.db']:
            return True

        # Match gitignore patterns
        ignored = False
        for rule, is_negated in self.rules:
            # Rule ending in slash matches directories only
            is_dir_rule = rule.endswith('/')
            clean_rule = rule.rstrip('/')
            
            # Check if there is a directory separator in the rule
            if '/' in clean_rule:
                # Absolute/Relative path matching
                match_pattern = clean_rule
                if not clean_rule.startswith('/'):
                    # If it doesn't start with / it can match anywhere
                    match_pattern = '*/' + clean_rule
                else:
                    match_pattern = clean_rule[1:]
                    
                match = (fnmatch.fnmatchcase(rel_path, match_pattern) or 
                         fnmatch.fnmatchcase(rel_path, clean_rule) or
                         fnmatch.fnmatchcase(rel_path + '/', clean_rule + '/'))
            else:
                # Base name matching (matches in any subdirectory)
                match = any(fnmatch.fnmatchcase(part, clean_rule) for part in parts)
                
            if match:
                ignored = not is_negated
                
        return ignored


def parse_go_file(filepath):
    """Parses Go files to extract package, imports, structs, and functions."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading Go file {filepath}: {e}")
        return {"package": "", "imports": [], "classes_structs": [], "functions": []}

    # Extract package
    package_match = re.search(r'\bpackage\s+([a-zA-Z0-9_]+)', content)
    package = package_match.group(1) if package_match else ""

    # Extract imports
    imports = []
    # Single imports: import "..."
    single_imports = re.findall(r'\bimport\s+"([^"]+)"', content)
    imports.extend(single_imports)
    
    # Block imports: import ( ... )
    block_imports_matches = re.finditer(r'\bimport\s*\(\s*(.*?)\s*\)', content, re.DOTALL)
    for match in block_imports_matches:
        block_content = match.group(1)
        for line in block_content.split('\n'):
            line = line.strip()
            # Remove comments
            line = re.sub(r'//.*', '', line).strip()
            if not line:
                continue
            # Match "..." inside the line
            m = re.search(r'"([^"]+)"\s*$', line)
            if m:
                imports.append(m.group(1))

    # Extract structs (representing models or data types)
    structs = re.findall(r'\btype\s+([a-zA-Z0-9_]+)\s+struct\b', content)

    # Extract functions
    # 1. Standard: func GetOrder(...)
    funcs_std = re.findall(r'\bfunc\s+([a-zA-Z0-9_]+)\s*\(', content)
    # 2. Receiver: func (o *Order) Save(...)
    funcs_recv = re.findall(r'\bfunc\s*\(\s*(?:[a-zA-Z0-9_]+\s+)?\*?[a-zA-Z0-9_]+\s*\)\s+([a-zA-Z0-9_]+)\s*\(', content)
    
    functions = list(set(funcs_std + funcs_recv))
    if "init" in functions:
        functions.remove("init")
        
    return {
        "package": package,
        "imports": list(set(imports)),
        "classes_structs": structs,
        "functions": functions
    }


def parse_python_file(filepath):
    """Parses Python files using AST to extract classes, functions, and imports."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading Python file {filepath}: {e}")
        return {"imports": [], "classes_structs": [], "functions": []}
        
    try:
        tree = ast.parse(content, filename=filepath)
    except Exception as e:
        # Fallback to Regex if AST parsing fails
        print(f"AST parsing failed for {filepath}, using regex fallback. Error: {e}")
        return parse_python_file_regex(content)
        
    imports = []
    classes = []
    functions = []
    
    for node in ast.walk(tree):
        # Imports
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module if node.module else ""
            level = node.level  # 1 for . , 2 for .. etc.
            prefix = "." * level
            full_module = prefix + module
            for name in node.names:
                imports.append(f"{full_module}.{name.name}" if full_module else name.name)
                
        # Classes
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
            
        # Functions / Async Functions
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)
            
    return {
        "imports": list(set(imports)),
        "classes_structs": list(set(classes)),
        "functions": list(set(functions))
    }


def parse_python_file_regex(content):
    """Fallback regex parser for Python files if AST fails."""
    imports = []
    # import x, y
    imp_matches = re.findall(r'^\s*import\s+([a-zA-Z0-9_,\s.]+)', content, re.MULTILINE)
    for match in imp_matches:
        for name in match.split(','):
            imports.append(name.strip())
            
    # from x import y
    from_matches = re.findall(r'^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+([a-zA-Z0-9_,\s*]+)', content, re.MULTILINE)
    for mod, names in from_matches:
        for name in names.split(','):
            imports.append(f"{mod}.{name.strip()}")

    classes = re.findall(r'^\s*class\s+([a-zA-Z0-9_]+)', content, re.MULTILINE)
    functions = re.findall(r'^\s*(?:def|async\s+def)\s+([a-zA-Z0-9_]+)\s*\(', content, re.MULTILINE)
    
    return {
        "imports": list(set(imports)),
        "classes_structs": classes,
        "functions": functions
    }


def parse_js_ts_file(filepath):
    """Parses JavaScript/TypeScript files to extract imports, classes, and functions."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading JS/TS file {filepath}: {e}")
        return {"imports": [], "classes_structs": [], "functions": []}

    imports = []
    # Extract import sources:
    # import X from 'source', import { X } from 'source', import 'source'
    import_from_matches = re.findall(r'\bfrom\s+[\'"]([^\'\"]+)[\'"]', content)
    import_direct_matches = re.findall(r'\bimport\s+[\'"]([^\'\"]+)[\'"]', content)
    # require('source')
    require_matches = re.findall(r'\brequire\s*\(\s*[\'"]([^\'\"]+)[\'"]\s*\)', content)
    
    imports.extend(import_from_matches)
    imports.extend(import_direct_matches)
    imports.extend(require_matches)
    imports = list(set(imports))

    # Extract classes
    classes = re.findall(r'\bclass\s+([a-zA-Z0-9_]+)\b', content)

    # Extract functions (standard, arrow, and exports)
    funcs_std = re.findall(r'\bfunction\s+([a-zA-Z0-9_]+)\b', content)
    funcs_arrow = re.findall(r'\b(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(.*?\)\s*=>', content)
    funcs_export = re.findall(r'\bexport\s+(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\b', content)
    funcs_export_const = re.findall(r'\bexport\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(.*?\)\s*=>', content)

    functions = list(set(funcs_std + funcs_arrow + funcs_export + funcs_export_const))
    ignore_words = {'typeof', 'import', 'export', 'default', 'from', 'as'}
    functions = [f for f in functions if f not in ignore_words]

    return {
        "imports": imports,
        "classes_structs": classes,
        "functions": functions
    }


def categorize_cluster(rel_path):
    """Categorizes files into logical clusters based on path patterns."""
    path_lower = rel_path.lower().replace('\\', '/')
    filename = os.path.basename(path_lower)
    
    # Main entry points
    if filename in ['main.go', 'main.py', 'app.py', 'index.js', 'index.ts', 'server.js', 'next.config.js', 'tailwind.config.js']:
        return 'Main/Entry'
        
    # Routes & Pages
    if ('/app/' in path_lower or '/pages/' in path_lower) and filename.split('.')[0] in ['page', 'route', 'layout']:
        return 'Routes/Endpoints'
    if '/routes/' in path_lower or '/handlers/' in path_lower or '/controllers/' in path_lower:
        if 'handler' in filename or 'controller' in filename:
            return 'Controllers/Handlers'
        return 'Routes/Endpoints'
        
    # Database Models
    if '/models/' in path_lower or '/db/' in path_lower or '/schemas/' in path_lower or 'model' in filename:
        return 'DB Models'
        
    # Components & UI Views
    if '/components/' in path_lower or '/context/' in path_lower or '/views/' in path_lower or '/ui/' in path_lower:
        return 'Components/Context'
        
    # Middleware, Services & background runners
    if '/middleware/' in path_lower or '/services/' in path_lower or '/cron/' in path_lower or '/tasks/' in path_lower or 'middleware' in filename:
        return 'Services/Middleware'
        
    # Config & Utilities
    if '/utils/' in path_lower or '/lib/' in path_lower or '/config/' in path_lower or '/helpers/' in path_lower or 'util' in filename or 'config' in filename:
        return 'Utilities/Config'
        
    return 'Other'


def get_language(filepath):
    """Identifies the programming language from file extension."""
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    if ext == '.go':
        return 'Go'
    elif ext == '.py':
        return 'Python'
    elif ext in ['.ts', '.tsx']:
        return 'TypeScript'
    elif ext in ['.js', '.jsx']:
        return 'JavaScript'
    return 'Other'


def resolve_js_ts_import(source_file, import_path, all_files):
    """Resolves relative and aliased JavaScript/TypeScript import paths."""
    source_dir = os.path.dirname(source_file)
    
    # 1. Alias imports starting with '@/`
    # Detect which project (admin-dashboard or storefront) this is in
    project_prefix = ""
    for proj in ['admin-dashboard', 'storefront']:
        if source_file.replace('\\', '/').startswith(proj):
            project_prefix = proj
            break
            
    resolved_path = ""
    if import_path.startswith('@/'):
        # Alias resolves relative to the project root directory
        resolved_path = project_prefix + '/' + import_path[2:]
    elif import_path.startswith('.') or import_path.startswith('..'):
        # Relative import
        raw_combined = os.path.join(source_dir, import_path)
        resolved_path = os.path.normpath(raw_combined).replace('\\', '/')
    else:
        # Standard or third-party packages (e.g. 'react')
        return None

    # Clean path separators
    resolved_path = resolved_path.replace('\\', '/')
    
    # Try finding matching file based on potential extensions
    candidates = [
        resolved_path + '.tsx',
        resolved_path + '.ts',
        resolved_path + '.jsx',
        resolved_path + '.js',
        resolved_path + '/index.tsx',
        resolved_path + '/index.ts',
        resolved_path + '/index.jsx',
        resolved_path + '/index.js'
    ]
    
    for candidate in candidates:
        if candidate in all_files:
            return candidate
            
    return None


def resolve_go_import(import_path, all_files, go_package_map):
    """Resolves local Go imports. Returns all Go files within the imported package directory."""
    # Module name is 'shadow-arrow-backend'
    # Any local import is: shadow-arrow-backend/handlers, shadow-arrow-backend/models etc.
    prefix = 'shadow-arrow-backend'
    if not import_path.startswith(prefix):
        return []
        
    # Translate to backend directory
    sub_path = import_path[len(prefix):].strip('/')
    target_dir = ('backend/' + sub_path).strip('/')
    
    # Find all Go files in this directory
    resolved_files = []
    for f in all_files:
        if f.startswith(target_dir) and f.endswith('.go'):
            if os.path.dirname(f).replace('\\', '/') == target_dir:
                resolved_files.append(f)
                
    return resolved_files


def resolve_python_import(source_file, import_path, all_files):
    """Resolves Python absolute and relative imports."""
    # Source directory
    source_dir = os.path.dirname(source_file)
    project_prefix = "python_service"
    
    # Handle relative dots: .config or ..services.gemini_service
    dot_match = re.match(r'^(\.+)(.*)', import_path)
    if dot_match:
        dots = dot_match.group(1)
        sub_import = dot_match.group(2)
        level = len(dots)
        
        # Go up level-1 directories
        curr_dir = source_dir
        for _ in range(level - 1):
            curr_dir = os.path.dirname(curr_dir)
            
        # Re-construct path
        sub_path = sub_import.replace('.', '/')
        resolved_path = os.path.normpath(os.path.join(curr_dir, sub_path)).replace('\\', '/')
    else:
        # Absolute import (e.g. services.gemini_service or backend_client)
        # Check if it resides inside python_service
        sub_path = import_path.replace('.', '/')
        # Try both python_service/<path> and <path>
        resolved_path = f"{project_prefix}/{sub_path}"

    candidates = [
        resolved_path + '.py',
        resolved_path + '/__init__.py',
        # Handle cases where it imports a specific function/variable from a file
        # e.g., python_service.services.gemini_service.some_function -> we truncate the last item and check if it's a file
        os.path.dirname(resolved_path) + '.py'
    ]
    
    for candidate in candidates:
        candidate_norm = os.path.normpath(candidate).replace('\\', '/')
        if candidate_norm in all_files:
            return candidate_norm
            
    return None


def get_git_churn(root_dir):
    """Calculates modification frequency for files based on Git logs."""
    churn_data = {}
    try:
        output = subprocess.check_output(
            ['git', 'log', '--name-only', '--pretty=format:'],
            cwd=root_dir,
            stderr=subprocess.DEVNULL,
            encoding='utf-8',
            errors='ignore'
        )
        for line in output.split('\n'):
            line = line.strip().replace('\\', '/')
            if line:
                churn_data[line] = churn_data.get(line, 0) + 1
    except Exception as e:
        print(f"Warning: Could not extract Git churn data: {e}")
    return churn_data


def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    print(f"Scanning workspace root: {root_dir}")
    
    # 1. Initialize gitignore matcher
    matcher = GitIgnoreMatcher(root_dir)
    
    # Calculate Git commit churn
    churn_data = get_git_churn(root_dir)
    
    # 2. Discover all relevant files in the codebase
    discovered_files = []
    for root, dirs, files in os.walk(root_dir):
        # Filter directories in-place to prevent traversing ignored dirs
        dirs[:] = [d for d in dirs if not matcher.is_ignored(os.path.join(root, d))]
        
        for file in files:
            full_path = os.path.join(root, file)
            if not matcher.is_ignored(full_path):
                # We only want JS, TS, Go, and Python files
                _, ext = os.path.splitext(file)
                if ext.lower() in ['.go', '.py', '.ts', '.tsx', '.js', '.jsx']:
                    rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
                    discovered_files.append(rel_path)
                    
    print(f"Discovered {len(discovered_files)} code files to parse.")
    
    # 3. Parse each file
    file_data = {}
    go_package_map = {} # Maps Go directory path to package name
    all_files_set = set(discovered_files)
    
    for f in discovered_files:
        lang = get_language(f)
        full_path = os.path.join(root_dir, f)
        cluster = categorize_cluster(f)
        
        parsed = {}
        if lang == 'Go':
            parsed = parse_go_file(full_path)
            # Register Go package directory mapping
            dir_path = os.path.dirname(f).replace('\\', '/')
            if parsed.get("package"):
                go_package_map[dir_path] = parsed["package"]
        elif lang == 'Python':
            parsed = parse_python_file(full_path)
        elif lang in ['TypeScript', 'JavaScript']:
            parsed = parse_js_ts_file(full_path)
            
        file_data[f] = {
            "language": lang,
            "cluster": cluster,
            "functions": parsed.get("functions", []),
            "classes_structs": parsed.get("classes_structs", []),
            "imports": parsed.get("imports", []),
            "dependencies": [],  # Resolved file paths
            "dependents": [],     # Back-links (filled later)
            "churn": churn_data.get(f, 0)
        }

    # 4. Resolve dependencies to build the edges
    for f, data in file_data.items():
        lang = data["language"]
        raw_imports = data["imports"]
        resolved_deps = []
        
        if lang in ['TypeScript', 'JavaScript']:
            for imp in raw_imports:
                dep = resolve_js_ts_import(f, imp, all_files_set)
                if dep and dep != f:
                    resolved_deps.append(dep)
        elif lang == 'Go':
            for imp in raw_imports:
                deps = resolve_go_import(imp, all_files_set, go_package_map)
                for dep in deps:
                    if dep != f:
                        resolved_deps.append(dep)
        elif lang == 'Python':
            for imp in raw_imports:
                dep = resolve_python_import(f, imp, all_files_set)
                if dep and dep != f:
                    resolved_deps.append(dep)
                    
        # Remove duplicates
        data["dependencies"] = list(set(resolved_deps))

    # 5. Populate dependents (back-references)
    for f, data in file_data.items():
        for dep in data["dependencies"]:
            if dep in file_data:
                file_data[dep]["dependents"].append(f)
                
    # Clean up duplicate dependents
    for f, data in file_data.items():
        data["dependents"] = list(set(data["dependents"]))

    # 6. Format data for Vis.js Graph Visualization
    vis_nodes = []
    vis_edges = []
    
    for f, data in file_data.items():
        # Label is just the filename
        label = os.path.basename(f)
        vis_nodes.append({
            "id": f,
            "label": label,
            "group": data["cluster"]
        })
        
        # Add dependency edges
        for dep in data["dependencies"]:
            vis_edges.append({
                "from": f,
                "to": dep
            })

    # Prepare complete output
    output_graph_data = {
        "nodes": vis_nodes,
        "edges": vis_edges,
        "details": file_data
    }
    
    # 7. Write code_graph_index.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'code_graph_index.json')
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(output_graph_data, jf, indent=2)
    print(f"Graph index generated at: {json_path}")

    # 8. Write visualizer.html
    html_content = HTML_TEMPLATE.replace('/* {{GRAPH_DATA}} */', json.dumps(output_graph_data))
    html_path = os.path.join(script_dir, 'visualizer.html')
    with open(html_path, 'w', encoding='utf-8') as hf:
        hf.write(html_content)
    print(f"Interactive visualizer generated at: {html_path}")
    
    # Write to admin-dashboard public folder for local Next.js rendering
    admin_public_dir = os.path.join(root_dir, 'admin-dashboard', 'public')
    try:
        os.makedirs(admin_public_dir, exist_ok=True)
        admin_html_path = os.path.join(admin_public_dir, 'visualizer.html')
        with open(admin_html_path, 'w', encoding='utf-8') as hf:
            hf.write(html_content)
        print(f"Interactive visualizer copied to admin-dashboard at: {admin_html_path}")
    except Exception as e:
        print(f"Warning: Could not copy visualizer to admin-dashboard/public: {e}")

    print("Done! Open visualizer.html in your browser to view the graph.")


if __name__ == '__main__':
    main()
