pipeline {
    agent any

    environment {
        HOST_WS = "/var/lib/docker/volumes/jenkins_home/_data/workspace/myproject-pipeline"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    docker run --rm \
                        --user 1000:1000 \
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
                        /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner \
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
                    docker run --rm \
                        --user 1000:1000 \
                        -v ${HOST_WS}:/app \
                        -w /app \
                        node:18 npm run build || true
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    docker run --rm \
                        -v ${HOST_WS}:/project \
                        aquasec/trivy fs /project \
                        --severity HIGH,CRITICAL \
                        --format json \
                        -o /project/trivy-report.json || true
                '''
            }

            post {
                always {
                    echo "Saving Trivy report..."
                    archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true
                }
            }
        }
    }
}
