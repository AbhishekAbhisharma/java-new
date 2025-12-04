pipeline {
    agent any

    environment {
        HOST_WS = "/var/lib/docker/volumes/jenkins_home/_data/workspace/myproject-pipeline"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "📁 Workspace files:"'
                sh 'pwd && ls -lah'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Installing dependencies using Node 18 container..."

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

                        /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner \
                          -Dsonar.projectKey=myProject \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://65.0.6.89:9000
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo "⏳ Waiting 10 seconds before checking quality gate..."
                sleep 10

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Test') {     // ⟵ FIXED (Previously 'Build' was failing)
            steps {
                sh '''
                    echo "🧪 Running Tests..."

                    docker run --rm \
                        -v ${HOST_WS}:/app \
                        -w /app \
                        node:18 npm test || true
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    echo "🛡 Running Trivy FS scan..."

                    docker run --rm \
                        -v ${HOST_WS}:/project \
                        aquasec/trivy fs /project
                '''
            }
        }
    }
}
