pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST  = "http://sonarqube:9000"
        WORK_DIR    = "/var/lib/docker/volumes/jenkins_home/_data/workspace/myproject-pipeline"
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
                    echo "📦 Installing dependencies..."

                    docker run --rm \
                        --network ci-net \
                        -v "${WORK_DIR}":/app \
                        -w /app \
                        node:18 \
                        npm install
                '''
            }
        }

        stage('Sonar Scan') {
            steps {
                withSonarQubeEnv('MySonar') {   // <-- CRITICAL FIX
                    sh '''
                        echo "🔍 Running Sonar Scanner..."

                        docker run --rm \
                            --network ci-net \
                            -e SONAR_HOST_URL=${SONAR_HOST} \
                            -e SONAR_TOKEN=${SONAR_TOKEN} \
                            -v "${WORK_DIR}":/usr/src \
                            sonarsource/sonar-scanner-cli \
                            -Dsonar.projectBaseDir=/usr/src \
                            -Dsonar.projectKey=myProject \
                            -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "❌ Quality Gate Failed: ${qg.status}"
                        } else {
                            echo "✔ Quality Gate PASSED"
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    echo "🚀 Building project..."

                    docker run --rm \
                        --network ci-net \
                        -v "${WORK_DIR}":/app \
                        -w /app \
                        node:18 \
                        npm run build || true
                '''
            }
        }

    }
}

