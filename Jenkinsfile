pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies and build') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Build image and push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-cred'){
                        def customImage = docker.build("arizonamarco521/inventory-management:${env.BUILD_ID}")
                        customImage.push()
                        customImage.push('latest')
                    }
                }
            }
        }

         stage('Deploy on server 1') {
            environment {
                PORT = credentials('PORT-inventory-app')
                Database = credentials('Database-inventory-app')
                JWT = credentials('JWT-inventory-app')
            }
            steps {
              
                script {
                    sshagent(['servera']) {
                     sh "ssh servera@10.10.131.17 'docker rm -f inventory-1 inventory-2 || true'"   
                     sh "ssh servera@10.10.131.17 'docker run --name inventory-1 --restart always -d -p 3001:3000 --env PORT=${PORT} --env MONGGO=${Database} --env JWT_SECRET=${JWT} arizonamarco521/inventory-management:latest'"
                     sh "ssh servera@10.10.131.17 'docker run --name inventory-2 --restart always -d -p 3002:3000 --env PORT=${PORT} --env MONGGO=${Database} --env JWT_SECRET=${JWT} arizonamarco521/inventory-management:latest'"
                   }
                }
            }
       }

        stage('Deploy on server 2') {
            environment {
                PORT = credentials('PORT-inventory-app')
                Database = credentials('Database-inventory-app')
                JWT = credentials('JWT-inventory-app')
            }
            steps {
              
                script {
                    sshagent(['serverb']) {
                     sh "ssh serverb@10.10.146.150 'id'"
                     sh "ssh serverb@10.10.146.150 'docker rm -f inventory-3 inventory-4 || true'" 
                     sh "ssh serverb@10.10.146.150 'docker run --name inventory-3 --restart always -d -p 3003:3000 --env PORT=${PORT} --env MONGGO=${Database} --env JWT_SECRET=${JWT} arizonamarco521/inventory-management:latest'"
                     sh "ssh serverb@10.10.146.150 'docker run --name inventory-4 --restart always -d -p 3004:3000 --env PORT=${PORT} --env MONGGO=${Database} --env JWT_SECRET=${JWT} arizonamarco521/inventory-management:latest'"               
                   }
                }
            }
       }

    }
}
