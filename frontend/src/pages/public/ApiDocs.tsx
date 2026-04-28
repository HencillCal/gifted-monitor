import { useState } from "react";
import { PublicLayout } from "@/layouts";
import { Key, ChevronDown, ChevronRight, Copy, CheckCircle, Activity, Plus, Settings, Trash2, Zap, List } from "lucide-react";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Copied!");
    });
  };
  return (
    <button onClick={copy} className="absolute top-3 right-3 btn h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
      {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative">
      <div className="bg-gray-900 rounded-xl p-4 pr-12 overflow-x-auto">
        <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre">{code}</pre>
      </div>
      <span className="absolute top-3 left-4 text-[10px] text-gray-500 font-mono">{language}</span>
      <CopyButton text={code} />
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono ${color}`}>
      {children}
    </span>
  );
}

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  description?: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  body?: { name: string; type: string; required: boolean; desc: string }[];
  response: string;
  example?: string;
}

const methodColors: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  POST:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  PUT:    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function Endpoint({ method, path, summary, description, params, body, response, example }: EndpointProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-foreground/50 transition-colors"
      >
        <Badge color={methodColors[method]}>{method}</Badge>
        <code className="text-sm font-mono font-medium text-main flex-1">{path}</code>
        <span className="text-sm text-muted hidden sm:block">{summary}</span>
        {open ? <ChevronDown size={16} className="text-muted shrink-0" /> : <ChevronRight size={16} className="text-muted shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-line p-4 space-y-4 bg-background">
          {description && <p className="text-sm text-muted">{description}</p>}

          {params && params.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Path / Query Parameters</p>
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Required</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {params.map(p => (
                      <tr key={p.name}>
                        <td className="px-3 py-2 font-mono text-xs font-medium text-main">{p.name}</td>
                        <td className="px-3 py-2 text-xs text-muted">{p.type}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-medium ${p.required ? "text-red-500" : "text-muted"}`}>
                            {p.required ? "Required" : "Optional"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {body && body.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Request Body (JSON)</p>
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Field</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Required</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {body.map(f => (
                      <tr key={f.name}>
                        <td className="px-3 py-2 font-mono text-xs font-medium text-main">{f.name}</td>
                        <td className="px-3 py-2 text-xs text-muted">{f.type}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-medium ${f.required ? "text-red-500" : "text-muted"}`}>
                            {f.required ? "Required" : "Optional"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Response</p>
            <CodeBlock code={response} language="json" />
          </div>

          {example && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Example Request</p>
              <CodeBlock code={example} language="bash" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const BASE = "https://monitor.giftedtech.co.ke/api/v1";

export default function ApiDocs() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-12 pb-8 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Activity size={13} />
            REST API — v1
          </div>
          <h1 data-aos="fade-up" className="text-4xl md:text-5xl font-bold font-outfit mb-4">
            API <span className="text-emerald-500">Reference</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="text-muted text-base max-w-xl mx-auto">
            Programmatically manage your monitors using our REST API. Authenticate with an API key to list, create, update, and delete monitors.
          </p>
        </div>
      </section>

      <div className="px-4 pb-16 max-w-4xl mx-auto space-y-10">

        {/* Authentication */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Authentication</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-4">
            <p className="text-sm text-muted">
              All API v1 requests require an API key. Generate one from your{" "}
              <a href="/profile" className="text-emerald-500 hover:underline">Profile → API Keys</a>.
              Pass the key via the <code className="bg-foreground px-1.5 py-0.5 rounded text-xs font-mono">X-API-Key</code> header or as a query parameter.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-muted mb-2">Header (recommended)</p>
                <CodeBlock code={`curl ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here"`} language="bash" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-2">Query parameter</p>
                <CodeBlock code={`curl "${BASE}/monitors?api_key=gm_your_key_here"`} language="bash" />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
              <strong>Keep your key secret.</strong> Do not commit it to source control or expose it in client-side code. Rotate it immediately if it's compromised.
            </div>

            <div>
              <p className="text-xs font-semibold text-muted mb-2">Key format</p>
              <div className="bg-foreground rounded-xl p-3 font-mono text-xs text-muted">
                <span className="text-emerald-500">gm_</span>
                <span>{"<64 hex chars>"}</span>
                <span className="ml-3 not-mono text-muted">e.g. gm_1a2b3c4d5e6f...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Base URL */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Base URL & Rate Limits</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted mb-1">Production base URL</p>
              <CodeBlock code={BASE} language="url" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Format", value: "JSON (application/json)" },
                { label: "Auth", value: "X-API-Key header" },
                { label: "Rate limit", value: "No hard limit (fair use)" },
              ].map(i => (
                <div key={i.label} className="bg-foreground rounded-xl p-3">
                  <p className="text-xs text-muted">{i.label}</p>
                  <p className="font-medium text-sm mt-0.5">{i.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Errors */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Error Responses</h2>
          </div>
          <div className="bg-background border border-line rounded-xl p-5 space-y-3">
            <p className="text-sm text-muted">All errors return a JSON body with an <code className="bg-foreground px-1 rounded text-xs font-mono">error</code> field.</p>
            <CodeBlock code={`{ "error": "Human-readable error message" }`} language="json" />
            <div className="rounded-xl border border-line overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Status</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ["200 / 201", "Success"],
                    ["400", "Bad request — missing or invalid fields"],
                    ["401", "Unauthorized — invalid or missing API key"],
                    ["403", "Forbidden — you don't own this resource, or limit reached"],
                    ["404", "Not found — monitor doesn't exist"],
                    ["500", "Server error — try again"],
                  ].map(([s, m]) => (
                    <tr key={s}>
                      <td className="px-3 py-2 font-mono text-xs font-medium">{s}</td>
                      <td className="px-3 py-2 text-xs text-muted">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Monitor Endpoints */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <List size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Monitor Endpoints</h2>
          </div>
          <div className="space-y-3">

            <Endpoint
              method="GET"
              path="/api/v1/monitors"
              summary="List all monitors"
              description="Returns all monitors belonging to the authenticated API key owner, including the last 30 history entries for each."
              response={`{
  "monitors": [
    {
      "id": 1,
      "name": "My Website",
      "url": "https://example.com",
      "path": null,
      "method": "GET",
      "interval_mins": 3,
      "is_active": true,
      "last_status": "up",
      "last_response_time": 182,
      "uptime_pct": 99.8,
      "notify_down": true,
      "notify_up": true,
      "created_at": "2025-01-15T10:00:00.000Z",
      "history": [ ... ]
    }
  ],
  "count": 1
}`}
              example={`curl ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/monitors/:id"
              summary="Get a single monitor"
              description="Returns full details of a single monitor with its last 60 check history entries."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{
  "id": 1,
  "name": "My Website",
  "url": "https://example.com",
  "last_status": "up",
  "uptime_pct": 99.8,
  "history": [ { "status": "up", "response_time": 182, "checked_at": "..." }, ... ]
}`}
              example={`curl ${BASE}/monitors/1 \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="POST"
              path="/api/v1/monitors"
              summary="Create a monitor"
              description="Create a new monitor. Your account's monitor limit applies."
              body={[
                { name: "name", type: "string", required: true, desc: "Display name (max 100 chars)" },
                { name: "url", type: "string", required: true, desc: "Full URL (must start with http:// or https://)" },
                { name: "path", type: "string", required: false, desc: "Extra path appended to URL (e.g. /health)" },
                { name: "method", type: "string", required: false, desc: "HTTP method: GET (default), HEAD, or POST" },
                { name: "body", type: "string", required: false, desc: "Request body for POST monitors (JSON string)" },
                { name: "intervalMins", type: "number", required: false, desc: "Check frequency in minutes. Min 0.5 (30s), max 1440 (24h). Default: 3" },
                { name: "notify_down", type: "boolean", required: false, desc: "Email alert when down. Default: true" },
                { name: "notify_up", type: "boolean", required: false, desc: "Email alert when recovered. Default: true" },
              ]}
              response={`{
  "id": 5,
  "name": "API Health",
  "url": "https://api.example.com",
  "method": "GET",
  "interval_mins": 5,
  "is_active": true,
  "last_status": "unknown",
  "created_at": "2025-01-15T12:00:00.000Z"
}`}
              example={`curl -X POST ${BASE}/monitors \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "API Health",
    "url": "https://api.example.com",
    "path": "/health",
    "method": "GET",
    "intervalMins": 5
  }'`}
            />

            <Endpoint
              method="PUT"
              path="/api/v1/monitors/:id"
              summary="Update a monitor"
              description="Partially update a monitor. Only fields you include will be changed."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              body={[
                { name: "name", type: "string", required: false, desc: "New display name" },
                { name: "url", type: "string", required: false, desc: "New URL" },
                { name: "path", type: "string", required: false, desc: "New path suffix" },
                { name: "method", type: "string", required: false, desc: "GET | HEAD | POST" },
                { name: "intervalMins", type: "number", required: false, desc: "New check interval in minutes" },
                { name: "is_active", type: "boolean", required: false, desc: "Pause (false) or resume (true) monitoring" },
                { name: "notify_down", type: "boolean", required: false, desc: "Toggle down alerts" },
                { name: "notify_up", type: "boolean", required: false, desc: "Toggle recovery alerts" },
              ]}
              response={`{ "id": 5, "name": "API Health v2", "interval_mins": 10, ... }`}
              example={`curl -X PUT ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "is_active": false }'`}
            />

            <Endpoint
              method="DELETE"
              path="/api/v1/monitors/:id"
              summary="Delete a monitor"
              description="Permanently deletes a monitor and all its check history. No password required when using an API key."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{ "message": "Monitor deleted" }`}
              example={`curl -X DELETE ${BASE}/monitors/5 \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="POST"
              path="/api/v1/monitors/:id/ping"
              summary="Trigger a manual ping"
              description="Immediately triggers a check for the specified monitor outside of its normal schedule. Useful for testing."
              params={[{ name: "id", type: "integer / string", required: true, desc: "Monitor ID" }]}
              response={`{ "message": "Ping triggered", "monitor_id": "5" }`}
              example={`curl -X POST ${BASE}/monitors/5/ping \\
  -H "X-API-Key: gm_your_key_here"`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/monitors/:id/history"
              summary="Get check history"
              description="Returns check history entries for a monitor. Default limit is 60, max 200."
              params={[
                { name: "id", type: "integer / string", required: true, desc: "Monitor ID" },
                { name: "limit", type: "integer", required: false, desc: "Number of entries to return (default: 60, max: 200)" },
              ]}
              response={`{
  "monitor_id": "5",
  "count": 60,
  "history": [
    {
      "id": 1201,
      "status": "up",
      "response_time": 145,
      "error_msg": null,
      "checked_at": "2025-01-15T12:05:00.000Z"
    },
    ...
  ]
}`}
              example={`curl "${BASE}/monitors/5/history?limit=100" \\
  -H "X-API-Key: gm_your_key_here"`}
            />

          </div>
        </section>

        {/* Code Examples */}
        <section data-aos="fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-emerald-500" />
            <h2 className="text-lg font-bold font-outfit">Code Examples</h2>
          </div>
          <div className="space-y-4">

            <div>
              <p className="text-xs font-semibold text-muted mb-2">Node.js (fetch)</p>
              <CodeBlock language="javascript" code={`const API_KEY = "gm_your_key_here";
const BASE    = "${BASE}";

async function getMonitors() {
  const res = await fetch(\`\${BASE}/monitors\`, {
    headers: { "X-API-Key": API_KEY }
  });
  const data = await res.json();
  console.log(data.monitors);
}

async function createMonitor(name, url, intervalMins = 5) {
  const res = await fetch(\`\${BASE}/monitors\`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ name, url, intervalMins })
  });
  return res.json();
}

getMonitors();`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-muted mb-2">Python (requests)</p>
              <CodeBlock language="python" code={`import requests

API_KEY = "gm_your_key_here"
BASE    = "${BASE}"
HEADERS = {"X-API-Key": API_KEY}

# List all monitors
r = requests.get(f"{BASE}/monitors", headers=HEADERS)
monitors = r.json()["monitors"]
print(f"You have {len(monitors)} monitors")

# Create a monitor
new_monitor = requests.post(
    f"{BASE}/monitors",
    headers=HEADERS,
    json={"name": "My API", "url": "https://api.example.com", "intervalMins": 5}
).json()
print("Created:", new_monitor["id"])

# Pause a monitor
requests.put(
    f"{BASE}/monitors/{new_monitor['id']}",
    headers=HEADERS,
    json={"is_active": False}
)`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-muted mb-2">PHP (curl)</p>
              <CodeBlock language="php" code={`<?php
$apiKey = "gm_your_key_here";
$base   = "${BASE}";

function apiRequest(string $method, string $path, ?array $body = null) use ($apiKey, $base): array {
    $ch = curl_init($base . $path);
    $headers = ["X-API-Key: $apiKey", "Content-Type: application/json"];
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS     => $body ? json_encode($body) : null,
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $result;
}

$monitors = apiRequest("GET", "/monitors")["monitors"];
echo "Monitors: " . count($monitors) . PHP_EOL;

$new = apiRequest("POST", "/monitors", [
    "name"         => "My Website",
    "url"          => "https://example.com",
    "intervalMins" => 5
]);
echo "Created ID: " . $new["id"] . PHP_EOL;
?>`} />
            </div>
          </div>
        </section>

        {/* Get started CTA */}
        <section data-aos="fade-up">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl center mx-auto">
              <Plus size={22} className="text-emerald-500" />
            </div>
            <h3 className="font-bold font-outfit text-lg">Ready to get started?</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Sign in, go to your Profile, open the API Keys tab, and create your first key.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/profile" className="btn h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold">
                Create API Key
              </a>
              <a href="/signup" className="btn h-10 px-5 rounded-xl bg-foreground text-sm font-medium">
                Sign up free
              </a>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
