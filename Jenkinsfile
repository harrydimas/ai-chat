pipeline {
    agent any
    stages {
        stage('Check files') {
            steps {
                sh 'ls -lah'
                sh 'cat package.json || echo "No package.json found"'
            }
        }
        stage('Install') {
            steps {
                sh 'bun install'
            }
        }
        stage('Format') {
            steps {
                sh 'bun run format'
            }
        }
        stage('Start') {
            steps {
                sh 'bun run start:prod'
            }
        }
    }
}

