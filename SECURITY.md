# Security & Privacy Policy 🛡️

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 🔒 Privacy & Zero-Data-Leakage Guarantees

PrivaPDF was engineered specifically for environments with strict data confidentiality (financial records, legal contracts, medical data, and personal documents). We enforce data isolation through technical constraints, not just promises:

1. **Zero Telemetry & Zero Egress**:
   - The application does not contain analytics, trackers, telemetry scripts, or external API endpoints.
   - **Content Security Policy Enforcement**: Outbound network requests are programmatically forbidden by the browser using:
     ```html
     <meta http-equiv="Content-Security-Policy" content="... connect-src 'none'; ...">
     ```
     Even if third-party code were introduced, modern web standards enforce `connect-src 'none'`, preventing any `fetch()`, `XMLHttpRequest`, or WebSocket packets from escaping your device.

2. **In-Memory Volatile Processing**:
   - Files are converted exclusively in the local machine's RAM (`ArrayBuffer` / `Uint8Array`).
   - No documents are ever uploaded to cloud servers or stored in persistent databases.

3. **Deterministic Memory Cleanup**:
   - Every file download triggers an immediate `URL.revokeObjectURL()` cleanup callback to safely wipe memory allocations and prevent RAM retention.

4. **Air-Gapped & Offline Verification**:
   - PrivaPDF functions 100% identically with Wi-Fi disabled or in Airplane Mode.

---

## 🚨 Reporting a Vulnerability

If you discover a security or privacy vulnerability, please do NOT open a public GitHub issue. Instead, report it privately via [GitHub Security Advisories](https://github.com/djakamiriandi/PrivaPDF/security/advisories) or contact the maintainer directly.
