# Quarkus Amazon S3

This project demonstrates how to use Quarkus (quarkiverse) with Amazon S3 to upload, download, and list files.
Example demonstrates both async and sync methods to interact with S3.

## Prerequisites

- Java 21
- Gradle
- AWS account with S3 access
- AWS credentials configured locally

## AWS profile for local instance using AWS CLI

$ aws configure --profile localstack
AWS Access Key ID [None]: test-key
AWS Secret Access Key [None]: test-secret
Default region name [None]: us-east-1
Default output format [None]:


## Create S3 bucket using AWS CLI

aws s3 mb s3://quarkus.s3.quickstart --profile localstack --endpoint-url=http://localhost:4566


### 1. Clone the repository

```sh
git clone <repository-url>
cd quarkus-amazon-s3

gradle clean build