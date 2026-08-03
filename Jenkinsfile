
pipeline {

    agent any

    environment {
        ACR_NAME = "ecomacr123"
        ACR_LOGIN_SERVER = "ecomacr123.azurecr.io"
        IMAGE_NAME = "ecom-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                credentialsId: 'github-creds',
                url: 'https://github.com/uddeshay/ecom-backend.git'
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            agent {
                docker {
                    image 'node:22'
                    reuseNode true
                }
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to ACR & Push Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'acr-creds',
                        usernameVariable: 'ACR_USER',
                        passwordVariable: 'ACR_PASS'
                    )
                ]) {
                    sh """
                    echo \$ACR_PASS | docker login ${ACR_LOGIN_SERVER} -u \$ACR_USER --password-stdin
                    docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh """
                kubectl set image deployment/backend-deployment \
                backend=${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}

                 kubectl rollout status deployment/backend-deployment --timeout=5m
                """
            }
        }
    }
}
