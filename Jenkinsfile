pipeline {
  agent any

  environment {
    IMAGE_NAME = "node-sample-app"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
    SONAR_HOST = "http://sonarqube:9000"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Test (coverage)') {
      steps {
        sh 'npm ci'
        sh 'npm test -- --coverage'
      }
      post {
        always {
          archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
          sh """
            docker run --rm \
              -v \$(pwd):/usr/src \
              -w /usr/src \
              sonarsource/sonar-scanner-cli \
              -Dsonar.projectKey=node-sample-app \
              -Dsonar.sources=. \
              -Dsonar.host.url=${SONAR_HOST} \
              -Dsonar.login=${SONAR_TOKEN} \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
          """
        }
      }
    }

    stage('Wait for Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
              error "Quality Gate failed: ${qg.status}"
            }
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
      }
    }

    stage('Trivy Scan') {
      steps {
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.46.1 image ${IMAGE_NAME}:${IMAGE_TAG}"
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh """
            docker login -u ${DH_USER} -p ${DH_PASS}
            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${DH_USER}/${IMAGE_NAME}:${IMAGE_TAG}
            docker push ${DH_USER}/${IMAGE_NAME}:${IMAGE_TAG}
          """
        }
      }
    }

    stage('Deploy Container') {
      steps {
        sh """
          docker rm -f ${IMAGE_NAME} || true
          docker run -d --name ${IMAGE_NAME} -p 3000:3000 ${DH_USER}/${IMAGE_NAME}:${IMAGE_TAG}
        """
      }
    }

  }

  post {
    always {
      echo "Pipeline Completed Successfully."
    }
  }
}

