pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST  = "http://sonarqube:9000"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "📁 Workspace: $(pwd)"'
                sh 'ls -lah'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing dependencies (Node 18)..."

                    docker run --rm \
                        --user 1000:1000 \
                        --network ci-net \
                        -v "$(pwd)":/app \
                        -w /app \
                        node:18 \
                        npm install
                '''
            }
        }

        stage('Sonar Scan') {
            steps {
                sh '''
                    echo "🔍 Running Sonar Scanner..."

                    docker run --rm \
                        --user 1000:1000 \
                        --network ci-net \
                        -e SONAR_HOST_URL=${SONAR_HOST} \
                        -e SONAR_TOKEN=${SONAR_TOKEN} \
                        -v "$(pwd)":/usr/src \
                        sonarsource/sonar-scanner-cli \
                        -Dsonar.projectBaseDir=/usr/src \
                        -Dsonar.projectKey=myProject \
                        -Dsonar.login=${SONAR_TOKEN}
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    echo "🚀 Building project..."

                    docker run --rm \
                        --user 1000:1000 \
                        --network ci-net \
                        -v "$(pwd)":/app \
                        -w /app \
                        node:18 \
                        npm run build || true
                '''
            }
        }

    }
}

