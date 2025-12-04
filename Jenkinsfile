pipeline {
    agent any

    environment {
        HOST_WS = "/var/lib/docker/volumes/jenkins_home/_data/workspace/myproject-pipeline"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "📁 Jenkins workspace:"'
                sh 'pwd'
                sh 'ls -lah'
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
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

stage('Build') {
    steps {
        sh '''
            echo "🧪 Running Tests..."

            docker run --rm \
                -v ${HOST_WS}:/app \
                -w /app \
                node:18 npm test
        '''
    }
}

