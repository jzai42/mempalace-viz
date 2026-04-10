#!/usr/bin/env python3
"""
api_server.py — REST API for the 3D Memory Palace visualization.

Thin FastAPI layer over existing MemPalace modules.
Read-only, local-only, no auth.

Usage:
    python -m mempalace.api_server
    python -m mempalace.api_server --palace /path/to/palace --port 8000
"""

import argparse
import os
from typing import Optional

import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import MempalaceConfig
from .palace_graph import build_graph, graph_stats, traverse, find_tunnels
from .searcher import search_memories

app = FastAPI(title="MemPalace Viz API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_config: Optional[MempalaceConfig] = None


def _get_config() -> MempalaceConfig:
    global _config
    if _config is None:
        _config = MempalaceConfig()
    return _config


@app.get("/api/graph")
def api_graph():
    """Full palace topology: nodes (rooms) and edges (tunnels)."""
    config = _get_config()
    nodes, edges = build_graph(config=config)
    return {"nodes": nodes, "edges": edges}


@app.get("/api/rooms")
def api_rooms(wing: Optional[str] = Query(None)):
    """Rooms within a wing, or all rooms if no wing specified."""
    import chromadb

    config = _get_config()
    try:
        client = chromadb.PersistentClient(path=config.palace_path)
        col = client.get_collection(config.collection_name)
    except Exception:
        return {"wing": wing or "all", "rooms": {}}

    rooms: dict[str, int] = {}
    kwargs: dict = {"include": ["metadatas"], "limit": 10000}
    if wing:
        kwargs["where"] = {"wing": wing}
    try:
        all_meta = col.get(**kwargs)["metadatas"]
        for m in all_meta:
            r = m.get("room", "unknown")
            rooms[r] = rooms.get(r, 0) + 1
    except Exception:
        pass
    return {"wing": wing or "all", "rooms": rooms}


@app.get("/api/search")
def api_search(
    q: str = Query(..., min_length=1),
    wing: Optional[str] = Query(None),
    room: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
):
    """Semantic search across the palace."""
    config = _get_config()
    return search_memories(
        query=q,
        palace_path=config.palace_path,
        wing=wing,
        room=room,
        n_results=limit,
    )


@app.get("/api/stats")
def api_stats():
    """Palace graph overview statistics."""
    config = _get_config()
    return graph_stats(config=config)


@app.get("/api/traverse")
def api_traverse(
    room: str = Query(..., min_length=1),
    max_hops: int = Query(2, ge=1, le=5),
):
    """BFS traversal from a starting room."""
    config = _get_config()
    return traverse(room, config=config, max_hops=max_hops)


@app.get("/api/tunnels")
def api_tunnels(
    wing_a: Optional[str] = Query(None),
    wing_b: Optional[str] = Query(None),
):
    """Find rooms that bridge two wings."""
    config = _get_config()
    return find_tunnels(wing_a=wing_a, wing_b=wing_b, config=config)


def _main():
    parser = argparse.ArgumentParser(description="MemPalace Viz API Server")
    parser.add_argument("--palace", metavar="PATH", help="Palace directory path")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    if args.palace:
        os.environ["MEMPALACE_PALACE_PATH"] = os.path.abspath(args.palace)

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    _main()
