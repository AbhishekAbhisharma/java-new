pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
        WORK_DIR    = "/var/lib/docker/volumes/jenkins_home/_data/workspace/myproject-pipeline"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'ls -lah'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
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
                withSonarQubeEnv('MySonar') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=myProject \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://15.207.71.20:9000 \
                          -Dsonar.login=${SONAR_TOKEN}
                    """
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
                        }
                        echo "✔ Quality Gate PASSED"
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
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

