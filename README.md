## Authentication & Authorization

This API uses JSON Web Tokens (JWT) for authentication and role-based authorization.
User roles include employee, manager, and admin. Access to protected routes is
controlled using custom middleware that validates JWT tokens and enforces role
permissions. Session-based authentication has been fully removed.
