"""Static preview server for the MJF funnel. Always serves ./public regardless of cwd or args."""
import os, sys, http.server, functools
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
port = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8766))
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
print(f"serving {root} on http://localhost:{port}", flush=True)
http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
