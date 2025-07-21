pipeline {
    agent any

    environment {
        PATH = "/root/.bun/bin:$PATH"
    }

    stages {
        stage('Check files') {
            steps {
                sh 'ls -lah'
                sh 'cat package.json || echo "No package.json found"'
            }
        }
        stage('Check bun') {
            steps {
                sh 'bun --version'
            }
        }
        stage('Prepare') {
            steps {
                echo 'Prepare'
                sh '''
                rm -rf .env
                rm -rf node_modules
                rm -rf dist
                cp .env.dev .env
                '''
            }
        }
        stage('build/Deploy'){
            steps {
                echo 'Build'
                sh '''
                docker compose down 
                docker compose up --build -d
                '''
            }
        }
    }
}

