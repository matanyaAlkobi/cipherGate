POST teamber-api-logs-prod/_doc
{
  "@timestamp": "2026-04-20T12:00:00Z",
  "type": "API",
  "status_code": 200,
  "className": "UsersController",
  "handler": "getUsers",
  "message": "API Req: GET /users 200",
  "duration": 123,
  "method": "GET",
  "endpoint": "/users",
  "path": "/users",
  "full_path": "/users?page=1",
  "full_url": "https://api.example.com/users?page=1",
  "protocol": "https",
  "hostname": "api.example.com",
  "clientIp": "10.10.10.10",
  "system": "backend",
  "username": "daniel",
  "host": "api.example.com",
  "forwarded": "for=10.10.10.10",
  "params": {
    "id": "123"
  },
  "body": {
    "name": "test"
  },
  "query": {
    "page": "1"
  }
}
