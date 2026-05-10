#!/bin/bash
# Obtiene info de un ticket de Jira Cloud via REST API
# Uso: ./jira.sh BL-1

TICKET=$1
JIRA_URL="https://blackline-corporation.atlassian.net"
JIRA_EMAIL="oscar.alonso23.34@gmail.com"
JIRA_TOKEN=$(grep JIRA_API_TOKEN /home/oscar/Documents/black_line/.env | cut -d'=' -f2-)

if [ -z "$TICKET" ]; then
  echo "Uso: $0 BL-1"
  exit 1
fi

curl -s \
  -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/$TICKET" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
fields = data.get('fields', {})
print('=== TICKET:', data.get('key'), '===')
print('Título:', fields.get('summary', ''))
print('Estado:', fields.get('status', {}).get('name', ''))
print('Tipo:', fields.get('issuetype', {}).get('name', ''))
print()
print('Descripción:')
desc = fields.get('description')
if desc and isinstance(desc, dict):
    for block in desc.get('content', []):
        for inner in block.get('content', []):
            if inner.get('type') == 'text':
                print(' ', inner.get('text', ''))
else:
    print('  (sin descripción)')
"