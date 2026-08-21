#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Codebase Graph Context Retriever
Helps AI or developers locate relevant codebase context by querying the generated
code graph index. Reduces token usage by identifying specific files and their dependencies.
"""

import os
import sys
import json
import argparse

# ANSI color codes for premium CLI interface
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def disable_colors():
    global BLUE, GREEN, YELLOW, RED, MAGENTA, CYAN, BOLD, RESET
    BLUE = GREEN = YELLOW = RED = MAGENTA = CYAN = BOLD = RESET = ""


def load_index():
    """Loads the generated graph index file."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(script_dir, 'code_graph_index.json')
    
    if not os.path.exists(index_path):
        print(f"{RED}{BOLD}Error:{RESET} Graph index file not found at '{index_path}'.")
        print(f"Please run the generator first: {CYAN}python generate_graph.py{RESET}")
        sys.exit(1)
        
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"{RED}{BOLD}Error reading index:{RESET} {e}")
        sys.exit(1)


def search_index(index_data, query, top_n=5):
    """Searches the index and ranks files based on keyword relevance."""
    keywords = [kw.lower() for kw in query.split()]
    if not keywords:
        return []
        
    details = index_data.get("details", {})
    scores = []
    
    for filepath, info in details.items():
        score = 0
        filename = os.path.basename(filepath).lower()
        filepath_lower = filepath.lower()
        cluster_lower = info.get("cluster", "").lower()
        funcs = [f.lower() for f in info.get("functions", [])]
        classes = [c.lower() for c in info.get("classes_structs", [])]
        imports = [imp.lower() for imp in info.get("imports", [])]
        
        matched_keywords = []
        for kw in keywords:
            # 1. Filename match (highest score)
            if kw == filename or filename.split('.')[0] == kw:
                score += 100
                matched_keywords.append(kw)
            elif kw in filename:
                score += 40
                matched_keywords.append(kw)
                
            # 2. Filepath/Directory match
            if kw in filepath_lower:
                score += 20
                if kw not in matched_keywords:
                    matched_keywords.append(kw)
                    
            # 3. Cluster name match (e.g. 'models' matches DB Models)
            if kw in cluster_lower:
                score += 15
                if kw not in matched_keywords:
                    matched_keywords.append(kw)
                    
            # 4. Class or Struct names match
            for cls in classes:
                if kw == cls:
                    score += 50
                    if kw not in matched_keywords:
                        matched_keywords.append(kw)
                elif kw in cls:
                    score += 15
                    if kw not in matched_keywords:
                        matched_keywords.append(kw)
                        
            # 5. Functions match
            for func in funcs:
                if kw == func:
                    score += 35
                    if kw not in matched_keywords:
                        matched_keywords.append(kw)
                elif kw in func:
                    score += 10
                    if kw not in matched_keywords:
                        matched_keywords.append(kw)
                        
            # 6. Imports match (low priority)
            for imp in imports:
                if kw in imp:
                    score += 5
                    
        # Apply score penalty for path length (prefer shorter paths for matching symbols)
        if score > 0:
            score = score - (len(filepath.split('/')) * 2)
            scores.append((filepath, score, matched_keywords))
            
    # Sort by score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_n]


def main():
    parser = argparse.ArgumentParser(
        description="Search codebase graph to find files, functions, and dependency contexts."
    )
    parser.add_argument("query", type=str, help="Search query (e.g. 'order DB model', 'admin router')")
    parser.add_argument("-n", "--limit", type=int, default=5, help="Limit results to top N files (default: 5)")
    parser.add_argument("-s", "--snippets", action="store_true", help="Print the file contents / code snippets")
    parser.add_argument("-d", "--dependencies", action="store_true", help="Include 1st-degree dependencies in search list")
    parser.add_argument("-p", "--paths-only", action="store_true", help="Output space-separated matching file paths only (useful for shell pipes)")
    parser.add_argument("--no-color", action="store_true", help="Disable terminal colors")
    
    args = parser.parse_args()
    
    if args.no_color or sys.platform == 'win32' and 'WT_SESSION' not in os.environ:
        # Check if running in standard cmd/powershell without modern terminal colors
        if args.no_color or not os.environ.get('TERM'):
            disable_colors()
            
    index_data = load_index()
    results = search_index(index_data, args.query, args.limit)
    
    if not results:
        if not args.paths_only:
            print(f"{YELLOW}No matches found for query: '{args.query}'{RESET}")
        return

    # Expand list if dependencies are requested
    all_targets = []
    for filepath, score, _ in results:
        if filepath not in all_targets:
            all_targets.append(filepath)
            
        if args.dependencies:
            deps = index_data.get("details", {}).get(filepath, {}).get("dependencies", [])
            for dep in deps:
                if dep not in all_targets:
                    all_targets.append(dep)

    # 1. Path-only output mode
    if args.paths_only:
        print(" ".join(all_targets))
        return

    # 2. Rich CLI Report mode
    print(f"\n{BOLD}{BLUE}=== Codebase Context Search Results for '{args.query}' ==={RESET}\n")
    
    # Print ranked files summary
    print(f"{BOLD}Ranked File Matches:{RESET}")
    for idx, (filepath, score, matched) in enumerate(results):
        info = index_data["details"][filepath]
        lang = info["language"]
        cluster = info["cluster"]
        print(f" {idx+1}. {GREEN}{filepath}{RESET} [Score: {score}]")
        print(f"    Language: {lang} | Cluster: {CYAN}{cluster}{RESET}")
        print(f"    Matches: {', '.join(matched)}")
        
    print(f"\n{BOLD}==================================================={RESET}\n")
    
    # Root directory for reading snippets
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

    # Detail view of targets
    for filepath in all_targets:
        info = index_data["details"].get(filepath)
        if not info:
            continue
            
        print(f"{BOLD}{YELLOW}FILE: {filepath}{RESET}")
        print(f" |  Language: {info['language']}")
        print(f" |  Cluster:  {CYAN}{info['cluster']}{RESET}")
        
        # Display symbols
        classes = info.get("classes_structs", [])
        if classes:
            print(f" |  Classes/Structs: {', '.join(classes)}")
            
        funcs = info.get("functions", [])
        if funcs:
            print(f" |  Functions: {', '.join(funcs[:15])}{' (and ' + str(len(funcs)-15) + ' more)' if len(funcs) > 15 else ''}")
            
        # Display local dependencies
        deps = info.get("dependencies", [])
        if deps:
            print(f" |  Dependencies: {', '.join([os.path.basename(d) for d in deps])}")
            
        # Display local dependents
        deps_in = info.get("dependents", [])
        if deps_in:
            print(f" +  Required By:  {', '.join([os.path.basename(d) for d in deps_in])}")
            
        print()

        # Display Code Snippets if requested
        if args.snippets:
            full_path = os.path.join(root_dir, filepath)
            if os.path.exists(full_path):
                print(f"{BOLD}{BLUE}--- CODE CONTENT: {filepath} ---{RESET}")
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as code_f:
                        lines = code_f.readlines()
                        
                    # If file is too large, print only first 150 lines or show warning
                    max_lines = 120
                    if len(lines) > max_lines:
                        print("".join(lines[:max_lines]))
                        print(f"\n{YELLOW}... [Truncated {len(lines) - max_lines} lines. File contains {len(lines)} total lines] ...{RESET}")
                    else:
                        print("".join(lines))
                except Exception as e:
                    print(f"{RED}Error reading file content: {e}{RESET}")
                print(f"{BOLD}{BLUE}---------------------------------------{RESET}\n")
            else:
                print(f"{RED}File not found on system: {full_path}{RESET}\n")


if __name__ == '__main__':
    main()
