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
      }
    }

    stage('Install Dependencies') {
      agent {
        docker {
          image 'node:18'
          args '--network ci-net'
        }
      }
      steps {
        sh '''
          echo "📦 Installing dependencies..."
          npm install
        '''
      }
    }

    stage('Sonar Scan') {
      steps {
        echo "🔍 Running sonar scanner..."
        sh '''
          docker run --rm \
            --network ci-net \
            -e SONAR_HOST_URL=${SONAR_HOST} \
            -e SONAR_TOKEN=${SONAR_TOKEN} \
            -v "$WORKSPACE":/usr/src \
            sonarsource/sonar-scanner-cli \
            -Dsonar.projectBaseDir=/usr/src \
            -Dsonar.projectKey=myProject \
            -Dsonar.login=${SONAR_TOKEN}
        '''
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
      agent {
        docker {
          image 'node:18'
          args '--network ci-net'
        }
      }
      steps {
        sh '''
          echo "🚀 Building project..."
          npm run build || true
        '''
      }
    }

  }

}

