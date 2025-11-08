# Watt Weaver

Watt Weaver is a Streamlit application that forecasts renewable generation and
optimizes the hourly energy mix across solar, wind, hydro, and battery storage.

This version introduces Firebase-backed authentication so that only registered
users can run optimizations.

## Getting started

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   or, if you are using the bundled Poetry configuration:

   ```bash
   poetry install
   ```

2. Provide Firebase configuration via environment variables before launching
   Streamlit:

   | Variable | Description |
   | --- | --- |
   | `FIREBASE_API_KEY` | Web API key from your Firebase project (used for Authentication). |
   | `FIREBASE_PROJECT_ID` | Firebase project ID that hosts your Firestore database. |
   | `FIREBASE_USERS_COLLECTION` *(optional)* | Collection containing user profile documents. Defaults to `users`. |

   Authentication uses Firebase's email/password provider. User profile
   documents are fetched from Firestore at
   `/{FIREBASE_USERS_COLLECTION}/{localId}` after sign in.

3. Run the application:

   ```bash
   streamlit run app.py
   ```

4. Sign in with a valid Firebase email/password account. If a profile document
   exists in Firestore, the sidebar will display its details.

## Project structure

Key files:

- `app.py` – Streamlit UI, now gated behind a Firebase login page.
- `firebase_client.py` – Helper functions for authenticating users and reading
  Firestore documents.
- `data/` – Region datasets used for forecasting and optimization examples.
- `optimization.py`, `forecasting.py`, etc. – Core modeling utilities.

## Development tips

- Use the Streamlit sidebar to configure optimization parameters once signed
  in.
- Set the environment variable `FIREBASE_USERS_COLLECTION` to customise which
  Firestore collection stores user profile documents.
- When running locally, you can export credentials inline:

  ```bash
  export FIREBASE_API_KEY="<your api key>"
  export FIREBASE_PROJECT_ID="<your project id>"
  streamlit run app.py
  ```
