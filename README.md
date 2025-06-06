# Appointment API

This project is a micro API built using Hono.js for managing appointment availability, confirmations, and cancellations. It is designed to be deployed as a Cloudflare Worker.

## Features

- **Appointment Management**: Create, confirm, and cancel appointments.
- **Availability Management**: Check and update appointment availability.
- **Authentication**: Middleware for securing routes.
- **Validation**: Middleware for validating incoming requests.

## Project Structure

```
appointment-api
├── src
│   ├── index.ts                # Entry point of the application
│   ├── routes                  # Contains route definitions
│   │   ├── appointments.ts     # Routes for appointment management
│   │   ├── availability.ts      # Routes for availability management
│   │   └── index.ts            # Exports all routes
│   ├── controllers             # Contains business logic
│   │   ├── appointmentController.ts  # Logic for appointment-related operations
│   │   └── availabilityController.ts # Logic for availability-related operations
│   ├── middleware              # Middleware functions
│   │   ├── auth.ts             # Authentication middleware
│   │   └── validation.ts        # Validation middleware
│   ├── types                   # Type definitions
│   │   └── index.ts            # Interfaces and types used in the application
│   └── utils                   # Utility functions
│       └── helpers.ts          # Common helper functions
├── wrangler.toml               # Cloudflare Workers configuration
├── package.json                # npm configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd appointment-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your Cloudflare account in `wrangler.toml`.

4. Deploy the application:
   ```
   wrangler publish
   ```

## API Usage

- **Create Appointment**: `POST /appointments`
- **Confirm Appointment**: `POST /appointments/confirm`
- **Cancel Appointment**: `DELETE /appointments/:id`
- **Check Availability**: `GET /availability`
- **Update Availability**: `PUT /availability`

## License

This project is licensed under the MIT License.