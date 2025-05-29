#!/usr/bin/env bash
#
# =====================================================================================
#
# Generates TypeScript stubs and Protobuf types for Connect-Web clients:
#   • Uses protoc-gen-connect-es to produce RPC client/server code.
#   • Uses protoc-gen-es to produce standalone Protobuf definitions.
#
# Configuration:
#   PROTO_DIR – directory containing your .proto files (relative to project root)
#   OUT_DIR   – target directory for generated TypeScript code
#
# Usage:
#   ./src/scripts/generate_protos.sh
#
# Requirements:
#   • protoc           – Protocol Buffers compiler
#   • protoc-gen-connect-es – @connectrpc/protoc-gen-connect-es installed
#   • protoc-gen-es    – @bufbuild/protoc-gen-es installed
# =====================================================================================
set -euo pipefail

# -------------------------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------------------------
PROTO_DIR="src/grpc/protos"
OUT_DIR="src/grpc/generated"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PROTO_PATH="${PROJECT_ROOT}/${PROTO_DIR}"
OUT_PATH="${PROJECT_ROOT}/${OUT_DIR}"

# -------------------------------------------------------------------------
# Verifying if proto directory exists
# -------------------------------------------------------------------------
if [ ! -d "${PROTO_PATH}" ]; then
  echo " ERROR: Proto directory not found at '${PROTO_PATH}'"
  exit 1
fi

# -------------------------------------------------------------------------
# Ensuring  protoc is installed
# -------------------------------------------------------------------------
if ! command -v protoc &>/dev/null; then
  echo " ERROR: 'protoc' is not installed or not in PATH"
  exit 1
fi

# -------------------------------------------------------------------------
# Locate codegen plugins in node_modules
# -------------------------------------------------------------------------
PLUGIN_CONNECT_ES="${PROJECT_ROOT}/node_modules/.bin/protoc-gen-connect-es"
PLUGIN_ES="${PROJECT_ROOT}/node_modules/.bin/protoc-gen-es"

if [ ! -f "${PLUGIN_CONNECT_ES}" ]; then
  echo " ERROR: Missing 'protoc-gen-connect-es'."
  echo "        Install with: npm install --save-dev @connectrpc/protoc-gen-connect-es"
  exit 1
fi

if [ ! -f "${PLUGIN_ES}" ]; then
  echo " ERROR: Missing 'protoc-gen-es'."
  echo "        Install with: npm install --save-dev @bufbuild/protoc-gen-es"
  exit 1
fi

# -------------------------------------------------------------------------
# Preparing output directory
# -------------------------------------------------------------------------
mkdir -p "${OUT_PATH}"

# -------------------------------------------------------------------------
# Collecting .proto files
# -------------------------------------------------------------------------
proto_files=$(find "${PROTO_PATH}" -type f -name '*.proto')
if [ -z "${proto_files}" ]; then
  echo " ERROR: No .proto files found in '${PROTO_PATH}'"
  exit 1
fi

# -------------------------------------------------------------------------
# Invoke protoc to generate TypeScript stubs and types
# -------------------------------------------------------------------------
echo " Generating Connect-Web client stubs and Protobuf types..."
protoc \
  --plugin=protoc-gen-connect-es="${PLUGIN_CONNECT_ES}" \
  --plugin=protoc-gen-es="${PLUGIN_ES}" \
  --proto_path="${PROTO_PATH}" \
  --connect-es_out=target=ts:"${OUT_PATH}" \
  --es_out=target=ts:"${OUT_PATH}" \
  ${proto_files}

echo " Protobuf + Connect-Web stubs generated at: '${OUT_PATH}'"
exit 0
