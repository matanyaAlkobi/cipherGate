PUT _component_template/teamber-api-logs-mappings
{
  "template": {
    "mappings": {
      "dynamic": false,
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "type": {
          "type": "keyword"
        },
        "status_code": {
          "type": "integer"
        },
        "className": {
          "type": "keyword"
        },
        "handler": {
          "type": "keyword"
        },
        "stackError": {
          "type": "text"
        },
        "errorMessage": {
          "type": "text"
        },
        "message": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "duration": {
          "type": "long"
        },
        "method": {
          "type": "keyword"
        },
        "endpoint": {
          "type": "keyword"
        },
        "path": {
          "type": "keyword"
        },
        "full_path": {
          "type": "keyword"
        },
        "full_url": {
          "type": "wildcard"
        },
        "protocol": {
          "type": "keyword"
        },
        "hostname": {
          "type": "keyword"
        },
        "clientIp": {
          "type": "ip"
        },
        "system": {
          "type": "keyword"
        },
        "username": {
          "type": "keyword"
        },
        "host": {
          "type": "keyword"
        },
        "forwarded": {
          "type": "text"
        },
        "authorization": {
          "type": "text",
          "index": false
        },
        "params": {
          "type": "flattened"
        },
        "body": {
          "type": "flattened"
        },
        "query": {
          "type": "flattened"
        }
      }
    }
  },
  "_meta": {
    "description": "Mappings for Teamber API application logs"
  }
}
