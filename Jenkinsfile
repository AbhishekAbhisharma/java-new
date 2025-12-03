pipeline {
    agent any

    environment {
        HOST_WS = "${WORKSPACE}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📁 Checking out source code from GitHub..."
                checkout scm
                sh 'pwd && ls -lah'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing dependencies using Node 18..."
                    docker run --rm \
                        -v ${HOST_WS}:/app \
                        -w /app \
                        node:18 npm install
                '''
            }
        }

        stage('Sonar Scan') {
            steps {
                withSonarQubeEnv('MySonar') {
                    sh '''
                        echo "🔍 Running Sonar Scan..."
                        sonar-scanner \
                          -Dsonar.projectKey=myProject \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://13.201.20.207:9000
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    echo "🚀 Building Node Project..."
                    docker run --rm \
                        -v ${HOST_WS}:/app \
                        -w /app \
                        node:18 npm run build || true
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    echo "🛡 Running Trivy FS scan on project..."

                    docker run --rm \
                        -v ${HOST_WS}:/project \
                        aquasec/trivy fs /project
                '''
            }
        }

    }
}
