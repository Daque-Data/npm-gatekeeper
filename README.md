# 🛡️ @refentse/gatekeeper-cli

**Proactive, Zero-Trust Supply Chain Security for Node.js.**

`@refentse/gatekeeper-cli` is a lightweight, high-performance CLI wrapper that shifts DevSecOps entirely to the left. By acting as an intercepting proxy for standard package installations, it neutralizes malicious payloads, typosquatting, and compromised dependencies **before a single byte is downloaded** to your local machine or CI/CD environment.

---

## 🚨 The Threat Landscape

The modern JavaScript ecosystem operates on an implicit model of blind trust. The native `npm install` command automatically pulls and executes hidden lifecycle scripts (`postinstall`).

> **The Reality:** Recent supply chain attacks weaponize these scripts to deploy Remote Access Trojans (RATs) and exfiltrate `.env` secrets in seconds. By the time a traditional scanner finishes, the environment is already compromised.

## 🛡️ The Gatekeeper Solution

Gatekeeper replaces blind trust with **active, real-time metadata interception.**

| Feature | `npm install` | `gatekeeper install` |
| :--- | :---: | :---: |
| **Execution Model** | Implicit Trust | **Zero-Trust** |
| **OSV Database Check** | Manual/Reactive | **Real-Time Interception** |
| **Malicious Script Blocking** | ❌ No | ✅ Hard-Block |
| **Typosquatting Protection** | ❌ No | ✅ Age Heuristics |
| **Speed** | ⚡ Fast | ⚡ Fast (Native Hand-off) |

---

## ⚙️ Core Architecture

1.  **Threat Intelligence Sync:** Instantly cross-references requested packages against the **Google Open Source Vulnerabilities (OSV) API**. Known malicious payloads are hard-blocked.
2.  **Lifecycle Quarantine:** Scans metadata for hidden `preinstall` and `postinstall` scripts. Suspicious events are flagged for developer authorization.
3.  **Zero-Day Age Heuristics:** Protects against account-takeover by analyzing publication timestamps. Packages < 48 hours old trigger high-risk warnings.
4.  **Frictionless Pass-Through:** If the package is clean, execution is handed off to the native `npm` binary with zero latency.

---

## 🚀 Usage

### Installation

Install globally to secure your local environment:

\`\`\`bash
npm install -g @refentse/gatekeeper-cli
\`\`\`

### Secure Your Workflow

Simply replace `npm` with `gatekeeper` when installing dependencies. The global installation automatically registers the `gatekeeper` command on your machine.

\`\`\`bash
# Securely install a package
gatekeeper install express
\`\`\`

### Example: Threat Interception

If a compromised package or known malware vector is detected, Gatekeeper halts the process instantly:

\`\`\`text
$ gatekeeper install lodash-security-patch

🔍 Inspecting metadata for: lodash-security-patch...
📡 Checking Google OSV database...

🚨 CRITICAL: KNOWN MALWARE DETECTED 🚨
   Package: lodash-security-patch@1.0.0
   Vulnerabilities: 1 [Malicious Script Injection]
   
🚫 HARD BLOCK ACTIVATED. Installation aborted.
\`\`\`

---

## 🏗️ Enterprise & CI/CD

*Currently in Development.*
We are building headless modes for **GitHub Actions, GitLab CI, and Azure DevOps** to enforce strict zero-trust installation policies across organizational builds.

---

## 🤝 Contributing

Securing the open-source supply chain is a community effort. If you are a security researcher or developer, please open an issue or submit a pull request to help expand our heuristic engine.

## 📄 License

This project is licensed under the **ISC License**.