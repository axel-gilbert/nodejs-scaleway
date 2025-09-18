# Node.js Scaleway CI/CD Sample

This repository demonstrates how to deploy a Node.js application to Scaleway Serverless Containers with two fully separated environments (dev and prod) powered by GitHub Actions.

## Infrastructure overview

```mermaid
flowchart TD
    Commit[Push on dev/main] --> CI[GitHub Actions workflow];
    CI --> Build[Build Docker image];
    Build --> Registry[Scaleway Container Registry];
    Registry --> Branch{Branch target};
    Branch -->|dev| DevContainer[Serverless Container (dev)];
    Branch -->|main| ProdContainer[Serverless Container (prod)];
    CI --> DB[Provision or reuse Scaleway Managed Database];
    DB --> DevContainer;
    DB --> ProdContainer;
    DevContainer --> DevDomain[Optional dev domain];
    ProdContainer --> ProdDomain[Optional prod domain];
```

This overview shows how each push triggers the workflow, publishes a container image, and refreshes the matching Scaleway stack.

## What the sample does

- Builds a Docker image for every push on `main` (production) or `dev` (development).
- Publishes the image to Scaleway Container Registry and deploys the matching Serverless Container.
- Optionally provisions or reuses Scaleway Managed Databases (RDB) and wires the connection string into the container.
- Attaches environment-specific domains such as `dev.mydomain.com` and `mydomain.com` when provided.

## Repository layout

- `.github/workflows/deploy.yml` – GitHub Actions workflow driving the CI/CD pipeline.
- `examples/github-secrets.*.example.env` – example files documenting the required GitHub secrets.

Your application source code and `Dockerfile` live at the repository root; nothing in this sample assumes a particular framework as long as a Docker build succeeds.

## Prerequisites

1. A Scaleway account with:
   - Access key / secret key with permissions for Container Registry, Serverless Containers, and Managed Databases.
   - A Container Registry namespace and a Serverless Container namespace.
   - (Optional) A Managed Database instance per environment or permission to create them on the fly.
2. A GitHub repository containing your Node.js project and this workflow.
3. GitHub environments `main` and `dev` (branches) mapped to your production and development domains.

## Configure GitHub secrets

The workflow relies entirely on repository secrets. Use the example files in `examples/` as a starting point:

1. Copy the values from `examples/github-secrets.common.example.env` into repository secrets with matching names.
2. Repeat the process for the dev and prod examples so that each variable in the files exists as a GitHub secret.
3. Update placeholder values (domains, database identifiers, scaling limits, etc.) to match your infrastructure.

> Tip: Keep the `DATABASE_URL` secrets even if you plan to let the workflow create databases. They serve as a fallback connection string.

## Workflow behavior

- **Branch routing:** pushes on `dev` deploy to the development environment; pushes on `main` deploy to production. The helper job auto-creates the remote `dev` branch the first time you merge to `main`.
- **Image build:** the Docker context is the repository root. Adjust the Dockerfile to compile your app, install dependencies, and expose the correct port.
- **Database provisioning:** when `DATABASE_INSTANCE_NAME` is present, the workflow uses the Scaleway CLI to create (or reuse) an RDB instance, ensure the target database exists, and emit a connection string. Update the engine, version, node type, and volume size secrets to fit your workload.
- **Serverless Container:** the container is created or updated with environment-specific variables (`NODE_ENV`, `DATABASE_URL`, `PUBLIC_BASE_URL`). Min/max scale defaults to `0/1` for dev and can be overridden via secrets.
- **Domain attachment:** if the `DEV_DOMAIN` / `PROD_DOMAIN` secrets are set, the workflow tries to attach the domain to the deployed container. Make sure the DNS records point to Scaleway before enabling this.

## Customization checklist

- Rename the image repository in `deploy.yml` (`IMAGE_REPO`) if you do not want to reuse `synkit`.
- Add or remove environment variables in the container step to match your app configuration.
- Adjust or remove the Managed Database step if you prefer to run migrations or provisioning elsewhere.
- Extend the workflow with tests or linting before the Docker build to harden your pipeline.

## Running the sample

1. Update the example secret files with values that fit your infrastructure and add them to GitHub secrets.
2. Commit your application code together with this workflow.
3. Push to the `dev` branch to deploy the development stack (`dev.mydomain.com`).
4. Merge to `main` to promote the latest image to production (`mydomain.com`).
5. Monitor the workflow run in the GitHub Actions tab; the final step prints a concise deployment summary.

Enjoy your dual-environment setup on Scaleway! If you adapt the project, document the changes so your team understands the staging and production boundaries.
