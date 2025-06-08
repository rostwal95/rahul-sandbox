
# 🚀 Quarkus Amazon S3 Integration

This project demonstrates how to integrate **Quarkus** with **Amazon S3** using the [Quarkiverse S3 extension](https://quarkiverse.github.io/quarkiverse-docs/quarkus-amazon-services/dev/amazon-s3/).
It supports both **asynchronous and synchronous** file operations, including uploading, downloading, and listing files.



## 📦 Features

* ✅ Upload files to an S3 bucket (sync & async)
* ✅ Download files from S3
* ✅ List bucket contents
* ✅ Built with Java 21 & Quarkus
* ✅ Compatible with **AWS** and **LocalStack**

---

## 🛠️ Prerequisites

Make sure you have the following installed:

* **Java 21**
* **Gradle**
* **AWS CLI**
* **AWS Account** *(or LocalStack for local testing)*
* AWS credentials configured (see below)

---

## ⚙️ AWS Profile Setup (Optional for LocalStack)

To configure a local AWS profile for testing with LocalStack:

```bash
aws configure --profile localstack
# Example values:
# AWS Access Key ID [None]: test-key
# AWS Secret Access Key [None]: test-secret
# Default region name [None]: us-east-1
# Default output format [None]:
```

---

## 📁 Create an S3 Bucket

Create a test bucket using the AWS CLI:

```bash
aws s3 mb s3://quarkus.s3.quickstart \
  --profile localstack \
  --endpoint-url=http://localhost:4566
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quarkus-amazon-s3
```

### 2. Build the Project

```bash
./gradlew clean build
```

### 3. Run the Application (Dev Mode)

```bash
./gradlew quarkusDev
```

---

## 📂 File Operations

The project includes REST endpoints to:

* Upload a file to a specific bucket
* List files in a bucket
* Download a file by key

> Use tools like **Postman** or **cURL** to interact with these endpoints. Check `S3Resource.java` for endpoint paths and parameters.

---

## 🔄 Sync vs Async Example

The code demonstrates both:

* `S3Client` (Synchronous)
* `S3AsyncClient` (Asynchronous)

Both clients are injected and configured via `application.properties`.

---

## 🧪 Test with LocalStack (Optional)

You can run a LocalStack container using Docker:

```bash
docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
```

Then interact with the S3 endpoints using the `--endpoint-url` flag pointing to `http://localhost:4566`.

